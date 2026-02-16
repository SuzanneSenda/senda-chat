'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ToolboxItem {
  id: string
  title: string
  content: string
  sort_order: number
  is_active: boolean
}

interface ToolboxSection {
  id: string
  slug: string
  title: string
  description: string
  icon?: string
  sort_order: number
  is_active: boolean
  items: ToolboxItem[]
}

export default function ToolboxEditorPage() {
  const [sections, setSections] = useState<ToolboxSection[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<{ sectionId: string; itemId: string } | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // New section modal
  const [showNewSectionModal, setShowNewSectionModal] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newSectionDescription, setNewSectionDescription] = useState('')
  
  // New item modal
  const [showNewItemModal, setShowNewItemModal] = useState<string | null>(null)
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemContent, setNewItemContent] = useState('')
  
  // Editing section
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editSectionTitle, setEditSectionTitle] = useState('')
  const [editSectionDescription, setEditSectionDescription] = useState('')
  
  const router = useRouter()

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content/toolbox')
      if (res.ok) {
        const data = await res.json()
        setSections(data.sections || [])
      } else if (res.status === 401) {
        router.push('/auth/login')
      } else if (res.status === 403) {
        router.push('/voluntarios')
      }
    } catch (err) {
      console.error('Failed to fetch toolbox:', err)
      showMessage('error', 'Error al cargar el contenido')
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

  // === SECTION FUNCTIONS ===
  const addSection = async () => {
    if (!newSectionTitle.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/toolbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          title: newSectionTitle,
          description: newSectionDescription || ''
        })
      })
      
      if (res.ok) {
        await fetchData()
        setNewSectionTitle('')
        setNewSectionDescription('')
        setShowNewSectionModal(false)
        showMessage('success', 'Sección creada ✓')
      } else {
        showMessage('error', 'Error al crear sección')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const startEditingSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      setEditingSection(sectionId)
      setEditSectionTitle(section.title)
      setEditSectionDescription(section.description)
    }
  }

  const saveSection = async () => {
    if (!editingSection) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/toolbox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          id: editingSection,
          title: editSectionTitle,
          description: editSectionDescription
        })
      })
      
      if (res.ok) {
        await fetchData()
        setEditingSection(null)
        showMessage('success', 'Sección actualizada ✓')
      } else {
        showMessage('error', 'Error al guardar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta sección y todo su contenido?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/toolbox?type=section&id=${sectionId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchData()
        setExpandedSection(null)
        showMessage('success', 'Sección eliminada ✓')
      } else {
        showMessage('error', 'Error al eliminar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  // === ITEM FUNCTIONS ===
  const addItem = async (sectionId: string) => {
    if (!newItemTitle.trim() || !newItemContent.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/toolbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          section_id: sectionId,
          title: newItemTitle,
          content: newItemContent
        })
      })
      
      if (res.ok) {
        await fetchData()
        setNewItemTitle('')
        setNewItemContent('')
        setShowNewItemModal(null)
        showMessage('success', 'Item agregado ✓')
      } else {
        showMessage('error', 'Error al crear item')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const startEditing = (sectionId: string, item: ToolboxItem) => {
    setEditingItem({ sectionId, itemId: item.id })
    setEditTitle(item.title)
    setEditContent(item.content)
  }

  const cancelEditing = () => {
    setEditingItem(null)
    setEditContent('')
    setEditTitle('')
  }

  const saveEdit = async () => {
    if (!editingItem) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/content/toolbox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          id: editingItem.itemId,
          title: editTitle,
          content: editContent
        })
      })
      
      if (res.ok) {
        await fetchData()
        setEditingItem(null)
        setEditContent('')
        setEditTitle('')
        showMessage('success', 'Cambios guardados ✓')
      } else {
        showMessage('error', 'Error al guardar')
      }
    } catch {
      showMessage('error', 'Error de conexión')
    }
    setSaving(false)
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('¿Seguro que quieres eliminar este item?')) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/content/toolbox?type=item&id=${itemId}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        await fetchData()
        showMessage('success', 'Item eliminado ✓')
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
            <h1 className="text-2xl font-bold text-gray-900">Editor del Toolbox</h1>
            <p className="text-gray-500 mt-1">Edita las secciones y contenido del manual</p>
          </div>
          <button
            onClick={() => setShowNewSectionModal(true)}
            disabled={saving}
            className="px-4 py-2 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Sección
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💾 Conectado a base de datos:</strong> Los cambios se guardan permanentemente.
        </p>
      </div>

      {/* Empty state */}
      {sections.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No hay secciones aún</p>
          <button
            onClick={() => setShowNewSectionModal(true)}
            className="px-4 py-2 bg-[var(--sage)] text-white rounded-lg"
          >
            Crear primera sección
          </button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="flex-1 text-left"
              >
                {editingSection === section.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editSectionTitle}
                      onChange={(e) => setEditSectionTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                      placeholder="Título de la sección"
                    />
                    <input
                      type="text"
                      value={editSectionDescription}
                      onChange={(e) => setEditSectionDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Descripción"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                )}
              </button>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {section.items?.length || 0} items
                </span>
                
                {editingSection === section.id ? (
                  <>
                    <button
                      onClick={saveSection}
                      disabled={saving}
                      className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded disabled:opacity-50"
                    >
                      {saving ? '...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditingSection(section.id)}
                      className="text-xs px-2 py-1 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded flex items-center gap-1"
                      title="Editar sección"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      disabled={saving}
                      className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center gap-1 disabled:opacity-50"
                      title="Eliminar sección"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
                
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Section Items */}
            {expandedSection === section.id && (
              <div className="border-t border-gray-200">
                {/* Add Item Button */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <button
                    onClick={() => setShowNewItemModal(section.id)}
                    disabled={saving}
                    className="text-sm px-3 py-1.5 bg-white border border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Item
                  </button>
                </div>
                
                {(!section.items || section.items.length === 0) ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    Esta sección está vacía. Agrega un item para comenzar.
                  </div>
                ) : (
                  section.items.map((item) => (
                    <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                          {editingItem?.itemId === item.id ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-medium"
                              placeholder="Título del item"
                            />
                          ) : (
                            <h4 className="font-medium text-gray-800">{item.title}</h4>
                          )}
                          
                          {editingItem?.itemId === item.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50"
                              >
                                {saving ? '...' : 'Guardar'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(section.id, item)}
                                className="text-xs px-2 py-1 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                disabled={saving}
                                className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {editingItem?.itemId === item.id ? (
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="mt-3 w-full h-64 p-3 border border-gray-200 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--sage)]"
                          />
                        ) : (
                          <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                            {item.content.length > 300 
                              ? item.content.substring(0, 300) + '...' 
                              : item.content}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Section Modal */}
      {showNewSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Sección</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  placeholder="Ej: Técnicas de Escucha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  placeholder="Breve descripción de la sección"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewSectionModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addSection}
                disabled={!newSectionTitle.trim() || saving}
                className="px-4 py-2 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nuevo Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  placeholder="Ej: Escucha Activa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage)] font-mono text-sm resize-y"
                  placeholder="Escribe el contenido aquí..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewItemModal(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => addItem(showNewItemModal)}
                disabled={!newItemTitle.trim() || !newItemContent.trim() || saving}
                className="px-4 py-2 bg-[var(--sage)] hover:bg-[var(--olive)] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
