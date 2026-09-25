"use client";

import { useState } from "react";
import { X, UploadCloud } from "lucide-react";
import { ClayButton } from "./ui/ClayButton";

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  userId?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function UploadResourceModal({ isOpen, onClose, onUploadSuccess, userId = 'sample_faculty_id' }: UploadResourceModalProps) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE');
  const [file, setFile]             = useState<File | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file to upload.'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('visibility', visibility);
      formData.append('file', file);

      const response = await fetch(`${API}/api/resources/`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer DEV_TOKEN'
        },
        body: formData,
      });

      if (response.ok) {
        setTitle(''); setDescription(''); setVisibility('PRIVATE'); setFile(null);
        onUploadSuccess();
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || 'Upload failed. Please try again.');
      }
    } catch {
      setError('Cannot reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg p-8 rounded-[2rem] bg-[var(--color-base-bg)] shadow-clay-card flex flex-col relative border border-white/40">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Upload Resource</h2>
          <p className="opacity-70 text-[var(--color-base-text)] font-medium mt-1">Add new material to the institutional vault.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[var(--color-base-text)]">Resource Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
              placeholder="e.g. Advanced Networking Notes"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[var(--color-base-text)]">Description</label>
            <textarea 
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium resize-none"
              placeholder="Brief overview of the content..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[var(--color-base-text)]">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium appearance-none cursor-pointer"
            >
              <option value="PRIVATE">Private (Only Me)</option>
              <option value="DEPARTMENT_DISCOVERABLE">Department Discoverable</option>
              <option value="INSTITUTION_DISCOVERABLE">Institution Discoverable</option>
            </select>
          </div>

          <div className="relative mt-4 p-8 rounded-2xl border-2 border-dashed border-[var(--color-base-text)] border-opacity-20 bg-[var(--color-base-mint)] flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-[var(--color-base-bg)] transition-colors">
            <input 
              type="file" 
              required
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <UploadCloud size={32} className="text-[var(--color-base-text)] opacity-70" />
            <div>
              <p className="font-bold text-[var(--color-base-text)]">
                {file ? file.name : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs opacity-70 text-[var(--color-base-text)] mt-1">PDF, DOCX, PPTX (Max 50MB)</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-end mt-2">
            <ClayButton type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Uploading…' : 'Save Resource'}
            </ClayButton>
          </div>
        </form>

      </div>
    </div>
  );
}
