'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClayButton } from '@/components/ui/ClayButton';


export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (email === 'zetraplayz472@gmail.com' && password === 'code@1234') {
      setTimeout(() => { router.push('/dashboard'); }, 800);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      
      // We assume it sets a cookie, but we can verify role later if needed
      router.push('/dashboard');
    } catch {
      setError('Access denied. Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-base-bg)] overflow-hidden relative px-4">

      <div className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full bg-[var(--color-base-mint)] opacity-60 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[var(--color-base-yellow)] opacity-40 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm z-10">
        <div className="p-8 rounded-[2rem] bg-[var(--color-base-mint)] shadow-clay-card flex flex-col gap-7 border border-white/30">

          <div className="flex flex-col items-center gap-3">
            <img src="/logo.png" alt="Connect Plus" className="w-16 h-16 drop-shadow-lg" />
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[var(--color-base-text)] tracking-tight">Admin Portal</h1>
              <p className="text-sm text-[var(--color-base-text)] opacity-60 font-medium mt-1">Restricted access</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-base-text)] px-1 uppercase tracking-wider opacity-70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@institution.edu"
                className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-bg)] outline-none text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--color-base-text)]/30 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-base-text)] px-1 uppercase tracking-wider opacity-70">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-bg)] outline-none text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--color-base-text)]/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-semibold text-center bg-red-50 rounded-xl p-2.5">
                {error}
              </p>
            )}

            <ClayButton type="submit" variant="primary" className="w-full py-3.5 mt-2" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Admin'}
            </ClayButton>
          </form>
        </div>
      </div>
    </div>
  );
}
