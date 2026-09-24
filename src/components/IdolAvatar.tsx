import React, { useState } from 'react';
import { Idol } from '../types';

interface IdolAvatarProps {
  idol: Idol;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const IdolAvatar: React.FC<IdolAvatarProps> = ({
  idol,
  size = 'md',
  className = '',
  showBadge = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-36 h-36 text-xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(/[\s-]+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden shadow-lg border-2 ${
          idol.gender === 'female' ? 'border-pink-500/60' : 'border-cyan-500/60'
        } bg-slate-800 flex items-center justify-center transition-all duration-300 group-hover:scale-105`}
      >
        {!imgError ? (
          <img
            src={idol.image}
            alt={idol.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${idol.fallbackGradient} flex flex-col items-center justify-center text-white font-bold p-1 text-center`}
          >
            <span>{getInitials(idol.name)}</span>
            {size !== 'sm' && (
              <span className="text-[10px] font-medium tracking-tight opacity-90 truncate max-w-full">
                {idol.name}
              </span>
            )}
          </div>
        )}
      </div>

      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full shadow-md text-white ${
            idol.type === 'producer'
              ? 'bg-amber-500 ring-1 ring-amber-300'
              : idol.gender === 'female'
              ? 'bg-pink-600 ring-1 ring-pink-300'
              : 'bg-indigo-600 ring-1 ring-indigo-300'
          }`}
          title={idol.type === 'producer' ? 'Producer' : idol.gender === 'female' ? 'Idol Nữ' : 'Idol Nam'}
        >
          {idol.type === 'producer' ? 'PD' : idol.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
        </span>
      )}
    </div>
  );
};
