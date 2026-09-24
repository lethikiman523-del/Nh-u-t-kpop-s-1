import React, { useState } from 'react';
import { Player } from '../types';

interface PlayerPinLoginProps {
  players: Player[];
  onLoginSuccess: (player: Player) => void;
  onCancel: () => void;
}

export const PlayerPinLogin: React.FC<PlayerPinLoginProps> = ({
  players,
  onLoginSuccess,
  onCancel,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) {
      setErrorMsg('Vui lòng nhập mã PIN 4 chữ số!');
      return;
    }

    const matchedPlayer = players.find((p) => p.secretPin === cleanPin);
    if (matchedPlayer) {
      onLoginSuccess(matchedPlayer);
    } else {
      setErrorMsg('Mã PIN không chính xác! Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-pink-500/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-slate-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-pink-950/40">
            🔑
          </div>
          <h3 className="text-xl font-black bg-gradient-to-r from-pink-400 to-indigo-300 bg-clip-text text-transparent">
            Nhập Mã PIN
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Nhập mã PIN 4 chữ số của nhà đầu tư để đăng nhập
          </p>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleVerifyPin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 text-center">
              Mã PIN 4 số bí mật:
            </label>
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setErrorMsg('');
              }}
              className="w-full text-center tracking-[0.5em] text-3xl font-mono font-bold bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-pink-400 focus:outline-none focus:border-pink-500 placeholder:text-slate-700"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/80 border border-red-500 text-red-300 text-xs rounded-xl font-bold text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg transition active:scale-95"
          >
            Vào Bàn Chơi Ngay →
          </button>
        </form>

        <button
          onClick={onCancel}
          className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
