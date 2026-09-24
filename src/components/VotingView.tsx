import React, { useState, useMemo } from 'react';
import { Player, VoteRecord, AudienceReaction, Idol } from '../types';
import { IdolAvatar } from './IdolAvatar';
import { InvestorAvatar } from './InvestorAvatar';
import { IdolVotingCard } from './IdolVotingCard';
import { IdolSpotlightModal } from './IdolSpotlightModal';
import { formatWon } from '../utils/format';
import { sound } from '../utils/audio';
import { useServerInfo, getAppBaseUrl } from '../utils/serverIp';
import {
  Heart,
  Flame,
  Sparkles,
  Trophy,
  Users,
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Award,
  Radio,
  Shuffle,
  ShieldCheck,
  Music,
  Globe,
  Share2,
  Maximize2,
  Eye,
} from 'lucide-react';

interface VotingViewProps {
  players: Player[];
  votes: Record<string, number>;
  voteRecords: VoteRecord[];
  audienceReactions: AudienceReaction[];
  roomCode: string;
  onCastVote: (playerId: string, voterName: string, comment?: string, lightstickColor?: string) => void;
  onSendReaction: (emoji: string, sender: string, groupName?: string) => void;
  onEndVotingAndAward: () => void;
  onOpenQrModal: () => void;
  isAnonymousMode?: boolean;
  revealIdentities?: boolean;
  shuffledVotingOrder?: string[];
  onShuffleVotingOrder?: () => void;
}

const LIGHTSTICK_COLORS = [
  { name: 'Hồng Bling (Pink)', hex: '#ec4899' },
  { name: 'Tím Huyền Ảo (Purple)', hex: '#a855f7' },
  { name: 'Xanh Neon (Cyan)', hex: '#06b6d4' },
  { name: 'Vàng Hoàng Kim (Gold)', hex: '#eab308' },
  { name: 'Xanh Lá Tươi (Emerald)', hex: '#10b981' },
];

export const VotingView: React.FC<VotingViewProps> = ({
  players,
  votes,
  voteRecords,
  audienceReactions,
  roomCode,
  onCastVote,
  onSendReaction,
  onEndVotingAndAward,
  onOpenQrModal,
  isAnonymousMode = true,
  revealIdentities = false,
  shuffledVotingOrder,
  onShuffleVotingOrder,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [voterName, setVoterName] = useState('Khán giả yêu K-Pop');
  const [voterComment, setVoterComment] = useState('Đội hình xuất sắc tuyệt đối, xứng đáng No.1!');
  const [lightstickColor, setLightstickColor] = useState('#ec4899');
  const [hasVotedLocally, setHasVotedLocally] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'shuffled' | 'leaderboard'>('shuffled');
  const [idolCardSize, setIdolCardSize] = useState<'large' | 'normal'>('large');
  const [spotlightIdol, setSpotlightIdol] = useState<{
    idol: Idol;
    role?: string;
    groupName?: string;
    playerId?: string;
  } | null>(null);

  const serverInfo = useServerInfo();
  const baseUrl = getAppBaseUrl(serverInfo);
  const audienceVotingUrl = `${baseUrl}/?room=${encodeURIComponent(roomCode)}&role=audience`;

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  // Compute displayed players based on viewMode
  const displayPlayers = useMemo(() => {
    if (viewMode === 'leaderboard') {
      return [...players].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));
    }
    // Shuffled view for maximum fair-play
    const list = [...players];
    if (shuffledVotingOrder && shuffledVotingOrder.length > 0) {
      const map = new Map(list.map((p) => [p.id, p]));
      const ordered: Player[] = [];
      for (const id of shuffledVotingOrder) {
        const found = map.get(id);
        if (found) ordered.push(found);
      }
      for (const p of list) {
        if (!ordered.some((o) => o.id === p.id)) ordered.push(p);
      }
      return ordered;
    }
    return list;
  }, [players, votes, viewMode, shuffledVotingOrder]);

  const handleVote = (playerId: string) => {
    onCastVote(playerId, voterName, voterComment, lightstickColor);
    sound.playVote();
    setHasVotedLocally(true);
  };

  const handleShuffle = () => {
    sound.playBuy();
    if (onShuffleVotingOrder) {
      onShuffleVotingOrder();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(audienceVotingUrl);
    setCopied(true);
    sound.playBuy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner & Voting Status */}
      <div className="bg-slate-900/90 border border-pink-500/50 rounded-3xl p-5 mb-6 shadow-2xl shadow-pink-500/15 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-1">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> CỔNG BÌNH CHỌN ĐANG MỞ TRỰC TIẾP
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Cổng Bình Chọn Khán Giả Qua Đường Link Trực Tiếp
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Khán giả truy cập đường link để bình chọn nhóm nhạc xuất sắc nhất giúp Nhà đầu tư giành cúp vô địch!
          </p>
        </div>

        {/* Big End Voting Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playVictory();
              onEndVotingAndAward();
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Trophy className="w-5 h-5 text-amber-200" />
            ĐÓNG CỔNG & VINH DANH QUÁN QUÂN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Direct Link Display for Audience (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border-2 border-pink-500 rounded-3xl p-6 text-center shadow-2xl shadow-pink-500/20 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-3">
              <Globe className="w-4 h-4 text-pink-400" /> ĐƯỜNG LINK BÌNH CHỌN KHÁN GIẢ
            </div>

            <h3 className="text-lg font-black text-white mb-2">
              Khán Giả Vào Link Này Để Vote
            </h3>

            {/* High-Contrast URL Display Box */}
            <div className="p-4 bg-slate-950 rounded-2xl border-2 border-pink-500/70 shadow-inner my-3 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                <span>Địa chỉ bình chọn:</span>
                <span className="text-emerald-400 font-mono text-[10px]">Phòng: {roomCode}</span>
              </span>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-pink-300 font-mono text-xs sm:text-sm break-all select-all font-semibold">
                {audienceVotingUrl}
              </div>
            </div>

            {/* Big Primary Copy Button */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
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
              href={audienceVotingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
              <span>Mở thử trang bình chọn (Tab mới)</span>
            </a>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed text-left">
              💡 Gửi link trên vào nhóm chat hoặc để khán giả gõ URL vào trình duyệt điện thoại/máy tính để bình chọn.
            </p>
          </div>

          {/* Direct On-Screen Voting for Local Tester/Host */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" /> Bỏ phiếu trực tiếp trên màn hình này:
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Tên của bạn (Khán giả):
                </label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Lời cổ vũ / Bình luận:
                </label>
                <input
                  type="text"
                  value={voterComment}
                  onChange={(e) => setVoterComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Màu Lightstick cổ vũ:
                </label>
                <div className="flex gap-2">
                  {LIGHTSTICK_COLORS.map((ls) => (
                    <button
                      key={ls.hex}
                      type="button"
                      onClick={() => setLightstickColor(ls.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        lightstickColor === ls.hex ? 'scale-110 ring-2 ring-white' : 'opacity-70'
                      }`}
                      style={{ backgroundColor: ls.hex }}
                      title={ls.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Emojis */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Thả tim & phản ứng nhanh:
                </label>
                <div className="flex gap-2">
                  {['💖', '🔥', '✨', '👑', '👏'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        onSendReaction(em, voterName);
                        sound.playBuy();
                      }}
                      className="text-lg p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 active:scale-90 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Candidate Groups & Votes (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Danh Sách Ứng Cử Viên Bình Chọn ({totalVotes} phiếu)
              </h3>
              <span className="text-xs text-slate-400">
                {viewMode === 'shuffled'
                  ? '✨ Bảng bình chọn hiển thị 5 nhóm nhạc của 5 Nhà đầu tư'
                  : '📊 Đang sắp xếp theo số lượng phiếu bầu giảm dần'}
              </span>
            </div>

            {/* View Mode Switcher + Idol Photo Size + Reshuffle Button */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Photo Size Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setIdolCardSize('large')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    idolCardSize === 'large'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Hiển thị ảnh idol lớn nổi bật"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ảnh Lớn</span>
                </button>
                <button
                  onClick={() => setIdolCardSize('normal')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    idolCardSize === 'normal'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Hiển thị ảnh idol kích cỡ tiêu chuẩn"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ảnh Gọn</span>
                </button>
              </div>

              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => {
                    setViewMode('shuffled');
                    sound.playBuy();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'shuffled'
                      ? 'bg-pink-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  Xáo Trộn
                </button>
                <button
                  onClick={() => {
                    setViewMode('leaderboard');
                    sound.playBuy();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    viewMode === 'leaderboard'
                      ? 'bg-pink-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Bảng Xếp Hạng
                </button>
              </div>

              {onShuffleVotingOrder && (
                <button
                  onClick={handleShuffle}
                  className="p-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded-xl active:scale-95 transition"
                  title="Xáo trộn lại thứ tự ngay lập tức"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* List of 5 Groups with Vote Bars & Action */}
          <div className="space-y-3">
            {displayPlayers.map((player, idx) => {
              const voteCount = votes[player.id] || 0;
              const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isLeader = viewMode === 'leaderboard' && idx === 0 && voteCount > 0;
              const group = player.groupDetails;
              const candidateLetter = String.fromCharCode(65 + idx);

              return (
                <div
                  key={player.id}
                  id={`vote-card-${player.id}`}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                    isLeader
                      ? 'bg-gradient-to-r from-slate-900 via-pink-950/40 to-slate-900 border-pink-500 shadow-xl shadow-pink-500/20 ring-1 ring-pink-400/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Rank / Candidate Letter & Group Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                          viewMode === 'leaderboard'
                            ? idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-amber-400/30'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                            : 'bg-gradient-to-br from-purple-900 to-slate-900 text-purple-200 border border-purple-700/60 font-black'
                        }`}
                      >
                        {viewMode === 'leaderboard' ? `#${idx + 1}` : candidateLetter}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-white">
                            {group?.groupName || `Nhóm Nhạc Ứng Viên ${candidateLetter}`}
                          </h4>
                          {isLeader && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-extrabold flex items-center gap-1 shadow">
                              <Sparkles className="w-3 h-3" /> Dẫn đầu
                            </span>
                          )}
                          {viewMode === 'shuffled' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black">
                              Ứng Viên {candidateLetter}
                            </span>
                          )}
                        </div>

                        {/* Real Investor Info */}
                        <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 text-slate-200 font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-md text-[11px]">
                            <InvestorAvatar player={player} size="xs" />
                            <span>{player.name}</span>
                            <span className="text-pink-400 font-normal">({player.agencyName})</span>
                          </span>
                          <span>•</span>
                          <span>Bài hát: <strong className="text-pink-300">{group?.debutSong || 'Debut Single'}</strong></span>
                          <span>•</span>
                          <span>Concept: <span className="text-amber-300 font-medium">{group?.concept || 'K-Pop'}</span></span>
                          {group?.fandomName && (
                            <>
                              <span>•</span>
                              <span>Fandom: <span className="text-slate-300 font-bold">{group.fandomName}</span></span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Vote Count & Fast Vote Button */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-pink-400">
                          {voteCount}{' '}
                          <span className="text-xs font-normal text-slate-400">phiếu</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold">{percent}%</span>
                      </div>

                      <button
                        onClick={() => handleVote(player.id)}
                        className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black rounded-xl shadow-md shadow-pink-500/25 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        Bình Chọn
                      </button>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-3 w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLeader
                          ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                  </div>

                  {/* Members Prominent Photocard Lineup */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Đội Hình Idol ({player.idols.length} thành viên)
                        </span>
                        <span className="text-[10px] text-pink-300 font-bold bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
                          Thẻ ảnh rõ nét
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        💡 Nhấn vào thẻ bất kỳ idol nào để xem ảnh HD cận cảnh & chỉ số
                      </span>
                    </div>

                    <div className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                      {player.idols.map((idol) => (
                        <IdolVotingCard
                          key={idol.id}
                          idol={idol}
                          assignedRole={group?.roleAssignments?.[idol.id] || idol.roles?.[0]}
                          size={idolCardSize}
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
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Audience Activity Feed */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 mt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
              Nhật ký bình chọn & lời cổ vũ từ khán giả:
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {voteRecords.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Chưa có phiếu bầu nào được gửi. Khán giả hãy truy cập đường link trên hoặc bấm nút "Bình Chọn" bên trên!
                </p>
              ) : (
                voteRecords.slice(0, 8).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: rec.lightstickColor || '#ec4899' }}
                      />
                      <strong className="text-white truncate">{rec.voterName}</strong>
                      <span className="text-slate-500">vừa bình chọn cho</span>
                      <strong className="text-pink-400 truncate">{rec.groupName}</strong>
                    </div>
                    {rec.comment && (
                      <span className="text-slate-400 italic text-[11px] truncate max-w-[180px]">
                        "{rec.comment}"
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Idol Spotlight HD Modal */}
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
