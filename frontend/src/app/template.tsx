'use client';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-enter w-full h-full flex flex-col flex-grow">
      {children}
    </div>
  );
}
