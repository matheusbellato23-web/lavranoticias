export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lavrasnoticias.com'
export const SITE_NAME = 'Lavras Notícia'
export const SITE_TAGLINE = 'A informação do bairro e geral.'
export const SITE_DESCRIPTION =
  'Jornal digital comunitário e independente do bairro Lavras e região — Guarulhos, São Paulo. Notícias locais, trânsito, obras, prefeitura, utilidade pública, agenda, vagas de emprego e informações gerais.'
export const DEFAULT_OG_IMAGE = '/assets/hero-bairro.jpg'
export const INSTAGRAM_URL = 'https://www.instagram.com/lavras_noticias/'

export interface CategoryDef {
  name: string
  slug: string
}

export const CATEGORIES_LIST: CategoryDef[] = [
  { name: 'Todas as Notícias', slug: 'todas-as-noticias' },
  { name: 'Bairro', slug: 'bairro' },
  { name: 'Geral', slug: 'geral' },
  { name: 'Segurança', slug: 'seguranca' },
  { name: 'Trânsito', slug: 'transito' },
  { name: 'Obras', slug: 'obras' },
  { name: 'Saúde', slug: 'saude' },
  { name: 'Educação', slug: 'educacao' },
  { name: 'Transporte', slug: 'transporte' },
  { name: 'Limpeza', slug: 'limpeza' },
  { name: 'Iluminação', slug: 'iluminacao' },
  { name: 'Prefeitura', slug: 'prefeitura' },
  { name: 'Comércio', slug: 'comercio' },
  { name: 'Eventos', slug: 'eventos' },
  { name: 'Esporte', slug: 'esporte' },
  { name: 'Cultura', slug: 'cultura' },
  { name: 'Reclamações', slug: 'reclamacoes' },
  { name: 'Histórias', slug: 'historias' },
]

export const EMERGENCY_NUMBERS = [
  { label: 'Polícia Militar', num: '190' },
  { label: 'Guarda Civil Municipal (GCM)', num: '153' },
  { label: 'SAMU (Socorro Urgente)', num: '192' },
  { label: 'Corpo de Bombeiros', num: '193' },
  { label: 'Prefeitura de Guarulhos (Zeladoria)', num: '156' },
]
