// ============================================================================
// Input Validation Utilities
// ============================================================================

import { ExamType, RegisterPayload, LoginPayload } from '../types/index'

// ─── Email Validation ─────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 255
}

// ─── Password Validation ──────────────────────────────────────────────────

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters')
    }
    // Optional: enforce stronger passwords
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Name Validation ──────────────────────────────────────────────────────

export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false
  }

  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

// ─── Exam Type Validation ─────────────────────────────────────────────────

const VALID_EXAM_TYPES: ExamType[] = ['JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'EAPCET']

export function isValidExamType(exam: string): exam is ExamType {
  return VALID_EXAM_TYPES.includes(exam as ExamType)
}

// ─── Registration Validation ──────────────────────────────────────────────

export interface ValidationError {
  field: string
  message: string
}

export function validateRegistration(payload: unknown): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Invalid request body' }],
    }
  }

  const data = payload as Record<string, unknown>

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' })
  } else {
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.isValid) {
      errors.push({
        field: 'password',
        message: passwordValidation.errors.join('; '),
      })
    }
  }

  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required' })
  } else if (!isValidName(data.name)) {
    errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' })
  }

  // Target exam validation
  if (!data.targetExam || typeof data.targetExam !== 'string') {
    errors.push({ field: 'targetExam', message: 'Target exam is required' })
  } else if (!isValidExamType(data.targetExam)) {
    errors.push({
      field: 'targetExam',
      message: `Invalid exam type. Must be one of: ${VALID_EXAM_TYPES.join(', ')}`,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Login Validation ──────────────────────────────────────────────────────

export function validateLogin(payload: unknown): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Invalid request body' }],
    }
  }

  const data = payload as Record<string, unknown>

  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' })
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  // Password validation
  if (!data.password || typeof data.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Generic Validation Helpers ────────────────────────────────────────────

export function validateRequired(value: unknown, fieldName: string): ValidationError | null {
  if (!value) {
    return { field: fieldName, message: `${fieldName} is required` }
  }
  return null
}

export function validateString(value: unknown, fieldName: string, min?: number, max?: number): ValidationError | null {
  if (typeof value !== 'string') {
    return { field: fieldName, message: `${fieldName} must be a string` }
  }

  if (min && value.length < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min} characters` }
  }

  if (max && value.length > max) {
    return { field: fieldName, message: `${fieldName} must not exceed ${max} characters` }
  }

  return null
}

export function validateNumber(value: unknown, fieldName: string, min?: number, max?: number): ValidationError | null {
  if (typeof value !== 'number') {
    return { field: fieldName, message: `${fieldName} must be a number` }
  }

  if (min !== undefined && value < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min}` }
  }

  if (max !== undefined && value > max) {
    return { field: fieldName, message: `${fieldName} must not exceed ${max}` }
  }

  return null
}
