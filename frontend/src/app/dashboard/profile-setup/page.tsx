'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClayButton } from '@/components/ui/ClayButton';
import { useSession } from '@/context/session';

export default function ProfileSetupPage() {
  const { user, loading: sessionLoading } = useSession();
  const [department, setDepartment] = useState('');
  const [education, setEducation] = useState('');
  const [role, setRole] = useState('STAFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department,
          education,
          role,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) return <div className="text-[var(--color-base-text)] p-10 animate-pulse font-bold opacity-50">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="p-8 rounded-[2rem] bg-[var(--color-base-bg)] shadow-clay-card border border-white/30">
        <h1 className="text-3xl font-extrabold text-[var(--color-base-text)] mb-2">Complete Profile</h1>
        <p className="text-[var(--color-base-text)] opacity-60 mb-8 font-medium">Please provide a few more details before accessing the dashboard.</p>
        
        <form onSubmit={handleUpdate} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--color-base-text)] opacity-70">Department</label>
            <input 
              required
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
              className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-mint)] outline-none text-[var(--color-base-text)] font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--color-base-text)] opacity-70">Education / Qualifications</label>
            <input 
              required
              value={education}
              onChange={e => setEducation(e.target.value)}
              placeholder="e.g. Ph.D. in AI"
              className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-mint)] outline-none text-[var(--color-base-text)] font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[var(--color-base-text)] opacity-70">Job Role</label>
            <select 
              value={role}
              onChange={e => setRole(e.target.value)}
              className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-mint)] outline-none text-[var(--color-base-text)] font-medium"
            >
              <option value="STAFF">Staff Member</option>
              <option value="HOD">Head of Department</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center mt-2">{error}</p>}

          <ClayButton type="submit" variant="primary" className="py-4 mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </ClayButton>
        </form>
      </div>
    </div>
  );
}
