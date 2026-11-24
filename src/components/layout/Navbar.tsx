'use client'

import Link from 'next/link'
import { CATEGORIES_LIST } from '@/lib/constants'

export default function Navbar() {
  return (
    <nav aria-label="Categorias" className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-4 py-3 text-sm font-semibold">
        {CATEGORIES_LIST.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className="py-1 text-foreground hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-ring"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
