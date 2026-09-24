import React, { useState, useMemo } from 'react';
import { Player, RoomState, Idol } from '../types';
import { IdolAvatar } from './IdolAvatar';
import { IdolVotingCard } from './IdolVotingCard';
import { IdolSpotlightModal } from './IdolSpotlightModal';
import { sound } from '../utils/audio';
import {
  Heart,
  Sparkles,
  Flame,
  CheckCircle2,
  Trophy,
  Users,
  Radio,
  Send,
  ArrowLeft,
  Shuffle,
  ShieldCheck,
  Music,
  Maximize2,
  Eye,
  Star,
} from 'lucide-react';

interface AudienceMobileVotingProps {
  roomState: RoomState;
  onCastVote: (playerId: string, voterName: string, comment?: string, lightstickColor?: string) => void;
  onSendReaction: (emoji: string, sender: string, groupName?: string) => void;
  onSwitchToHost: () => void;
  onShuffleVotingOrder?: () => void;
}

const LIGHTSTICKS = [
  { name: 'Hồng Bling', color: '#ec4899' },
  { name: 'Tím Dream', color: '#a855f7' },
  { name: 'Xanh Neon', color: '#06b6d4' },
  { name: 'Hoàng Kim', color: '#eab308' },
  { name: 'Lục Tinh', color: '#10b981' },
];

export const AudienceMobileVoting: React.FC<AudienceMobileVotingProps> = ({
  roomState,
  onCastVote,
  onSendReaction,
  onSwitchToHost,
  onShuffleVotingOrder,
}) => {
  const [voterName, setVoterName] = useState(() => {
    return localStorage.getItem('kpop_voter_name') || `Fan #${Math.floor(100 + Math.random() * 900)}`;
  });
  const [comment, setComment] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ec4899');
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(() => {
    return localStorage.getItem(`kpop_voted_${roomState.roomCode}`) || null;
  });
  const [justVotedNotice, setJustVotedNotice] = useState(false);
  const [localShuffleSeed, setLocalShuffleSeed] = useState(0);
  const [displayMode, setDisplayMode] = useState<'photocard' | 'compact'>('photocard');
  const [spotlightIdol, setSpotlightIdol] = useState<{
    idol: Idol;
    role?: string;
    groupName?: string;
    playerId?: string;
  } | null>(null);

  const handleVote = (playerId: string) => {
    onCastVote(playerId, voterName, comment, selectedColor);
    sound.playVote();
    setVotedPlayerId(playerId);
    localStorage.setItem('kpop_voter_name', voterName);
    localStorage.setItem(`kpop_voted_${roomState.roomCode}`, playerId);
    setJustVotedNotice(true);
    setTimeout(() => setJustVotedNotice(false), 3000);
  };

  const handleReaction = (emoji: string) => {
    onSendReaction(emoji, voterName);
    sound.playBuy();
  };

  // Determine shuffled order for candidate groups
  const shuffledCandidates: Player[] = useMemo(() => {
    const list = [...roomState.players];
    const serverOrder = roomState.shuffledVotingOrder;

    if (serverOrder && serverOrder.length > 0 && localShuffleSeed === 0) {
      const map = new Map(list.map((p) => [p.id, p]));
      const ordered: Player[] = [];
      for (const id of serverOrder) {
        const found = map.get(id);
        if (found) ordered.push(found);
      }
      for (const p of list) {
        if (!ordered.some((o) => o.id === p.id)) ordered.push(p);
      }
      return ordered;
    }

    // Local shuffle using Fisher-Yates
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [roomState.players, roomState.shuffledVotingOrder, localShuffleSeed]);

  const handleReshuffle = () => {
    sound.playBuy();
    setLocalShuffleSeed((prev) => prev + 1);
    if (onShuffleVotingOrder) {
      onShuffleVotingOrder();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-lg mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <button
            onClick={onSwitchToHost}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Bàn chơi chính
          </button>
          <span className="text-xs font-bold text-pink-400">
            Phòng: {roomState.roomCode}
          </span>
        </div>

        {/* Hero Title */}
        <div className="text-center my-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            {roomState.phase === 'VOTING'
              ? 'CỔNG BÌNH CHỌN ĐANG MỞ!'
              : roomState.phase === 'CEREMONY'
              ? 'LỄ TRAO GIẢI ĐÃ KẾT THÚC'
              : 'CHUẨN BỊ BÌNH CHỌN'}
          </div>
          <h1 className="text-2xl font-black text-white">
            Bình Chọn <span className="text-pink-400">SIÊU NHÓM K-POP</span> No.1
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Đánh giá công tâm dựa trên phong cách, bài hát debut và đội hình idol!
          </p>
        </div>

        {/* Voting Info Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-900 border border-pink-500/40 flex items-start justify-between gap-2.5 shadow-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Bình Chọn Trực Tiếp Cho Nhóm K-POP Xuất Sắc Nhất</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Đánh giá bài hát debut, visual và concept của các nhà đầu tư để chọn ra quán quân No.1!
              </p>
            </div>
          </div>

          <button
            onClick={handleReshuffle}
            className="shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
            title="Đổi thứ tự hiển thị"
          >
            <Shuffle className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Xáo trộn</span>
          </button>
        </div>

        {/* Voter Profile Setup */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Tên khán giả:</label>
            <input
              type="text"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs text-right w-40 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Màu Lightstick cổ vũ:</label>
            <div className="flex gap-1.5">
              {LIGHTSTICKS.map((ls) => (
                <button
                  key={ls.color}
                  onClick={() => setSelectedColor(ls.color)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    selectedColor === ls.color ? 'scale-125 ring-2 ring-white' : 'opacity-60'
                  }`}
                  style={{ backgroundColor: ls.color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Toast Just Voted */}
        {justVotedNotice && (
          <div className="mb-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold text-center animate-bounce">
            🎉 Đã ghi nhận phiếu bình chọn của bạn thành công!
          </div>
        )}

        {/* View Mode Toggle for Mobile Fans */}
        <div className="flex items-center justify-between gap-2 mb-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Chế độ xem Idol:</span>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDisplayMode('photocard')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                displayMode === 'photocard'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Thẻ Ảnh Lớn</span>
            </button>
            <button
              onClick={() => setDisplayMode('compact')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                displayMode === 'compact'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Gọn</span>
            </button>
          </div>
        </div>

        {/* Shuffled Candidate Groups (No investor names) */}
        <div className="space-y-4 mb-6">
          {shuffledCandidates.map((player, idx) => {
            const hasVotedThis = votedPlayerId === player.id;
            const voteCount = roomState.votes[player.id] || 0;
            const group = player.groupDetails;
            const candidateLetter = String.fromCharCode(65 + idx);

            return (
              <div
                key={player.id}
                className={`p-4 rounded-3xl border transition-all ${
                  hasVotedThis
                    ? 'bg-gradient-to-r from-pink-950/40 via-slate-900 to-slate-900 border-pink-500 ring-2 ring-pink-500/50 shadow-xl shadow-pink-500/15'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-[11px] font-black text-purple-300">
                        Ứng Viên {candidateLetter}
                      </span>
                      <span className="text-[10px] text-slate-300 font-semibold flex items-center gap-1">
                        <span>Nhà đầu tư: <strong className="text-pink-300">{player.name}</strong> ({player.agencyName})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {group?.groupName || `Nhóm Nhạc Dự Thi ${candidateLetter}`}
                      </h3>
                      {hasVotedThis && (
                        <span className="text-[10px] text-pink-300 font-bold bg-pink-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 border border-pink-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Đã chọn
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-pink-300 mt-1 font-semibold flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      {group?.debutSong || 'Debut Single'} • <span className="text-amber-300">{group?.concept || 'K-Pop High Teen'}</span>
                    </p>
                    {group?.fandomName && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Fandom: <span className="text-slate-200 font-bold">{group.fandomName}</span>
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-black text-pink-400 bg-pink-500/10 border border-pink-500/30 px-3 py-1 rounded-xl shrink-0">
                    {voteCount} phiếu
                  </span>
                </div>

                {/* Idols Members Prominent Lineup */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Đội hình idol ({player.idols.length} thành viên):
                    </span>
                    <span className="text-[10px] text-pink-400 font-medium">
                      💡 Chạm vào ảnh để phóng to
                    </span>
                  </div>

                  {displayMode === 'photocard' ? (
                    <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {player.idols.map((idol) => (
                        <IdolVotingCard
                          key={idol.id}
                          idol={idol}
                          assignedRole={group?.roleAssignments?.[idol.id] || idol.roles?.[0]}
                          size="normal"
                          onInspect={(inspectedIdol) => {
                            setSpotlightIdol({
                              idol: inspectedIdol,
                              role: group?.roleAssignments?.[inspectedIdol.id] || inspectedIdol.roles?.[0],
                              groupName: group?.groupName,
                              playerId: player.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {player.idols.map((idol) => (
                        <IdolVotingCard
                          key={idol.id}
                          idol={idol}
                          assignedRole={group?.roleAssignments?.[idol.id] || idol.roles?.[0]}
                          size="mobile"
                          onInspect={(inspectedIdol) => {
                            setSpotlightIdol({
                              idol: inspectedIdol,
                              role: group?.roleAssignments?.[inspectedIdol.id] || inspectedIdol.roles?.[0],
                              groupName: group?.groupName,
                              playerId: player.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Vote button */}
                <div className="mt-3">
                  <button
                    onClick={() => handleVote(player.id)}
                    className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                      hasVotedThis
                        ? 'bg-pink-600 text-white shadow-pink-600/30'
                        : 'bg-gradient-to-r from-slate-800 to-slate-850 hover:from-slate-750 hover:to-slate-800 text-slate-200 border border-slate-700 hover:border-pink-500/50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasVotedThis ? 'fill-current text-white' : 'text-pink-400'}`} />
                    <span>{hasVotedThis ? 'Bình Chọn Lại Cho Nhóm Này' : `Bình Chọn Cho Ứng Viên ${candidateLetter}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Fan Cheer Buttons at Bottom */}
      <div className="sticky bottom-2 bg-slate-900/95 border border-slate-800 p-2.5 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-around gap-2">
          {['💖 Thả Tim', '🔥 Bùng Cháy', '✨ Lung Linh', '👏 Tuyệt Đỉnh'].map((txt) => {
            const emoji = txt.split(' ')[0];
            return (
              <button
                key={txt}
                onClick={() => handleReaction(emoji)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-bold rounded-xl text-white border border-slate-700 transition-all text-center"
              >
                {txt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Idol Spotlight HD Modal for Mobile Fans */}
      {spotlightIdol && (
        <IdolSpotlightModal
          idol={spotlightIdol.idol}
          assignedRole={spotlightIdol.role}
          groupName={spotlightIdol.groupName}
          onClose={() => setSpotlightIdol(null)}
          onVoteForGroup={spotlightIdol.playerId ? () => handleVote(spotlightIdol.playerId!) : undefined}
        />
      )}
    </div>
  );
};
