import React from 'react';
import { Idol } from '../types';
import { formatWon } from '../utils/format';
import {
  X,
  Sparkles,
  Heart,
  Mic,
  Flame,
  Star,
  Zap,
  Music,
  Award,
  Crown,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface IdolSpotlightModalProps {
  idol: Idol | null;
  assignedRole?: string;
  groupName?: string;
  onClose: () => void;
  onVoteForGroup?: () => void;
}

export const IdolSpotlightModal: React.FC<IdolSpotlightModalProps> = ({
  idol,
  assignedRole,
  groupName,
  onClose,
  onVoteForGroup,
}) => {
  if (!idol) return null;

  const roleText = assignedRole || idol.roles?.[0] || 'Member';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-pink-500/70 rounded-3xl p-5 sm:p-7 max-w-md w-full relative shadow-2xl shadow-pink-500/30 overflow-hidden text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-black uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>HỒ SƠ THẦN TƯỢNG • IDOL PHOTOCARD</span>
        </div>

        {/* High-Resolution Large Idol Image Card */}
        <div className="relative mx-auto my-2 w-48 h-64 sm:w-56 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-400/80 group">
          <img
            src={idol.image}
            alt={idol.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Gender / Type Tag */}
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-600/90 text-white shadow">
            {idol.type === 'producer' ? 'PRODUCER' : idol.gender === 'female' ? '♀ NỮ' : '♂ NAM'}
          </span>

          {/* Bottom Overlay on Image */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-300 bg-pink-950/90 border border-pink-500/50 px-2 py-0.5 rounded-md inline-block mb-1">
              {idol.originalGroup}
            </span>
            <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">
              {idol.name}
            </h3>
          </div>
        </div>

        {/* Stage Name & Assigned Role */}
        <div className="mt-3">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {idol.stageName || idol.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-pink-500/25 border border-pink-500/50 text-pink-300 font-extrabold text-xs">
              Vị trí: {roleText}
            </span>
            {groupName && (
              <span className="px-3 py-0.5 rounded-full bg-purple-500/25 border border-purple-500/50 text-purple-300 font-bold text-xs">
                Nhóm: {groupName}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
              {formatWon(idol.price)}
            </span>
          </div>
        </div>

        {/* Idol Quote */}
        {idol.quote && (
          <p className="text-xs italic text-slate-300 my-2.5 px-4 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            "{idol.quote}"
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 my-3 text-left">
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-0.5">
              <Mic className="w-3 h-3 text-indigo-400" /> Vocal
            </div>
            <div className="text-sm font-black text-indigo-300">{idol.stats.vocal}</div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-rose-400" /> Dance
            </div>
            <div className="text-sm font-black text-rose-300">{idol.stats.dance}</div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-0.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> Visual
            </div>
            <div className="text-sm font-black text-amber-300">{idol.stats.visual}</div>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 text-pink-400" /> Charisma
            </div>
            <div className="text-sm font-black text-pink-300">{idol.stats.charisma}</div>
          </div>
        </div>

        {/* Perk Note */}
        {idol.perk && (
          <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 text-left mb-4 flex items-start gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{idol.perk}</span>
          </div>
        )}

        {/* Action Button: Vote for this idol's group */}
        {onVoteForGroup && (
          <button
            onClick={() => {
              sound.playVote();
              onVoteForGroup();
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>BÌNH CHỌN CHO NHÓM NÀY ({groupName || 'Ứng viên'})</span>
          </button>
        )}
      </div>
    </div>
  );
};
