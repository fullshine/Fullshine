'use client'

import { useState } from 'react'
import { signIn } from '@/actions/admin'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const result = await signIn(email, password)
    if (!result.success) {
      setError(result.error ?? 'Credenciales incorrectas')
      setLoading(false)
    } else {
      window.location.href = '/admin/dashboard'
    }
  }

  return (
    <form action={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input className="input-field" type="email" name="email" required
          placeholder="admin@fullshine.autos" autoComplete="email" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input className="input-field" type="password" name="password" required
          autoComplete="current-password" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
