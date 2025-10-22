import { db, pg } from "@/infra/db"
import { schema } from "@/infra/db/schemas"
import { Either, makeRight } from "@/shared/either"
import { z } from "zod"
import { ilike } from "drizzle-orm"
import { stringify } from "csv-stringify"
import { PassThrough, Transform } from "node:stream"
import { pipeline } from "node:stream/promises"
import { uploadFileStorageInput } from "@/infra/storage/upload-file-to-storage"

const exportUploadsInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(["createdAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
})

type ExportUploadsInput = z.input<typeof exportUploadsInput>

type ExportUploadsOutput = {
  reportUrl: string
}

export async function exportUploads(
  input: ExportUploadsInput
): Promise<Either<never, ExportUploadsOutput>> {
  const { searchQuery } = exportUploadsInput.parse(input)

  const { sql, params } = db
    .select({
      id: schema.uploads.id,
      name: schema.uploads.name,
      remoteUrl: schema.uploads.remoteUrl,
      createdAt: schema.uploads.createdAt,
    })
    .from(schema.uploads)
    .where(
      searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
    )
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(2)

  const csv = stringify({
    delimiter: ",",
    header: true,
    columns: [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
      { key: "remote_url", header: "URL" },
      { key: "created_at", header: "Updated Date" },
    ],
  })

  const uploadToStorageStream = new PassThrough()

  const convertToCsvPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], encoding, callback) {
        for (const chunck of chunks) {
          this.push(chunck)
        }

        callback()
      },
    }),
    csv,
    uploadToStorageStream
  )

  // const uploadToStorage = uploadFileStorageInput({
  //   fileName: `${new Date().toISOString()}-uploads.csv`,
  //   contentType: "text/csv",
  //   folder: "downloads",
  //   contentStream: uploadToStorageStream,
  // })

  const teste = await convertToCsvPipeline

  // const [{ url }] = await Promise.all([uploadToStorage, convertToCsvPipeline])

  // for await (const rowns of cursor) {
  //   console.log("--->", rowns)
  // }

  console.log("teste", teste)

  return makeRight({ reportUrl: "url" })
}
