// ============================================================================
// Database Operations for User Management
// ============================================================================

import { User, Env, RegisterPayload } from '../types/index'
import { generateId } from '../utils/auth'

// ─── User Queries ─────────────────────────────────────────────────────────

/**
 * Check if user exists by email
 */
export async function userExistsByEmail(db: D1Database, email: string): Promise<boolean> {
  try {
    const result = await db
      .prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1')
      .bind(email)
      .first()

    return !!result
  } catch (error) {
    console.error('Error checking user existence:', error)
    throw error
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  try {
    const result = (await db
      .prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
      .bind(email)
      .first()) as Record<string, unknown> | undefined

    if (!result) {
      return null
    }

    return mapDbUserToUser(result)
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

/**
 * Get user by ID
 */
export async function getUserById(db: D1Database, userId: string): Promise<User | null> {
  try {
    const result = (await db
      .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
      .bind(userId)
      .first()) as Record<string, unknown> | undefined

    if (!result) {
      return null
    }

    return mapDbUserToUser(result)
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw error
  }
}

/**
 * Create new user
 */
export async function createUser(
  db: D1Database,
  email: string,
  passwordHash: string,
  name: string,
  targetExam: string
): Promise<User> {
  try {
    const userId = generateId('user')
    const now = new Date().toISOString()

    const result = await db
      .prepare(
        `
        INSERT INTO users (id, email, password_hash, name, target_exam, is_active, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, 0, ?, ?)
      `
      )
      .bind(userId, email, passwordHash, name, targetExam, now, now)
      .run()

    if (!result.success) {
      throw new Error('Failed to create user')
    }

    // Retrieve and return the created user
    const user = await getUserById(db, userId)
    if (!user) {
      throw new Error('User created but could not be retrieved')
    }

    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update user last login
 */
export async function updateUserLastLogin(db: D1Database, userId: string): Promise<void> {
  try {
    const now = new Date().toISOString()
    await db
      .prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?')
      .bind(now, now, userId)
      .run()
  } catch (error) {
    console.error('Error updating last login:', error)
    throw error
  }
}

/**
 * Mark email as verified
 */
export async function verifyUserEmail(db: D1Database, userId: string): Promise<void> {
  try {
    const now = new Date().toISOString()
    await db
      .prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?')
      .bind(now, userId)
      .run()
  } catch (error) {
    console.error('Error verifying email:', error)
    throw error
  }
}

/**
 * Store email verification token
 */
export async function storeVerificationToken(
  db: D1Database,
  userId: string,
  token: string,
  expiresAt: string
): Promise<void> {
  try {
    const now = new Date().toISOString()
    const id = generateId('token')
    
    await db
      .prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, userId, token, expiresAt, now)
      .run()
  } catch (error) {
    console.error('Error storing verification token:', error)
    throw error
  }
}

/**
 * Get verification token
 */
export async function getVerificationToken(
  db: D1Database,
  token: string
): Promise<{ userId: string } | null> {
  try {
    const result = (await db
      .prepare(
        `SELECT user_id, expires_at FROM email_verification_tokens 
         WHERE token = ? AND expires_at > datetime('now') LIMIT 1`
      )
      .bind(token)
      .first()) as Record<string, unknown> | undefined

    if (!result) {
      return null
    }

    return { userId: result.user_id as string }
  } catch (error) {
    console.error('Error getting verification token:', error)
    throw error
  }
}

/**
 * Delete verification token
 */
export async function deleteVerificationToken(db: D1Database, token: string): Promise<void> {
  try {
    await db
      .prepare('DELETE FROM email_verification_tokens WHERE token = ?')
      .bind(token)
      .run()
  } catch (error) {
    console.error('Error deleting verification token:', error)
    throw error
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────

/**
 * Map database user row to User type
 */
function mapDbUserToUser(dbUser: Record<string, unknown>): User {
  return {
    id: dbUser.id as string,
    email: dbUser.email as string,
    name: dbUser.name as string,
    targetExam: dbUser.target_exam as any,
    profilePictureUrl: (dbUser.profile_picture_url as string) || undefined,
    bio: (dbUser.bio as string) || undefined,
    isActive: Boolean(dbUser.is_active),
    emailVerified: Boolean(dbUser.email_verified),
    createdAt: dbUser.created_at as string,
    updatedAt: dbUser.updated_at as string,
    lastLoginAt: (dbUser.last_login_at as string) || undefined,
  }
}

/**
 * Get user password hash from database
 * (used for login validation)
 */
export async function getUserPasswordHash(db: D1Database, email: string): Promise<string | null> {
  try {
    const result = (await db
      .prepare('SELECT password_hash FROM users WHERE email = ? LIMIT 1')
      .bind(email)
      .first()) as Record<string, unknown> | undefined

    return (result?.password_hash as string) || null
  } catch (error) {
    console.error('Error getting password hash:', error)
    throw error
  }
}
