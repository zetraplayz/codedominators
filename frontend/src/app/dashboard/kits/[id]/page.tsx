'use client';

import { useState, useEffect, use } from 'react';
import { BookOpen, FileText, Lock, Eye, ChevronLeft, Download } from 'lucide-react';
import { ClayButton } from '@/components/ui/ClayButton';
import { useRouter } from 'next/navigation';

interface KitResource {
  id: number;
  title: string;
  description: string;
  visibility: string;
  created_at: string;
}

interface KitDetails {
  id: number;
  name: string;
  subject: string;
  visibility: string;
  owner_id: number;
  lastUpdated: string;
  resources: KitResource[];
}

export default function KitDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [kit, setKit] = useState<KitDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/kits/${id}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setKit(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-32 bg-[var(--color-base-mint)] shadow-clay-card animate-pulse rounded-full" />
        <div className="h-32 bg-[var(--color-base-mint)] shadow-clay-card animate-pulse rounded-[2rem]" />
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Kit Not Found</h2>
        <ClayButton onClick={() => router.back()} className="mt-4">Go Back</ClayButton>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <button 
        onClick={() => router.push('/dashboard/kits')}
        className="flex items-center gap-2 text-[var(--color-base-text)] opacity-60 hover:opacity-100 transition-opacity font-bold text-sm"
      >
        <ChevronLeft size={16} />
        Back to Kits
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-8 rounded-[2rem] bg-[var(--color-base-mint)] shadow-clay-card">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn">
              <BookOpen size={20} className="text-[var(--color-base-text)]" />
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-white/20 text-[var(--color-base-text)] ${kit.visibility === 'PRIVATE' ? 'bg-[var(--color-base-yellow)]' : 'bg-[var(--color-base-bg)]'} shadow-clay-btn`}>
              {kit.visibility === 'PRIVATE' ? <Lock size={12} /> : <Eye size={12} />}
              {kit.visibility === 'PRIVATE' ? 'Private' : 'Shared'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">{kit.name}</h1>
          <p className="text-[var(--color-base-text)] opacity-60 font-medium mt-1 text-sm">
            {kit.subject} • {kit.resources.length} resources
          </p>
        </div>
      </div>

      {/* Resources List */}
      <div>
        <h3 className="text-xl font-bold text-[var(--color-base-text)] mb-6">Kit Resources</h3>
        
        {kit.resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-5 text-[var(--color-base-text)] rounded-[2rem] border-2 border-dashed border-[var(--color-base-text)]/20">
            <div className="p-6 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card">
              <FileText size={40} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg opacity-50">This kit is empty</p>
              <p className="text-sm opacity-40 max-w-xs mt-2">
                Add resources to this kit from the Resources page.
              </p>
            </div>
            <ClayButton onClick={() => router.push('/dashboard/resources')} variant="primary" className="mt-2">
              Browse Resources
            </ClayButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {kit.resources.map(res => (
              <div key={res.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-btn">
                    <FileText size={20} className="text-[var(--color-base-text)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-base-text)] text-base">{res.title}</h4>
                    <p className="text-[var(--color-base-text)] opacity-50 text-xs font-medium mt-1 line-clamp-1 max-w-lg">
                      {res.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-[3.25rem] md:ml-0">
                  <ClayButton onClick={() => window.open(`/api/resources/${res.id}/download`, '_blank')} className="flex items-center gap-2 h-10 px-4 text-xs">
                    <Download size={14} /> Download
                  </ClayButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
