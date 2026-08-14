import React from 'react';
import logoUrl from '../../assets/logo.png';

export function LogoIcon({ className = "w-8 h-8 rounded-xl" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center shadow-sm overflow-hidden bg-black ${className}`}>
      <img 
        src={logoUrl} 
        alt="Lexa Logo" 
        className="w-full h-full object-cover" 
      />
    </div>
  );
}
