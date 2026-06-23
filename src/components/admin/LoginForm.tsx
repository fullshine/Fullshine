'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/actions/admin'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn(email, password)
    if (result.success) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      setError(result.error ?? 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input className="input-field" type="email" required value={email}
          onChange={e => setEmail(e.target.value)} placeholder="admin@fullshine.autos" autoComplete="email" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input className="input-field" type="password" required value={password}
          onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
