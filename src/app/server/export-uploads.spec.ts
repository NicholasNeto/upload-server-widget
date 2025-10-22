import { beforeAll, describe, expect, it, vi } from "vitest"
import { isRight, unwrapEither } from "@/shared/either"
import { randomUUID } from "node:crypto"
import { makeUpload } from "@/test/factories/make-upload"
import { exportUploads } from "./export-uploads"
import * as uploads from "@/infra/storage/upload-file-to-storage"

describe("export uploads", () => {
  it("shuould be able to export uploads ", async () => {
    const uploadStub = vi
      .spyOn(uploads, "uploadFileStorageInput")
      .mockImplementation(async () => {
        return {
          key: `${randomUUID()}.csv`,
          url: "http://example.com/file.csv",
        }
      })

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

    const generatedCSVStream = uploadStub.mock.calls[0][0].contentStream
    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chuncks: Buffer[] = []

      generatedCSVStream.on("data", (chunck: Buffer) => {
        chuncks.push(chunck)
      })

      generatedCSVStream.on("end", () => {
        resolve(Buffer.concat(chuncks).toString("utf-8"))
      })

      generatedCSVStream.on("error", err => {
        reject(err)
      })
    })

    const csvAsArray = csvAsString
      .trim()
      .split("\n")
      .map(row => row.split(","))

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).reportUrl).toEqual("http://example.com/file.csv")
    expect(csvAsArray).toEqual([
      ["ID", "Name", "URL", "Updated Date"],
      [upload1.id, upload1.name, upload1.remoteUrl, expect.any(String)],
      [upload2.id, upload2.name, upload2.remoteUrl, expect.any(String)],
      [upload3.id, upload3.name, upload3.remoteUrl, expect.any(String)],
      [upload4.id, upload4.name, upload4.remoteUrl, expect.any(String)],
      [upload5.id, upload5.name, upload5.remoteUrl, expect.any(String)],
    ])
  })
})
