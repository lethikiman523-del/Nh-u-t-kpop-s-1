import React, { useState } from 'react';
import { Player, RoomState, Idol, GroupDetails } from '../types';
import { IDOL_ROSTER, CONCEPT_PRESETS } from '../data/idols';
import { IdolAvatar } from './IdolAvatar';
import { InvestorAvatar } from './InvestorAvatar';
import { sound } from '../utils/audio';

interface PlayerMobileViewProps {
  player: Player;
  roomState: RoomState;
  onBuyIdol: (playerId: string, idolId: string) => void;
  onSellIdol: (playerId: string, idolId: string) => void;
  onSubmitGroup: (playerId: string, groupDetails: GroupDetails) => void;
  onSendReaction: (emoji: string, sender: string, groupName?: string) => void;
  onSwitchSeat: () => void;
  onOpenMainScreen?: () => void;
}

export const PlayerMobileView: React.FC<PlayerMobileViewProps> = ({
  player,
  roomState,
  onBuyIdol,
  onSellIdol,
  onSubmitGroup,
  onSendReaction,
  onSwitchSeat,
  onOpenMainScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'my_team' | 'voting'>('market');
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male' | 'producer'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group Details state
  const [groupName, setGroupName] = useState(player.groupDetails?.groupName || '');
  const [concept, setConcept] = useState(player.groupDetails?.concept || CONCEPT_PRESETS[0].name);
  const [debutSong, setDebutSong] = useState(player.groupDetails?.debutSong || '');
  const [fandomName, setFandomName] = useState(player.groupDetails?.fandomName || '');
  const [motto, setMotto] = useState(player.groupDetails?.motto || '');
  const [roleAssignments, setRoleAssignments] = useState<Record<string, string>>(
    player.groupDetails?.roleAssignments || {}
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const formatMoney = (amount: number) => {
    return (amount / 1_000_000).toLocaleString('vi-VN') + ' Tr Won';
  };

  const filteredIdols = IDOL_ROSTER.filter((idol) => {
    if (filterGender === 'female' && (idol.gender !== 'female' || idol.type === 'producer')) return false;
    if (filterGender === 'male' && (idol.gender !== 'male' || idol.type === 'producer')) return false;
    if (filterGender === 'producer' && idol.type !== 'producer') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        idol.name.toLowerCase().includes(q) ||
        idol.stageName.toLowerCase().includes(q) ||
        idol.originalGroup.toLowerCase().includes(q) ||
        idol.roles.some((r) => r.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRoleChange = (idolId: string, role: string) => {
    setRoleAssignments((prev) => ({
      ...prev,
      [idolId]: role,
    }));
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Vui lòng đặt tên cho nhóm nhạc của bạn!');
      return;
    }
    if (player.idols.length === 0) {
      alert('Bạn cần mua ít nhất 1 Idol để thành lập nhóm nhạc!');
      return;
    }

    sound.playSuccess();
    onSubmitGroup(player.id, {
      groupName: groupName.trim(),
      concept,
      debutSong: debutSong.trim() || 'Hit Bài Hát Ra Mắt',
      fandomName: fandomName.trim() || 'Fandom Toàn Cầu',
      motto: motto.trim() || 'Tỏa sáng rực rỡ nhất K-POP!',
      roleAssignments,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBuy = (idol: Idol) => {
    if (player.balance < idol.price) {
      sound.playError();
      alert('Không đủ ngân sách Won để mua thần tượng này!');
      return;
    }
    sound.playBuy();
    onBuyIdol(player.id, idol.id);
  };

  const handleSell = (idol: Idol) => {
    sound.playSell();
    onSellIdol(player.id, idol.id);
  };

  const myVotes = roomState.votes[player.id] || 0;
  const totalVotes = Object.values(roomState.votes).reduce((sum, c) => sum + c, 0);
  const votePercent = totalVotes > 0 ? Math.round((myVotes / totalVotes) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-pink-500/30 p-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <InvestorAvatar player={player} size="sm" showBadge />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-white">{player.name}</span>
                <span className="bg-pink-950 border border-pink-500/40 text-pink-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {player.agencyName}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span>Ghế #{player.seatNumber}</span>
                <span>•</span>
                <span className="text-pink-300">Công ty: {player.agencyName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onSwitchSeat}
              className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700"
              title="Đổi mã người chơi"
            >
              PIN: {player.secretPin} ⇄
            </button>
            {onOpenMainScreen && (
              <button
                onClick={onOpenMainScreen}
                className="text-[10px] text-pink-300 bg-pink-950/60 hover:bg-pink-900 px-2 py-1 rounded-lg border border-pink-500/40"
              >
                Màn hình chính
              </button>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <div className="mt-2.5 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Ngân Sách Còn Lại:
            </span>
            <div
              className={`text-base font-black ${
                player.balance < 100_000_000
                  ? 'text-red-400'
                  : player.balance < 300_000_000
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatMoney(player.balance)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Đội hình hiện tại:
            </span>
            <div className="text-sm font-bold text-pink-400">
              {player.idols.length} / 20 IDOL
            </div>
          </div>
        </div>

        {/* Phase notification banner */}
        <div className="mt-2 text-[10px] flex items-center justify-between text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
          <span>
            Giai đoạn:{' '}
            <strong className="text-pink-400 uppercase">
              {roomState.phase === 'LOBBY' && 'Chờ bắt đầu'}
              {roomState.phase === 'MARKET' && 'Thị trường mua bán IDOL'}
              {roomState.phase === 'GROUP_CREATION' && 'Thiết lập nhóm nhạc'}
              {roomState.phase === 'DEBUT_SHOWCASE' && 'Trình diễn ra mắt'}
              {roomState.phase === 'VOTING' && 'Khán giả đang bình chọn!'}
              {roomState.phase === 'CEREMONY' && 'Lễ trao giải'}
            </strong>
          </span>
          <span className="text-pink-400 font-semibold">💎 Tranh Đấu Công Khai</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3">
        {/* TAB 1: IDOL MARKET */}
        {activeTab === 'market' && (
          <div className="space-y-3">
            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Tất cả (20)' },
                { id: 'female', label: '♀ Idol Nữ' },
                { id: 'male', label: '♂ Idol Nam' },
                { id: 'producer', label: '👑 Producer' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterGender(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                    filterGender === tab.id
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm idol, nhóm, vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-slate-400"
                >
                  ✕
                </button>
              )}
            </div>

            {/* List of Idols */}
            <div className="space-y-3">
              {filteredIdols.map((idol) => {
                const isOwned = player.idols.some((i) => i.id === idol.id);
                const canAfford = player.balance >= idol.price;

                return (
                  <div
                    key={idol.id}
                    className={`bg-slate-900/90 border rounded-2xl p-3 flex gap-3 shadow-md transition ${
                      isOwned
                        ? 'border-emerald-500/70 bg-emerald-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 flex flex-col items-center">
                      <IdolAvatar idol={idol} size="md" />
                      <span className="text-[10px] text-pink-400 font-bold mt-1 text-center truncate max-w-[70px]">
                        {idol.originalGroup}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-sm font-black text-white truncate">{idol.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{idol.stageName}</p>
                          </div>
                          <span className="text-xs font-black text-amber-300 shrink-0">
                            {formatMoney(idol.price)}
                          </span>
                        </div>

                        {/* Roles */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {idol.roles.slice(0, 2).map((r) => (
                            <span
                              key={r}
                              className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded"
                            >
                              {r}
                            </span>
                          ))}
                        </div>

                        {/* Perk */}
                        <p className="text-[10px] text-pink-300 mt-1 line-clamp-1 italic">
                          ✨ {idol.perk}
                        </p>
                      </div>

                      {/* Buy / Sell Buttons */}
                      <div className="mt-2 flex justify-end">
                        {isOwned ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Đã sở hữu</span>
                            <button
                              onClick={() => handleSell(idol)}
                              className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 border border-red-500/40 text-red-200 text-[11px] font-bold rounded-lg transition"
                            >
                              Bán (-{formatMoney(idol.price)})
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuy(idol)}
                            disabled={!canAfford}
                            className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                              canAfford
                                ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                          >
                            + Chiêu Mộ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MY TEAM & GROUP BUILDER */}
        {activeTab === 'my_team' && (
          <div className="space-y-4">
            {/* Overview of current squad */}
            <div className="bg-slate-900/90 border border-pink-500/30 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                  Thành Viên Đã Chọn ({player.idols.length})
                </h3>
                <span className="text-xs text-slate-400">
                  Tổng chi phí: <strong className="text-white">{formatMoney(1_000_000_000 - player.balance)}</strong>
                </span>
              </div>

              {player.idols.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  <p>Bạn chưa chiêu mộ idol nào!</p>
                  <button
                    onClick={() => setActiveTab('market')}
                    className="mt-2 text-pink-400 font-bold underline"
                  >
                    Vào chợ thần tượng ngay →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {player.idols.map((idol) => (
                    <div
                      key={idol.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center gap-2"
                    >
                      <IdolAvatar idol={idol} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{idol.name}</div>
                        <div className="text-[10px] text-amber-300 font-mono">
                          {formatMoney(idol.price)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSell(idol)}
                        className="text-red-400 hover:text-red-300 text-xs p-1"
                        title="Bán hoàn tiền"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Group Configuration Form */}
            <form onSubmit={handleSaveGroup} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>🎵</span> Thiết Lập Nhóm Nhạc Của Bạn
              </h3>

              {savedSuccess && (
                <div className="p-2 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-xl font-bold text-center">
                  ✓ Đã lưu thông tin nhóm nhạc thành công!
                </div>
              )}

              {/* Group Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tên Nhóm Nhạc *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: ECLIPSE X, NOVA QUEENS, PHANTOM..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Concept Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Concept Âm Nhạc
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {CONCEPT_PRESETS.map((cp) => (
                    <div
                      key={cp.id}
                      onClick={() => setConcept(cp.name)}
                      className={`cursor-pointer p-2 rounded-xl border text-xs flex items-center justify-between ${
                        concept === cp.name
                          ? 'bg-pink-950/60 border-pink-500 text-pink-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1.5">
                        <span>{cp.icon}</span> {cp.name}
                      </span>
                      {concept === cp.name && <span className="text-pink-400 font-bold">✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Debut Song & Fandom */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Bài Hát Ra Mắt
                  </label>
                  <input
                    type="text"
                    placeholder="Tên ca khúc..."
                    value={debutSong}
                    onChange={(e) => setDebutSong(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Tên Fandom
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: ECLIPSER..."
                    value={fandomName}
                    onChange={(e) => setFandomName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Motto */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Khẩu Hiệu / Slogan Nhóm
                </label>
                <input
                  type="text"
                  placeholder="Khẩu hiệu của nhóm khi chào khán giả..."
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Role Assignment for each Idol */}
              {player.idols.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Phân Công Vai Trò Trong Nhóm:
                  </label>
                  <div className="space-y-2">
                    {player.idols.map((idol) => (
                      <div
                        key={idol.id}
                        className="flex items-center justify-between gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs"
                      >
                        <span className="font-bold text-white truncate max-w-[100px]">
                          {idol.name}
                        </span>
                        <select
                          value={roleAssignments[idol.id] || idol.roles[0]}
                          onChange={(e) => handleRoleChange(idol.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-pink-300 focus:outline-none"
                        >
                          <option value="Leader / Trưởng Nhóm">Leader / Trưởng Nhóm</option>
                          <option value="Center / Trung Tâm">Center / Trung Tâm</option>
                          <option value="Main Vocalist">Main Vocalist</option>
                          <option value="Lead Vocalist">Lead Vocalist</option>
                          <option value="Main Dancer">Main Dancer</option>
                          <option value="Lead Dancer">Lead Dancer</option>
                          <option value="Main Rapper">Main Rapper</option>
                          <option value="Visual Quốc Dân">Visual Quốc Dân</option>
                          <option value="Maknae / Em Út Vàng">Maknae / Em Út</option>
                          <option value="Executive Producer">Executive Producer</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider"
              >
                ✓ Lưu Đội Hình &amp; Xác Nhận Sẵn Sàng
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: VOTING & CHEER */}
        {activeTab === 'voting' && (
          <div className="space-y-4 text-center">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Phiếu Bầu Khán Giả Cho Nhóm Của Bạn
              </div>
              <div className="text-4xl font-black text-pink-400 mt-2">{myVotes} Phiếu</div>
              <div className="text-xs text-slate-400 mt-1">
                Chiếm <strong className="text-white">{votePercent}%</strong> tổng số phiếu ({totalVotes} phiếu)
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${votePercent}%` }}
                />
              </div>
            </div>

            {/* Floating cheer sender to main screen */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Gửi Cổ Vũ Lên Màn Hình Lớn
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {['💖', '🔥', '👑', '🎉', '⚡', '✨', '👏', '🌟'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      sound.playPop();
                      onSendReaction(emoji, player.anonymousCodename, player.groupDetails?.groupName);
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-2xl transition active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'market' ? 'text-pink-400 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🛒</span>
          <span className="text-[10px]">Chợ Idol</span>
        </button>

        <button
          onClick={() => setActiveTab('my_team')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition relative ${
            activeTab === 'my_team' ? 'text-pink-400 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">⭐</span>
          <span className="text-[10px]">Đội Hình</span>
          {player.idols.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-pink-600 text-[9px] font-bold text-white flex items-center justify-center">
              {player.idols.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('voting')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'voting' ? 'text-pink-400 font-black' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🗳️</span>
          <span className="text-[10px]">Bình Chọn</span>
        </button>
      </nav>
    </div>
  );
};
