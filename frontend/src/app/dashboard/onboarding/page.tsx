"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClayButton } from "@/components/ui/ClayButton";
import { useSession } from "@/context/session";
import { CheckCircle, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    education: '',
    department: '',
    designation: '',
    role: 'STAFF',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          education: formData.education,
          department: formData.department,
          designation: formData.designation,
          role: formData.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to save profile');
      }

      await refresh();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const inputCls = "p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium w-full";
  const labelCls = "font-bold text-sm text-[var(--color-base-text)] opacity-80";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-2xl bg-[var(--color-base-bg)] p-8 md:p-12 rounded-[3rem] shadow-clay-card border border-white/30">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="p-4 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-btn">
            <CheckCircle size={32} className="text-[var(--color-base-text)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-base-text)] text-center">Complete Your Profile</h1>
          <p className="opacity-60 text-center font-medium text-[var(--color-base-text)] max-w-sm">
            Welcome to Connect Plus! Set up your profile to unlock department collaboration and resource sharing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="flex flex-col gap-2">
              <label className={labelCls}>Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => update('fullName', e.target.value)}
                className={inputCls}
                placeholder="Dr. Sarah Connor"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelCls}>Job Role *</label>
              <select
                required
                value={formData.role}
                onChange={e => update('role', e.target.value)}
                className={inputCls}
              >
                <option value="STAFF">Staff Member</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelCls}>Department *</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={e => update('department', e.target.value)}
                className={inputCls}
                placeholder="e.g. Computer Science"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelCls}>Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={e => update('designation', e.target.value)}
                className={inputCls}
                placeholder="e.g. Senior Lecturer"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className={labelCls}>Education / Qualifications *</label>
              <input
                type="text"
                required
                value={formData.education}
                onChange={e => update('education', e.target.value)}
                className={inputCls}
                placeholder="e.g. Ph.D. in Artificial Intelligence"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 rounded-xl p-3">
              {error}
            </p>
          )}

          <div className="mt-4">
            <ClayButton type="submit" variant="primary" disabled={loading} className="w-full h-14 text-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              {loading ? 'Saving Profile...' : 'Complete Setup & Go to Dashboard'}
            </ClayButton>
          </div>

          <p className="text-center text-xs text-[var(--color-base-text)] opacity-40 font-medium">
            You can update these details anytime in Settings.
          </p>
        </form>
      </div>
    </div>
  );
}
