import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, Globe, Smartphone, Users, Heart, Share2, Wifi, Settings } from 'lucide-react';
import { sound } from '../utils/audio';
import { useServerInfo, getAppBaseUrl, setCustomBaseUrl, getCustomBaseUrl } from '../utils/serverIp';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  onSimulateVote?: (fanName: string, comment: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  onSimulateVote,
}) => {
  const [copied, setCopied] = useState(false);
  const [simName, setSimName] = useState('Fan K-Pop Hà Nội');
  const [simComment, setSimComment] = useState('Nhóm nhạc đỉnh chóp visual 10/10! 💖');
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);
  const [customInput, setCustomInput] = useState(getCustomBaseUrl());

  const serverInfo = useServerInfo();

  if (!isOpen) return null;

  const baseUrl = getAppBaseUrl(serverInfo);
  const votingUrl = `${baseUrl}/?room=${encodeURIComponent(roomCode)}&role=audience`;

  const handleCopy = () => {
    navigator.clipboard.writeText(votingUrl);
    setCopied(true);
    sound.playBuy();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimVote = () => {
    if (onSimulateVote) {
      onSimulateVote(simName, simComment);
      sound.playVote();
    }
  };

  const handleSaveCustomUrl = () => {
    setCustomBaseUrl(customInput);
    sound.playBuy();
    setShowNetworkSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-slate-900 border border-pink-500/50 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-center relative shadow-2xl shadow-pink-500/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold mb-3">
          <Globe className="w-4 h-4 text-pink-400" />
          <span>ĐƯỜNG LINK & MÃ QR BÌNH CHỌN CHO KHÁN GIẢ</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white">
          Quét Mã QR Đổi Mới / Mở Link Trên Điện Thoại
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Khán giả chỉ cần quét mã QR bằng camera điện thoại hoặc bấm mở link bên dưới để xem trực tiếp và bình chọn cho các nhóm idol yêu thích.
        </p>

        {/* Real QR Code Display */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-pink-500/80 inline-block relative group">
            <QRCodeSVG
              value={votingUrl}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "https://api.iconify.design/twemoji:sparkles.svg",
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>
          <p className="text-[11px] text-pink-300 font-bold mt-2.5 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-pink-400" />
            <span>Mở camera trên iPhone / Android để quét ngay</span>
          </p>
        </div>

        {/* Network & IP Notice Banner */}
        <div className="mb-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-left text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>
                IP Mạng Wi-Fi Máy Chủ:{' '}
                <strong className="text-amber-300 font-mono">
                  {serverInfo?.primaryIp ? `${serverInfo.primaryIp}:3000` : 'Đang quét...'}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setShowNetworkSettings(!showNetworkSettings)}
              className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 underline"
            >
              <Settings className="w-3 h-3" />
              <span>{showNetworkSettings ? 'Ẩn cài đặt' : 'Cấu hình IP / Tunnel'}</span>
            </button>
          </div>

          {showNetworkSettings && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[11px] text-slate-400">
                Nếu bạn muốn chơi qua Internet (dành cho người chơi ở xa dùng 4G), bạn có thể chạy lệnh <code className="text-pink-300 font-mono bg-slate-900 px-1 py-0.5 rounded">npm run tunnel</code> và dán URL công khai vào đây:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ví dụ: https://tee-vienna-member-techniques.trycloudflare.com"
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-pink-500 font-mono"
                />
                <button
                  onClick={handleSaveCustomUrl}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl"
                >
                  Lưu URL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4G / Cookie Notice Box for Mobile Browsers */}
        <div className="mb-5 bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 text-left text-xs text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <span>💡 LƯU Ý KHI ĐIỆN THOẠI MỞ LINK / QUÉT MÃ:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
            <li>
              <strong>Nếu dùng mạng Wi-Fi nội bộ:</strong> Điện thoại <strong>bắt buộc phải bật Wi-Fi</strong> (không dùng mạng 4G/5G).
            </li>
            <li>
              <strong>Nếu điện thoại hiện thông báo "Action required to load your app / Cookie check":</strong> Bấm nút <strong>"Close and continue"</strong> hoặc bấm dấu <strong className="text-amber-300">...</strong> ở góc trên bên phải → Chọn <strong>"Mở bằng Safari / Chrome"</strong>.
            </li>
          </ul>
        </div>

        {/* Highlighted URL Display Box */}
        <div className="mb-5 bg-slate-950 p-4 rounded-2xl border-2 border-pink-500/60 shadow-xl shadow-pink-950/40 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-pink-400" />
              Link bình chọn khán giả phòng <strong className="text-amber-300 font-mono">#{roomCode}</strong>:
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">● Đang mở kết nối</span>
          </div>

          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="font-mono text-xs sm:text-sm text-pink-300 break-all select-all font-semibold">
              {votingUrl}
            </span>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleCopy}
              className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>ĐÃ SAO CHÉP LINK BÌNH CHỌN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>SAO CHÉP ĐƯỜNG LINK BÌNH CHỌN</span>
                </>
              )}
            </button>

            <a
              href={votingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4 text-pink-400" />
              <span>Mở Tab Khán Giả</span>
            </a>
          </div>
        </div>

        {/* Steps Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left text-xs mb-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-pink-400 font-bold block mb-1">Bước 1:</span>
            <span className="text-slate-400 text-[11px]">Dùng điện thoại quét mã QR ở trên hoặc gửi link vào nhóm chat</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-pink-400 font-bold block mb-1">Bước 2:</span>
            <span className="text-slate-400 text-[11px]">Khán giả mở link để xem danh sách 5 nhóm idol K-Pop đỉnh cao</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-pink-400 font-bold block mb-1">Bước 3:</span>
            <span className="text-slate-400 text-[11px]">Bấm bình chọn và thả biểu cảm lightstick cổ vũ trực tiếp</span>
          </div>
        </div>

        {/* Test Voting Simulator Box */}
        {onSimulateVote && (
          <div className="pt-4 border-t border-slate-800/80 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Gửi nhanh 1 phiếu bầu thử nghiệm (Dành cho chủ phòng test):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                placeholder="Tên khán giả..."
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500"
              />
              <input
                type="text"
                value={simComment}
                onChange={(e) => setSimComment(e.target.value)}
                placeholder="Lời chúc, cổ vũ..."
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500"
              />
            </div>
            <button
              onClick={handleSimVote}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-pink-600/30 active:scale-95 transition"
            >
              <Heart className="w-3.5 h-3.5" /> Gửi 1 Phiếu Bầu Thử Nghiệm Từ Khán Giả Này
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
