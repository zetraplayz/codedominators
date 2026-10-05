import Image from 'next/image';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-base-bg)]">
      <div className="relative flex flex-col items-center justify-center">
        {/* Minimalist pulse ring behind */}
        <div className="absolute w-24 h-24 bg-[var(--color-base-text)] opacity-10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        
        {/* Logo pulsing softly */}
        <div className="relative w-16 h-16 animate-pulse" style={{ animationDuration: '1.5s' }}>
          <Image 
            src="/logo.png" 
            alt="Loading..." 
            fill
            sizes="100px"
            className="object-contain"
            priority
          />
        </div>
        
        {/* Minimal text */}
        <p className="mt-8 text-xs font-black text-[var(--color-base-text)] tracking-[0.3em] uppercase opacity-40 animate-pulse">
          RIT Connect Plus
        </p>
      </div>
    </div>
  );
}
