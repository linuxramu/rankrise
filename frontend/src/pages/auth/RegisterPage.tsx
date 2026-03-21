import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { EXAM_LABELS } from '@/lib/utils'
import {
  validateRegistrationForm,
  validatePassword,
  parseApiErrors,
  type FieldErrors,
} from '@/lib/validation'

const EXAMS = Object.entries(EXAM_LABELS)

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  targetExam: string
}

interface VerificationState {
  showVerification: boolean
  email: string
  verificationToken?: string
}

export function RegisterPage() {
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetExam: 'JEE_MAINS',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [verification, setVerification] = useState<VerificationState>({
    showVerification: false,
    email: '',
  })

  // Real-time password validation
  const passwordValidation = useMemo(() => {
    return validatePassword(form.password)
  }, [form.password])

  const passwordMatches = form.password && form.confirmPassword && form.password === form.confirmPassword

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    // Validate form before submit
    const validation = validateRegistrationForm(form)
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors)
      return
    }

    setLoading(true)
    try {
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        targetExam: form.targetExam,
      })
      
      // Show verification message instead of redirecting
      setVerification({
        showVerification: true,
        email: form.email,
        verificationToken: (response as any)?.verificationToken,
      })
    } catch (error) {
      // Parse API errors and display them
      const apiErrors = parseApiErrors(error)
      setFieldErrors(apiErrors)
    } finally {
      setLoading(false)
    }
  }

  const generalError = fieldErrors.api ? fieldErrors.api[0] : null

  // Show verification message
  if (verification.showVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
        <Card className="w-full max-w-md text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto">
            <span className="text-xl">✓</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mb-6 text-sm text-gray-600">
            We've sent a verification link to <span className="font-medium">{verification.email}</span>
          </p>
          
          {verification.verificationToken && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <p className="text-xs text-blue-700 mb-2">For testing (dev only):</p>
              <code className="text-xs font-mono text-blue-600 break-all">{verification.verificationToken}</code>
            </div>
          )}

          <p className="mb-4 text-sm text-gray-600">
            Click the link in your email to verify your account. If you don't see the email, check your spam folder.
          </p>

          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Go to Login
          </Button>

          <p className="mt-4 text-center text-xs text-gray-500">
            After verifying your email, you can sign in with your credentials.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mb-6 text-sm text-gray-600">Join RankRise and start your exam preparation</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Field */}
          <Input
            id="name"
            label="Full Name"
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={fieldErrors.name ? fieldErrors.name[0] : undefined}
            placeholder="John Doe"
            disabled={loading}
          />

          {/* Email Field */}
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email ? fieldErrors.email[0] : undefined}
            placeholder="you@example.com"
            disabled={loading}
          />

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={fieldErrors.password ? fieldErrors.password[0] : undefined}
              placeholder="At least 8 characters"
              disabled={loading}
            />

            {/* Password Criteria Checklist */}
            {form.password && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-xs font-medium text-gray-700">Password must contain:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                      ✓
                    </span>
                    <span className={form.password.length >= 8 ? 'text-green-700' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}>
                      ✓
                    </span>
                    <span className={/[A-Z]/.test(form.password) ? 'text-green-700' : 'text-gray-500'}>
                      Uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={/[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}>
                      ✓
                    </span>
                    <span className={/[a-z]/.test(form.password) ? 'text-green-700' : 'text-gray-500'}>
                      Lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={/[0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}>
                      ✓
                    </span>
                    <span className={/[0-9]/.test(form.password) ? 'text-green-700' : 'text-gray-500'}>
                      Number (0-9)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={fieldErrors.confirmPassword ? fieldErrors.confirmPassword[0] : undefined}
            placeholder="Re-enter your password"
            disabled={loading}
          />

          {/* Password Match Indicator */}
          {form.password && form.confirmPassword && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                passwordMatches
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {passwordMatches ? '✓ Passwords match' : '✗ Passwords do not match'}
            </div>
          )}

          {/* Target Exam Select */}
          <div className="flex flex-col gap-1">
            <label htmlFor="exam" className="text-sm font-medium text-gray-700">
              Target Exam
            </label>
            <select
              id="exam"
              value={form.targetExam}
              onChange={(e) => handleChange('targetExam', e.target.value)}
              disabled={loading}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1 ${
                fieldErrors.targetExam
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
            >
              {EXAMS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {fieldErrors.targetExam && (
              <p className="text-xs text-red-600">{fieldErrors.targetExam[0]}</p>
            )}
          </div>

          {/* General Error Message */}
          {generalError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {generalError}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            loading={loading}
            disabled={!passwordValidation.isValid || !passwordMatches}
            className="mt-4"
          >
            Create account
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
