'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClayButton } from '@/components/ui/ClayButton';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
          employee_id: employeeId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      // No need to set cookie manually, rewrite proxy passes the Set-Cookie header directly!
      const data = await res.json();

      router.push('/dashboard/profile-setup');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[var(--color-base-text)] tracking-tight">Create Account</h1>
              <p className="text-sm text-[var(--color-base-text)] opacity-60 font-medium mt-1">Join Connect Plus</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-base-text)] px-1 uppercase tracking-wider opacity-70">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. John Doe"
                className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-bg)] outline-none text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--color-base-text)]/30 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-base-text)] px-1 uppercase tracking-wider opacity-70">Employee ID</label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP12345"
                className="px-5 py-3.5 rounded-xl shadow-clay-pressed bg-[var(--color-base-bg)] outline-none text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 focus:ring-2 focus:ring-[var(--color-base-text)]/30 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[var(--color-base-text)] px-1 uppercase tracking-wider opacity-70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@institution.edu"
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
              {loading ? 'Creating...' : 'Sign Up'}
            </ClayButton>
            
            <div className="text-center mt-2">
              <span className="text-sm text-[var(--color-base-text)] opacity-70">Already have an account? </span>
              <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
