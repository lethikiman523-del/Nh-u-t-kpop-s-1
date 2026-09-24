import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { IdolAvatar } from './IdolAvatar';
import { InvestorAvatar } from './InvestorAvatar';
import { formatWon } from '../utils/format';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Globe,
  Music,
  Disc,
  Play,
  Volume2,
  Award,
  Users,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface ShowcaseViewProps {
  players: Player[];
  activeShowcasePlayerId: string;
  onSetShowcasePlayer: (playerId: string) => void;
  onStartVoting: () => void;
  onOpenQr: () => void;
  isAnonymousMode?: boolean;
  revealIdentities?: boolean;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({
  players,
  activeShowcasePlayerId,
  onSetShowcasePlayer,
  onStartVoting,
  onOpenQr,
  isAnonymousMode = true,
  revealIdentities = false,
}) => {
  const [isPlayingSong, setIsPlayingSong] = useState(false);

  const activeIndex = players.findIndex((p) => p.id === activeShowcasePlayerId);
  const activePlayer = players[activeIndex >= 0 ? activeIndex : 0];

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % players.length;
    onSetShowcasePlayer(players[nextIdx].id);
    sound.playCheer();
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + players.length) % players.length;
    onSetShowcasePlayer(players[prevIdx].id);
    sound.playCheer();
  };

  const handlePlayCheer = () => {
    sound.playCheer();
    setIsPlayingSong(true);
    setTimeout(() => setIsPlayingSong(false), 2000);
  };

  const group = activePlayer.groupDetails;
  const totalInvestment = activePlayer.idols.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/90 border border-pink-500/40 p-4 rounded-3xl shadow-xl shadow-pink-500/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> SÂN KHẤU SHOWCASE DEBUT K-POP TRỰC TIẾP
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Màn Trình Diễn Của 5 Siêu Nhóm Nhạc
          </h2>
          <p className="text-xs text-slate-400">
            Xem phong cách ra mắt của từng nhà đầu tư trước khi mở cổng bình chọn qua link cho khán giả!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenQr}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/40 rounded-2xl text-xs font-bold flex items-center gap-2"
          >
            <Globe className="w-4 h-4" /> Link Khán Giả Bình Chọn
          </button>
          <button
            onClick={() => {
              sound.playVictory();
              onStartVoting();
            }}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-pink-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            MỞ CỔNG BÌNH CHỌN KHÁN GIẢ
          </button>
        </div>
      </div>

      {/* 5 Group Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {players.map((p) => {
          const isSelected = p.id === activePlayer.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                onSetShowcasePlayer(p.id);
                sound.playBuy();
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-xl shadow-pink-500/20 scale-105'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <InvestorAvatar player={p} size="xs" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 truncate">
                  {p.name}
                </span>
              </div>
              <div className="text-xs font-black text-white truncate mt-0.5">
                {p.groupDetails?.groupName || p.name}
              </div>
              <div className="text-[10px] text-slate-300 truncate mt-1">
                {p.idols.length} idols • {p.groupDetails?.concept || 'K-Pop'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Grand Stage Centerpiece */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/50 bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-purple-900/30 text-center">
        {/* Stage Lighting FX */}
        <div className="absolute -top-20 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-20 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900/80 hover:bg-pink-600 text-white rounded-full border border-slate-700 shadow-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900/80 hover:bg-pink-600 text-white rounded-full border border-slate-700 shadow-xl transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Agency Tag & Investor */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-300 mb-4">
          <InvestorAvatar player={activePlayer} size="xs" />
          <span className="text-white font-black">{activePlayer.name}</span>
          <span>•</span>
          <span className="text-pink-400 font-semibold">{activePlayer.agencyName}</span>
          <span>•</span>
          <span className="text-amber-300">Vốn chiêu mộ: {formatWon(totalInvestment)}</span>
        </div>

        {/* Group Name Title */}
        <h1 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 tracking-tight">
          {group?.groupName || 'K-POP SUPERGROUP'}
        </h1>

        {/* Song & Concept */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-full text-xs font-bold">
            <Disc className="w-3.5 h-3.5 animate-spin" /> Debut Single: {group?.debutSong || 'First Hit Track'}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Concept: {group?.concept || 'Cyberpunk'}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold">
            <Users className="w-3.5 h-3.5" /> Fandom: {group?.fandomName || 'Superfans'}
          </div>
        </div>

        {/* Group Slogan */}
        <p className="italic text-slate-300 text-sm max-w-xl mx-auto mb-8">
          "{group?.motto || 'Âm nhạc đỉnh cao bùng nổ sân khấu K-Pop!'}"
        </p>

        {/* Members Lineup Display */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 my-6">
          {activePlayer.idols.map((idol) => {
            const role = group?.roleAssignments?.[idol.id] || idol.roles[0];
            return (
              <div
                key={idol.id}
                className="flex flex-col items-center bg-slate-900/80 border border-slate-800 hover:border-pink-500/60 p-3 sm:p-4 rounded-3xl shadow-xl transition-transform hover:-translate-y-1.5"
              >
                <IdolAvatar idol={idol} size="lg" />
                <h4 className="text-sm sm:text-base font-black text-white mt-2">
                  {idol.name}
                </h4>
                <span className="text-[11px] text-slate-400 truncate max-w-[110px]">
                  {idol.originalGroup}
                </span>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold">
                  {role}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold mt-1">
                  {formatWon(idol.price)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stage Sound Interaction */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={handlePlayCheer}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
              isPlayingSong
                ? 'bg-pink-600 text-white border-pink-400 scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            {isPlayingSong ? 'Khán đài reo hò cuồng nhiệt! 👏' : 'Tiếng Cổ Vũ Của Khán Giả'}
          </button>
        </div>
      </div>
    </div>
  );
};
