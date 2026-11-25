import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov'])
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50 MB

export async function POST(request: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const rawFolder = (formData.get('folder') as string | null) || 'media'
    const folder = rawFolder === 'ads' ? 'ads' : 'media'

    if (!file || file.size === 0 || !file.name) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()
    const isImage = IMAGE_TYPES.has(file.type) || IMAGE_EXTS.has(ext)
    const isVideo = VIDEO_TYPES.has(file.type) || VIDEO_EXTS.has(ext)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Formato inválido. Use imagens (JPG, PNG, WebP, GIF) ou vídeos (MP4, WebM, MOV).' },
        { status: 400 }
      )
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `Arquivo muito grande. O limite é ${isVideo ? '50 MB para vídeos' : '10 MB para imagens'}.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await mkdir(uploadDir, { recursive: true })

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${Date.now()}-${sanitizedName}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      kind: isVideo ? 'video' : 'image',
      url: `/api/uploads/${folder}/${fileName}`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Falha ao salvar arquivo' }, { status: 500 })
  }
}
