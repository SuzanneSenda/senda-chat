'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  title: string
  content: string
  usage_hint?: string
  tags: string[]
  sort_order: number
  is_active: boolean
}

interface Tag {
  id: string
  slug: string
  label: string
  sort_order: number
}

export default function MensajesEditorPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  
  // Editing message
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editUsage, setEditUsage] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  
  // New message modal
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newUsage, setNewUsage] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])
  
  // New tag modal
  const [showNewTagModal, setShowNewTagModal] = useState(false)
  const [newTagLabel, setNewTagLabel] = useState('')
  
  const router = useRouter()

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/mensajes')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setTags(data.tags || [])
      } else if (res.status === 401) {
        router.push('/auth/login')
      } else if (res.status === 403) {
        router.push('/voluntarios')
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      showMsg('error', 'Error al cargar mensajes')
    }
  }, [router])

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/admin/me')
        if (res.ok) {
          const data = await res.json()
          if (data.profile?.role === 'supervisor' || data.profile?.role === 'admin') {
            setAuthorized(true)
            await fetchData()
          } else {
            router.push('/voluntarios')
            return
          }
        } else {
          router.push('/auth/login')
          return
        }
      } catch {
        router.push('/auth/login')
        return
      }
      setLoading(false)
    }
    init()
  }, [router, fetchData])

  // === TAG FUNCTIONS ===
  const addTag = async () => {
    if (!newTagLabel.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tag',
          slug: newTagLabel.toLowerCase().replace(/\s+/g, '-'),
          label: newTagLabel
        })
      })
      
      if (res.ok) {
        await fetchData()
        setNewTagLabel('')
        setShowNewTagModal(false)
        showMsg('success', 'Etiqueta creada ✓')
      } else {
        showMsg('error', 'Error al crear etiqueta')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const deleteTag = async (tagId: string) => {
    if (!confirm('¿Eliminar esta etiqueta? Los mensajes conservarán su contenido.')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/mensajes?type=tag&id=${tagId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
        showMsg('success', 'Etiqueta eliminada ✓')
      } else {
        showMsg('error', 'Error al eliminar')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSaving(false)
  }

  // === MESSAGE FUNCTIONS ===
  const addMessage = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          title: newTitle,
          content: newContent,
          usage_hint: newUsage,
          tags: newTags
        })
      })
      
      if (res.ok) {
        await fetchData()
        setNewTitle('')
        setNewContent('')
        setNewUsage('')
        setNewTags([])
        setShowNewMessageModal(false)
        showMsg('success', 'Mensaje creado ✓')
      } else {
        showMsg('error', 'Error al crear mensaje')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const startEditing = (msg: Message) => {
    setEditingMessage(msg.id)
    setEditTitle(msg.title)
    setEditContent(msg.content)
    setEditUsage(msg.usage_hint || '')
    setEditTags(msg.tags || [])
  }

  const cancelEditing = () => {
    setEditingMessage(null)
    setEditTitle('')
    setEditContent('')
    setEditUsage('')
    setEditTags([])
  }

  const saveEdit = async () => {
    if (!editingMessage) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/mensajes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          id: editingMessage,
          title: editTitle,
          content: editContent,
          usage_hint: editUsage,
          tags: editTags
        })
      })
      
      if (res.ok) {
        await fetchData()
        cancelEditing()
        showMsg('success', 'Cambios guardados ✓')
      } else {
        showMsg('error', 'Error al guardar')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const deleteMessage = async (msgId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este mensaje?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/mensajes?type=message&id=${msgId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
        showMsg('success', 'Mensaje eliminado ✓')
      } else {
        showMsg('error', 'Error al eliminar')
      }
    } catch {
      showMsg('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const toggleTag = (tagSlug: string, list: string[], setList: (t: string[]) => void) => {
    if (list.includes(tagSlug)) {
      setList(list.filter(t => t !== tagSlug))
    } else {
      setList([...list, tagSlug])
    }
  }

  const filteredMessages = filterTag === 'all' 
    ? messages 
    : messages.filter(m => m.tags?.includes(filterTag))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sage)]"></div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/voluntarios/admin/contenido" className="text-sm text-[var(--sage)] hover:underline mb-2 inline-block">
          ← Volver a Editor de Contenido
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Mensajes</h1>
            <p className="text-gray-500 mt-1">Gestiona respuestas pre-escritas</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewTagModal(true)}
              disabled={saving}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              + Etiqueta
            </button>
            <button
              onClick={() => setShowNewMessageModal(true)}
              disabled={saving}
              className="px-4 py-2 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Mensaje
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800"><strong>💾 Conectado a base de datos:</strong> Los cambios se guardan permanentemente.</p>
      </div>

      {/* Tags section */}
      {tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">Filtrar por etiqueta:</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${filterTag === 'all' ? 'bg-[var(--sage)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Todas ({messages.length})
            </button>
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center">
                <button
                  onClick={() => setFilterTag(tag.slug)}
                  className={`px-3 py-1 rounded-l-full text-sm transition-colors ${filterTag === tag.slug ? 'bg-[var(--sage)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {tag.label} ({messages.filter(m => m.tags?.includes(tag.slug)).length})
                </button>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-500 rounded-r-full text-xs"
                  title="Eliminar etiqueta"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredMessages.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No hay mensajes{filterTag !== 'all' ? ' con esta etiqueta' : ' aún'}</p>
          <button onClick={() => setShowNewMessageModal(true)} className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg">
            Crear primer mensaje
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {editingMessage === msg.id ? (
              <div className="p-6 space-y-4">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-medium" placeholder="Título" />
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y" placeholder="Contenido del mensaje..." />
                <input type="text" value={editUsage} onChange={(e) => setEditUsage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Cuándo usar (opcional)" />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Etiquetas:</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button key={tag.id} onClick={() => toggleTag(tag.slug, editTags, setEditTags)} className={`px-3 py-1 rounded-full text-xs transition-colors ${editTags.includes(tag.slug) ? 'bg-[var(--sage)] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
                  <button onClick={cancelEditing} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{msg.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => startEditing(msg)} className="text-xs px-2 py-1 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Editar
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} disabled={saving} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center gap-1 disabled:opacity-50">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content}</p>
                {msg.usage_hint && <p className="text-xs text-gray-400 mb-2">💡 {msg.usage_hint}</p>}
                {msg.tags && msg.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {msg.tags.map(tagSlug => {
                      const tag = tags.find(t => t.slug === tagSlug)
                      return tag ? <span key={tagSlug} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">{tag.label}</span> : null
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Tag Modal */}
      {showNewTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Etiqueta</h3>
            <input type="text" value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" placeholder="Nombre de la etiqueta" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNewTagModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={addTag} disabled={!newTagLabel.trim() || saving} className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg disabled:opacity-50">{saving ? '...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nuevo Mensaje</h3>
            <div className="space-y-4">
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Título *" />
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm resize-y" placeholder="Contenido del mensaje *" />
              <input type="text" value={newUsage} onChange={(e) => setNewUsage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Cuándo usar (opcional)" />
              {tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Etiquetas:</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button key={tag.id} onClick={() => toggleTag(tag.slug, newTags, setNewTags)} className={`px-3 py-1 rounded-full text-xs transition-colors ${newTags.includes(tag.slug) ? 'bg-[var(--sage)] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewMessageModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={addMessage} disabled={!newTitle.trim() || !newContent.trim() || saving} className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg disabled:opacity-50">{saving ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
