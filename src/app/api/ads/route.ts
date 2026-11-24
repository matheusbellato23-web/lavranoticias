import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Public ads fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
