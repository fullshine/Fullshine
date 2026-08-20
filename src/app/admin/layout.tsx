import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: 'Fullshine Admin',
  robots: { index: false, follow: false },
  // Manifiesto propio del panel: así el acceso directo del admin abre el
  // dashboard, y el del sitio público abre la portada.
  manifest: '/manifest-admin.json',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
