export interface CategoryDef {
  name: string
  slug: string
}

export const CATEGORIES_LIST: CategoryDef[] = [
  { name: 'Bairro', slug: 'bairro' },
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
