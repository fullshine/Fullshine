'use client'

import { useEffect, useState } from 'react'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_KEY!

export default function PushSubscribe() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'loading'>('idle')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission === 'granted') setStatus('subscribed')
    if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  async function subscribe() {
    if (!('serviceWorker' in navigator)) return
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })

      setStatus('subscribed')
    } catch (e) {
      console.error(e)
      setStatus('idle')
    }
  }

  if (status === 'subscribed') {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        🔔 Notificaciones activas
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        🔕 Notificaciones bloqueadas
      </div>
    )
  }

  return (
    <button
      onClick={subscribe}
      disabled={status === 'loading'}
      className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 disabled:opacity-50 transition-colors"
    >
      {status === 'loading' ? '...' : '🔔 Activar notificaciones'}
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
