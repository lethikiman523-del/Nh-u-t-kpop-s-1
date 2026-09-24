import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Player, VoteRecord } from '../types';
import { IdolAvatar } from './IdolAvatar';
import { InvestorAvatar } from './InvestorAvatar';
import { formatWon } from '../utils/format';
import { sound } from '../utils/audio';
import {
  Trophy,
  Crown,
  Sparkles,
  Award,
  RotateCcw,
  Users,
  Flame,
  Heart,
  Disc,
  BarChart3,
  TrendingUp,
  Coins,
  MessageSquare,
  Eye,
  EyeOff,
  Zap,
  Star,
  PartyPopper,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface CeremonyViewProps {
  players: Player[];
  votes: Record<string, number>;
  voteRecords: VoteRecord[];
  winnerPlayerId?: string;
  onRestartGame: () => void;
  isAnonymousMode?: boolean;
  revealIdentities?: boolean;
  onRevealIdentities?: () => void;
}

export const CeremonyView: React.FC<CeremonyViewProps> = ({
  players,
  votes,
  voteRecords,
  winnerPlayerId,
  onRestartGame,
  isAnonymousMode = true,
  revealIdentities = false,
  onRevealIdentities,
}) => {
  const [localRevealed, setLocalRevealed] = useState(revealIdentities);
  const [activeTab, setActiveTab] = useState<'ranking' | 'awards' | 'comments'>('ranking');

  // Sort players by votes descending
  const rankedPlayers = [...players].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));
  const winner = rankedPlayers[0] || players[0];
  const runnerUp = rankedPlayers[1];
  const thirdPlace = rankedPlayers[2];

  const winnerVotes = votes[winner.id] || 0;
  const runnerUpVotes = runnerUp ? votes[runnerUp.id] || 0 : 0;
  const totalVotes = Object.values(votes).reduce((sum, c) => sum + c, 0);
  const winPercent = totalVotes > 0 ? ((winnerVotes / totalVotes) * 100).toFixed(1) : '100.0';
  const voteMargin = winnerVotes - runnerUpVotes;

  // Total money invested across all 5 teams
  const totalSpentAll = players.reduce((acc, p) => {
    return acc + p.idols.reduce((s, i) => s + i.price, 0);
  }, 0);

  // Group performance stats helper
  const getPlayerStats = (player: Player) => {
    const vCount = votes[player.id] || 0;
    const pct = totalVotes > 0 ? (vCount / totalVotes) * 100 : 0;
    const spent = player.idols.reduce((s, i) => s + i.price, 0);
    const costPerVote = vCount > 0 ? Math.round(spent / vCount) : spent;
    const avgVocal =
      player.idols.length > 0
        ? Math.round(player.idols.reduce((s, i) => s + i.stats.vocal, 0) / player.idols.length)
        : 0;
    const avgDance =
      player.idols.length > 0
        ? Math.round(player.idols.reduce((s, i) => s + i.stats.dance, 0) / player.idols.length)
        : 0;
    const avgVisual =
      player.idols.length > 0
        ? Math.round(player.idols.reduce((s, i) => s + i.stats.visual, 0) / player.idols.length)
        : 0;
    const avgRap =
      player.idols.length > 0
        ? Math.round(player.idols.reduce((s, i) => s + i.stats.rap, 0) / player.idols.length)
        : 0;
    const avgPower = Math.round((avgVocal + avgDance + avgVisual + avgRap) / 4);

    return {
      vCount,
      pct,
      pctFormatted: pct.toFixed(1),
      spent,
      costPerVote,
      avgVocal,
      avgDance,
      avgVisual,
      avgRap,
      avgPower,
    };
  };

  // Trigger celebratory confetti fireworks
  const triggerConfettiCannon = () => {
    sound.playCheer();
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#38bdf8'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#38bdf8'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  useEffect(() => {
    sound.playVictory();
    triggerConfettiCannon();
  }, []);

  const handleToggleReveal = () => {
    const nextVal = !localRevealed;
    setLocalRevealed(nextVal);
    if (onRevealIdentities) {
      onRevealIdentities();
    }
    if (nextVal) {
      sound.playCheer();
      triggerConfettiCannon();
    }
  };

  const isRevealed = !isAnonymousMode || localRevealed || revealIdentities;

  // Segment colors for 5 teams in market share bar
  const TEAM_COLORS = [
    { bg: 'bg-amber-500', text: 'text-amber-300', border: 'border-amber-500/50', hex: '#f59e0b' },
    { bg: 'bg-indigo-500', text: 'text-indigo-300', border: 'border-indigo-500/50', hex: '#6366f1' },
    { bg: 'bg-rose-500', text: 'text-rose-300', border: 'border-rose-500/50', hex: '#f43f5e' },
    { bg: 'bg-emerald-500', text: 'text-emerald-300', border: 'border-emerald-500/50', hex: '#10b981' },
    { bg: 'bg-purple-500', text: 'text-purple-300', border: 'border-purple-500/50', hex: '#a855f7' },
  ];

  // Best ROI investor (lowest cost per vote among those with >0 votes)
  const sortedByRoi = [...rankedPlayers].sort((a, b) => {
    const statsA = getPlayerStats(a);
    const statsB = getPlayerStats(b);
    if (statsA.vCount === 0 && statsB.vCount === 0) return 0;
    if (statsA.vCount === 0) return 1;
    if (statsB.vCount === 0) return -1;
    return statsA.costPerVote - statsB.costPerVote;
  });
  const bestRoiPlayer = sortedByRoi[0];

  // Best visual team
  const sortedByVisual = [...rankedPlayers].sort((a, b) => {
    return getPlayerStats(b).avgVisual - getPlayerStats(a).avgVisual;
  });
  const bestVisualPlayer = sortedByVisual[0];

  // Best vocal team
  const sortedByVocal = [...rankedPlayers].sort((a, b) => {
    return getPlayerStats(b).avgVocal - getPlayerStats(a).avgVocal;
  });
  const bestVocalPlayer = sortedByVocal[0];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Top Ceremony Banner & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-1.5 shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            LỄ TRAO GIẢI K-POP GRAND CEREMONY
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2 justify-center sm:justify-start">
            <span>Đại Tiệc Vinh Danh Nhà Đầu Tư Số 1</span>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tổng kết {totalVotes} phiếu bình chọn từ khán giả cả nước • Khám phá quán quân và bảng tổng sắp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Confetti Firework Trigger */}
          <button
            onClick={triggerConfettiCannon}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/50 rounded-2xl text-xs font-bold transition shadow-lg active:scale-95"
            title="Bắn pháo hoa kim tuyến chúc mừng"
          >
            <PartyPopper className="w-4 h-4 text-amber-400" />
            <span>Bắn Pháo Hoa</span>
          </button>

          {/* Reveal Identities Toggle (If anonymous mode) */}
          {isAnonymousMode && (
            <button
              onClick={handleToggleReveal}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition shadow-lg active:scale-95 ${
                isRevealed
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/60'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-900/40'
              }`}
              title="Công bố danh tính thật của các nhà đầu tư bí ẩn"
            >
              {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isRevealed ? 'Ẩn Danh Tính Lại' : '🎭 Mở Mặt Nạ Danh Tính'}</span>
            </button>
          )}

          {/* New Game Restart */}
          <button
            onClick={() => {
              sound.playBuy();
              onRestartGame();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black shadow-xl shadow-pink-600/30 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Ván Mới</span>
          </button>
        </div>
      </div>

      {/* GRAND CHAMPION SHOWCASE (DAESANG WINNER) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400 bg-gradient-to-b from-amber-950/50 via-purple-950/40 to-slate-950 p-6 sm:p-10 text-center shadow-2xl shadow-amber-500/25">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-b from-amber-400/20 via-pink-500/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

        {/* Crown & Title */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-500/40 to-amber-500/30 border border-amber-400/70 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-widest mb-3 shadow-lg shadow-amber-500/20">
            <Crown className="w-5 h-5 text-amber-300 fill-current animate-bounce" />
            <span>🏆 QUÁN QUÂN DAESANG • NHÀ ĐẦU TƯ IDOL K-POP SỐ 1</span>
          </div>

          <h2 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-rose-300 tracking-tight my-2">
            {winner.groupDetails?.groupName || winner.name}
          </h2>

          <div className="flex items-center gap-2 my-2">
            <span className="text-sm sm:text-base text-slate-300">
              Nhà đầu tư:{' '}
              <strong className="text-amber-300 font-extrabold text-base sm:text-lg">
                {isRevealed ? winner.name : winner.anonymousCodename}
              </strong>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
              {winner.agencyName}
            </span>
          </div>

          {/* Winner Avatar */}
          <div className="my-5 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-rose-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative">
              <InvestorAvatar
                player={winner}
                size="xl"
                showBadge
                className="ring-4 ring-amber-300 shadow-2xl rounded-3xl"
              />
            </div>
          </div>

          {/* Detailed Winner Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl my-4">
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-center shadow-lg">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>Số Phiếu Bình Chọn</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {winnerVotes}{' '}
                <span className="text-xs font-bold text-slate-400">phiếu</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                {winPercent}% tổng số phiếu
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-center shadow-lg">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-pink-400" />
                <span>Khoảng Cách Á Quân</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-pink-400">
                +{voteMargin}{' '}
                <span className="text-xs font-bold text-slate-400">phiếu</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Cách biệt an toàn
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-center shadow-lg">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Vốn Đầu Tư Idol</span>
              </div>
              <div className="text-base sm:text-lg font-black text-white truncate">
                {formatWon(getPlayerStats(winner).spent)}
              </div>
              <div className="text-[11px] text-amber-300/90 font-mono mt-0.5">
                Còn lại: {formatWon(winner.balance)}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-center shadow-lg">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Hiệu Suất Chi Phí</span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-300 truncate">
                {formatWon(getPlayerStats(winner).costPerVote)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Chi phí / mỗi phiếu
              </div>
            </div>
          </div>

          {/* Group Details Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 my-3">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Disc className="w-3.5 h-3.5 text-purple-400" />
              Debut Song: <strong>{winner.groupDetails?.debutSong || 'Hit Debut'}</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Concept: <strong>{winner.groupDetails?.concept || 'K-Pop Masterpiece'}</strong>
            </span>
            {winner.groupDetails?.fandomName && (
              <span className="px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Fandom: <strong>{winner.groupDetails.fandomName}</strong>
              </span>
            )}
          </div>

          {/* Winner Members Portrait Lineup */}
          <div className="mt-6 pt-6 border-t border-amber-500/30 w-full">
            <h4 className="text-xs font-black text-amber-200 uppercase tracking-widest mb-4 flex items-center justify-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              ĐỘI HÌNH THẦN TƯỢNG VÔ ĐỊCH ({winner.idols.length} THÀNH VIÊN)
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {winner.idols.map((idol) => {
                const role = winner.groupDetails?.roleAssignments?.[idol.id] || idol.roles[0];
                return (
                  <div
                    key={idol.id}
                    className="flex flex-col items-center bg-slate-900/90 border border-amber-500/40 p-3 rounded-2xl shadow-xl hover:scale-105 transition-all w-28 sm:w-32"
                  >
                    <IdolAvatar idol={idol} size="md" />
                    <span className="text-xs font-black text-white mt-2 truncate w-full text-center">
                      {idol.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 mt-0.5 truncate w-full text-center">
                      {role}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                      {idol.originalGroup}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3-TIER OLYMPIC PODIUM (TOP 3 GROUPS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Bục Vinh Quang Top 3 Chung Cuộc
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Xếp hạng theo tổng phiếu khán giả
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto pt-4">
          {/* #2 RUNNER-UP (SILVER) */}
          {runnerUp && (
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="mb-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-slate-300 text-slate-950 font-black text-lg flex items-center justify-center mx-auto mb-2 shadow-lg ring-2 ring-slate-400">
                  #2
                </div>
                <InvestorAvatar player={runnerUp} size="md" showBadge />
                <h4 className="text-sm font-black text-white mt-2 truncate max-w-[200px]">
                  {runnerUp.groupDetails?.groupName || runnerUp.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isRevealed ? runnerUp.name : runnerUp.anonymousCodename}
                </p>
                <div className="text-base font-black text-slate-200 mt-1">
                  {votes[runnerUp.id] || 0} phiếu{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    ({getPlayerStats(runnerUp).pctFormatted}%)
                  </span>
                </div>
              </div>

              {/* Pedestal Bar */}
              <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700/80 border-t-4 border-slate-400 rounded-t-2xl p-4 text-center shadow-xl h-44 flex flex-col justify-between">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  🥈 Á QUÂN 1 (BONSANG)
                </span>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div>Vốn: {formatWon(getPlayerStats(runnerUp).spent)}</div>
                  <div className="text-slate-400">
                    Cách quán quân: -{voteMargin} phiếu
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* #1 WINNER (GOLD - CENTER - TALLEST) */}
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="mb-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-2xl ring-4 ring-amber-400/80 animate-pulse">
                👑 #1
              </div>
              <InvestorAvatar player={winner} size="lg" showBadge />
              <h4 className="text-base font-black text-amber-300 mt-2 truncate max-w-[220px]">
                {winner.groupDetails?.groupName || winner.name}
              </h4>
              <p className="text-xs text-slate-300">
                {isRevealed ? winner.name : winner.anonymousCodename}
              </p>
              <div className="text-xl font-black text-amber-400 mt-1">
                {winnerVotes} phiếu{' '}
                <span className="text-xs text-amber-300/80 font-normal">
                  ({winPercent}%)
                </span>
              </div>
            </div>

            {/* Pedestal Bar */}
            <div className="w-full bg-gradient-to-t from-amber-950/80 via-amber-900/60 to-amber-700/80 border-t-4 border-amber-400 rounded-t-2xl p-4 text-center shadow-2xl h-56 flex flex-col justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-300 fill-current" />
                🏆 QUÁN QUÂN (DAESANG)
              </span>
              <div className="text-xs text-amber-200 font-semibold space-y-1">
                <div>Chi phí/phiếu: {formatWon(getPlayerStats(winner).costPerVote)}</div>
                <div className="text-emerald-400 font-bold">👑 Dẫn đầu tuyệt đối</div>
              </div>
            </div>
          </div>

          {/* #3 THIRD PLACE (BRONZE) */}
          {thirdPlace && (
            <div className="order-3 flex flex-col items-center">
              <div className="mb-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-800 text-amber-100 font-black text-lg flex items-center justify-center mx-auto mb-2 shadow-lg ring-2 ring-amber-700">
                  #3
                </div>
                <InvestorAvatar player={thirdPlace} size="md" showBadge />
                <h4 className="text-sm font-black text-white mt-2 truncate max-w-[200px]">
                  {thirdPlace.groupDetails?.groupName || thirdPlace.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isRevealed ? thirdPlace.name : thirdPlace.anonymousCodename}
                </p>
                <div className="text-base font-black text-amber-600 mt-1">
                  {votes[thirdPlace.id] || 0} phiếu{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    ({getPlayerStats(thirdPlace).pctFormatted}%)
                  </span>
                </div>
              </div>

              {/* Pedestal Bar */}
              <div className="w-full bg-gradient-to-t from-amber-950/60 to-amber-900/50 border-t-4 border-amber-700 rounded-t-2xl p-4 text-center shadow-xl h-36 flex flex-col justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  🥉 Á QUÂN 2 (BONSANG)
                </span>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <div>Vốn: {formatWon(getPlayerStats(thirdPlace).spent)}</div>
                  <div className="text-slate-400">
                    Cách quán quân: -{winnerVotes - (votes[thirdPlace.id] || 0)} phiếu
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AUDIENCE VOTE MARKET SHARE BREAKDOWN (BIỂU ĐỒ THỊ PHẦN BÌNH CHỌN) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Phân Bổ Thị Phần Bình Chọn Khán Giả ({totalVotes} Phiếu)
            </h3>
          </div>
          <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30">
            Tỷ lệ tham gia 100%
          </span>
        </div>

        {/* Multi-segmented market share bar */}
        <div className="h-6 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 shadow-inner">
          {rankedPlayers.map((player, idx) => {
            const stats = getPlayerStats(player);
            if (stats.pct === 0) return null;
            const color = TEAM_COLORS[idx % TEAM_COLORS.length];

            return (
              <div
                key={player.id}
                className={`${color.bg} h-full transition-all duration-500 relative group cursor-pointer`}
                style={{ width: `${stats.pct}%` }}
                title={`${player.groupDetails?.groupName || player.name}: ${stats.vCount} phiếu (${stats.pctFormatted}%)`}
              />
            );
          })}
        </div>

        {/* Legend pills for all 5 groups */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4">
          {rankedPlayers.map((player, idx) => {
            const stats = getPlayerStats(player);
            const color = TEAM_COLORS[idx % TEAM_COLORS.length];

            return (
              <div
                key={player.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${color.bg} shrink-0`} />
                  <span className="text-xs font-bold text-white truncate">
                    {player.groupDetails?.groupName || player.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-800/80">
                  <span className={`text-xs font-black ${color.text}`}>
                    {stats.vCount} phiếu
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {stats.pctFormatted}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED RANKING COMPARISON TABLE FOR ALL 5 INVESTORS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Bảng Thống Kê & Phân Tích Thông Số Toàn Diện 5 Nhà Đầu Tư
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ghi rõ thứ hạng, số phiếu, tỷ lệ %, chênh lệch, vốn đầu tư và hiệu quả chi phí
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'ranking'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bảng Tổng Sắp
            </button>
            <button
              onClick={() => setActiveTab('awards')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'awards'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Giải Thưởng Phụ
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'comments'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ý Kiến Khán Giả ({voteRecords.length})
            </button>
          </div>
        </div>

        {/* TAB 1: FULL RANKING TABLE */}
        {activeTab === 'ranking' && (
          <div className="space-y-3">
            {rankedPlayers.map((player, rank) => {
              const stats = getPlayerStats(player);
              const color = TEAM_COLORS[rank % TEAM_COLORS.length];
              const isLead = rank === 0;
              const diffFromWinner = stats.vCount - winnerVotes;

              return (
                <div
                  key={player.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isLead
                      ? 'bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border-amber-500/60 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/40'
                      : rank === 1
                      ? 'bg-slate-800/70 border-slate-700 shadow-md'
                      : rank === 2
                      ? 'bg-slate-900/90 border-amber-800/40'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Rank, Avatar, Name & Agency */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-md ${
                          rank === 0
                            ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 ring-2 ring-amber-400'
                            : rank === 1
                            ? 'bg-slate-300 text-slate-950 ring-2 ring-slate-400'
                            : rank === 2
                            ? 'bg-amber-800 text-amber-100 ring-2 ring-amber-700'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{rank + 1}
                      </div>

                      <InvestorAvatar player={player} size="sm" showBadge />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-black text-white truncate">
                            {player.groupDetails?.groupName || player.name}
                          </h4>
                          {isLead && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
                              👑 QUÁN QUÂN
                            </span>
                          )}
                          <span className="text-xs text-pink-400 font-semibold">
                            {player.agencyName}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>
                            Nhà đầu tư:{' '}
                            <strong className="text-slate-200">
                              {isRevealed ? player.name : player.anonymousCodename}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>{player.idols.length} idol</span>
                          <span>•</span>
                          <span>Vốn: {formatWon(stats.spent)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Key Voting & Financial Metrics */}
                    <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      {/* Vote Count & Percent */}
                      <div className="text-left lg:text-right min-w-[120px]">
                        <div className="flex items-baseline lg:justify-end gap-1.5">
                          <span className="text-xl sm:text-2xl font-black text-amber-400">
                            {stats.vCount}
                          </span>
                          <span className="text-xs font-bold text-slate-400">phiếu</span>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            {stats.pctFormatted}%
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {isLead
                            ? '👑 Dẫn đầu toàn sàn'
                            : `Cách Quán Quân: ${diffFromWinner} phiếu (${((diffFromWinner / (totalVotes || 1)) * 100).toFixed(1)}%)`}
                        </div>
                      </div>

                      {/* Financial Efficiency */}
                      <div className="text-left lg:text-right min-w-[130px] hidden sm:block">
                        <div className="text-xs font-bold text-slate-300">
                          {formatWon(stats.costPerVote)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Chi phí / 1 phiếu
                        </div>
                      </div>

                      {/* Vote Progress Bar */}
                      <div className="w-full lg:w-28 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full ${color.bg} transition-all duration-500`}
                          style={{ width: `${stats.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SPECIAL HONOR AWARDS */}
        {activeTab === 'awards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Daesang Award */}
            <div className="bg-gradient-to-br from-amber-950/50 to-slate-950 border-2 border-amber-400/80 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Crown className="w-6 h-6 fill-current" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  GIẢI THƯỞNG DANH GIÁ NHẤT
                </span>
              </div>
              <h4 className="text-base font-black text-white">🏆 Daesang - Nhóm Nhạc Của Năm</h4>
              <p className="text-xs text-slate-400 mt-1">Đạt số lượng bình chọn cao nhất từ toàn thể khán giả</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-black text-amber-300">
                  {winner.groupDetails?.groupName || winner.name}
                </span>
                <span className="text-xs font-bold text-white bg-amber-500/30 px-2 py-0.5 rounded">
                  {winnerVotes} phiếu ({winPercent}%)
                </span>
              </div>
            </div>

            {/* Smart Value Investor Award */}
            {bestRoiPlayer && (
              <div className="bg-slate-950/80 border border-emerald-500/50 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Coins className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    CHIẾN LƯỢC ĐẦU TƯ TỐI ƯU
                  </span>
                </div>
                <h4 className="text-base font-black text-white">💰 Nhà Đầu Tư Thông Thái Nhất</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Đạt chi phí bình quân thấp nhất trên mỗi phiếu bầu ({formatWon(getPlayerStats(bestRoiPlayer).costPerVote)}/phiếu)
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-emerald-300">
                    {bestRoiPlayer.groupDetails?.groupName || bestRoiPlayer.name}
                  </span>
                  <span className="text-xs text-slate-300">
                    Nhà đầu tư: {isRevealed ? bestRoiPlayer.name : bestRoiPlayer.anonymousCodename}
                  </span>
                </div>
              </div>
            )}

            {/* Visual Masterpiece Award */}
            {bestVisualPlayer && (
              <div className="bg-slate-950/80 border border-rose-500/50 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                    <Sparkles className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                    NHAN SẮC ĐỈNH CAO
                  </span>
                </div>
                <h4 className="text-base font-black text-white">✨ Visual Dream Team</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Đội hình sở hữu chỉ số Visual trung bình ấn tượng nhất ({getPlayerStats(bestVisualPlayer).avgVisual}/100)
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-rose-300">
                    {bestVisualPlayer.groupDetails?.groupName || bestVisualPlayer.name}
                  </span>
                  <span className="text-xs text-slate-400">{bestVisualPlayer.idols.length} idol</span>
                </div>
              </div>
            )}

            {/* Vocal Powerhouse Award */}
            {bestVocalPlayer && (
              <div className="bg-slate-950/80 border border-indigo-500/50 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                    <Flame className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    GIỌNG CA NỘI LỰC
                  </span>
                </div>
                <h4 className="text-base font-black text-white">🎤 Vocal Powerhouse Award</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Nhóm sở hữu chỉ số Vocal trung bình cao nhất toàn cuộc thi ({getPlayerStats(bestVocalPlayer).avgVocal}/100)
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-indigo-300">
                    {bestVocalPlayer.groupDetails?.groupName || bestVocalPlayer.name}
                  </span>
                  <span className="text-xs text-slate-400">{bestVocalPlayer.agencyName}</span>
                </div>
              </div>
            )}

            {/* Performance Group Award */}
            {runnerUp && (
              <div className="bg-slate-950/80 border border-slate-700 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    <Trophy className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    BONSANG CHÍNH THỨC
                  </span>
                </div>
                <h4 className="text-base font-black text-white">🥈 Bonsang - Á Quân K-Pop Xuất Sắc</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Đạt vị trí thứ 2 chung cuộc với {votes[runnerUp.id] || 0} lượt bình chọn từ khán giả
                </p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-200">
                    {runnerUp.groupDetails?.groupName || runnerUp.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {getPlayerStats(runnerUp).pctFormatted}% thị phần
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FAN COMMENTS & AUDIENCE LOG */}
        {activeTab === 'comments' && (
          <div className="space-y-3">
            {voteRecords.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-2xl border border-slate-800">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-semibold">
                  Chưa có bình luận khán giả nào được ghi nhận
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Các lá phiếu từ điện thoại quét QR kèm lời nhắn sẽ xuất hiện trực tiếp tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {voteRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-start gap-3 shadow"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-1 shadow-sm"
                      style={{ backgroundColor: record.lightstickColor || '#ec4899' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-white truncate">
                          {record.voterName}
                        </span>
                        <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.2 rounded border border-pink-500/30">
                          Vote: {record.groupName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{record.comment || 'Cố lên các idol của tôi! Nhóm xuất sắc nhất!'}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FINAL CALL TO ACTION FOOTER */}
      <div className="text-center pt-2 pb-6">
        <button
          onClick={() => {
            sound.playBuy();
            onRestartGame();
          }}
          className="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-base sm:text-lg rounded-3xl shadow-2xl shadow-pink-600/40 hover:scale-105 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>BẮT ĐẦU VÁN CHƠI MỚI (CHIA LẠI 1 TỶ WON)</span>
        </button>
      </div>
    </div>
  );
};
