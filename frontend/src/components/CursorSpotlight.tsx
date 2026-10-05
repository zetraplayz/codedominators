'use client';

import { useEffect, useState } from 'react';

export default function CursorSpotlight() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over something clickable to intensify the spotlight
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, input, select, textarea, [role="button"]');
      setIsHoveringClickable(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 mix-blend-overlay"
      style={{
        background: `radial-gradient(${isHoveringClickable ? '400px' : '600px'} circle at ${position.x}px ${position.y}px, rgba(255, 255, 255, ${isHoveringClickable ? '0.08' : '0.04'}), transparent 40%)`
      }}
    />
  );
}
