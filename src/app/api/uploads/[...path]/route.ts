import { NextResponse } from 'next/server'
import { stat } from 'fs/promises'
import { createReadStream } from 'fs'
import path from 'path'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
}

function nodeStreamToWeb(nodeStream: ReturnType<typeof createReadStream>): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
      })
      nodeStream.on('end', () => controller.close())
      nodeStream.on('error', (err) => controller.error(err))
    },
    cancel() {
      nodeStream.destroy()
    },
  })
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path || []
    if (segments.length === 0 || segments.some((s) => s.includes('..') || s.includes('/') || s.includes('\\'))) {
      return new NextResponse('Invalid path', { status: 400 })
    }

    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads')
    const targetPath = path.resolve(uploadsRoot, ...segments)

    if (!targetPath.startsWith(uploadsRoot + path.sep)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const fileStat = await stat(targetPath)
    const fileSize = fileStat.size
    const ext = path.extname(targetPath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    const rangeHeader = request.headers.get('range')
    if (rangeHeader) {
      const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader)
      if (match) {
        const start = parseInt(match[1], 10)
        const end = match[2] ? Math.min(parseInt(match[2], 10), fileSize - 1) : fileSize - 1
        if (start >= fileSize || start > end) {
          return new NextResponse(null, {
            status: 416,
            headers: { 'Content-Range': `bytes */${fileSize}` },
          })
        }
        const chunkSize = end - start + 1
        const stream = nodeStreamToWeb(createReadStream(targetPath, { start, end }))
        return new NextResponse(stream, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    }

    const stream = nodeStreamToWeb(createReadStream(targetPath))
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
