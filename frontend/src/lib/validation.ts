/**
 * Frontend validation utilities matching backend rules
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldErrors {
  [key: string]: string[]
}

// ─── Email Validation ─────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  if (!email) {
    errors.push('Email is required')
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format')
  } else if (email.length > 255) {
    errors.push('Email must not exceed 255 characters')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Password Validation ──────────────────────────────────────────────────

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
  } else {
    if (password.length < 8) {
      errors.push('Must be at least 8 characters')
    }
    if (password.length > 128) {
      errors.push('Must not exceed 128 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter (A-Z)')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Must contain at least one lowercase letter (a-z)')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Must contain at least one number (0-9)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Password Match Validation ────────────────────────────────────────────

export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  const errors: string[] = []

  if (!confirmPassword) {
    errors.push('Please confirm your password')
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Name Validation ──────────────────────────────────────────────────────

export function validateName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name) {
    errors.push('Full name is required')
  } else {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      errors.push('Name must be at least 2 characters')
    } else if (trimmed.length > 100) {
      errors.push('Name must not exceed 100 characters')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ─── Registration Form Validation ─────────────────────────────────────────

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  targetExam: string
}

export function validateRegistrationForm(form: RegisterFormData): { isValid: boolean; fieldErrors: FieldErrors } {
  const fieldErrors: FieldErrors = {}

  // Validate each field
  const nameVal = validateName(form.name)
  if (!nameVal.isValid) fieldErrors.name = nameVal.errors

  const emailVal = validateEmail(form.email)
  if (!emailVal.isValid) fieldErrors.email = emailVal.errors

  const passwordVal = validatePassword(form.password)
  if (!passwordVal.isValid) fieldErrors.password = passwordVal.errors

  const matchVal = validatePasswordMatch(form.password, form.confirmPassword)
  if (!matchVal.isValid) fieldErrors.confirmPassword = matchVal.errors

  // Exam is a select, so it's always valid if present
  if (!form.targetExam) {
    fieldErrors.targetExam = ['Please select a target exam']
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  }
}

// ─── Parse API Error Responses ────────────────────────────────────────────

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

export function parseApiErrors(error: unknown): FieldErrors {
  const fieldErrors: FieldErrors = {}

  if (error && typeof error === 'object') {
    const apiError = error as any

    // If it's an axios error with response data
    if (apiError.response?.data?.error?.details) {
      const details = apiError.response.data.error.details
      Object.entries(details).forEach(([field, message]) => {
        fieldErrors[field] = [message as string]
      })
    }

    // Handle specific status codes with user-friendly messages
    if (apiError.response?.status === 409 && apiError.response?.data?.error?.message) {
      // Conflict error - typically email already exists
      fieldErrors.email = [apiError.response.data.error.message]
    } else if (apiError.response?.status === 401 || apiError.response?.status === 403) {
      // Unauthorized or forbidden
      fieldErrors.credentials = ['Invalid email or password. Please try again.']
    } else if (apiError.response?.status === 400 && apiError.response?.data?.error?.message) {
      // Bad request - show the message without status code
      fieldErrors.api = [apiError.response.data.error.message]
    } else if (apiError.response?.status && apiError.response?.status >= 500) {
      // Server error - don't expose details
      fieldErrors.api = ['Something went wrong. Please try again later.']
    } else if (apiError.message && !apiError.message.includes('status code')) {
      // Non-status code error messages
      fieldErrors.api = [apiError.message]
    } else if (apiError.message) {
      // Generic error
      fieldErrors.api = ['An error occurred. Please try again.']
    }
  }

  return fieldErrors
}
