import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug?: string[] }
}) {
  // No proteger la página de login
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const isLoginPage = typeof window === 'undefined' &&
    process.env.NEXT_RUNTIME === 'edge'

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}