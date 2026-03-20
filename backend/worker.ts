import { Router } from 'itty-router'
import { Env, AuthResponse, User } from './src/types/index'
import { hashPassword, createToken } from './src/utils/auth'
import { validateRegistration } from './src/utils/validation'
import { successResponse, errorResponse, validationErrorResponse, ConflictError, parseJsonBody, InternalServerError, UnauthorizedError } from './src/utils/errors'
import { userExistsByEmail, createUser, getUserByEmail, updateUserLastLogin, getUserPasswordHash } from './src/db/users'
import { verifyPassword } from './src/utils/auth'

const router = Router<{ Bindings: Env }>()

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
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

    // Create user
    const user = await createUser(env.DB, email, passwordHash, name, targetExam)

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
    return router.handle(request, env)
  },
}
