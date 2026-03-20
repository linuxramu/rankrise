// ============================================================================
// Error Handling & Response Utilities
// ============================================================================

import { ApiResponse, ValidationError } from '../types/index'

// ─── Custom Error Classes ─────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Record<string, string>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationErrorClass extends AppError {
  constructor(message: string, public validationErrors: ValidationError[]) {
    super('VALIDATION_ERROR', message, 400)
    this.details = validationErrors.reduce(
      (acc, err) => {
        acc[err.field] = err.message
        return acc
      },
      {} as Record<string, string>
    )
    this.name = 'ValidationErrorClass'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409)
    this.name = 'ConflictError'
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_SERVER_ERROR', message, 500)
    this.name = 'InternalServerError'
  }
}

// ─── Response Builders ────────────────────────────────────────────────────

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function successResponse<T>(data: T, statusCode = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  }
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: corsHeaders,
  })
}

export function errorResponse(error: AppError | Error): Response {
  let statusCode = 400
  let code = 'ERROR'
  let message = 'An error occurred'
  let details: Record<string, string> | undefined

  if (error instanceof AppError) {
    statusCode = error.statusCode
    code = error.code
    message = error.message
    details = error.details
  } else {
    message = error.message
  }

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: corsHeaders,
  })
}

// ─── Error Handler Middleware ─────────────────────────────────────────────

export function createErrorHandler(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('[Error Handler]', error)

      if (error instanceof AppError) {
        return errorResponse(error)
      }

      if (error instanceof Error) {
        return errorResponse(error)
      }

      return errorResponse(new InternalServerError('Unknown error occurred'))
    }
  }
}

// ─── Validation Error Response ────────────────────────────────────────────

export function validationErrorResponse(errors: ValidationError[]): Response {
  const error = new ValidationErrorClass('Validation failed', errors)
  return errorResponse(error)
}

// ─── Common Error Responses ───────────────────────────────────────────────

export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return errorResponse(new UnauthorizedError(message))
}

export function notFoundResponse(resource: string): Response {
  return errorResponse(new NotFoundError(resource))
}

export function conflictResponse(message: string): Response {
  return errorResponse(new ConflictError(message))
}

export function internalErrorResponse(message?: string): Response {
  return errorResponse(new InternalServerError(message))
}

// ─── Request Parsing Helpers ──────────────────────────────────────────────

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text()
    if (!text) {
      throw new SyntaxError('Empty body')
    }
    return JSON.parse(text)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AppError('INVALID_JSON', 'Invalid JSON in request body', 400)
    }
    throw error
  }
}

export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

// ─── Request Logging ──────────────────────────────────────────────────────

export function logRequest(request: Request, status: number, error?: Error): void {
  const url = new URL(request.url)
  const time = new Date().toISOString()
  const log = `[${time}] ${request.method} ${url.pathname} - ${status}`

  if (error) {
    console.error(log, error)
  } else {
    console.log(log)
  }
}
