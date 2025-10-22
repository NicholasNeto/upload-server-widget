import { describe, expect, it } from "vitest"
import { isRight, unwrapEither } from "@/shared/either"
import { randomUUID } from "node:crypto"
import { makeUpload } from "@/test/factories/make-upload"
import { exportUploads } from "./export-uploads"

describe("export uploads", () => {
  it("shuould be able to export uploads ", async () => {
    const namePattern = randomUUID()

    const upload1 = await makeUpload({ name: `${namePattern}.webp` })
    const upload2 = await makeUpload({ name: `${namePattern}.webp` })
    const upload3 = await makeUpload({ name: `${namePattern}.webp` })
    const upload4 = await makeUpload({ name: `${namePattern}.webp` })
    const upload5 = await makeUpload({ name: `${namePattern}.webp` })

    // sut  === System undert test
    const sut = await exportUploads({
      searchQuery: namePattern,
    })

    // expect(isRight(sut)).toBe(true)

    // expect(unwrapEither(sut).total).toEqual(5)
    // expect(unwrapEither(sut).uploads).toEqual([
    //   expect.objectContaining({ id: upload5.id }),
    //   expect.objectContaining({ id: upload4.id }),
    //   expect.objectContaining({ id: upload3.id }),
    //   expect.objectContaining({ id: upload2.id }),
    //   expect.objectContaining({ id: upload1.id }),
    // ])
  })
})
