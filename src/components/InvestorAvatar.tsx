import React, { useState } from 'react';
import { Player } from '../types';

interface InvestorAvatarProps {
  player: {
    name?: string;
    avatar?: string;
    image?: string;
    seatNumber?: number;
    agencyName?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-7 h-7 rounded-lg text-xs',
  sm: 'w-10 h-10 rounded-xl text-sm',
  md: 'w-14 h-14 rounded-2xl text-lg',
  lg: 'w-20 h-20 rounded-3xl text-2xl',
  xl: 'w-28 h-28 rounded-3xl text-3xl',
};

export const InvestorAvatar: React.FC<InvestorAvatarProps> = ({
  player,
  size = 'md',
  showBadge = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = player.image || (player.avatar?.startsWith('http') || player.avatar?.startsWith('/') ? player.avatar : undefined);
  const initials = player.name
    ? player.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
    : `G${player.seatNumber || '?'}`;

  return (
    <div className={`relative shrink-0 inline-block ${className}`}>
      <div
        className={`${SIZE_CLASSES[size]} overflow-hidden border-2 border-slate-700/80 bg-gradient-to-br from-slate-800 to-slate-900 shadow-md flex items-center justify-center font-bold text-slate-200 transition-transform group-hover:scale-105`}
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={player.name || 'Investor'}
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-pink-300 font-black">
            {initials}
          </div>
        )}
      </div>

      {showBadge && player.seatNumber && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-pink-600 text-white font-black text-[9px] shadow-md border border-slate-900">
          #{player.seatNumber}
        </span>
      )}
    </div>
  );
};
