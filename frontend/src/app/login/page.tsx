'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ClayButton } from '@/components/ui/ClayButton';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-base-bg)] p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--color-base-text)]">Connect Plus</h1>
          <p className="opacity-80 mt-2 font-medium">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[var(--color-base-text)]">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[#faf8f5] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)]"
              placeholder="faculty@institution.edu"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[var(--color-base-text)]">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[#faf8f5] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-bold bg-white/50 p-2 rounded-xl">{error}</p>}

          <ClayButton type="submit" variant="primary" className="mt-4 flex justify-center items-center gap-2" disabled={loading}>
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={20} />
                Secure Login
              </>
            )}
          </ClayButton>
        </form>
      </div>
    </div>
  );
}
