import LoginForm from '@/components/admin/LoginForm'

export const metadata = { title: 'Login | Fullshine Admin' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Fullshine Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Panel de gestión</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
