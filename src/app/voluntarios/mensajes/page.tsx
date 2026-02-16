'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';

interface Message {
  title: string;
  content: string;
  usage?: string;
  tags: string[];
}

interface Tag {
  id: string;
  label: string;
}

export default function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('todos');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/content/mensajes');
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setTags([{ id: 'todos', label: 'Todos' }, ...(data.tags || [])]);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'todos' || message.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sage)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: 'var(--font-quicksand)' }}>
          Mensajes
        </h1>
        <p className="text-[var(--muted)]">
          Respuestas pre-escritas para situaciones comunes • {messages.length} mensajes
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          placeholder="Buscar mensajes..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Tags Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTag === tag.id
                ? 'bg-[var(--sage)] text-white'
                : 'bg-white border border-[var(--border)] hover:border-[var(--sage)] text-[var(--foreground)]'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Messages Count */}
      <p className="text-sm text-[var(--muted)] mb-4">
        Mostrando {filteredMessages.length} de {messages.length} mensajes
      </p>

      {/* Messages Grid */}
      <div className="grid gap-4">
        {filteredMessages.map((message, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{message.title}</h3>
              <button
                onClick={() => copyToClipboard(message.content, index)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex-shrink-0 ml-4 ${
                  copiedId === index
                    ? 'bg-green-100 text-green-700'
                    : 'bg-[var(--cream)] hover:bg-[var(--sage)] hover:text-white text-[var(--foreground)]'
                }`}
              >
                {copiedId === index ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-[var(--foreground)]/80 text-sm leading-relaxed whitespace-pre-wrap mb-3">
              {message.content}
            </p>
            {message.usage && (
              <p className="text-xs text-[var(--muted)] mb-3">💡 {message.usage}</p>
            )}
            {message.tags && message.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.tags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className="px-2 py-0.5 bg-[var(--cream)] text-[var(--muted)] text-xs rounded"
                    >
                      {tag.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            {searchQuery || selectedTag !== 'todos'
              ? 'No se encontraron mensajes con estos filtros'
              : 'No hay mensajes disponibles'}
          </div>
        )}
      </div>
    </div>
  );
}
