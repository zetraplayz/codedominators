'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Layers, FileText, Lock, Eye, ChevronRight, X, Loader2 } from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { useRouter } from 'next/navigation';

interface KitItem {
  id: number;
  name: string;
  subject: string;
  resourceCount: number;
  visibility: string;
  lastUpdated: string;
}

function VisibilityBadge({ v }: { v: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/20 text-[var(--color-base-text)] ${v === 'PRIVATE' ? 'bg-[var(--color-base-yellow)]' : 'bg-[var(--color-base-bg)]'} shadow-clay-btn`}>
      {v === 'PRIVATE' ? <Lock size={10} /> : <Eye size={10} />}
      {v === 'PRIVATE' ? 'Private' : 'Shared'}
    </span>
  );
}

export default function TeachingKitsPage() {
  const [kits, setKits] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const [newKitSubject, setNewKitSubject] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/kits', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => setKits(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKitName, subject: newKitSubject })
      });
      if (res.ok) {
        const newKit = await res.json();
        setKits(prev => [newKit, ...prev]);
        setNewKitName('');
        setNewKitSubject('');
        setIsModalOpen(false);
      } else {
        alert('Failed to create teaching kit');
      }
    } catch {
      alert('Network error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">Teaching Kits</h1>
          <p className="text-[var(--color-base-text)] opacity-60 font-medium mt-1 text-sm">
            Curated bundles of resources organised by subject or course.
          </p>
        </div>
        <ClayButton onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2">
          <Plus size={18} /> New Teaching Kit
        </ClayButton>
      </header>

      {/* Info Banner */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--color-base-yellow)] shadow-clay-pressed">
        <Layers size={20} className="text-[var(--color-base-text)] opacity-60 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[var(--color-base-text)] text-sm">What are Teaching Kits?</p>
          <p className="text-[var(--color-base-text)] opacity-60 text-xs mt-1 font-medium">
            A Teaching Kit groups multiple resources (notes, lab manuals, question banks) into one shareable bundle. HODs can approve kits for department-wide use.
          </p>
        </div>
      </div>

      {/* Kit List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card animate-pulse" />
          ))}
        </div>
      ) : kits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-[var(--color-base-text)]">
          <div className="p-6 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card">
            <BookOpen size={48} className="opacity-20" />
          </div>
          <div className="text-center">
            <p className="font-bold text-lg opacity-50">No teaching kits yet</p>
            <p className="text-sm opacity-40 max-w-xs mt-2">
              Create your first kit to bundle related resources into a structured package for your department.
            </p>
          </div>
          <ClayButton onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2 mt-2">
            <Plus size={16} /> Create First Kit
          </ClayButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kits.map(kit => (
            <div key={kit.id} onClick={() => router.push(`/dashboard/kits/${kit.id}`)} className="group p-6 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card hover:shadow-clay-pressed transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-btn">
                  <BookOpen size={22} className="text-[var(--color-base-text)]" />
                </div>
                <VisibilityBadge v={kit.visibility} />
              </div>
              <h3 className="font-bold text-[var(--color-base-text)] text-lg leading-tight">{kit.name}</h3>
              <p className="text-[var(--color-base-text)] opacity-50 text-xs font-medium mt-1">{kit.subject}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-base-text)]/10">
                <div className="flex items-center gap-1.5 text-[var(--color-base-text)] opacity-50">
                  <FileText size={14} />
                  <span className="text-xs font-medium">{kit.resourceCount} resources</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--color-base-text)] opacity-40 group-hover:opacity-80 transition-opacity">
                  <span className="text-xs font-bold">Open</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Kit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg p-8 rounded-[2rem] bg-[var(--color-base-bg)] shadow-clay-card flex flex-col relative border border-white/40">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all"
            >
              <X size={20} />
            </button>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Create Teaching Kit</h2>
              <p className="opacity-70 text-[var(--color-base-text)] font-medium mt-1">Organize resources into a single bundle.</p>
            </div>
            <form onSubmit={handleCreateKit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm text-[var(--color-base-text)]">Kit Name</label>
                <input
                  type="text"
                  required
                  value={newKitName}
                  onChange={(e) => setNewKitName(e.target.value)}
                  className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
                  placeholder="e.g. Database Systems 2026"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm text-[var(--color-base-text)]">Subject / Course</label>
                <input
                  type="text"
                  required
                  value={newKitSubject}
                  onChange={(e) => setNewKitSubject(e.target.value)}
                  className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
                  placeholder="e.g. CS-301"
                />
              </div>
              <div className="flex justify-end mt-2">
                <ClayButton type="submit" variant="primary" className="w-full flex items-center justify-center gap-2" disabled={creating}>
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {creating ? 'Creating...' : 'Create Kit'}
                </ClayButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
