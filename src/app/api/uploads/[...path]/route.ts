import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

export async function GET(
  _request: Request,
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

    const buffer = await readFile(targetPath)
    const ext = path.extname(targetPath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
