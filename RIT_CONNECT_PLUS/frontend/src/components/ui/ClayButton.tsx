import React from 'react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'solid';
}

export function ClayButton({ children, variant = 'primary', className = '', ...props }: ClayButtonProps) {
  const baseStyle = "px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ease-in-out active:scale-95";
  
  const variantStyles = {
    primary: "bg-[var(--color-base-mint)] text-[var(--color-base-text)] shadow-clay-btn hover:shadow-clay-card active:shadow-clay-pressed",
    solid: "bg-[var(--color-base-yellow)] text-[var(--color-base-text)] shadow-solid hover:-translate-y-1 hover:shadow-[6px_6px_0px_#6a716e] active:translate-y-0 active:shadow-solid border-2 border-[var(--color-base-text)]"
  };

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
