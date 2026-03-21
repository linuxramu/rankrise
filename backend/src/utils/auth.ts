// ============================================================================
// Authentication Utilities
// Password hashing and JWT token management
// ============================================================================

import { JWTPayload } from '../types/index'

// ─── Utility Functions ────────────────────────────────────────────────────

/**
 * Encode string to base64
 */
function base64Encode(str: string): string {
  return btoa(str)
}

/**
 * Decode base64 string
 */
function base64Decode(str: string): string {
  return atob(str)
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return bytes.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes.buffer
}

// ─── Password Hashing ─────────────────────────────────────────────────────

/**
 * Hash password using PBKDF2
 * Returns: salt$hash (salt and hash separated by $)
 * Format allows for easy verification later
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = bufferToHex(salt)

  // Import password as key
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  // Derive key using PBKDF2
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    256 // 32 bytes
  )

  const hashHex = bufferToHex(derived)

  // Return salt$hash format
  return `${saltHex}$${hashHex}`
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [saltHex, storedHashHex] = hash.split('$')

    if (!saltHex || !storedHashHex) {
      return false
    }

    // Convert stored salt back
    const salt = new Uint8Array(hexToBuffer(saltHex))

    // Import password as key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive key with same parameters
    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      256
    )

    const computedHashHex = bufferToHex(derived)

    // Constant time comparison to prevent timing attacks
    return constantTimeCompare(computedHashHex, storedHashHex)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Constant time string comparison
 * Prevents timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

// ─── JWT Token Management ─────────────────────────────────────────────────

/**
 * Create JWT token
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  }

  // Create JWT header
  const header = base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64Encode(JSON.stringify(jwtPayload))

  // Create signature
  const message = `${header}.${body}`
  const secretKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', secretKey, new TextEncoder().encode(message))
  const signatureB64 = base64Encode(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${message}.${signatureB64}`
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')

    if (parts.length !== 3) {
      return null
    }

    const [headerB64, bodyB64, signatureB64] = parts

    // Verify signature
    const message = `${headerB64}.${bodyB64}`
    const secretKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Decode signature
    const signaturePadded = signatureB64 + '='.repeat((4 - (signatureB64.length % 4)) % 4)
    const signatureBytes = new Uint8Array(
      atob(signaturePadded.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => c.charCodeAt(0))
    )

    const isValid = await crypto.subtle.verify('HMAC', secretKey, signatureBytes, new TextEncoder().encode(message))

    if (!isValid) {
      return null
    }

    // Decode payload
    const payload = JSON.parse(base64Decode(bodyB64)) as JWTPayload

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}_${timestamp}${randomStr}` : `${timestamp}${randomStr}`
}
/**
 * Generate email verification token
 * Returns a random 32-character token
 */
export function generateVerificationToken(): string {
  // Generate 24 random bytes and convert to hex (48 chars), then take first 32
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return bufferToHex(array).substring(0, 32)
}