import React, { useState } from 'react';
import { Idol } from '../types';
import { Sparkles, Maximize2, Mic, Flame, Star } from 'lucide-react';

interface IdolVotingCardProps {
  idol: Idol;
  assignedRole?: string;
  onInspect?: (idol: Idol) => void;
  size?: 'normal' | 'large' | 'mobile';
  className?: string;
}

export const IdolVotingCard: React.FC<IdolVotingCardProps> = ({
  idol,
  assignedRole,
  onInspect,
  size = 'normal',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const roleText = assignedRole || idol.roles?.[0] || 'Member';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInspect) {
      onInspect(idol);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(/[\s-]+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Border & Glow based on gender or type
  const borderTone =
    idol.type === 'producer'
      ? 'border-amber-400 group-hover:border-amber-300 ring-amber-400/30'
      : idol.gender === 'female'
      ? 'border-pink-500/80 group-hover:border-pink-400 ring-pink-500/30'
      : 'border-cyan-500/80 group-hover:border-cyan-400 ring-cyan-500/30';

  if (size === 'mobile') {
    return (
      <div
        onClick={handleClick}
        className={`group relative flex items-center gap-2.5 p-2 bg-slate-950/90 border rounded-2xl transition-all active:scale-95 cursor-pointer shadow-md hover:bg-slate-900 ${borderTone} ${className}`}
        title="Nhấn để xem ảnh phóng to và thông số chi tiết"
      >
        {/* Prominent Mobile Photo (54px x 68px portrait) */}
        <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800 shadow">
          {!imgError ? (
            <img
              src={idol.image}
              alt={idol.name}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${idol.fallbackGradient} flex items-center justify-center text-white font-bold text-xs`}
            >
              {getInitials(idol.name)}
            </div>
          )}
          {/* Subtle zoom icon hint */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h5 className="text-xs font-black text-white truncate drop-shadow-sm">
              {idol.name}
            </h5>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold text-pink-300 bg-pink-500/20 border border-pink-500/30 truncate">
              {idol.originalGroup}
            </span>
          </div>

          <div className="text-[10px] text-amber-300 font-extrabold truncate mt-0.5">
            {roleText}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400">
            <span>✨ Visual: {idol.stats.visual}</span>
            <span>•</span>
            <span>🎤 Vocal: {idol.stats.vocal}</span>
          </div>
        </div>
      </div>
    );
  }

  // Large or Normal Photocard Display for Host / Desktop / Voting board
  const isLarge = size === 'large';

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col items-center bg-gradient-to-b from-slate-900 to-slate-950 border-2 rounded-2xl p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${borderTone} ${
        isLarge ? 'w-32 sm:w-36' : 'w-28 sm:w-32'
      } ${className}`}
      title="Nhấn để xem ảnh phóng to và thông số chi tiết"
    >
      {/* Photocard Image Container */}
      <div
        className={`relative w-full ${
          isLarge ? 'h-36 sm:h-40' : 'h-28 sm:h-32'
        } rounded-xl overflow-hidden shadow-inner border border-slate-700/80 bg-slate-900`}
      >
        {!imgError ? (
          <img
            src={idol.image}
            alt={idol.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${idol.fallbackGradient} flex flex-col items-center justify-center text-white font-bold p-1 text-center`}
          >
            <span className="text-lg">{getInitials(idol.name)}</span>
            <span className="text-[10px] opacity-80 truncate max-w-full">{idol.name}</span>
          </div>
        )}

        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

        {/* Gender / Type mini badge */}
        <span
          className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-black rounded-md shadow text-white ${
            idol.type === 'producer'
              ? 'bg-amber-600'
              : idol.gender === 'female'
              ? 'bg-pink-600'
              : 'bg-indigo-600'
          }`}
        >
          {idol.type === 'producer' ? 'PD' : idol.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
        </span>

        {/* Hover zoom icon badge */}
        <div className="absolute bottom-1.5 right-1.5 p-1 bg-black/60 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-3 h-3 text-pink-300" />
        </div>
      </div>

      {/* Idol Name & Details below photo */}
      <div className="w-full text-center mt-2">
        <h5 className="text-xs sm:text-sm font-black text-white truncate drop-shadow-sm">
          {idol.name}
        </h5>

        <div className="text-[10px] text-pink-400 font-extrabold px-1.5 py-0.5 rounded bg-pink-500/15 border border-pink-500/30 truncate mt-1">
          {roleText}
        </div>

        <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
          {idol.originalGroup}
        </div>
      </div>
    </div>
  );
};
