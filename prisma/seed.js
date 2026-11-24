const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed with authentic site data...')

  // 1. Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lavranoticias.com.br' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@lavranoticias.com.br',
      name: 'Matheus - Editor Chefe',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user ready: admin@lavranoticias.com.br / admin123')

  // 2. Categories
  const categoriesData = [
    { name: 'Bairro', slug: 'bairro', order: 1 },
    { name: 'Segurança', slug: 'seguranca', order: 2 },
    { name: 'Trânsito', slug: 'transito', order: 3 },
    { name: 'Obras', slug: 'obras', order: 4 },
    { name: 'Saúde', slug: 'saude', order: 5 },
    { name: 'Educação', slug: 'educacao', order: 6 },
    { name: 'Transporte', slug: 'transporte', order: 7 },
    { name: 'Limpeza', slug: 'limpeza', order: 8 },
    { name: 'Iluminação', slug: 'iluminacao', order: 9 },
    { name: 'Prefeitura', slug: 'prefeitura', order: 10 },
    { name: 'Comércio', slug: 'comercio', order: 11 },
    { name: 'Eventos', slug: 'eventos', order: 12 },
    { name: 'Esporte', slug: 'esporte', order: 13 },
    { name: 'Cultura', slug: 'cultura', order: 14 },
    { name: 'Reclamações', slug: 'reclamacoes', order: 15 },
    { name: 'Histórias', slug: 'historias', order: 16 },
  ]

  const categories = {}
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: cat,
    })
    categories[cat.slug] = created
  }
  console.log(`✅ ${categoriesData.length} categories synced`)

  // 3. Posts with exact real titles, excerpts, and local downloaded images
  const posts = [
    // Hero Post
    {
      title: 'Corrida Novembro Azul acontece neste domingo no Bosque Maia e reforça conscientização sobre a saúde do homem',
      slug: 'corrida-novembro-azul-bosque-maia',
      excerpt: 'A Prefeitura de Guarulhos, por meio da Secretaria de Esportes e Lazer, realiza neste domingo (15), a partir das 7h, no Bosque Maia, a Corrida Novembro Azul, evento gratuito com objetivo de incentivar a prática de atividades físicas e conscientizar a população sobre a importância dos cuidados com a saúde do homem e da prevenção do câncer de próstata.',
      content: `<p>A Prefeitura de Guarulhos, por meio da Secretaria de Esportes e Lazer, realiza neste domingo (15), a partir das 7h, no Bosque Maia, a <strong>Corrida Novembro Azul</strong>, evento gratuito com objetivo de incentivar a prática de atividades físicas e conscientizar a população sobre a importância dos cuidados com a saúde do homem e da prevenção do câncer de próstata.</p>
<p>Com percursos de 5 km para corrida e 3 km para caminhada da família, o evento combinou incentivo à prática de atividades físicas com palestras rápidas de profissionais de saúde da rede municipal.</p>
<h2>Participação Comunitária</h2>
<p>"É fundamental que os homens cuidem da saúde regularmente e deixem o preconceito de lado", destacou um dos organizadores comunitários durante a entrega das medalhas de participação. O apoio dos comerciantes locais garantiu pontos de hidratação e frutas para todos os participantes.</p>
<p>A Secretaria de Esportes e Lazer reforçou que novas edições e passeios ciclísticos estão programados para o calendário do próximo mês.</p>`,
      coverImage: '/assets/hero-bairro.jpg',
      categorySlug: 'esporte',
      featured: true,
      authorName: 'Redação Lavras Notícia',
    },
    // Últimas Notícias (Sidebar)
    {
      title: 'Artista que representou o Brasil no maior festival de artes cênicas do mundo se apresenta em Guarulhos',
      slug: 'vidrado-guilherme-torres-teatro-padre-bento',
      excerpt: 'Espetáculo internacional de teatro e artes visuais chega ao município com sessões especiais gratuitas para toda a comunidade.',
      content: `<p>O renomado espetáculo circense e teatral que percorreu palcos internacionais chega a Guarulhos para apresentações inéditas no Teatro Padre Bento. A montagem combina acrobacias aéreas, efeitos visuais e trilha sonora imersiva.</p>`,
      coverImage: '/assets/noticia-documento-6.jpg',
      categorySlug: 'cultura',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'Prefeitura recebe inscrições para sessão gratuita de cinema para pessoas com deficiência no Sesc Guarulhos',
      slug: 'cine-conforto-pequena-amelie-sesc',
      excerpt: 'Iniciativa promove inclusão e conforto com luzes amenas, som reduzido e total acessibilidade para o público.',
      content: `<p>A Prefeitura de Guarulhos abriu inscrições para a sessão adaptada Cine Conforto no Sesc Guarulhos. A exibição contará com audiodescrição, intérprete de Libras e ambiente preparado para acolher pessoas com sensibilidade sensorial.</p>`,
      coverImage: '/assets/noticia-documento-10.jpg',
      categorySlug: 'cultura',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'Bienal do Livro de Guarulhos promove bate-papos variados com autores guarulhenses até sexta-feira',
      slug: 'bienal-bate-papos-autores-guarulhenses',
      excerpt: 'Programação destaca a produção literária local, incentivo à leitura infantil e debates com escritores da cidade.',
      content: `<p>A 4ª Bienal do Livro de Guarulhos segue com uma grade intensa de atividades culturais, oficinas e lançamentos de livros de escritores residentes em Guarulhos e na região metropolitana.</p>`,
      coverImage: '/assets/noticia-documento-7.jpg',
      categorySlug: 'educacao',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'CTMO Vila Augusta inicia as aulas do curso de maquiagem em parceria com o Qualifica SP',
      slug: 'ctmo-vila-augusta-curso-maquiagem',
      excerpt: 'Capacitação profissional gratuita abre portas para o mercado de trabalho e incentiva o empreendedorismo na área da beleza.',
      content: `<p>O Centro de Treinamento de Mão de Obra (CTMO) deu início nesta semana às aulas da nova turma do curso de maquiagem profissional. O programa visa gerar renda e autonomia para os munícipes.</p>`,
      coverImage: '/assets/noticia-documento-9.jpg',
      categorySlug: 'educacao',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },

    // Manchetes Locais
    {
      title: 'Prefeitura remove descartes irregulares em ruas de cinco regiões de Guarulhos',
      slug: 'descartes-irregulares-removidos-sar',
      excerpt: 'A Prefeitura de Guarulhos, por meio da Secretaria de Administrações Regionais (SAR), promoveu, nesta segunda-feira (9), a remoção de descartes irregulares em vias localizadas nas regiões da Vila Rio, Lavras e adjacências.',
      content: `<p>A Secretaria de Administrações Regionais recolheu toneladas de entulho e materiais descartados irregularmente em vias públicas, reiterando o canal de denúncias e o cronograma dos Pontos de Entrega Voluntária (PEV).</p>`,
      coverImage: null,
      categorySlug: 'limpeza',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'Prefeitura de Guarulhos promove melhorias em três vias no Água Azul',
      slug: 'melhorias-vias-agua-azul',
      excerpt: 'A Prefeitura de Guarulhos, por meio da Secretaria de Administrações Regionais (SAR), realizou na segunda-feira (9) serviços de recuperação na rua Três Irmãos, na rua Efraim e na avenida Vitória, todas localizadas no bairro Água Azul, região formada predominantemente por sítios e chácaras.',
      content: `<p>Os serviços de nivelamento, cascalhamento e manutenção viária beneficiaram moradores e produtores da região que utilizam as estradas rurais para locomoção diária e escoamento de insumos.</p>`,
      coverImage: null,
      categorySlug: 'obras',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'Bienal Internacional do Livro de Guarulhos garante acessibilidade e inclusão para todos os visitantes',
      slug: 'bienal-livro-acessibilidade-inclusao',
      excerpt: 'A acessibilidade é um dos destaques da 4ª Bienal Internacional do Livro de Guarulhos, que busca garantir a participação de todos os públicos e igualdade de oportunidades na programação cultural e literária.',
      content: `<p>Com rampas de acesso, cadeiras de rodas disponíveis, monitores treinados e material em braille, a Bienal consolida-se como um dos eventos mais inclusivos do calendário paulista.</p>`,
      coverImage: null,
      categorySlug: 'cultura',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'Desafio Cross da Defesa Civil de Guarulhos reúne 13 equipes em provas de resistência e salvamento',
      slug: 'desafio-cross-defesa-civil-13-equipes',
      excerpt: 'A Prefeitura de Guarulhos, por meio da Subsecretaria de Proteção e Defesa Civil (SDSDC), realizou na sexta-feira (6), no Núcleo Cabuçu do Parque Estadual da Cantareira, a 14ª edição do Desafio Cross com simulações de resgate.',
      content: `<p>As equipes enfrentaram provas práticas de orientação na mata, primeiros socorros e travessia aquática, aprimorando os protocolos de resposta rápida para situações de emergência no município.</p>`,
      coverImage: null,
      categorySlug: 'eventos',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
    {
      title: 'Guarulhos recebe premiação em evento de tecnologia na gestão pública',
      slug: 'guarulhos-premio-ia-honors-gov',
      excerpt: 'A Prefeitura de Guarulhos, representada pela Secretaria de Ciência, Tecnologia e Inovação, participou do Fórum Brasileiro de Governança em Inteligência Artificial, recebendo reconhecimento por projetos de digitalização cidadã.',
      content: `<p>O prêmio reconheceu a modernização dos serviços públicos digitais da cidade, facilitando a abertura de chamados e solicitações de zeladoria diretamente pela internet.</p>`,
      coverImage: null,
      categorySlug: 'prefeitura',
      featured: false,
      authorName: 'Redação Lavras Notícia',
    },
  ]

  for (const p of posts) {
    const category = categories[p.categorySlug]
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        featured: p.featured,
        categoryId: category?.id,
        userId: admin.id,
      },
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        featured: p.featured,
        published: true,
        publishedAt: new Date(),
        categoryId: category?.id,
        userId: admin.id,
      },
    })
  }
  console.log(`✅ ${posts.length} authentic posts synced`)

  // 4. Events
  const events = [
    {
      title: 'Mutirão de limpeza na praça',
      description: 'Ação comunitária de zeladoria e plantio de mudas.',
      date: new Date('2026-11-08T08:00:00Z'),
      location: 'Praça central · 8h',
      published: true,
    },
    {
      title: 'Torneio de futebol comunitário',
      description: 'Jogos amistosos entre times da várzea do bairro.',
      date: new Date('2026-11-15T09:00:00Z'),
      location: 'Campo do bairro · 9h',
      published: true,
    },
    {
      title: 'Reunião da associação de moradores',
      description: 'Debate de pautas prioritárias de segurança e iluminação pública.',
      date: new Date('2026-11-22T19:00:00Z'),
      location: 'Salão comunitário · 19h',
      published: true,
    },
  ]

  await prisma.event.deleteMany({})
  for (const ev of events) {
    await prisma.event.create({ data: ev })
  }
  console.log(`✅ ${events.length} events seeded`)

  // 5. Jobs
  const jobs = [
    {
      title: 'Atendente de Padaria e Balcão',
      company: 'Panificadora Estrela de Lavras',
      location: 'Lavras – Guarulhos/SP',
      type: 'CLT',
      description: 'Atendimento ao público, organização de balcões e pesagem. Salário: R$ 1.850,00 + VT + Refeição.',
      contact: 'curriculo@padariaestrelalavras.com.br',
      published: true,
    },
    {
      title: 'Operador de Caixa / Repositor',
      company: 'Supermercado Nova Lavras',
      location: 'Lavras – Guarulhos/SP',
      type: 'CLT',
      description: 'Operação de PDV e reposição de gôndolas. Salário: R$ 1.780,00 + Cesta Básica.',
      contact: 'rh@supermercadonovalavras.com.br',
      published: true,
    },
    {
      title: 'Ajudante Geral de Marcenaria',
      company: 'Móveis & Projetos Lavras',
      location: 'Vila Nova Lavras – Guarulhos/SP',
      type: 'CLT',
      description: 'Corte de MDF, auxílio na montagem e lixamento. Salário: R$ 1.950,00.',
      contact: '(11) 98877-6655',
      published: true,
    },
  ]

  await prisma.job.deleteMany({})
  for (const j of jobs) {
    await prisma.job.create({ data: j })
  }
  console.log(`✅ ${jobs.length} jobs seeded`)

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
