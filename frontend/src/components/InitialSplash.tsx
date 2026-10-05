'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function InitialSplash() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Only show once per session to avoid annoying the user on every refresh
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    // Sequence: Wait 1.5s, trigger fade out, wait 0.5s for transition, then unmount and save state
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      
      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasSeenSplash', 'true');
      }, 700); // Wait for opacity transition to finish
    }, 1800);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!showSplash) return null;

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--color-base-bg)] transition-opacity duration-700 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Core Logo scale-in animation */}
        <div className="relative w-24 h-24 animate-[splashLogo_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <Image 
            src="/logo.png" 
            alt="RIT Connect Plus" 
            fill
            sizes="100px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
        
        <p className="mt-8 text-sm font-black text-[var(--color-base-text)] tracking-[0.4em] uppercase opacity-0 animate-[splashText_1.2s_ease_0.4s_forwards]">
          RIT Connect Plus
        </p>
      </div>
    </div>
  );
}
