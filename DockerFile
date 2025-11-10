FROM node:20.18 AS base

RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

FROM base AS build

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN pnpm build
RUN pnpm prune --prod

FROM cgr.dev/chainguard/node:latest AS deploy

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

ENV CLAOUDFLARE_ACCESS_KEY_ID="#"
ENV CLAOUDFLARE_SECRET_ACCESS_KEY="#"
ENV CLAOUDFLARE_BUCKETE="#"
ENV CLAOUDFLARE_ACCOUNT_ID="#"
ENV CLAOUDFLARE_PUBLIC_URL="http://localhost"
ENV DATABASE_URL="postgresql://docker:docker@localhost:5432/#"

USER 1000

EXPOSE 3333

CMD ["dist/infra/http/server.js"]