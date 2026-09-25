'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// ============================================================
// SESSION CONTEXT
// Sample account acts as a real Staff user
// ============================================================
interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'HOD' | 'STAFF';
}

const SAMPLE_USER: UserSession = {
  id: 'sample_faculty_id',
  email: 'sample@gmail.com',
  name: 'Sample Faculty',
  role: 'STAFF',
};

const SessionContext = createContext<UserSession>(SAMPLE_USER);

export function useSession(): UserSession {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // In production this reads from Supabase auth
  // For now: sample@gmail.com is the real active Staff user
  return (
    <SessionContext.Provider value={SAMPLE_USER}>
      {children}
    </SessionContext.Provider>
  );
}
