'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClayButton } from '@/components/ui/ClayButton';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [devAnnouncement, setDevAnnouncement] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.ok ? res.json() : {})
      .then((data: Record<string, string>) => {
        if (data.MAINTENANCE_MODE === 'true') setMaintenance(true);
        if (data.DEVELOPER_MODE === 'true') {
          setDevMode(true);
          setDevAnnouncement(data.DEV_MODE_ANNOUNCEMENT || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await res.json();

      // Role-based post-login routing
      if (data.user?.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else if (data.user?.role === 'HOD') {
        router.push('/dashboard/department');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If system is in Maintenance or Developer Mode and Admin login hasn't been explicitly toggled
  if ((maintenance || devMode) && !showAdminLogin) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${devMode ? 'bg-[#0d0d0d] text-white' : 'bg-[var(--color-base-bg)] text-[var(--color-base-text)]'}`}>
        {/* Animated concentric rings */}
        <div className="w-32 h-32 mb-8 relative flex-shrink-0">
          <div className={`absolute inset-0 border-4 rounded-full ${devMode ? 'border-red-900/30' : 'border-[var(--color-base-text)]/20'}`} />
          <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${devMode ? 'border-red-600' : 'border-[var(--color-base-text)]'}`} />
          <div className="absolute inset-4 border-4 border-red-500 rounded-full border-b-transparent animate-spin" style={{ animationDuration: '0.9s', animationDirection: 'reverse' }} />
          <div className="absolute inset-8 border-2 border-yellow-500 rounded-full border-l-transparent animate-spin" style={{ animationDuration: '1.4s' }} />
        </div>

        <div className="text-center max-w-md z-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
            {devMode ? <Terminal size={14} /> : <ShieldAlert size={14} />}
            {devMode ? 'Developer Control Mode' : 'System Maintenance'}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            {devMode ? 'Developer Maintenance Active' : 'Scheduled Maintenance'}
          </h1>

          <p className="text-sm opacity-70 leading-relaxed font-medium">
            {devAnnouncement || (devMode 
              ? 'RIT Connect Plus is in Developer Control Mode. Normal access is currently paused.' 
              : 'RIT Connect Plus is currently undergoing scheduled maintenance. Please check back shortly.')}
          </p>

          <button
            onClick={() => setShowAdminLogin(true)}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-opacity underline"
          >
            <Lock size={12} />
            Administrator / Developer Sign-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-base-bg)] overflow-hidden relative px-4">

      {/* Background blobs */}
      <div className="absolute top-[-60px] left-[-60px] w-60 h-60 rounded-full bg-[var(--color-base-mint)] opacity-70 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-[var(--color-base-yellow)] opacity-50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm z-10">
        {/* Card */}
        <div className="p-8 rounded-[2rem] bg-[var(--color-base-mint)] shadow-clay-card flex flex-col gap-7 border border-white/30">
          
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Connect Plus" className="w-16 h-16 drop-shadow-lg" />
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[var(--color-base-text)] tracking-tight">Connect<span className="opacity-50">+</span></h1>
              <p className="text-sm text-[var(--color-base-text)] opacity-60 font-medium mt-1">
                {(maintenance || devMode) ? 'Administrator Control Login' : 'Sign in to continue'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-base-text)] px-1 uppercase tracking-wider opacity-70">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@ritrjpm.ac.in"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </ClayButton>
            
            {(maintenance || devMode) && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="text-xs font-bold text-[var(--color-base-text)] opacity-70 hover:opacity-100"
                >
                  ← Back to Status Screen
                </button>
              </div>
            )}

            {!maintenance && !devMode && (
              <div className="text-center mt-2">
                <span className="text-xs text-[var(--color-base-text)] opacity-70">
                  Accounts are provisioned by Administrator. Institutional access only.
                </span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
