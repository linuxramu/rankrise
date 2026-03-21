import { Router } from 'itty-router'
import { Env, AuthResponse, User } from './src/types/index'
import { hashPassword, createToken, generateVerificationToken } from './src/utils/auth'
import { validateRegistration } from './src/utils/validation'
import { successResponse, errorResponse, validationErrorResponse, ConflictError, parseJsonBody, InternalServerError, UnauthorizedError } from './src/utils/errors'
import { userExistsByEmail, createUser, getUserByEmail, getUserById, updateUserLastLogin, getUserPasswordHash, verifyUserEmail, storeVerificationToken, getVerificationToken, deleteVerificationToken } from './src/db/users'
import { verifyPassword } from './src/utils/auth'

const router = Router<{ Bindings: Env }>()

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',      // Local development
  'http://127.0.0.1:5173',      // Local development (alternative)
  'https://rankrise-frontend.pages.dev',  // Production frontend
]

/**
 * Get CORS headers based on request origin
 * Only allows specific frontend origins
 */
function getCorsHeaders(origin?: string): Record<string, string> {
  const isOriginAllowed = origin && ALLOWED_ORIGINS.includes(origin)
  
  return {
    'Access-Control-Allow-Origin': isOriginAllowed ? origin : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  }
}

// Handle CORS preflight requests
router.options('*', (request: Request) => {
  const origin = request.headers.get('origin') || undefined
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
})

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get('/api/health', () => {
  return successResponse({ status: 'ok' })
})

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/api/auth/register', async (request: Request, env: Env) => {
  try {
    // Parse request body
    const body = await parseJsonBody(request)

    // Validate input
    const validation = validateRegistration(body)
    if (!validation.isValid) {
      return validationErrorResponse(validation.errors)
    }

    const { email, password, name, targetExam } = body as {
      email: string
      password: string
      name: string
      targetExam: string
    }

    // Check if user already exists
    const userExists = await userExistsByEmail(env.DB, email)
    if (userExists) {
      return errorResponse(new ConflictError('Email already registered'))
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user (with email_verified = 0)
    const user = await createUser(env.DB, email, passwordHash, name, targetExam)

    // Generate verification token (valid for 24 hours)
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await storeVerificationToken(env.DB, user.id, verificationToken, expiresAt)

    // Create JWT token (can be used, but features may be limited until verified)
    const token = await createToken(
      {
        userId: user.id,
        email: user.email,
      },
      env.JWT_SECRET
    )

    // Update last login
    await updateUserLastLogin(env.DB, user.id)

    // Return success response with verification token (for dev/testing)
    const response: AuthResponse & { verificationToken?: string } = {
      token,
      user,
      verificationToken, // Include token in response for development
    }

    return successResponse(response, 201)
  } catch (error) {
    console.error('[Register Error]', error)
    if (error instanceof Error) {
      return errorResponse(error)
    }
    return errorResponse(new InternalServerError())
  }
})

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/api/auth/login', async (request: Request, env: Env) => {
  try {
    // Parse request body
    const body = await parseJsonBody(request)

    // Validate input
    if (!body || typeof body !== 'object') {
      return validationErrorResponse([{ field: 'body', message: 'Invalid request body' }])
    }

    const data = body as Record<string, unknown>
    if (!data.email || !data.password) {
      return validationErrorResponse([
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is required' },
      ])
    }

    const email = data.email as string
    const password = data.password as string

    // Get user by email
    const user = await getUserByEmail(env.DB, email)
    if (!user) {
      return errorResponse(new UnauthorizedError('Invalid email or password'))
    }

    // Get password hash and verify
    const passwordHash = await getUserPasswordHash(env.DB, email)
    if (!passwordHash) {
      return errorResponse(new UnauthorizedError('Invalid email or password'))
    }

    const isPasswordValid = await verifyPassword(password, passwordHash)
    if (!isPasswordValid) {
      return errorResponse(new UnauthorizedError('Invalid email or password'))
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return errorResponse(new UnauthorizedError('Please verify your email before logging in'))
    }

    // Create JWT token
    const token = await createToken(
      {
        userId: user.id,
        email: user.email,
      },
      env.JWT_SECRET
    )

    // Update last login
    await updateUserLastLogin(env.DB, user.id)

    // Return success response
    const response: AuthResponse = {
      token,
      user,
    }

    return successResponse(response)
  } catch (error) {
    console.error('[Login Error]', error)
    if (error instanceof Error) {
      return errorResponse(error)
    }
    return errorResponse(new InternalServerError())
  }
})

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
router.post('/api/auth/verify-email', async (request: Request, env: Env) => {
  try {
    // Parse request body
    const body = await parseJsonBody(request)

    if (!body || typeof body !== 'object') {
      return validationErrorResponse([{ field: 'body', message: 'Invalid request body' }])
    }

    const data = body as Record<string, unknown>
    const token = data.token as string

    if (!token) {
      return validationErrorResponse([{ field: 'token', message: 'Verification token is required' }])
    }

    // Get verification token
    const tokenRecord = await getVerificationToken(env.DB, token)
    if (!tokenRecord) {
      return errorResponse(new UnauthorizedError('Invalid or expired verification token'))
    }

    // Mark email as verified
    await verifyUserEmail(env.DB, tokenRecord.userId)

    // Delete used token
    await deleteVerificationToken(env.DB, token)

    // Get updated user
    const user = await getUserById(env.DB, tokenRecord.userId)
    if (!user) {
      return errorResponse(new InternalServerError('User not found'))
    }

    return successResponse({ success: true, message: 'Email verified successfully', user })
  } catch (error) {
    console.error('[Verify Email Error]', error)
    if (error instanceof Error) {
      return errorResponse(error)
    }
    return errorResponse(new InternalServerError())
  }
})

// ============================================================================
// TEST ROUTES (Placeholder)
// ============================================================================

router.get('/api/tests', async (request: Request, env: Env) => {
  return successResponse({ message: 'GET /api/tests - List tests' })
})

router.post('/api/tests', async (request: Request, env: Env) => {
  return successResponse({ message: 'POST /api/tests - Create test' }, 201)
})

router.get('/api/tests/:id', async (request: Request, env: Env) => {
  return successResponse({ message: 'GET /api/tests/:id - Get test' })
})

// ============================================================================
// RESULTS ROUTES (Placeholder)
// ============================================================================

router.get('/api/results', async (request: Request, env: Env) => {
  return successResponse({ message: 'GET /api/results - List results' })
})

router.post('/api/results', async (request: Request, env: Env) => {
  return successResponse({ message: 'POST /api/results - Submit result' }, 201)
})

router.get('/api/results/:id', async (request: Request, env: Env) => {
  return successResponse({ message: 'GET /api/results/:id - Get result' })
})

// ============================================================================
// ANALYTICS ROUTES (Placeholder)
// ============================================================================

router.get('/api/analytics', async (request: Request, env: Env) => {
  return successResponse({ message: 'GET /api/analytics - Get analytics' })
})

router.get('/api/analytics/leaderboard', async (request: Request, env: Env) => {
  return successResponse({ message: 'GET /api/analytics/leaderboard - Get leaderboard' })
})

// ============================================================================
// 404 Handler
// ============================================================================

router.all('*', () => {
  return errorResponse(new Error('Not Found'))
})

// ============================================================================
// Export Worker
// ============================================================================

export default {
  fetch: async (request: Request, env: Env): Promise<Response> => {
    const response = await router.handle(request, env)
    
    // Add CORS headers to all responses
    const origin = request.headers.get('origin') || undefined
    const corsHeaders = getCorsHeaders(origin)
    
    // Clone response and add CORS headers
    const newResponse = new Response(response.body, response)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value)
    })
    
    return newResponse
  },
}
