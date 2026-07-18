'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/actions/admin'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/kanban', label: 'CRM', icon: '🗂️' },
  { href: '/admin/agenda', label: 'Agenda', icon: '📅' },
  { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { href: '/admin/servicios', label: 'Servicios', icon: '✨' },
  { href: '/admin/finanzas', label: 'Finanzas', icon: '💰' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 bg-gray-900 flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-white font-bold">Fullshine</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Bottom nav móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(item => (
          <Link key={item.href} href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors min-w-[52px]',
              pathname.startsWith(item.href)
                ? 'text-blue-400'
                : 'text-gray-500'
            )}>
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs font-medium text-gray-500 min-w-[52px]">
          <span className="text-xl leading-none">🚪</span>
          <span>Salir</span>
        </button>
      </nav>
    </>
  )
}
