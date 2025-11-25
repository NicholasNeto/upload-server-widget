import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src"],
  format: ["esm"],
  loader: {
    ".sql": "file",
  },
  external: ["drizzle-kit"],
})
