import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Player } from '../types';
import { InvestorAvatar } from './InvestorAvatar';
import { KeyRound, Copy, Check, ExternalLink, Smartphone, ShieldCheck, X, QrCode } from 'lucide-react';
import { sound } from '../utils/audio';
import { useServerInfo, getAppBaseUrl } from '../utils/serverIp';

interface PlayerCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  roomCode: string;
  onSelectPlayerForCurrentTab?: (playerId: string) => void;
  onLaunchSeat?: (seatNumber: number) => void;
}

export const PlayerCodesModal: React.FC<PlayerCodesModalProps> = ({
  isOpen,
  onClose,
  players,
  roomCode,
  onSelectPlayerForCurrentTab,
  onLaunchSeat,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedGeneralUrl, setCopiedGeneralUrl] = useState(false);
  const [activeQrSeat, setActiveQrSeat] = useState<number | null>(null);

  const serverInfo = useServerInfo();

  if (!isOpen) return null;

  const baseUrl = getAppBaseUrl(serverInfo);
  const generalAppUrl = baseUrl ? `${baseUrl}/?room=${encodeURIComponent(roomCode)}` : '';

  const getPlayerUrl = (player: Player) => {
    return `${baseUrl}/?room=${encodeURIComponent(roomCode)}&role=player&seat=${player.seatNumber}&pin=${player.secretPin}`;
  };

  const handleCopyLink = (player: Player, index: number) => {
    const url = getPlayerUrl(player);
    navigator.clipboard?.writeText(url);
    sound.playBuy();
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyPin = (pin: string, index: number) => {
    navigator.clipboard?.writeText(pin);
    sound.playBuy();
    setCopiedIndex(index + 100);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyGeneralUrl = () => {
    navigator.clipboard?.writeText(generalAppUrl);
    sound.playBuy();
    setCopiedGeneralUrl(true);
    setTimeout(() => setCopiedGeneralUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-pink-500/40 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Mã PIN & Mã QR Tham Gia Cho 5 Người Chơi</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            Tham Gia Điều Khiển Trực Tiếp
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Người chơi quét mã QR hoặc mở link và nhập <strong className="text-amber-300">Mã PIN 4 số</strong> trên điện thoại để sở hữu bảng điều khiển chiêu mộ IDOL riêng biệt.
          </p>
        </div>

        {/* General App Link Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0">
            <Smartphone className="w-5 h-5 text-pink-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Đường Link Game Cho Người Chơi (Kết nối Wi-Fi):
              </span>
              <span className="text-xs font-mono text-pink-300 truncate block">
                {generalAppUrl}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopyGeneralUrl}
            className="w-full sm:w-auto px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-pink-600/20"
          >
            {copiedGeneralUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedGeneralUrl ? 'Đã sao chép!' : 'Sao chép link web'}</span>
          </button>
        </div>

        {/* Mobile 4G / Cookie Notice Box */}
        <div className="mb-5 bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-left text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <span>💡 XỬ LÝ LỖI TRÊN ĐIỆN THOẠI:</span>
          </div>
          <p className="text-[11px] text-slate-300">
            • <strong>Khi dùng mạng Wi-Fi nội bộ:</strong> Điện thoại <strong>bắt buộc phải bật Wi-Fi</strong> (tắt 4G) kết nối cùng Wi-Fi với máy tính.
            <br />
            • <strong>Khi điện thoại hiện màn hình "Action required to load your app / Cookie check":</strong> Bấm nút <strong>"Close and continue"</strong> trên điện thoại hoặc bấm dấu <strong className="text-amber-300">...</strong> ở góc trên bên phải → Chọn <strong>"Mở bằng Safari / Chrome"</strong>.
          </p>
        </div>

        {/* 5 Player Cards with PIN and Direct Control Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Danh Sách 5 Nhà Đầu Tư &amp; Mã PIN BẢO MẬT:</span>
            <span>Bấm mã PIN để chép hoặc mở QR</span>
          </div>

          {players.map((player, idx) => {
            const hasBought = player.idols.length > 0;
            const isPinCopied = copiedIndex === idx + 100;
            const isLinkCopied = copiedIndex === idx;
            const isQrOpen = activeQrSeat === player.seatNumber;
            const playerDirectUrl = getPlayerUrl(player);

            return (
              <div
                key={player.id}
                className="p-4 rounded-2xl border bg-slate-950/70 border-slate-800 hover:border-slate-700 transition flex flex-col space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Investor Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <InvestorAvatar player={player} size="md" showBadge />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {player.name}
                        </span>
                        <span className="bg-pink-950/80 text-pink-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-pink-500/30">
                          {player.agencyName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-300">Ghế #{player.seatNumber}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-medium">Ngân sách: 1 Tỷ Won</span>
                        <span>•</span>
                        <span className={hasBought ? 'text-emerald-400' : 'text-slate-500'}>
                          {hasBought ? `Đã chiêu mộ ${player.idols.length} idol` : 'Chưa mua idol'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PIN Code Badge & Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                    {/* Big Clickable PIN Badge */}
                    <button
                      onClick={() => handleCopyPin(player.secretPin, idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-black flex items-center gap-2 border transition shadow-sm ${
                        isPinCopied
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-300'
                      }`}
                      title="Bấm để sao chép Mã PIN"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>PIN:</span>
                      <span className="text-base tracking-widest">{player.secretPin}</span>
                      <span className="text-[11px] opacity-75">
                        {isPinCopied ? <Check className="w-3.5 h-3.5 inline" /> : <Copy className="w-3 h-3 inline" />}
                      </span>
                    </button>

                    {/* QR Code Toggle Button */}
                    <button
                      onClick={() => setActiveQrSeat(isQrOpen ? null : player.seatNumber)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                        isQrOpen
                          ? 'bg-pink-600 border-pink-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title="Hiện mã QR riêng cho ghế này"
                    >
                      <QrCode className="w-3.5 h-3.5 text-pink-400" />
                      <span>{isQrOpen ? 'Ẩn QR' : 'Mã QR Ghế'}</span>
                    </button>

                    {/* Copy Direct Link */}
                    <button
                      onClick={() => handleCopyLink(player, idx)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                      title="Sao chép link đăng nhập thẳng vào vị trí này"
                    >
                      {isLinkCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Chép Link</span>
                        </>
                      )}
                    </button>

                    {/* Direct launch seat on current tab */}
                    {onLaunchSeat && (
                      <button
                        onClick={() => onLaunchSeat(player.seatNumber)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95"
                        title="Mở giao diện điều khiển vị trí này ngay trên thiết bị này"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Vào Ghế Này</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Individual QR Code Box */}
                {isQrOpen && (
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-4 bg-slate-900/90 p-3 rounded-xl">
                    <div className="p-2.5 bg-white rounded-2xl border-2 border-pink-500/80 shadow-md">
                      <QRCodeSVG
                        value={playerDirectUrl}
                        size={120}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-left space-y-1">
                      <span className="text-xs font-bold text-pink-300 block">
                        Mã QR Đăng Nhập Thẳng Ghế #{player.seatNumber} ({player.name})
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Quét mã này bằng camera điện thoại của nhà đầu tư để mở thẳng màn hình chiêu mộ idol mà không cần nhập mã PIN thủ công.
                      </p>
                      <span className="font-mono text-[10px] text-amber-300 break-all block">
                        {playerDirectUrl}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Mỗi mã PIN & mã QR bảo mật riêng cho từng ghế để người chơi tự do điều khiển trên thiết bị cá nhân.
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
