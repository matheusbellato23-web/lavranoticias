import { prisma } from './prisma'

export async function resolvePostCategories(
  categoryIdsInput?: unknown,
  fallbackCategoryId?: string | null
) {
  const rawList: string[] = Array.isArray(categoryIdsInput)
    ? categoryIdsInput.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : []

  if (fallbackCategoryId && !rawList.includes(fallbackCategoryId)) {
    rawList.push(fallbackCategoryId)
  }

  const uniqueIds = Array.from(new Set(rawList))
  if (uniqueIds.length === 0) {
    return { primaryCategoryId: null, categories: [] as { id: string; slug: string }[] }
  }

  const found = await prisma.category.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, slug: true, order: true },
    orderBy: { order: 'asc' },
  })

  // Prefer thematic category (not "todas-as-noticias") as primary badge
  const thematic = found.find((c) => c.slug !== 'todas-as-noticias')
  const primaryCategoryId = thematic?.id ?? found[0]?.id ?? null

  return {
    primaryCategoryId,
    categories: found.map((c) => ({ id: c.id, slug: c.slug })),
  }
}
