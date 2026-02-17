'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';

interface Message {
  id: string;
  phone_number: string;
  sender_name: string;
  message_body: string;
  direction: 'inbound' | 'outbound';
  created_at: string;
  status: string;
}

interface Conversation {
  phone_number: string;
  contact_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  anonymous_id: string;
  crisis_level: number | null;
  conversation_state: string;
  assigned_to: string | null;
  assigned_name: string | null;
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface TagInfo {
  id: string;
  label: string;
}

interface Volunteer {
  id: string;
  full_name: string;
  role: string;
  is_on_duty: boolean;
}

export default function ConversacionesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [tagList, setTagList] = useState<TagInfo[]>([]);
  const [quickReplySearch, setQuickReplySearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('voluntario');
  const [userId, setUserId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [taking, setTaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
    fetchQuickReplies();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch quick replies
  async function fetchQuickReplies() {
    try {
      const res = await fetch('/api/content/mensajes');
      const data = await res.json();
      setQuickReplies(data.messages || []);
      if (data.tags && data.tags.length > 0) {
        setTagList(data.tags.filter((t: TagInfo) => t.id !== 'todos'));
      }
    } catch (error) {
      console.error('Error fetching quick replies:', error);
    }
  }

  // Filter quick replies
  const filteredReplies = quickReplies.filter(reply => {
    const matchesSearch = !quickReplySearch || 
      reply.title.toLowerCase().includes(quickReplySearch.toLowerCase()) ||
      reply.content.toLowerCase().includes(quickReplySearch.toLowerCase());
    const matchesTag = !selectedTag || (reply.tags && reply.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  function insertQuickReply(content: string) {
    setNewMessage(content);
    setShowQuickReplies(false);
  }

  // Take conversation
  async function handleTakeConversation(phone: string) {
    if (taking) return;
    setTaking(true);
    
    try {
      const res = await fetch('/api/whatsapp/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (res.ok) {
        fetchConversations();
      } else {
        const error = await res.json();
        alert('Error: ' + (error.error || 'No se pudo tomar la conversación'));
      }
    } catch (error) {
      console.error('Error taking conversation:', error);
      alert('Error de conexión');
    } finally {
      setTaking(false);
    }
  }

  // Transfer conversation (supervisors only)
  async function handleTransfer(phone: string, toVolunteerId: string) {
    try {
      const res = await fetch('/api/whatsapp/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, toVolunteerId }),
      });

      if (res.ok) {
        setShowTransferModal(false);
        fetchConversations();
        alert('✅ Conversación transferida');
      } else {
        const error = await res.json();
        alert('Error: ' + (error.error || 'No se pudo transferir'));
      }
    } catch (error) {
      console.error('Error transferring:', error);
      alert('Error de conexión');
    }
  }

  // Fetch volunteers for transfer
  async function fetchVolunteers() {
    try {
      const res = await fetch('/api/whatsapp/transfer');
      const data = await res.json();
      setVolunteers(data.volunteers || []);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  }

  // Close conversation
  async function handleCloseConversation(phone: string) {
    const confirmed = confirm(
      '¿Cerrar esta conversación?\n\nSe enviará automáticamente una encuesta de satisfacción al usuario.'
    );
    
    if (!confirmed) return;

    try {
      const res = await fetch('/api/whatsapp/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (res.ok) {
        alert('✅ Conversación cerrada y encuesta enviada');
        setSelectedPhone(null);
        fetchConversations();
      } else {
        const error = await res.json();
        alert('Error: ' + (error.message || 'No se pudo cerrar'));
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Error de conexión');
    }
  }

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedPhone) {
      fetchMessages(selectedPhone);
      const interval = setInterval(() => fetchMessages(selectedPhone), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedPhone]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch('/api/whatsapp/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
      setUserRole(data.userRole || 'voluntario');
      setUserId(data.userId || null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(phone: string) {
    try {
      const res = await fetch(`/api/whatsapp/messages?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPhone || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedPhone,
          message: newMessage.trim(),
        }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedPhone);
      } else {
        const error = await res.json();
        alert('Error enviando: ' + (error.message || 'Intenta de nuevo'));
      }
    } catch (error) {
      console.error('Error sending:', error);
      alert('Error de conexión');
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

  function getCrisisLevelColor(level: number | null) {
    if (!level) return 'bg-gray-200 text-gray-600';
    if (level >= 5) return 'bg-red-500 text-white';
    if (level >= 4) return 'bg-orange-500 text-white';
    if (level >= 3) return 'bg-yellow-500 text-white';
    return 'bg-blue-100 text-blue-700';
  }

  function getCrisisLevelEmoji(level: number | null) {
    if (!level) return '';
    if (level >= 5) return '🚨';
    if (level >= 4) return '⚠️';
    if (level >= 3) return '❗';
    return '💙';
  }

  const selectedConversation = conversations.find(c => c.phone_number === selectedPhone);
  const canTakeConversation = selectedConversation && 
    selectedConversation.conversation_state === 'waiting_for_volunteer';
  const isAssignedToMe = selectedConversation?.assigned_to === userId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sage)]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)]">
      {/* Conversations List */}
      <div className={`
        w-full md:w-80 border-r border-[var(--border)] bg-white flex flex-col
        ${selectedPhone ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="text-xl font-semibold">Conversaciones</h1>
          <p className="text-sm text-[var(--muted)]">
            {userRole === 'supervisor' ? 'Todas las conversaciones' : 'Conversaciones disponibles'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-[var(--muted)]">
              <p className="text-4xl mb-2">📭</p>
              <p>No hay conversaciones</p>
              <p className="text-xs mt-1">Los mensajes de WhatsApp aparecerán aquí</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.phone_number}
                onClick={() => setSelectedPhone(conv.phone_number)}
                className={`
                  w-full p-4 text-left border-b border-[var(--border)] transition-colors
                  ${selectedPhone === conv.phone_number 
                    ? 'bg-[var(--light-blue)]' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {conv.anonymous_id || 'Persona'}
                      </p>
                      {conv.crisis_level && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${getCrisisLevelColor(conv.crisis_level)}`}>
                          {getCrisisLevelEmoji(conv.crisis_level)} {conv.crisis_level}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)] truncate">
                      {conv.last_message}
                    </p>
                    {/* Status badges */}
                    <div className="flex items-center gap-1 mt-1">
                      {conv.conversation_state === 'waiting_for_volunteer' && (
                        <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                          Sin asignar
                        </span>
                      )}
                      {conv.assigned_name && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          {conv.assigned_to === userId ? 'Mía' : conv.assigned_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 text-right flex-shrink-0">
                    <p className="text-xs text-[var(--muted)]">
                      {formatTime(conv.last_message_at)}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 mt-1 text-xs font-medium text-white bg-[var(--terracotta)] rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 flex flex-col bg-[#f0f2f5] relative
        ${selectedPhone ? 'flex' : 'hidden md:flex'}
      `}>
        {selectedPhone && selectedConversation ? (
          <>
            {/* Chat Header - STICKY */}
            <div className="sticky top-0 z-10 p-4 bg-white border-b border-[var(--border)] flex items-center gap-3 shadow-sm">
              <button
                onClick={() => setSelectedPhone(null)}
                className="md:hidden p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-[var(--sage)] flex items-center justify-center text-white font-medium">
                {(selectedConversation.anonymous_id || 'P')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{selectedConversation.anonymous_id}</p>
                  {selectedConversation.crisis_level && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getCrisisLevelColor(selectedConversation.crisis_level)}`}>
                      Nivel {selectedConversation.crisis_level}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {selectedConversation.assigned_name 
                    ? `Asignado a: ${selectedConversation.assigned_to === userId ? 'ti' : selectedConversation.assigned_name}`
                    : 'Sin asignar'}
                </p>
              </div>
              
              {/* Action buttons - Desktop only (mobile buttons at bottom) */}
              <div className="hidden md:flex gap-2">
                {canTakeConversation && (
                  <button
                    onClick={() => handleTakeConversation(selectedPhone)}
                    disabled={taking}
                    className="px-3 py-1.5 text-sm bg-[var(--sage)] text-white rounded-lg hover:bg-[var(--sage)]/90 transition-colors flex items-center gap-1"
                  >
                    {taking ? '...' : '✋ Tomar'}
                  </button>
                )}
                
                {userRole === 'supervisor' && selectedConversation.conversation_state === 'assigned' && (
                  <button
                    onClick={() => {
                      fetchVolunteers();
                      setShowTransferModal(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    🔄 Transferir
                  </button>
                )}
                
                {(isAssignedToMe || userRole === 'supervisor') && (
                  <button
                    onClick={() => handleCloseConversation(selectedPhone)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    ✓ Cerrar
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Action Bar - Fixed at bottom for Safari compatibility */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] p-3 flex justify-center gap-3 z-20 shadow-lg safe-area-pb">
              {canTakeConversation && (
                <button
                  onClick={() => handleTakeConversation(selectedPhone)}
                  disabled={taking}
                  className="flex-1 max-w-[140px] py-3 text-sm bg-[var(--sage)] text-white rounded-xl hover:bg-[var(--sage)]/90 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                >
                  {taking ? '...' : '✋ Tomar'}
                </button>
              )}
              
              {userRole === 'supervisor' && selectedConversation.conversation_state === 'assigned' && (
                <button
                  onClick={() => {
                    fetchVolunteers();
                    setShowTransferModal(true);
                  }}
                  className="flex-1 max-w-[140px] py-3 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                >
                  🔄 Transferir
                </button>
              )}
              
              {(isAssignedToMe || userRole === 'supervisor') && (
                <button
                  onClick={() => handleCloseConversation(selectedPhone)}
                  className="flex-1 max-w-[140px] py-3 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
                >
                  ✓ Cerrar
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20 md:pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[75%] rounded-lg px-3 py-2 shadow-sm
                      ${msg.direction === 'outbound'
                        ? 'bg-[#dcf8c6] rounded-br-none'
                        : 'bg-white rounded-bl-none'
                      }
                      ${msg.status === 'system_note' ? 'bg-gray-200 text-gray-600 text-xs italic' : ''}
                    `}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message_body}</p>
                    <p className={`text-[10px] mt-1 text-right ${
                      msg.direction === 'outbound' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies Panel */}
            {showQuickReplies && (
              <div className="absolute bottom-20 left-0 right-0 mx-4 bg-white rounded-lg shadow-xl border border-[var(--border)] max-h-96 overflow-hidden z-10">
                <div className="p-3 border-b border-[var(--border)] bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">Respuestas rápidas</h3>
                    <button 
                      onClick={() => setShowQuickReplies(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar respuesta..."
                    value={quickReplySearch}
                    onChange={(e) => setQuickReplySearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-400"
                  />
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 max-h-20 overflow-y-auto">
                      <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                          !selectedTag ? 'bg-[var(--sage)] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Todos
                      </button>
                      {tagList.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                          className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                            selectedTag === tag.id ? 'bg-[var(--sage)] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="overflow-y-auto max-h-56">
                  {filteredReplies.length === 0 ? (
                    <p className="p-4 text-center text-sm text-gray-500">No se encontraron respuestas</p>
                  ) : (
                    filteredReplies.map(reply => (
                      <button
                        key={reply.id}
                        onClick={() => insertQuickReply(reply.content)}
                        className="w-full p-3 text-left hover:bg-[var(--light-blue)] border-b border-gray-100 transition-colors"
                      >
                        <p className="font-medium text-sm text-[var(--sage)]">{reply.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{reply.content}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Transferir conversación</h3>
                  <p className="text-sm text-gray-500 mb-4">Selecciona a quién transferir:</p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {volunteers.filter(v => v.id !== userId).map(vol => (
                      <button
                        key={vol.id}
                        onClick={() => handleTransfer(selectedPhone, vol.id)}
                        className="w-full p-3 text-left hover:bg-gray-100 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{vol.full_name}</p>
                          <p className="text-xs text-gray-500">
                            {vol.role === 'supervisor' ? '👑 Supervisor' : vol.role === 'admin' ? '⚙️ Admin' : '💙 Voluntario'}
                          </p>
                        </div>
                        {vol.is_on_duty && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            En guardia
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="mt-4 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Message Input - Only show if assigned to me or supervisor */}
            {(isAssignedToMe || userRole === 'supervisor' || canTakeConversation) && (
              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-[var(--border)] mb-[70px] md:mb-0">
                {canTakeConversation && !isAssignedToMe && (
                  <p className="text-xs text-center text-amber-600 mb-2">
                    Toma la conversación para responder
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={`p-2 rounded-full transition-colors ${
                      showQuickReplies 
                        ? 'bg-[var(--sage)] text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Respuestas rápidas"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isAssignedToMe || userRole === 'supervisor' ? "Escribe un mensaje..." : "Toma la conversación primero"}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-0 focus:border-gray-400"
                    disabled={sending || (!isAssignedToMe && userRole !== 'supervisor')}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending || (!isAssignedToMe && userRole !== 'supervisor')}
                    className="px-4 py-2 bg-[var(--sage)] text-white rounded-full disabled:opacity-50 hover:bg-[var(--sage)]/90 transition-colors"
                  >
                    {sending ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
            <div className="text-center">
              <p className="text-6xl mb-4">💬</p>
              <p className="text-lg">Selecciona una conversación</p>
              <p className="text-sm">para ver los mensajes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
