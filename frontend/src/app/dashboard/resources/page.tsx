'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileText, Download, Lock, Eye, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ClayButton } from '@/components/ui/ClayButton';
import { UploadResourceModal } from '@/components/UploadResourceModal';
import { AddToKitModal } from '@/components/AddToKitModal';
import { useSession } from '@/context/session';


interface Resource {
  id: number;
  title: string;
  description?: string;
  visibility: string;
  created_at: string;
  owner_id: string;
}

function VisibilityBadge({ v }: { v: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    PRIVATE:                  { label: 'Private',    icon: Lock, cls: 'bg-[var(--color-base-yellow)]' },
    DEPARTMENT_DISCOVERABLE:  { label: 'Department', icon: Eye,  cls: 'bg-[var(--color-base-mint)]'   },
    INSTITUTION_DISCOVERABLE: { label: 'Institution',icon: Eye,  cls: 'bg-[var(--color-base-bg)]'     },
  };
  const cfg = map[v] || map.PRIVATE;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-clay-btn border border-white/20 text-[var(--color-base-text)] ${cfg.cls}`}>
      <cfg.icon size={10} />{cfg.label}
    </span>
  );
}

export default function ResourcesPage() {
  const { user: session, loading: sessionLoading } = useSession();
  const [searchQuery, setSearchQuery]         = useState('');
  const [isUploadOpen, setIsUploadOpen]       = useState(false);
  const [resourceToKit, setResourceToKit]     = useState<number | null>(null);
  const [resources, setResources]             = useState<Resource[]>([]);
  const [displayedIds, setDisplayedIds]       = useState<number[] | null>(null); // null = show all
  const [dataLoading, setDataLoading]         = useState(true);
  const [aiSearching, setAiSearching]         = useState(false);
  const [aiExplanation, setAiExplanation]     = useState('');

  const fetchResources = useCallback(async () => {
    setDataLoading(true);
    setDisplayedIds(null);
    setAiExplanation('');
    try {
      const r = await fetch(`/api/resources/`, { credentials: 'include' });
      if (r.ok) setResources(await r.json());
    } catch { /* backend offline */ }
    finally { setDataLoading(false); }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // AI semantic search
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) { setDisplayedIds(null); setAiExplanation(''); return; }

    setAiSearching(true);
    setAiExplanation('');
    try {
      const res = await fetch(`/api/ai/search`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: q, resource_titles: resources.map(r => r.title) }),
      });
      if (res.ok) {
        const data = await res.json();
        const ranked = data.ranked_titles as string[];
        const matchedIds = ranked
          .map(title => resources.find(r => r.title === title)?.id)
          .filter((id): id is number => id !== undefined);
        setDisplayedIds(matchedIds.length > 0 ? matchedIds : []);
        setAiExplanation(data.explanation || '');
      }
    } catch {
      // fallback: simple text filter
      const lower = q.toLowerCase();
      setDisplayedIds(resources.filter(r => r.title.toLowerCase().includes(lower)).map(r => r.id));
    } finally {
      setAiSearching(false);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const res = await fetch(`/api/resources/${id}/download`, { credentials: 'include' });
      if (!res.ok) {
        alert('Failed to download resource or access denied.');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // We extract filename from content-disposition if possible, but fallback to a default
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `resource-${id}`;
      if (contentDisposition && contentDisposition.includes('filename="')) {
        filename = contentDisposition.split('filename="')[1].split('"')[0];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Network error while downloading.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { 
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchResources();
      } else {
        alert('Failed to delete resource.');
      }
    } catch {
      alert('Network error while deleting.');
    }
  };

  const displayed = displayedIds === null
    ? resources
    : displayedIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];

  if (sessionLoading || dataLoading) return <div className="text-[var(--color-base-text)] opacity-50 p-10 font-bold animate-pulse">Loading vault...</div>;
  if (!session) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">Resource Vault</h1>
          <p className="text-[var(--color-base-text)] opacity-60 font-medium mt-1 text-sm">
            Your teaching materials, notes and question banks — powered by MESH AI.
          </p>
        </div>
        <ClayButton variant="primary" className="flex items-center gap-2" onClick={() => setIsUploadOpen(true)}>
          <Plus size={18} /> Upload Resource
        </ClayButton>
      </header>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--color-base-text)] opacity-50">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Semantic search powered by MESH AI…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); if (!e.target.value.trim()) { setDisplayedIds(null); setAiExplanation(''); } }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none shadow-clay-pressed bg-[var(--color-base-mint)] text-[var(--color-base-text)] font-medium placeholder:opacity-40 focus:ring-2 focus:ring-[var(--color-base-text)]/20 transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={aiSearching || !searchQuery.trim()}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-btn hover:shadow-clay-pressed disabled:opacity-40 font-bold text-sm text-[var(--color-base-text)] transition-all"
        >
          {aiSearching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          AI Search
        </button>
      </div>

      {/* AI explanation */}
      {aiExplanation && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--color-base-yellow)] shadow-clay-pressed text-sm font-medium text-[var(--color-base-text)]">
          <Sparkles size={14} className="flex-shrink-0 opacity-60" />
          <span className="opacity-70">{aiExplanation}</span>
        </div>
      )}

      {/* Resource grid */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-[var(--color-base-text)]">
          <FileText size={48} className="opacity-20" />
          <p className="font-bold opacity-50">
            {displayedIds !== null ? 'No matching resources found' : 'Your vault is empty'}
          </p>
          <p className="text-sm opacity-40 text-center max-w-sm">
            {displayedIds !== null
              ? 'Try a different search term — MESH AI looks for meaning, not just keywords.'
              : 'Upload your first resource to start building your teaching library.'}
          </p>
          {displayedIds === null && (
            <button onClick={() => setIsUploadOpen(true)} className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-base-mint)] shadow-clay-btn text-sm font-bold text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all">
              <Plus size={16} /> Upload now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map(resource => (
            <div key={resource.id} className="group p-6 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card hover:shadow-clay-pressed transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-btn text-[var(--color-base-text)]">
                  <FileText size={22} />
                </div>
                {resource.owner_id === session.id && (
                  <span className="text-[10px] font-bold text-[var(--color-base-text)] opacity-40 uppercase tracking-widest pt-1">Mine</span>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/dashboard/resources/${resource.id}`}>
                  <h3 className="font-bold text-[var(--color-base-text)] leading-tight line-clamp-2 hover:underline decoration-2 underline-offset-4 cursor-pointer" title={resource.title}>
                    {resource.title}
                  </h3>
                </Link>
                {resource.description && (
                  <p className="text-[var(--color-base-text)] opacity-50 text-xs font-medium mt-1 line-clamp-2">{resource.description}</p>
                )}
                <p className="text-[var(--color-base-text)] opacity-40 text-xs font-medium mt-2">
                  {new Date(resource.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-base-text)]/10 relative">
                <VisibilityBadge v={resource.visibility} />
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(resource.id)} className="p-2 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] opacity-60 hover:opacity-100 transition-all" title="Download Resource">
                    <Download size={16} />
                  </button>
                  {resource.owner_id === session.id && (
                    <button className="p-2 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] opacity-60 hover:opacity-100 transition-all group relative" title="Options">
                      <div className="w-4 flex justify-between items-center px-0.5">
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                      </div>
                      
                      {/* Dropdown Menu (Hover based for now) */}
                      <div className="absolute bottom-full right-0 mb-2 w-32 bg-[var(--color-base-mint)] shadow-clay-card rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden border border-white/20 z-10">
                        <Link href={`/dashboard/resources/${resource.id}`} className="px-4 py-2.5 text-xs font-bold text-[var(--color-base-text)] hover:bg-[var(--color-base-bg)] transition-colors text-left border-b border-white/10 text-decoration-none">View Details</Link>
                        <div className="px-4 py-2.5 text-xs font-bold text-[var(--color-base-text)] hover:bg-[var(--color-base-bg)] transition-colors text-left border-b border-white/10 cursor-pointer" onClick={() => setResourceToKit(resource.id)}>Add to Kit</div>
                        <div className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer" onClick={() => handleDelete(resource.id)}>Delete</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadResourceModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchResources}
        userId={session.id}
      />
      <AddToKitModal
        isOpen={resourceToKit !== null}
        onClose={() => setResourceToKit(null)}
        resourceId={resourceToKit}
      />
    </div>
  );
}
