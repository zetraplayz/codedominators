'use client';

import { Users } from 'lucide-react';

export default function DepartmentPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--color-base-mint)] p-6 rounded-3xl shadow-clay-card border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-base-text)] tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 opacity-80" />
            Department
          </h1>
          <p className="text-[var(--color-base-text)] opacity-60 mt-1 font-medium tracking-wide">
            Manage your faculty network and department resources
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-base-mint)] p-8 rounded-3xl shadow-clay-card border border-white/20 flex flex-col items-center justify-center min-h-[300px]">
        <Users className="w-16 h-16 text-[var(--color-base-text)] opacity-20 mb-4" />
        <h2 className="text-xl font-bold text-[var(--color-base-text)]">Department Coming Soon</h2>
        <p className="text-[var(--color-base-text)] opacity-60 mt-2 font-medium">
          We are currently building this section. Check back later.
        </p>
      </div>
    </div>
  );
}
