'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ContentType = 'toolbox' | 'mensajes' | 'recursos'

export default function ContentAdminPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me')
        if (res.ok) {
          const data = await res.json()
          if (data.profile?.role === 'supervisor' || data.profile?.role === 'admin') {
            setAuthorized(true)
          } else {
            router.push('/voluntarios')
          }
        } else {
          router.push('/auth/login')
        }
      } catch {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sage)]"></div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  const contentTypes = [
    {
      id: 'toolbox' as ContentType,
      title: 'Toolbox',
      description: 'Manual y protocolos de atención',
      icon: '📚',
      count: '15 secciones',
      href: '/voluntarios/admin/contenido/toolbox',
    },
    {
      id: 'mensajes' as ContentType,
      title: 'Mensajes',
      description: 'Respuestas pre-escritas para voluntarios',
      icon: '💬',
      count: '40+ mensajes',
      href: '/voluntarios/admin/contenido/mensajes',
    },
    {
      id: 'recursos' as ContentType,
      title: 'Recursos',
      description: 'Líneas de emergencia y recursos comunitarios',
      icon: '📋',
      count: '3 categorías',
      href: '/voluntarios/admin/contenido/recursos',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/voluntarios/admin"
          className="text-sm text-[var(--sage)] hover:underline mb-2 inline-block"
        >
          ← Volver a Administración
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editor de Contenido</h1>
        <p className="text-gray-500 mt-1">
          Edita el contenido del Toolbox, Mensajes y Recursos
        </p>
      </div>

      <div className="grid gap-4">
        {contentTypes.map((type) => (
          <Link
            key={type.id}
            href={type.href}
            className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-[var(--sage)] hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{type.icon}</span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{type.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{type.description}</p>
                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {type.count}
                </span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Nota:</strong> Los cambios que hagas aquí se guardarán en la base de datos y se reflejarán inmediatamente para todos los voluntarios.
        </p>
      </div>
    </div>
  )
}
