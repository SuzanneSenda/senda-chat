'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';

interface Resource {
  title: string;
  description?: string;
  type?: string;
  contact?: string;
  link?: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  resources: Resource[];
}

export default function RecursosPage() {
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/content/recursos');
        if (res.ok) {
          const data = await res.json();
          setResourceCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredCategories = resourceCategories
    .map((category) => ({
      ...category,
      resources: category.resources.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (resource.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (category) =>
        category.resources.length > 0 ||
        category.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const displayCategories = selectedCategory
    ? filteredCategories.filter((c) => c.id === selectedCategory)
    : filteredCategories;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const totalResources = resourceCategories.reduce((acc, cat) => acc + cat.resources.length, 0);

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
          Recursos
        </h1>
        <p className="text-[var(--muted)]">
          Materiales internos y externos para referencia • {totalResources} recursos
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          placeholder="Buscar recursos..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !selectedCategory
              ? 'bg-[var(--sage)] text-white'
              : 'bg-white border border-[var(--border)] hover:border-[var(--sage)] text-[var(--foreground)]'
          }`}
        >
          Todos
        </button>
        {resourceCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-[var(--sage)] text-white'
                : 'bg-white border border-[var(--border)] hover:border-[var(--sage)] text-[var(--foreground)]'
            }`}
          >
            {category.icon} {category.title.split(' ').slice(-1)[0]}
          </button>
        ))}
      </div>

      {/* Resources */}
      <div className="space-y-8">
        {displayCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h2 className="text-xl font-semibold">{category.title}</h2>
                {category.description && (
                  <p className="text-sm text-[var(--muted)]">{category.description}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              {category.resources.map((resource, index) => {
                const itemId = `${category.id}-${index}`;

                return (
                  <div
                    key={itemId}
                    className="bg-white rounded-lg border border-[var(--border)] p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-[var(--muted)] mt-1">{resource.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resource.type && (
                            <span className="text-xs bg-[var(--cream)] text-[var(--muted)] px-2 py-1 rounded">
                              {resource.type}
                            </span>
                          )}
                          {resource.contact && (
                            <span className="text-xs bg-[var(--light-blue)]/30 text-[var(--sage)] px-2 py-1 rounded">
                              {resource.contact}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        {resource.link && (
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm bg-[var(--cream)] hover:bg-[var(--sage)] hover:text-white text-[var(--foreground)] rounded-lg transition-all"
                          >
                            Abrir
                          </a>
                        )}
                        <button
                          onClick={() => {
                            // Build full copy text with title, description, contact, and link
                            let fullText = resource.title;
                            if (resource.description) fullText += `\n${resource.description}`;
                            if (resource.contact) fullText += `\n📞 ${resource.contact}`;
                            if (resource.link) fullText += `\n🔗 ${resource.link}`;
                            copyToClipboard(fullText, itemId);
                          }}
                          className={`px-3 py-1 text-sm rounded-lg transition-all ${
                            copiedItem === itemId
                              ? 'bg-green-100 text-green-700'
                              : 'bg-[var(--cream)] hover:bg-[var(--sage)] hover:text-white text-[var(--foreground)]'
                          }`}
                        >
                          {copiedItem === itemId ? '✓' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {displayCategories.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            {searchQuery || selectedCategory
              ? 'No se encontraron recursos con estos filtros'
              : 'No hay recursos disponibles'}
          </div>
        )}
      </div>
    </div>
  );
}
