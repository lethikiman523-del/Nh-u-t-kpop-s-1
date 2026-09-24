import React from 'react';
import { ActivityEvent } from '../types';

interface ActivityTickerProps {
  activities: ActivityEvent[];
  isAnonymousMode?: boolean;
}

export const ActivityTicker: React.FC<ActivityTickerProps> = ({
  activities,
  isAnonymousMode = false,
}) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-pink-400 uppercase tracking-wider text-[11px]">Sàn Giao Dịch Trực Tiếp:</span>
        <span className="italic">Chưa có giao dịch mới. 5 nhà đầu tư đang cân nhắc ngân sách trên điện thoại cá nhân...</span>
      </div>
    );
  }

  const latest = activities[0];

  return (
    <div className="bg-slate-900/90 border border-pink-500/30 rounded-xl p-3 shadow-lg shadow-pink-950/20 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
          </span>
          <span className="font-black text-pink-400 uppercase tracking-wider text-[11px]">
            Thao Tác Trực Tiếp Từ Điện Thoại Khách Mời
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Tổng cộng: <strong className="text-slate-200">{activities.length}</strong> giao dịch đã diễn ra
        </span>
      </div>

      {/* Latest Highlight */}
      <div className="flex items-center gap-3 text-xs text-slate-200 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
        <span className="bg-gradient-to-r from-pink-600 to-indigo-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] uppercase shrink-0">
          Mới Nhất
        </span>
        <span className="font-bold text-amber-300 shrink-0">
          {latest.realActor || latest.anonymousActor}:
        </span>
        <span className="text-slate-100 flex-1 truncate">{latest.details}</span>
        <span className="text-[10px] text-slate-500 shrink-0">
          {new Date(latest.timestamp).toLocaleTimeString('vi-VN', { minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Horizontal marquee ticker of recent 4 */}
      {activities.length > 1 && (
        <div className="flex items-center gap-2 mt-2 overflow-x-auto text-[11px] text-slate-400 scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Trước đó:</span>
          {activities.slice(1, 4).map((act) => (
            <div
              key={act.id}
              className="bg-slate-800/60 rounded px-2 py-0.5 shrink-0 flex items-center gap-1.5 border border-slate-700/50"
            >
              <span className="font-medium text-slate-300">
                {act.realActor || act.anonymousActor}:
              </span>
              <span className="text-slate-400 truncate max-w-xs">{act.details}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
