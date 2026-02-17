'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';

interface ToolboxItem {
  title: string;
  content: string;
}

interface ToolboxSection {
  id: string;
  title: string;
  description: string;
  items: ToolboxItem[];
}

export default function ToolboxPage() {
  const [toolboxData, setToolboxData] = useState<ToolboxSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['bienvenida']);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/content/toolbox');
        if (res.ok) {
          const data = await res.json();
          setToolboxData(data.sections || []);
          // Auto-expand first section if exists
          if (data.sections?.length > 0) {
            setExpandedSections([data.sections[0].id]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch toolbox:', err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleItem = (itemKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemKey)
        ? prev.filter((key) => key !== itemKey)
        : [...prev, itemKey]
    );
  };

  const filteredSections = toolboxData
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (section) =>
        section.items.length > 0 ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          Toolbox
        </h1>
        <p className="text-[var(--muted)]">
          Manual de protocolos y técnicas para voluntarios • {toolboxData.length} secciones
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBar
          placeholder="Buscar en el manual..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-[var(--border)] overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--cream)] transition-colors"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl font-medium">{section.title}</span>
                <span className="text-sm text-[var(--muted)]">({section.items.length})</span>
              </div>
              <svg
                className={`w-5 h-5 text-[var(--muted)] transition-transform flex-shrink-0 ${
                  expandedSections.includes(section.id) ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Section Items */}
            {expandedSections.includes(section.id) && (
              <div className="border-t border-[var(--border)]">
                {section.items.map((item, itemIndex) => {
                  const itemKey = `${section.id}-${itemIndex}`;
                  return (
                    <div key={itemKey} className="border-b border-[var(--border)] last:border-b-0">
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full px-6 py-3 flex items-center justify-between hover:bg-[var(--cream)]/50 transition-colors"
                      >
                        <span className="text-[var(--foreground)] font-medium text-left">
                          {item.title}
                        </span>
                        <svg
                          className={`w-4 h-4 text-[var(--muted)] transition-transform flex-shrink-0 ${
                            expandedItems.includes(itemKey) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {expandedItems.includes(itemKey) && (
                        <div className="px-6 pb-4 text-[var(--foreground)]/80 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {filteredSections.length === 0 && searchQuery && (
          <div className="text-center py-12 text-[var(--muted)]">
            No se encontraron resultados para &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
