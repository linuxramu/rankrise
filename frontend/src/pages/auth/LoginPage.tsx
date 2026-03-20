import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { validateEmail, parseApiErrors, type FieldErrors } from '@/lib/validation'

interface FormData {
  email: string
  password: string
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

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

    // Basic validation
    const errors: FieldErrors = {}
    if (!form.email) {
      errors.email = ['Email is required']
    } else if (!validateEmail(form.email).isValid) {
      errors.email = ['Invalid email format']
    }

    if (!form.password) {
      errors.password = ['Password is required']
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (error) {
      // Parse API errors
      const apiErrors = parseApiErrors(error)
      if (Object.keys(apiErrors).length === 0) {
        // If no specific field errors, show general error
        setFieldErrors({
          credentials: ['Invalid email or password. Please try again.'],
        })
      } else {
        setFieldErrors(apiErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  const credentialsError = fieldErrors.credentials ? fieldErrors.credentials[0] : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome to RankRise</h1>
        <p className="mb-6 text-sm text-gray-600">Sign in to continue your exam preparation</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={fieldErrors.password ? fieldErrors.password[0] : undefined}
            placeholder="Enter your password"
            disabled={loading}
          />

          {credentialsError && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {credentialsError}
            </div>
          )}

          <Button type="submit" loading={loading} className="mt-4">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
