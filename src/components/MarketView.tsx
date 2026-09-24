import React, { useState } from 'react';
import { Idol, Player, ActivityEvent } from '../types';
import { IDOL_ROSTER, TOTAL_BUDGET } from '../data/idols';
import { IdolCard } from './IdolCard';
import { ActivityTicker } from './ActivityTicker';
import { InvestorAvatar } from './InvestorAvatar';
import { formatWon } from '../utils/format';
import { sound } from '../utils/audio';
import {
  Wallet,
  Users,
  Search,
  Filter,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Dices,
  Trash2,
} from 'lucide-react';

interface MarketViewProps {
  activePlayer: Player;
  allPlayers: Player[];
  onSelectPlayer: (playerId: string) => void;
  onBuyIdol: (playerId: string, idolId: string) => void;
  onSellIdol: (playerId: string, idolId: string) => void;
  onProceedToGroupCreation: () => void;
  activities?: ActivityEvent[];
  isAnonymousMode?: boolean;
  onOpenPlayerCodes?: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({
  activePlayer,
  allPlayers,
  onSelectPlayer,
  onBuyIdol,
  onSellIdol,
  onProceedToGroupCreation,
  activities = [],
  isAnonymousMode = true,
  onOpenPlayerCodes,
}) => {
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male' | 'producer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'stat'>('price-desc');

  const ownedIdolIds = new Set(activePlayer.idols.map((i) => i.id));
  const totalSpent = activePlayer.idols.reduce((sum, i) => sum + i.price, 0);
  const remainingBudget = activePlayer.balance;
  const budgetPercent = Math.min(100, Math.round((totalSpent / TOTAL_BUDGET) * 100));

  // Filtered idols
  const filteredIdols = IDOL_ROSTER.filter((idol) => {
    // Gender / Type filter
    if (filterGender === 'female' && (idol.gender !== 'female' || idol.type === 'producer')) return false;
    if (filterGender === 'male' && (idol.gender !== 'male' || idol.type === 'producer')) return false;
    if (filterGender === 'producer' && idol.type !== 'producer') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = idol.name.toLowerCase().includes(q);
      const matchGroup = idol.originalGroup.toLowerCase().includes(q);
      const matchRoles = idol.roles.some((r) => r.toLowerCase().includes(q));
      if (!matchName && !matchGroup && !matchRoles) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'price-asc') return a.price - b.price;
    const statA = a.stats.vocal + a.stats.dance + a.stats.visual;
    const statB = b.stats.vocal + b.stats.dance + b.stats.visual;
    return statB - statA;
  });

  // Auto pick for active player
  const handleAutoDraft = () => {
    // Clear current idols first
    [...activePlayer.idols].forEach((i) => onSellIdol(activePlayer.id, i.id));

    // Shuffle and pick until budget runs out
    const shuffled = [...IDOL_ROSTER].sort(() => 0.5 - Math.random());
    let currentBudget = TOTAL_BUDGET;

    for (const candidate of shuffled) {
      if (candidate.price <= currentBudget) {
        onBuyIdol(activePlayer.id, candidate.id);
        currentBudget -= candidate.price;
      }
    }
    sound.playCheer();
  };

  // Auto draft for ALL 5 players
  const handleAutoDraftAll = () => {
    allPlayers.forEach((p) => {
      // Clear
      [...p.idols].forEach((i) => onSellIdol(p.id, i.id));
      const shuffled = [...IDOL_ROSTER].sort(() => 0.5 - Math.random());
      let bud = TOTAL_BUDGET;
      for (const cand of shuffled) {
        if (cand.price <= bud) {
          onBuyIdol(p.id, cand.id);
          bud -= cand.price;
        }
      }
    });
    sound.playCheer();
  };

  const allPlayersHaveIdols = allPlayers.every((p) => p.idols.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Real-time Audience Transaction Activity Ticker */}
      <ActivityTicker activities={activities} isAnonymousMode={isAnonymousMode} />

      {/* 5 Investors Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-pink-400" />
              5 Nhà Đầu Tư K-POP Tuyển Chọn IDOL:
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenPlayerCodes && (
              <button
                onClick={onOpenPlayerCodes}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-1.5 transition-colors"
                title="Xem mã PIN để 5 người chơi chọn trên điện thoại riêng"
              >
                <span>🔑</span> Mã PIN 5 Người Chơi
              </button>
            )}
            <button
              onClick={handleAutoDraft}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/30 flex items-center gap-1.5 transition-colors"
              title="Tự động chọn ngẫu nhiên đội hình cho ghế này"
            >
              <Dices className="w-3.5 h-3.5" /> Ngẫu nhiên ghế này
            </button>
            <button
              onClick={handleAutoDraftAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 flex items-center gap-1.5 transition-colors"
              title="Tự động chọn đội hình cho cả 5 nhà đầu tư"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Auto chọn cả 5 ghế
            </button>
          </div>
        </div>

        {/* Player Seat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {allPlayers.map((p) => {
            const isCurrent = p.id === activePlayer.id;
            const count = p.idols.length;

            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPlayer(p.id);
                  sound.playBuy();
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-lg shadow-pink-500/25 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold truncate flex items-center gap-1.5">
                    <InvestorAvatar player={p} size="xs" />
                    <span>Ghế #{p.seatNumber}</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      count > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count} idol
                  </span>
                </div>
                <div className="text-xs font-extrabold truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-pink-400 truncate font-semibold">
                  {p.agencyName}
                </div>
                <div className="text-[10px] text-amber-300 mt-1 font-semibold truncate flex items-center justify-between">
                  <span>Còn: {formatWon(p.balance)}</span>
                  <span className="text-[9px] font-mono text-slate-400">PIN: {p.secretPin}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Investor Financial & Lineup Summary Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-pink-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Budget stats */}
          <div className="flex items-center gap-4">
            <InvestorAvatar player={activePlayer} size="md" showBadge />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {activePlayer.name}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-950 border border-pink-500/40 text-pink-300 font-bold">
                  {activePlayer.agencyName}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
                  Ghế #{activePlayer.seatNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  PIN: {activePlayer.secretPin}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm mt-1">
                <span className="text-slate-400">
                  Ngân sách khởi điểm: <strong className="text-white">{formatWon(TOTAL_BUDGET)}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Đã giải ngân: <strong className="text-pink-400">{formatWon(totalSpent)}</strong> ({budgetPercent}%)
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  Còn lại:{' '}
                  <strong className="text-amber-300 font-black text-sm sm:text-base">
                    {formatWon(remainingBudget)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action button to proceed */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={onProceedToGroupCreation}
              disabled={activePlayer.idols.length === 0}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                activePlayer.idols.length > 0
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-600/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <span>Tiến Hành Thành Lập Nhóm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Budget visual progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
            <span>Đã dùng: {formatWon(totalSpent)}</span>
            <span>Hạn mức tối đa: 1,000,000,000 ₩ (1 Tỷ)</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercent > 90
                  ? 'bg-gradient-to-r from-pink-500 to-red-500'
                  : 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400'
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Current Roster Quick Pill Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-pink-400" /> Đội hình đã ký hợp đồng ({activePlayer.idols.length} thành viên):
            </span>
            {activePlayer.idols.length > 0 && (
              <button
                onClick={() => {
                  [...activePlayer.idols].forEach((i) => onSellIdol(activePlayer.id, i.id));
                }}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Xóa toàn bộ
              </button>
            )}
          </div>

          {activePlayer.idols.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-1">
              Chưa có idol nào được ký hợp đồng. Hãy chọn các IDOL K-Pop bên dưới để thêm vào nhóm của bạn!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activePlayer.idols.map((idol) => (
                <div
                  key={idol.id}
                  className="flex items-center gap-2 bg-slate-950/90 border border-pink-500/40 px-3 py-1.5 rounded-xl shadow text-xs"
                >
                  <span className="font-bold text-white">{idol.name}</span>
                  <span className="text-[10px] text-amber-300">{formatWon(idol.price)}</span>
                  <button
                    onClick={() => onSellIdol(activePlayer.id, idol.id)}
                    className="text-slate-400 hover:text-red-400 ml-1"
                    title="Bán idol"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        {/* Gender / Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterGender('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filterGender === 'all'
                ? 'bg-pink-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tất Cả ({IDOL_ROSTER.length})
          </button>
          <button
            onClick={() => setFilterGender('female')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterGender === 'female'
                ? 'bg-pink-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>♀ IDOL Nữ</span>
          </button>
          <button
            onClick={() => setFilterGender('male')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterGender === 'male'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>♂ IDOL Nam</span>
          </button>
          <button
            onClick={() => setFilterGender('producer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterGender === 'producer'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>⭐ Nhà Sản Xuất</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm idol..."
              className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-pink-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-pink-500"
          >
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="stat">Chỉ số kỹ năng cao</option>
          </select>
        </div>
      </div>

      {/* Idols Grid: Displays the 20 requested idols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredIdols.map((idol) => {
          const isOwned = ownedIdolIds.has(idol.id);
          const canAfford = remainingBudget >= idol.price;

          return (
            <IdolCard
              key={idol.id}
              idol={idol}
              isOwned={isOwned}
              canAfford={canAfford}
              onBuy={() => onBuyIdol(activePlayer.id, idol.id)}
              onSell={() => onSellIdol(activePlayer.id, idol.id)}
            />
          );
        })}
      </div>

      {filteredIdols.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Không tìm thấy idol nào phù hợp với bộ lọc.
        </div>
      )}
    </div>
  );
};
