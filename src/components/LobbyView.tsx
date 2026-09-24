import React, { useState } from 'react';
import { Player } from '../types';
import { Users, Crown, Sparkles, Building2, Play, Globe, KeyRound, CheckCircle2 } from 'lucide-react';
import { formatWon } from '../utils/format';
import { sound } from '../utils/audio';
import { InvestorAvatar } from './InvestorAvatar';

interface LobbyViewProps {
  players: Player[];
  onClaimSeat: (seatNumber: number, name: string, agencyName: string, avatar: string) => void;
  onStartGame: () => void;
  onOpenQr: () => void;
  onOpenPlayerCodes: () => void;
  roomCode: string;
}

const AVATAR_OPTIONS = ['💎', '🚀', '🌟', '🔥', '👑', '🌸', '⚡', '🎧', '🎬', '🏆'];

export const LobbyView: React.FC<LobbyViewProps> = ({
  players,
  onClaimSeat,
  onStartGame,
  onOpenQr,
  onOpenPlayerCodes,
  roomCode,
}) => {
  const [editingSeat, setEditingSeat] = useState<number | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempAgency, setTempAgency] = useState('');
  const [tempAvatar, setTempAvatar] = useState('💎');

  const startEdit = (player: Player) => {
    setEditingSeat(player.seatNumber);
    setTempName(player.name);
    setTempAgency(player.agencyName);
    setTempAvatar(player.avatar || '💎');
  };

  const saveEdit = (seatNumber: number) => {
    onClaimSeat(seatNumber, tempName || `Nhà đầu tư ${seatNumber}`, tempAgency || `Agency ${seatNumber}`, tempAvatar);
    setEditingSeat(null);
    sound.playBuy();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-300 text-xs sm:text-sm font-bold mb-3 shadow-lg shadow-pink-500/10">
          <Sparkles className="w-4 h-4 text-amber-300" />
          ĐẠI CHIẾN SHOWBIZ • 5 GHẾ NHÀ ĐẦU TƯ • 1 TỶ WON
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Nhà Đầu Tư <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400">IDOL K-POP</span> Số 1
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl mx-auto leading-relaxed">
          Mỗi nhà đầu tư được cấp <strong className="text-amber-300 font-extrabold">1,000,000,000 ₩ (1 Tỷ Won)</strong> để chiêu mộ đội hình IDOL K-Pop huyền thoại, sản xuất bài hát debut và kêu gọi khán giả bình chọn trực tiếp qua đường link!
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onOpenPlayerCodes}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-transform active:scale-95"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            Mã PIN & QR Cho 5 Người Chơi
          </button>
          <button
            onClick={onOpenQr}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-xs sm:text-sm font-bold rounded-2xl border border-pink-500/40 transition-all"
          >
            <Globe className="w-4 h-4 text-pink-400" />
            Mã QR & Link Bình Chọn Khán Giả
          </button>
        </div>

        {/* Fair-play open competition notification */}
        <div className="mt-5 max-w-2xl mx-auto bg-slate-900/90 border border-pink-500/30 rounded-2xl p-3 text-xs text-slate-300 flex items-center justify-center gap-2 shadow">
          <span className="text-base">🔥</span>
          <span>
            <strong>Tranh Đấu Công Khai Minh Bạch:</strong> 5 Nhà đầu tư kết nối điện thoại qua mã PIN/QR, xây dựng nhóm nhạc đỉnh cao và nhận bình chọn trực tiếp từ khán giả trên cùng mạng Wi-Fi!
          </span>
        </div>
      </div>

      {/* 5 Investor Seats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-8">
        {players.map((player) => {
          const isEditing = editingSeat === player.seatNumber;

          return (
            <div
              key={player.id}
              id={`investor-seat-${player.seatNumber}`}
              className={`rounded-3xl p-5 border transition-all relative flex flex-col justify-between ${
                player.seatNumber === 1
                  ? 'bg-gradient-to-b from-slate-900 to-purple-950/40 border-pink-500/70 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Seat Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] font-extrabold text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-pink-400" /> Ghế {player.seatNumber}
                  </span>
                  {player.seatNumber === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" /> Trưởng phòng
                    </span>
                  )}
                </div>

                {/* Avatar & Info */}
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Biểu tượng:
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {AVATAR_OPTIONS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setTempAvatar(em)}
                            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border ${
                              tempAvatar === em
                                ? 'border-pink-500 bg-pink-500/30'
                                : 'border-slate-700 bg-slate-800'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Tên nhà đầu tư:
                      </label>
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Công ty giải trí (Agency):
                      </label>
                      <input
                        type="text"
                        value={tempAgency}
                        onChange={(e) => setTempAgency(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(player.seatNumber)}
                        className="flex-1 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingSeat(null)}
                        className="px-2.5 py-1.5 bg-slate-800 text-slate-400 text-xs rounded-xl"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center my-3">
                    <div className="flex justify-center mb-2">
                      <InvestorAvatar player={player} size="lg" showBadge />
                    </div>
                    <h3 className="text-base font-extrabold text-white truncate px-1">
                      {player.name}
                    </h3>
                    <p className="text-xs text-pink-400 font-semibold flex items-center justify-center gap-1 mt-0.5 truncate">
                      <Building2 className="w-3 h-3" /> {player.agencyName}
                    </p>

                    {/* Capital Indicator */}
                    <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                        Vốn đầu tư ban đầu:
                      </span>
                      <span className="text-sm font-extrabold text-amber-300">
                        {formatWon(player.balance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="mt-3">
                  <button
                    onClick={() => startEdit(player)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 hover:border-slate-500 transition-colors"
                  >
                    Tùy chỉnh ghế này
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="text-center mt-10">
        <button
          onClick={() => {
            sound.playVictory();
            onStartGame();
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-base sm:text-lg font-black rounded-3xl shadow-2xl shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <Play className="w-5 h-5 fill-current" />
          BƯỚC VÀO THỊ TRƯỜNG CHUYỂN NHƯỢNG IDOL (1 TỶ ₩)
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Cả 5 nhà đầu tư đã sẵn sàng vào bàn tuyển chọn idol và thành lập nhóm nhạc đỉnh cao
        </p>
      </div>
    </div>
  );
};
