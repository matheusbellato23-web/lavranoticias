const fs = require('fs')
const path = require('path')

const dbUrl = process.env.DATABASE_URL || ''
if (dbUrl.startsWith('file:')) {
  let filePath = dbUrl.slice(5)
  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), 'prisma', filePath)
  }
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  console.log(`📁 Ensured SQLite directory exists: ${dir}`)
}
