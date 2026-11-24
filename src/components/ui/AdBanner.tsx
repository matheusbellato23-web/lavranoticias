interface AdBannerProps {
  label?: string
  position?: 'top' | 'mid' | 'bottom' | 'sidebar'
  className?: string
}

export default function AdBanner({
  label = 'Publicidade',
  position = 'top',
  className = '',
}: AdBannerProps) {
  if (position === 'sidebar') {
    return (
      <figure className={`mx-auto w-full ${className}`} style={{ maxWidth: '300px' }}>
        <figcaption className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </figcaption>
        <img
          src="/assets/programa-formiguinha-300x250.jpg"
          alt="Programa Formiguinha — Nós ligamos os pontos!"
          width={300}
          height={250}
          loading="lazy"
          className="h-auto w-full rounded shadow-sm"
        />
      </figure>
    )
  }

  // Margin based on position
  const wrapperSpacing =
    position === 'top'
      ? 'mb-10'
      : position === 'mid'
      ? 'my-12'
      : 'mt-12'

  return (
    <div className={`w-full ${wrapperSpacing} ${className}`}>
      {/* Desktop banner 728×90 */}
      <div className="hidden md:block">
        <figure className="mx-auto w-full" style={{ maxWidth: '728px' }}>
          <figcaption className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </figcaption>
          <img
            src="/assets/programa-formiguinha-728x90.jpg"
            alt="Programa Formiguinha — Nós ligamos os pontos!"
            width={728}
            height={90}
            loading="lazy"
            className="h-auto w-full shadow-sm rounded-sm"
          />
        </figure>
      </div>

      {/* Mobile banner 300×250 */}
      <div className="md:hidden">
        <figure className="mx-auto w-full" style={{ maxWidth: '300px' }}>
          <figcaption className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </figcaption>
          <img
            src="/assets/programa-formiguinha-300x250.jpg"
            alt="Programa Formiguinha — Nós ligamos os pontos!"
            width={300}
            height={250}
            loading="lazy"
            className="h-auto w-full rounded shadow-sm"
          />
        </figure>
      </div>
    </div>
  )
}
