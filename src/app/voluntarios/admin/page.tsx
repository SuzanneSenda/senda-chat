'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Channel Manager Component
function ChannelManager() {
  const [config, setConfig] = useState<{
    whatsapp_enabled: boolean;
    sms_enabled: boolean;
    updated_at: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/channels')
      .then(res => res.json())
      .then(data => {
        setConfig(data.config);
        setLoading(false);
      })
      .catch(() => {
        setConfig({ whatsapp_enabled: true, sms_enabled: false, updated_at: '' });
        setLoading(false);
      });
  }, []);

  const toggleChannel = async (channel: 'whatsapp' | 'sms') => {
    if (!config) return;
    
    setSaving(true);
    const newConfig = {
      ...config,
      [`${channel}_enabled`]: !config[`${channel}_enabled` as keyof typeof config],
    };

    try {
      const res = await fetch('/api/admin/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_enabled: newConfig.whatsapp_enabled,
          sms_enabled: newConfig.sms_enabled,
        }),
      });

      if (res.ok) {
        setConfig(newConfig);
        setMessage({ type: 'success', text: `Canal ${channel.toUpperCase()} ${newConfig[`${channel}_enabled` as keyof typeof newConfig] ? 'activado' : 'desactivado'}` });
      } else {
        setMessage({ type: 'error', text: 'Error al actualizar canal' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión' });
    }
    
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Canales de comunicación</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp Channel */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          config?.whatsapp_enabled 
            ? 'bg-green-50 border-green-300' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config?.whatsapp_enabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-500">
                  {config?.whatsapp_enabled ? 'Recibiendo mensajes' : 'Canal pausado'}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('whatsapp')}
              disabled={saving}
              className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                config?.whatsapp_enabled 
                  ? 'bg-green-500 focus:ring-green-500' 
                  : 'bg-gray-300 focus:ring-gray-400'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  config?.whatsapp_enabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Sandbox: +1 415 523 8886
          </p>
        </div>

        {/* SMS Channel */}
        <div className={`p-4 rounded-xl border-2 transition-all ${
          config?.sms_enabled 
            ? 'bg-blue-50 border-blue-300' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config?.sms_enabled ? 'bg-blue-500' : 'bg-gray-400'}`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">SMS</h3>
                <p className="text-sm text-gray-500">
                  {config?.sms_enabled ? 'Recibiendo mensajes' : 'Canal pausado'}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleChannel('sms')}
              disabled={saving}
              className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                config?.sms_enabled 
                  ? 'bg-blue-500 focus:ring-blue-500' 
                  : 'bg-gray-300 focus:ring-gray-400'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                  config?.sms_enabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER || 'No configurado - se necesita número'}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        💡 Desactiva un canal para pausar la recepción de mensajes sin perder la configuración.
      </p>
    </div>
  );
}

// Stats Dashboard Component
function StatsDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de conversaciones</h2>
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-[var(--sage)]">{stats.totalConversations || 0}</p>
          <p className="text-sm text-gray-500">Conversaciones totales</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-blue-500">{stats.closedConversations || 0}</p>
          <p className="text-sm text-gray-500">Conversaciones cerradas</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-purple-500">{stats.surveyResponses || 0}</p>
          <p className="text-sm text-gray-500">Respuestas a encuesta</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-3xl font-bold text-amber-500">{stats.averageScore || '-'}</p>
          <p className="text-sm text-gray-500">Calificación promedio</p>
        </div>
      </div>

      {/* Score Distribution */}
      {stats.scoreDistribution && stats.surveyResponses > 0 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Distribución de calificaciones</p>
          <div className="flex items-end gap-2 h-24">
            {stats.scoreDistribution.map((item: { score: number; count: number }) => {
              const maxCount = Math.max(...stats.scoreDistribution.map((s: any) => s.count), 1)
              const height = (item.count / maxCount) * 100
              return (
                <div key={item.score} className="flex-1 flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">{item.count}</span>
                  <div 
                    className="w-full bg-[var(--sage)] rounded-t transition-all"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs font-medium text-gray-700 mt-1">{item.score}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">1 = No me ayudó → 5 = Me ayudó mucho</p>
        </div>
      )}

      {/* Response Rate */}
      {stats.closedConversations > 0 && (
        <div className="bg-gradient-to-r from-[var(--sage)]/10 to-blue-50 p-4 rounded-xl border border-[var(--sage)]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Tasa de respuesta a encuesta</p>
              <p className="text-xs text-gray-500">Usuarios que respondieron después de cerrar</p>
            </div>
            <p className="text-2xl font-bold text-[var(--sage)]">{stats.responseRate}%</p>
          </div>
        </div>
      )}
    </div>
  )
}

type UserProfile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: 'supervisor' | 'admin' | 'voluntario'
  status: 'pending' | 'active' | 'inactive'
  created_at: string
  last_sign_in: string | null
}

const roleLabels = {
  supervisor: 'Supervisor',
  admin: 'Administrador', 
  voluntario: 'Voluntario',
}

const roleColors = {
  supervisor: 'bg-[#d6865d]/20 text-[#d6865d] border-[#d6865d]/30',
  admin: 'bg-[#9ab5af]/20 text-[#9ab5af] border-[#9ab5af]/30',
  voluntario: 'bg-[#d3e4e5]/40 text-[#7a9a9e] border-[#d3e4e5]',
}

const statusLabels = {
  pending: 'Pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
}

export default function AdminPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const initRef = useRef(false)

  // Initialize: fetch data from server-side API routes
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    
    async function init() {
      try {
        // Fetch current user's profile from server-side API
        console.log('Admin: fetching profile from API...')
        const meResponse = await fetch('/api/admin/me')
        
        console.log('Admin: me API status:', meResponse.status)
        
        if (meResponse.status === 401) {
          console.log('Admin: not authenticated')
          router.push('/auth/login')
          return
        }
        
        if (!meResponse.ok) {
          console.log('Admin: me API error')
          setAuthChecked(true)
          setLoading(false)
          return
        }
        
        const meData = await meResponse.json()
        console.log('Admin: me API result:', meData)
        
        const { user, profile: profileData } = meData
        
        if (!profileData) {
          console.log('Admin: no profile data')
          setAuthChecked(true)
          setLoading(false)
          return
        }
        
        setUserId(user.id)
        
        const userProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name,
          phone: profileData.phone || null,
          role: profileData.role || 'voluntario',
          status: profileData.status || 'active',
          created_at: profileData.created_at,
          last_sign_in: null
        }
        setProfile(userProfile)
        
        // Check permissions
        if (userProfile.role !== 'supervisor' && userProfile.role !== 'admin') {
          console.log('Admin: user is not admin/supervisor, redirecting')
          router.push('/voluntarios')
          return
        }
        
        // Fetch all users from server-side API
        console.log('Admin: fetching users from API...')
        const usersResponse = await fetch('/api/admin/users')
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          console.log('Admin: users API result:', usersData.users?.length)
          
          if (Array.isArray(usersData.users)) {
            const mappedUsers = usersData.users.map((u: any) => ({
              id: u.id,
              email: u.email,
              full_name: u.full_name,
              phone: u.phone || null,
              role: u.role || 'voluntario',
              status: u.status || 'active',
              created_at: u.created_at,
              last_sign_in: null
            }))
            setUsers(mappedUsers)
            console.log('Admin: users loaded:', mappedUsers.length)
          }
        }
        
        setAuthChecked(true)
        setLoading(false)
      } catch (err) {
        console.error('Admin: init error:', err)
        setAuthChecked(true)
        setLoading(false)
      }
    }
    
    init()
  }, [router])

  const updateUserRole = async (userId: string, newRole: 'supervisor' | 'admin' | 'voluntario') => {
    // Only supervisors can change roles
    if (profile?.role !== 'supervisor') {
      setMessage({ type: 'error', text: 'Solo los supervisores pueden cambiar roles' })
      return
    }

    setActionLoading(userId)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      setMessage({ type: 'success', text: 'Rol actualizado correctamente' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar rol' })
    }
    
    setActionLoading(null)
    setTimeout(() => setMessage(null), 3000)
  }

  const updateUserStatus = async (userId: string, newStatus: 'pending' | 'active' | 'inactive') => {
    setActionLoading(userId)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      setMessage({ type: 'success', text: newStatus === 'active' ? 'Usuario aprobado' : 'Estado actualizado' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar estado' })
    }
    
    setActionLoading(null)
    setTimeout(() => setMessage(null), 3000)
  }

  const updateUserPhone = async (userId: string, phone: string) => {
    setActionLoading(userId)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone: phone || null })
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      setUsers(users.map(u => u.id === userId ? { ...u, phone } : u))
      setMessage({ type: 'success', text: 'WhatsApp actualizado' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar WhatsApp' })
    }
    
    setActionLoading(null)
    setTimeout(() => setMessage(null), 3000)
  }

  const deleteUser = async (userId: string, userName: string) => {
    const confirmed = confirm(`¿Estás seguro de eliminar a "${userName}"?\n\nEsta acción no se puede deshacer.`)
    if (!confirmed) return

    setActionLoading(userId)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      setUsers(users.filter(u => u.id !== userId))
      setMessage({ type: 'success', text: 'Usuario eliminado' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al eliminar usuario' })
    }
    
    setActionLoading(null)
    setTimeout(() => setMessage(null), 3000)
  }

  // Loading state
  if (loading || !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sage)]"></div>
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Not logged in
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-600">Debes iniciar sesión.</p>
        <a href="/auth/login" className="text-[var(--sage)] hover:underline">
          Iniciar sesión
        </a>
      </div>
    )
  }

  // No profile loaded
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-600">Error al cargar perfil.</p>
        <a href="/voluntarios" className="text-[var(--sage)] hover:underline">
          Volver al inicio
        </a>
      </div>
    )
  }

  // Not authorized
  if (profile.role !== 'supervisor' && profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-600">No tienes permisos para ver esta página.</p>
        <a href="/voluntarios" className="text-[var(--sage)] hover:underline">
          Volver al inicio
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sage)]"></div>
        <p className="text-sm text-gray-500">Cargando usuarios...</p>
      </div>
    )
  }

  const pendingUsers = users.filter(u => u.status === 'pending')
  const activeUsers = users.filter(u => u.status === 'active')
  const inactiveUsers = users.filter(u => u.status === 'inactive')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
        <p className="text-gray-500 mt-1">Gestiona usuarios y contenido</p>
      </div>

      {/* Stats Dashboard */}
      <StatsDashboard />

      {/* Channel Manager */}
      <ChannelManager />

      {/* Content Editors Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Editores de Contenido</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/voluntarios/admin/contenido/toolbox"
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[var(--sage)] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Toolbox</h3>
            </div>
            <p className="text-sm text-gray-500">Manual de herramientas y técnicas</p>
          </a>

          <a
            href="/voluntarios/admin/contenido/mensajes"
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[var(--sage)] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Mensajes</h3>
            </div>
            <p className="text-sm text-gray-500">Respuestas pre-escritas</p>
          </a>

          <a
            href="/voluntarios/admin/contenido/recursos"
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-[var(--sage)] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Recursos</h3>
            </div>
            <p className="text-sm text-gray-500">Contactos y referencias externas</p>
          </a>
        </div>
      </div>

      {/* Users Section Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestión de Usuarios</h2>

      {/* Notification */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Pendientes de Aprobación ({pendingUsers.length})
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-medium text-gray-900">{u.full_name || 'Sin nombre'}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Registrado: {new Date(u.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateUserStatus(u.id, 'active')}
                    disabled={actionLoading === u.id}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading === u.id ? '...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => updateUserStatus(u.id, 'inactive')}
                    disabled={actionLoading === u.id}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Users */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Usuarios Activos ({activeUsers.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">WhatsApp</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Rol</th>
                {profile.role === 'supervisor' && (
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.full_name || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      defaultValue={u.phone || ''}
                      onBlur={(e) => {
                        const newPhone = e.target.value.trim()
                        if (newPhone !== (u.phone || '')) {
                          updateUserPhone(u.id, newPhone)
                        }
                      }}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-[var(--sage)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${roleColors[u.role]}`}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  {profile.role === 'supervisor' && (
                    <td className="px-4 py-3 text-right">
                      {u.id !== userId ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as any)}
                            disabled={actionLoading === u.id}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--sage)]"
                          >
                            <option value="voluntario">Voluntario</option>
                            <option value="admin">Admin</option>
                            <option value="supervisor">Supervisor</option>
                          </select>
                          <button
                            onClick={() => updateUserStatus(u.id, 'inactive')}
                            disabled={actionLoading === u.id}
                            className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                            title="Desactivar usuario"
                          >
                            ⏸️
                          </button>
                          <button
                            onClick={() => deleteUser(u.id, u.full_name || u.email)}
                            disabled={actionLoading === u.id}
                            className="px-2 py-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">(Tú)</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {activeUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No hay usuarios activos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inactive Users */}
      {inactiveUsers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Usuarios Inactivos ({inactiveUsers.length})
          </h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2">
            {inactiveUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                <div>
                  <p className="text-gray-600">{u.full_name || u.email}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateUserStatus(u.id, 'active')}
                    disabled={actionLoading === u.id}
                    className="px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    title="Activar usuario"
                  >
                    ▶️ Activar
                  </button>
                  <button
                    onClick={() => deleteUser(u.id, u.full_name || u.email)}
                    disabled={actionLoading === u.id}
                    className="px-2 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="Eliminar usuario"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
