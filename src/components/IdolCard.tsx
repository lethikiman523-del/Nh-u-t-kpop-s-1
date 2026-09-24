import React, { useState } from 'react';
import { Idol } from '../types';
import { IdolAvatar } from './IdolAvatar';
import { formatWon } from '../utils/format';
import { Sparkles, Check, Plus, Info, X, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface IdolCardProps {
  idol: Idol;
  isOwned?: boolean;
  canAfford?: boolean;
  onBuy?: (idol: Idol) => void;
  onSell?: (idol: Idol) => void;
  compact?: boolean;
  assignedRole?: string;
  onAssignRole?: (idol: Idol, role: string) => void;
  selectableRoles?: string[];
}

export const IdolCard: React.FC<IdolCardProps> = ({
  idol,
  isOwned = false,
  canAfford = true,
  onBuy,
  onSell,
  compact = false,
  assignedRole,
  onAssignRole,
  selectableRoles = [
    'Leader (Trưởng nhóm)',
    'Center / Visual',
    'Main Vocalist (Hát chính)',
    'Lead Vocalist',
    'Main Dancer (Vũ đạo chính)',
    'Main Rapper',
    'Producer / Giám đốc âm nhạc',
  ],
}) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuy && canAfford && !isOwned) {
      sound.playBuy();
      onBuy(idol);
    }
  };

  const handleSell = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSell && isOwned) {
      sound.playSell();
      onSell(idol);
    }
  };

  if (compact) {
    return (
      <div
        id={`idol-card-${idol.id}`}
        className={`relative flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
          isOwned
            ? 'bg-slate-900/90 border-pink-500/50 shadow-md shadow-pink-500/10'
            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
        }`}
      >
        <IdolAvatar idol={idol} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{idol.name}</h4>
            <span className="text-[10px] text-slate-400 truncate">({idol.originalGroup})</span>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-semibold text-amber-400">{formatWon(idol.price)}</span>
            {assignedRole && (
              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                {assignedRole}
              </span>
            )}
          </div>
        </div>
        {onSell && isOwned && (
          <button
            onClick={handleSell}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Bán thần tượng hoàn tiền"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        id={`idol-card-${idol.id}`}
        onClick={() => setShowDetail(true)}
        className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
          isOwned
            ? 'bg-gradient-to-b from-slate-900 to-pink-950/40 border-pink-500 shadow-lg shadow-pink-500/20 ring-1 ring-pink-500/40'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50'
        }`}
      >
        {/* Top Header Card */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <IdolAvatar idol={idol} size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black tracking-tight text-white group-hover:text-pink-400 transition-colors">
                    {idol.name}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetail(true);
                    }}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Xem chi tiết kỹ năng"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[140px]">
                  {idol.originalGroup}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                    {formatWon(idol.price)}
                  </span>
                </div>
              </div>
            </div>

            {isOwned && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Đã sở hữu
              </span>
            )}
          </div>

          {/* Roles Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {idol.roles.slice(0, 2).map((r, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-md"
              >
                {r}
              </span>
            ))}
          </div>

          {/* Perk Snippet */}
          <div className="mt-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{idol.perk}</p>
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
          {onAssignRole && isOwned ? (
            <div className="w-full">
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Phân công vị trí trong nhóm:
              </label>
              <select
                value={assignedRole || ''}
                onChange={(e) => onAssignRole(idol, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-pink-500"
              >
                <option value="">-- Chọn vai trò --</option>
                {selectableRoles.map((role, idx) => (
                  <option key={idx} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetail(true);
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Chỉ số
              </button>

              {isOwned ? (
                <button
                  type="button"
                  onClick={handleSell}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Trả lại
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={handleBuy}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-xl shadow transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-pink-500/25 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {canAfford ? 'Ký hợp đồng' : 'Vượt ngân sách'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <IdolAvatar idol={idol} size="lg" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                  {idol.originalGroup}
                </span>
                <h2 className="text-2xl font-black text-white">{idol.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{idol.stageName}</p>
                <div className="mt-2 inline-block font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-xl text-sm">
                  {formatWon(idol.price)}
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 italic text-slate-300 text-xs">
              "{idol.quote}"
            </div>

            {/* Stats Bar */}
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Chỉ số năng lực chuyên môn:
              </h4>
              {[
                { label: 'Hát (Vocal)', val: idol.stats.vocal, color: 'bg-emerald-500' },
                { label: 'Vũ đạo (Dance)', val: idol.stats.dance, color: 'bg-cyan-500' },
                { label: 'Rap', val: idol.stats.rap, color: 'bg-orange-500' },
                { label: 'Nhan sắc (Visual)', val: idol.stats.visual, color: 'bg-pink-500' },
                { label: 'Thần thái (Charisma)', val: idol.stats.charisma, color: 'bg-purple-500' },
                { label: 'Sản xuất (Production)', val: idol.stats.production, color: 'bg-amber-500' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-36 text-slate-300 truncate">{stat.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${stat.val}%` }}
                    />
                  </div>
                  <span className="w-8 font-bold text-right text-white">{stat.val}</span>
                </div>
              ))}
            </div>

            {/* Special Perk */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Đặc quyền Nhà đầu tư (Investor Perk):
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">{idol.perk}</p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Đóng
              </button>
              {onBuy && !isOwned && (
                <button
                  disabled={!canAfford}
                  onClick={(e) => {
                    handleBuy(e);
                    setShowDetail(false);
                  }}
                  className={`px-5 py-2 text-xs font-bold rounded-xl text-white ${
                    canAfford
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? `Ký hợp đồng (${formatWon(idol.price)})` : 'Không đủ số dư'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
