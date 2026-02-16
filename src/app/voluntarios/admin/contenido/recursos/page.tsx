'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  description?: string
  resource_type?: string
  contact?: string
  link?: string
  sort_order: number
  is_active: boolean
}

interface ResourceCategory {
  id: string
  slug: string
  title: string
  description: string
  icon?: string
  sort_order: number
  is_active: boolean
  resources: Resource[]
}

export default function RecursosEditorPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [editingResource, setEditingResource] = useState<{ categoryId: string; resourceId: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState('')
  const [editContact, setEditContact] = useState('')
  const [editLink, setEditLink] = useState('')
  
  // New category modal
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('')
  
  // New resource modal
  const [showNewResourceModal, setShowNewResourceModal] = useState<string | null>(null)
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [newResourceDescription, setNewResourceDescription] = useState('')
  const [newResourceType, setNewResourceType] = useState('')
  const [newResourceContact, setNewResourceContact] = useState('')
  const [newResourceLink, setNewResourceLink] = useState('')
  
  // Editing category
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryTitle, setEditCategoryTitle] = useState('')
  const [editCategoryDescription, setEditCategoryDescription] = useState('')
  
  const router = useRouter()

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/recursos')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      } else if (res.status === 401) {
        router.push('/auth/login')
      } else if (res.status === 403) {
        router.push('/voluntarios')
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err)
      showMessage('error', 'Error al cargar recursos')
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

  // === CATEGORY FUNCTIONS ===
  const addCategory = async () => {
    if (!newCategoryTitle.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/recursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          title: newCategoryTitle,
          description: newCategoryDescription || '',
          icon: newCategoryIcon || '📁'
        })
      })
      
      if (res.ok) {
        await fetchData()
        setNewCategoryTitle('')
        setNewCategoryDescription('')
        setNewCategoryIcon('')
        setShowNewCategoryModal(false)
        showMessage('success', 'Categoría creada ✓')
      } else {
        showMessage('error', 'Error al crear categoría')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const startEditingCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      setEditingCategory(categoryId)
      setEditCategoryTitle(category.title)
      setEditCategoryDescription(category.description)
    }
  }

  const saveCategory = async () => {
    if (!editingCategory) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/recursos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          id: editingCategory,
          title: editCategoryTitle,
          description: editCategoryDescription
        })
      })
      
      if (res.ok) {
        await fetchData()
        setEditingCategory(null)
        showMessage('success', 'Categoría actualizada ✓')
      } else {
        showMessage('error', 'Error al guardar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta categoría y todos sus recursos?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/recursos?type=category&id=${categoryId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchData()
        setExpandedCategory(null)
        showMessage('success', 'Categoría eliminada ✓')
      } else {
        showMessage('error', 'Error al eliminar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  // === RESOURCE FUNCTIONS ===
  const addResource = async (categoryId: string) => {
    if (!newResourceTitle.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/recursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resource',
          category_id: categoryId,
          title: newResourceTitle,
          description: newResourceDescription,
          resource_type: newResourceType,
          contact: newResourceContact,
          link: newResourceLink
        })
      })
      
      if (res.ok) {
        await fetchData()
        setNewResourceTitle('')
        setNewResourceDescription('')
        setNewResourceType('')
        setNewResourceContact('')
        setNewResourceLink('')
        setShowNewResourceModal(null)
        showMessage('success', 'Recurso agregado ✓')
      } else {
        showMessage('error', 'Error al crear recurso')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const startEditing = (categoryId: string, resource: Resource) => {
    setEditingResource({ categoryId, resourceId: resource.id })
    setEditTitle(resource.title)
    setEditDescription(resource.description || '')
    setEditType(resource.resource_type || '')
    setEditContact(resource.contact || '')
    setEditLink(resource.link || '')
  }

  const cancelEditing = () => {
    setEditingResource(null)
    setEditTitle('')
    setEditDescription('')
    setEditType('')
    setEditContact('')
    setEditLink('')
  }

  const saveEdit = async () => {
    if (!editingResource) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/recursos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'resource',
          id: editingResource.resourceId,
          title: editTitle,
          description: editDescription,
          resource_type: editType,
          contact: editContact,
          link: editLink
        })
      })
      
      if (res.ok) {
        await fetchData()
        cancelEditing()
        showMessage('success', 'Cambios guardados ✓')
      } else {
        showMessage('error', 'Error al guardar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const deleteResource = async (resourceId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este recurso?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/recursos?type=resource&id=${resourceId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchData()
        showMessage('success', 'Recurso eliminado ✓')
      } else {
        showMessage('error', 'Error al eliminar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

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
        <Link 
          href="/voluntarios/admin/contenido"
          className="text-sm text-[var(--sage)] hover:underline mb-2 inline-block"
        >
          ← Volver a Editor de Contenido
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editor de Recursos</h1>
            <p className="text-gray-500 mt-1">Gestiona categorías y recursos de ayuda</p>
          </div>
          <button
            onClick={() => setShowNewCategoryModal(true)}
            disabled={saving}
            className="px-4 py-2 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Categoría
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💾 Conectado a base de datos:</strong> Los cambios se guardan permanentemente.
        </p>
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No hay categorías aún</p>
          <button
            onClick={() => setShowNewCategoryModal(true)}
            className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg"
          >
            Crear primera categoría
          </button>
        </div>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className="flex-1 text-left"
              >
                {editingCategory === category.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editCategoryTitle}
                      onChange={(e) => setEditCategoryTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                      placeholder="Título"
                    />
                    <input
                      type="text"
                      value={editCategoryDescription}
                      onChange={(e) => setEditCategoryDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Descripción"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon || '📁'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                )}
              </button>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {category.resources?.length || 0} recursos
                </span>
                
                {editingCategory === category.id ? (
                  <>
                    <button onClick={saveCategory} disabled={saving} className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50">
                      {saving ? '...' : 'Guardar'}
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditingCategory(category.id)} className="text-xs px-2 py-1 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => deleteCategory(category.id)} disabled={saving} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded disabled:opacity-50">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
                
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedCategory === category.id && (
              <div className="border-t border-gray-200">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <button
                    onClick={() => setShowNewResourceModal(category.id)}
                    disabled={saving}
                    className="text-sm px-3 py-1.5 bg-white border border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Recurso
                  </button>
                </div>
                
                {(!category.resources || category.resources.length === 0) ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Esta categoría está vacía. Agrega un recurso para comenzar.
                  </div>
                ) : (
                  category.resources.map((resource) => (
                    <div key={resource.id} className="border-b border-gray-100 last:border-b-0 px-6 py-4">
                      {editingResource?.resourceId === resource.id ? (
                        <div className="space-y-3">
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-medium" placeholder="Título" />
                          <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Descripción" />
                          <div className="grid grid-cols-3 gap-3">
                            <input type="text" value={editType} onChange={(e) => setEditType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Tipo (Teléfono, Web...)" />
                            <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contacto" />
                            <input type="text" value={editLink} onChange={(e) => setEditLink(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Link" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} disabled={saving} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded disabled:opacity-50">{saving ? '...' : 'Guardar'}</button>
                            <button onClick={cancelEditing} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{resource.title}</h4>
                            {resource.description && <p className="text-sm text-gray-500 mt-1">{resource.description}</p>}
                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                              {resource.resource_type && <span>Tipo: {resource.resource_type}</span>}
                              {resource.contact && <span>Contacto: {resource.contact}</span>}
                              {resource.link && <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver enlace</a>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditing(category.id, resource)} className="text-xs px-2 py-1 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              Editar
                            </button>
                            <button onClick={() => deleteResource(resource.id)} disabled={saving} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center gap-1 disabled:opacity-50">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Categoría</h3>
            <div className="space-y-4">
              <input type="text" value={newCategoryTitle} onChange={(e) => setNewCategoryTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Título" />
              <input type="text" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Descripción" />
              <input type="text" value={newCategoryIcon} onChange={(e) => setNewCategoryIcon(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Emoji (ej: 📞)" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewCategoryModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={addCategory} disabled={!newCategoryTitle.trim() || saving} className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg disabled:opacity-50">{saving ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* New Resource Modal */}
      {showNewResourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Nuevo Recurso</h3>
            <div className="space-y-4">
              <input type="text" value={newResourceTitle} onChange={(e) => setNewResourceTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Título *" />
              <input type="text" value={newResourceDescription} onChange={(e) => setNewResourceDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Descripción" />
              <input type="text" value={newResourceType} onChange={(e) => setNewResourceType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Tipo (Teléfono, WhatsApp, Web...)" />
              <input type="text" value={newResourceContact} onChange={(e) => setNewResourceContact(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Contacto (número, email...)" />
              <input type="text" value={newResourceLink} onChange={(e) => setNewResourceLink(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Link (URL)" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewResourceModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={() => addResource(showNewResourceModal)} disabled={!newResourceTitle.trim() || saving} className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg disabled:opacity-50">{saving ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
