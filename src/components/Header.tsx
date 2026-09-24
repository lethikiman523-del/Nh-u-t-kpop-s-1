import React, { useState, useEffect } from 'react';
import { GamePhase, Player } from '../types';
import {
  Sparkles,
  KeyRound,
  Volume2,
  VolumeX,
  RotateCcw,
  Users,
  Home,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Disc3,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { kpopMusic } from '../utils/kpopAudio';

interface HeaderProps {
  phase: GamePhase;
  roomCode: string;
  onOpenQr: () => void;
  onOpenPlayerCodes: () => void;
  onOpenPlayerLogin: () => void;
  onResetGame: () => void;
  onChangePhase?: (phase: GamePhase) => void;
  players: Player[];
  activePlayerId: string;
  onSelectActivePlayer: (playerId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalVotes: number;
}

const PHASES: { key: GamePhase; label: string; step: number; shortLabel: string }[] = [
  { key: 'LOBBY', label: '1. Sảnh Chờ', shortLabel: '1. Sảnh', step: 1 },
  { key: 'MARKET', label: '2. Thị Trường Idol', shortLabel: '2. Mua Idol', step: 2 },
  { key: 'GROUP_CREATION', label: '3. Thành Lập Nhóm', shortLabel: '3. Nhóm', step: 3 },
  { key: 'DEBUT_SHOWCASE', label: '4. Sân Khấu Debut', shortLabel: '4. Debut', step: 4 },
  { key: 'VOTING', label: '5. Khán Giả Bình Chọn', shortLabel: '5. Bình Chọn', step: 5 },
  { key: 'CEREMONY', label: '6. Trao Giải', shortLabel: '6. Trao Giải', step: 6 },
];

export const Header: React.FC<HeaderProps> = ({
  phase,
  roomCode,
  onOpenQr,
  onOpenPlayerCodes,
  onOpenPlayerLogin,
  onResetGame,
  onChangePhase,
  players,
  activePlayerId,
  onSelectActivePlayer,
  soundEnabled,
  onToggleSound,
  totalVotes,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState(kpopMusic.getIsPlaying());
  const currentStepIndex = PHASES.findIndex((p) => p.key === phase);
  const currentStep = currentStepIndex !== -1 ? currentStepIndex + 1 : 1;

  useEffect(() => {
    return kpopMusic.subscribe(() => {
      setIsBgmPlaying(kpopMusic.getIsPlaying());
    });
  }, []);

  const handlePrevStep = () => {
    if (currentStepIndex > 0 && onChangePhase) {
      onChangePhase(PHASES[currentStepIndex - 1].key);
      sound.playBuy();
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < PHASES.length - 1 && onChangePhase) {
      onChangePhase(PHASES[currentStepIndex + 1].key);
      sound.playCheer();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-2 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* Main Interactive Phase Stepper Bar: Dedicated Full-Width Row so all 6 steps are 100% visible */}
          <div className="w-full flex items-center justify-between gap-1 sm:gap-2 bg-slate-900/95 p-1 sm:p-1.5 rounded-2xl border border-slate-800/90 shadow-lg shadow-black/30">
            {/* Step navigation: Previous step */}
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`p-1.5 sm:p-2 rounded-xl transition shrink-0 ${
                currentStepIndex === 0 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Quay lại bước trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 1. Sảnh Chờ ➜ 2. Thị Trường Idol ➜ 3. Thành Lập Nhóm ➜ 4. Sân Khấu Debut ➜ 5. Khán Giả Bình Chọn ➜ 6. Trao Giải */}
            <div className="flex items-center justify-between flex-1 gap-1 sm:gap-1.5 overflow-x-auto md:overflow-x-visible scrollbar-none px-0.5 sm:px-1">
              {PHASES.map((p, idx) => {
                const isActive = p.key === phase;
                const isCompleted = p.step < currentStep;
                return (
                  <React.Fragment key={p.key}>
                    <button
                      onClick={() => {
                        if (onChangePhase) {
                          onChangePhase(p.key);
                          sound.playBuy();
                        }
                      }}
                      className={`flex-1 min-w-fit px-1.5 sm:px-2 md:px-3 lg:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer text-center select-none ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 ring-2 ring-pink-400/60 scale-[1.02]'
                          : isCompleted
                          ? 'text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                      title={`Chuyển tới bước ${p.label}`}
                    >
                      <span>{p.label}</span>
                    </button>
                    {idx < PHASES.length - 1 && (
                      <span className="text-pink-500/70 font-black text-xs sm:text-sm px-0.5 select-none shrink-0">
                        ➜
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step navigation: Next step */}
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === PHASES.length - 1}
              className={`p-1.5 sm:p-2 rounded-xl transition shrink-0 ${
                currentStepIndex === PHASES.length - 1 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Chuyển sang bước tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Utility Controls Row */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] sm:text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-300">
                Bước {currentStep}/6: <strong className="text-pink-400 font-extrabold">{PHASES[currentStepIndex]?.label}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Background Music Button (AOA - Miniskirt) */}
              <button
                onClick={() => kpopMusic.togglePlay()}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                  isBgmPlaying
                    ? 'bg-rose-950/80 text-rose-200 border-rose-500/60 shadow-md shadow-rose-950/50'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                }`}
                title={
                  isBgmPlaying
                    ? 'Tạm dừng nhạc nền: AOA - Miniskirt (Lặp lại tự động)'
                    : 'Phát nhạc nền: AOA - Miniskirt (Lặp lại tự động)'
                }
              >
                <Disc3
                  className={`w-3.5 h-3.5 text-rose-400 ${isBgmPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '3s' }}
                />
                <span className="hidden sm:inline font-semibold">
                  {isBgmPlaying ? 'Nhạc: Miniskirt' : 'Bật Nhạc Nền'}
                </span>
                <span className="sm:hidden font-semibold">
                  {isBgmPlaying ? 'Nhạc' : 'Bật Nhạc'}
                </span>
              </button>

              {/* Quick PIN Login button */}
              <button
                onClick={onOpenPlayerLogin}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition"
                title="Nhập mã PIN để vào điều khiển trên thiết bị này"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Nhập PIN</span>
              </button>

              {/* Seat Switcher */}
              {phase !== 'LOBBY' && phase !== 'CEREMONY' && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Xem:</span>
                  <select
                    value={activePlayerId}
                    onChange={(e) => {
                      onSelectActivePlayer(e.target.value);
                      sound.playBuy();
                    }}
                    className="bg-slate-800 text-xs font-bold text-pink-300 rounded-lg px-2 py-0.5 focus:outline-none border border-slate-700"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        Ghế {p.seatNumber}: {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sound FX toggle */}
              <button
                onClick={onToggleSound}
                className={`p-1.5 rounded-xl border transition-colors ${
                  soundEnabled
                    ? 'bg-slate-800 text-pink-400 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-900 text-slate-600 border-slate-800'
                }`}
                title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Primary EXIT TO MAIN SCREEN & RESET GAME BUTTON */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-rose-500/40 transition active:scale-95"
                title="Thoát ra màn hình chính, reset lại toàn bộ game từ đầu"
              >
                <Home className="w-3.5 h-3.5 text-rose-400" />
                <span>Về Màn Hình Chính</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Reset / Exit to Home */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-red-950/50 text-slate-100">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="p-3 bg-red-950/60 rounded-2xl border border-red-500/40">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Thoát &amp; Khởi Động Lại Game?</h3>
                <p className="text-xs text-slate-400">Về màn hình chính (Sảnh chờ ban đầu)</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Bạn có chắc chắn muốn <strong className="text-red-400">thoát về màn hình chính</strong> và làm mới toàn bộ dữ liệu?
              <br />
              Tất cả idol đã mua, cấu hình nhóm nhạc và phiếu bình chọn sẽ được làm mới về trạng thái ban đầu để bạn bắt đầu lượt chơi mới hoặc thuyết trình lại từ đầu.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetGame();
                }}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xác Nhận Reset Về Màn Hình Chính</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
