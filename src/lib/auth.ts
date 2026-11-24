import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'lavranoticias_secure_jwt_token_2026_super_secret'

interface SessionPayload {
  userId: string
  email: string
  name: string
  role: string
  exp: number
}

// Simple and robust HMAC-SHA256 token using Web Crypto
export async function createSessionToken(payload: Omit<SessionPayload, 'exp'>, expiresInDays = 7): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60
  const fullPayload: SessionPayload = { ...payload, exp }
  
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const encodedSignature = Buffer.from(signature).toString('base64url')
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signatureB64] = parts
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    const signature = Buffer.from(signatureB64, 'base64url')
    
    const isValid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!isValid) return null
    
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

export async function getCurrentAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get('lavra_admin_token')?.value
  if (!token) return null
  return await verifySessionToken(token)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
