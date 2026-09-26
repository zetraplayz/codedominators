'use client';

import { useState, useEffect } from 'react';
import { X, Layers, Plus, Loader2 } from 'lucide-react';
import { ClayButton } from './ui/ClayButton';

interface KitItem {
  id: number;
  name: string;
  subject: string;
}

export function AddToKitModal({ 
  isOpen, 
  onClose, 
  resourceId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  resourceId: number | null; 
}) {
  const [kits, setKits] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/kits', { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => setKits(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAddToKit = async (kitId: number) => {
    if (!resourceId) return;
    setAddingTo(kitId);
    try {
      const res = await fetch(`/api/kits/${kitId}/resources`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_id: resourceId })
      });
      if (res.ok) {
        onClose();
      } else {
        alert('Failed to add resource to kit');
      }
    } catch {
      alert('Network error');
    } finally {
      setAddingTo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md p-8 rounded-[2rem] bg-[var(--color-base-bg)] shadow-clay-card flex flex-col relative border border-white/40">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)] flex items-center gap-2">
            <Layers size={24} />
            Add to Teaching Kit
          </h2>
          <p className="opacity-70 text-[var(--color-base-text)] font-medium mt-1 text-sm">
            Select a kit to include this resource.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-64 space-y-3 pr-2">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[var(--color-base-text)]" /></div>
          ) : kits.length === 0 ? (
            <div className="text-center p-4 text-[var(--color-base-text)] opacity-50 text-sm font-medium">
              You don't have any teaching kits yet.
            </div>
          ) : (
            kits.map(kit => (
              <div key={kit.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed transition-all">
                <div>
                  <p className="font-bold text-[var(--color-base-text)] text-sm">{kit.name}</p>
                  <p className="text-xs opacity-60 text-[var(--color-base-text)] font-medium">{kit.subject}</p>
                </div>
                <ClayButton
                  variant="primary"
                  className="px-3 py-1.5 h-auto text-xs"
                  onClick={() => handleAddToKit(kit.id)}
                  disabled={addingTo !== null}
                >
                  {addingTo === kit.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                  Add
                </ClayButton>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
