import React, { useEffect, useState } from 'react';
import { Sparkles, ShoppingBag, Trophy, Heart, Users, CheckCircle2, Music, DollarSign } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'BUY' | 'SELL' | 'CLAIM' | 'GROUP_SUBMIT' | 'VOTE' | 'REACTION' | 'INFO';
  title: string;
  description: string;
  actorName: string;
  avatar?: string;
  color?: string;
  timestamp: number;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-2">
      {toasts.slice(0, 3).map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slideDown bg-slate-900/95 backdrop-blur-xl border border-pink-500/50 rounded-2xl p-4 shadow-2xl shadow-pink-950/50 text-white flex items-start gap-3.5 ring-2 ring-pink-500/30 transition-all duration-300"
        >
          {/* Icon Badge based on type */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shrink-0 shadow-md shadow-pink-500/30">
            {toast.type === 'BUY' && <ShoppingBag className="w-5 h-5 text-amber-300" />}
            {toast.type === 'SELL' && <DollarSign className="w-5 h-5 text-emerald-300" />}
            {toast.type === 'CLAIM' && <Users className="w-5 h-5 text-cyan-300" />}
            {toast.type === 'GROUP_SUBMIT' && <Music className="w-5 h-5 text-purple-200" />}
            {toast.type === 'VOTE' && <Trophy className="w-5 h-5 text-amber-300" />}
            {toast.type === 'REACTION' && <Heart className="w-5 h-5 text-rose-300" />}
            {toast.type === 'INFO' && <Sparkles className="w-5 h-5 text-amber-300" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 bg-pink-950/80 border border-pink-500/30 px-2 py-0.5 rounded-md">
                {toast.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(toast.timestamp).toLocaleTimeString('vi-VN', { minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white truncate">
              {toast.actorName}
            </h4>
            <p className="text-xs text-slate-200 leading-snug mt-0.5 font-medium line-clamp-2">
              {toast.description}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-white text-xs p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
