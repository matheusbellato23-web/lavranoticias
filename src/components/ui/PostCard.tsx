import Link from 'next/link'

interface PostCardData {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  authorName?: string | null
  publishedAt: Date | string
  category?: {
    name: string
    slug: string
  } | null
}

interface PostCardProps {
  post: PostCardData
  variant?: 'featured' | 'compact' | 'grid' | 'full'
}

export function formatDate(dateInput: Date | string): string {
  const d = new Date(dateInput)
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function PostCard({ post, variant = 'grid' }: PostCardProps) {
  const fallbackImage =
    post.coverImage ||
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'

  if (variant === 'featured') {
    return (
      <article className="group flex flex-col h-full">
        <Link href={`/noticia/${post.slug}`} className="block overflow-hidden rounded relative aspect-[16/9] bg-slate-100">
          <img
            src={fallbackImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          {post.category && (
            <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-archivo font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow">
              Destaque · {post.category.name}
            </span>
          )}
        </Link>

        <div className="mt-3 flex-1 flex flex-col justify-between">
          <div>
            <Link href={`/noticia/${post.slug}`}>
              <h2 className="font-source-serif font-bold text-2xl sm:text-3xl text-editorial-black leading-tight group-hover:text-primary transition-colors">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="font-archivo text-slate-600 text-sm sm:text-base leading-relaxed mt-2 line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="mt-3 pt-2 text-xs text-slate-500 font-archivo flex items-center gap-2 border-t border-slate-100">
            <span>{post.authorName || 'Redação Lavras Notícia'}</span>
            <span>·</span>
            <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className="group flex items-start gap-3 py-3 border-b border-slate-200 last:border-b-0">
        <Link
          href={`/noticia/${post.slug}`}
          className="shrink-0 w-20 h-20 sm:w-24 sm:h-20 rounded overflow-hidden bg-slate-100 relative"
        >
          <img
            src={fallbackImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {post.category && (
            <Link
              href={`/categoria/${post.category.slug}`}
              className="text-[10px] font-archivo font-bold text-primary uppercase tracking-wider hover:underline"
            >
              {post.category.name}
            </Link>
          )}

          <Link href={`/noticia/${post.slug}`}>
            <h4 className="font-source-serif font-bold text-xs sm:text-sm text-editorial-black leading-snug line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
          </Link>

          <span className="text-[11px] text-slate-400 font-archivo block mt-1">
            {formatDate(post.publishedAt)}
          </span>
        </div>
      </article>
    )
  }

  // Default Grid Card ("Manchetes Locais")
  return (
    <article className="group flex flex-col justify-between border-b sm:border-b-0 pb-4 sm:pb-0 border-slate-200">
      <Link
        href={`/noticia/${post.slug}`}
        className="block overflow-hidden rounded aspect-[16/10] bg-slate-100 mb-2 relative"
      >
        <img
          src={fallbackImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {post.category && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
            {post.category.name}
          </span>
        )}
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/noticia/${post.slug}`}>
            <h3 className="font-source-serif font-bold text-sm sm:text-base text-editorial-black leading-snug group-hover:text-primary transition-colors line-clamp-3">
              {post.title}
            </h3>
          </Link>
          {post.excerpt && (
            <p className="text-xs text-slate-600 font-archivo mt-1 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        <span className="text-[11px] text-slate-400 font-archivo mt-2 block">
          {formatDate(post.publishedAt)}
        </span>
      </div>
    </article>
  )
}
