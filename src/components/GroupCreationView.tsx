import React, { useState } from 'react';
import { Player, GroupDetails } from '../types';
import { CONCEPT_PRESETS } from '../data/idols';
import { IdolCard } from './IdolCard';
import { IdolAvatar } from './IdolAvatar';
import { InvestorAvatar } from './InvestorAvatar';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Music,
  Disc,
  Users,
  CheckCircle2,
  ArrowRight,
  Radio,
  Dices,
  Layers,
} from 'lucide-react';

interface GroupCreationViewProps {
  activePlayer: Player;
  allPlayers: Player[];
  onSelectPlayer: (playerId: string) => void;
  onSubmitGroup: (playerId: string, groupDetails: GroupDetails) => void;
  onProceedToShowcase: () => void;
  onBackToMarket: () => void;
  isAnonymousMode?: boolean;
  onOpenPlayerCodes?: () => void;
}

const PRESET_GROUP_IDEAS = [
  { name: 'SUPERNOVA FIVE', song: 'Galactic Horizon', concept: 'Cyberpunk Neon', fandom: 'NOVAS' },
  { name: 'ROYAL ECLIPSE', song: 'Moonlight Crown', concept: 'Dark Royalty & Gothic', fandom: 'ECLIPSE' },
  { name: 'GLAMOUR IT GIRLS & BOYS', song: 'Pink Champagne', concept: 'High-Teen Glam', fandom: 'GLAMS' },
  { name: 'SUMMER EUPHORIA', song: 'Ocean Breeze Wave', concept: 'Summer Euphoria', fandom: 'BREEZES' },
  { name: 'NEO RETRO 1988', song: 'Midnight City Lights', concept: 'Retro Synthwave 80s', fandom: 'RETROS' },
];

export const GroupCreationView: React.FC<GroupCreationViewProps> = ({
  activePlayer,
  allPlayers,
  onSelectPlayer,
  onSubmitGroup,
  onProceedToShowcase,
  onBackToMarket,
  isAnonymousMode = true,
  onOpenPlayerCodes,
}) => {
  // Current editing state
  const existingDetails = activePlayer.groupDetails;

  const [groupName, setGroupName] = useState(
    existingDetails?.groupName || (isAnonymousMode ? `Nhóm Nhạc ${activePlayer.anonymousMask}` : `Nhóm của ${activePlayer.name}`)
  );
  const [concept, setConcept] = useState(existingDetails?.concept || CONCEPT_PRESETS[0].name);
  const [debutSong, setDebutSong] = useState(existingDetails?.debutSong || 'Bài Hát Debut Triệu Views');
  const [fandomName, setFandomName] = useState(existingDetails?.fandomName || 'FANDOM ĐỈNH CAO');
  const [motto, setMotto] = useState(existingDetails?.motto || 'Tỏa sáng rực rỡ và thống trị bảng xếp hạng Billboard!');
  const [roleAssignments, setRoleAssignments] = useState<Record<string, string>>(
    existingDetails?.roleAssignments || {}
  );

  const handleAssignRole = (idolId: string, role: string) => {
    setRoleAssignments((prev) => ({
      ...prev,
      [idolId]: role,
    }));
    sound.playBuy();
  };

  const handleSaveCurrentGroup = () => {
    const details: GroupDetails = {
      groupName: groupName.trim() || `Nhóm Nhạc ${activePlayer.agencyName}`,
      concept,
      debutSong: debutSong.trim() || 'Debut Track',
      fandomName: fandomName.trim() || 'Fans',
      motto: motto.trim() || 'Let us shine!',
      roleAssignments,
    };
    onSubmitGroup(activePlayer.id, details);
    sound.playCheer();
  };

  // Auto fill for active player
  const handleRandomizeGroup = () => {
    const preset = PRESET_GROUP_IDEAS[Math.floor(Math.random() * PRESET_GROUP_IDEAS.length)];
    setGroupName(`${preset.name} (${activePlayer.agencyName})`);
    setConcept(preset.concept);
    setDebutSong(preset.song);
    setFandomName(preset.fandom);

    // Auto assign roles
    const roles = [
      'Center / Visual',
      'Leader (Trưởng nhóm)',
      'Main Vocalist',
      'Main Dancer',
      'Main Rapper',
      'Producer Âm Nhạc',
    ];
    const newRoles: Record<string, string> = {};
    activePlayer.idols.forEach((idol, idx) => {
      newRoles[idol.id] = roles[idx % roles.length];
    });
    setRoleAssignments(newRoles);

    const details: GroupDetails = {
      groupName: `${preset.name} (${activePlayer.agencyName})`,
      concept: preset.concept,
      debutSong: preset.song,
      fandomName: preset.fandom,
      motto: 'Quyết tâm giành quán quân Nhà Đầu Tư Số 1!',
      roleAssignments: newRoles,
    };
    onSubmitGroup(activePlayer.id, details);
    sound.playCheer();
  };

  // Auto fill for all 5 players so testing is effortless
  const handleAutoFillAllGroups = () => {
    allPlayers.forEach((p, pIdx) => {
      const preset = PRESET_GROUP_IDEAS[pIdx % PRESET_GROUP_IDEAS.length];
      const roles = [
        'Center / Visual',
        'Leader (Trưởng nhóm)',
        'Main Vocalist',
        'Main Dancer',
        'Main Rapper',
        'Producer Âm Nhạc',
      ];
      const assigned: Record<string, string> = {};
      p.idols.forEach((idol, idx) => {
        assigned[idol.id] = roles[idx % roles.length];
      });

      const details: GroupDetails = {
        groupName: `${preset.name} [${p.agencyName}]`,
        concept: preset.concept,
        debutSong: preset.song,
        fandomName: preset.fandom,
        motto: 'Âm nhạc đỉnh cao chinh phục toàn bộ khán giả!',
        roleAssignments: assigned,
      };
      onSubmitGroup(p.id, details);
    });
    sound.playVictory();
  };

  const allHaveGroups = allPlayers.every((p) => p.idols.length > 0 && p.isReady);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> GIAI ĐOẠN 3 • THÀNH LẬP NHÓM NHẠC HOÀN CHỈNH
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Xây Dựng Nhóm Nhạc & Đặt Tên Debut
          </h2>
          <p className="text-xs text-slate-400">
            Đặt tên nhóm, phong cách concept, bài hát debut và phân công vai trò cho các IDOL đã ký hợp đồng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPlayerCodes && (
            <button
              onClick={onOpenPlayerCodes}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 flex items-center gap-1.5 transition-colors"
            >
              <span>🔑</span> Mã PIN 5 Người Chơi
            </button>
          )}
          <button
            onClick={handleAutoFillAllGroups}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 flex items-center gap-1.5 transition-colors"
          >
            <Dices className="w-3.5 h-3.5 text-amber-300" /> Tự động hoàn thiện cả 5 nhóm
          </button>
          <button
            onClick={onBackToMarket}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Về Chợ Idol
          </button>
        </div>
      </div>

      {/* 5 Investor Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {allPlayers.map((p) => {
          const isCurrent = p.id === activePlayer.id;
          const hasGroup = !!p.groupDetails && p.isReady;

          return (
            <button
              key={p.id}
              onClick={() => {
                onSelectPlayer(p.id);
                sound.playBuy();
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <InvestorAvatar player={p} size="xs" />
                  <span>Ghế #{p.seatNumber}</span>
                </span>
                {hasGroup ? (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Xong
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded-full font-bold">
                    Chờ duyệt
                  </span>
                )}
              </div>
              <div className="text-xs font-black truncate">
                {p.groupDetails?.groupName || p.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.idols.length} idol đã ký</div>
            </button>
          );
        })}
      </div>

      {/* Main Group Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Setup */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <InvestorAvatar player={activePlayer} size="sm" showBadge />
                <div>
                  <h3 className="text-lg font-black text-white">{activePlayer.name}</h3>
                  <p className="text-xs text-pink-400 font-semibold">{activePlayer.agencyName}</p>
                </div>
              </div>
              <button
                onClick={handleRandomizeGroup}
                className="text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/30 rounded-xl flex items-center gap-1.5"
              >
                <Dices className="w-3.5 h-3.5" /> Ngẫu nhiên concept nhóm
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Tên nhóm nhạc (Group Name):
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ví dụ: ECLIPSE, NOVA 5, BLACK DIAMOND..."
                  className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Bài hát Debut (Debut Single Track):
                </label>
                <div className="relative">
                  <Music className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input
                    type="text"
                    value={debutSong}
                    onChange={(e) => setDebutSong(e.target.value)}
                    placeholder="Ví dụ: Supernova Explosion, Golden Crown..."
                    className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-pink-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Tên Fandom người hâm mộ:
                </label>
                <input
                  type="text"
                  value={fandomName}
                  onChange={(e) => setFandomName(e.target.value)}
                  placeholder="Ví dụ: BLINKS, ARMED, STARLIGHTS..."
                  className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Khẩu hiệu / Slogan nhóm:
                </label>
                <input
                  type="text"
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="Ví dụ: To the world! Here comes the future!"
                  className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Concept Presets */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Phong cách Concept chủ đạo:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {CONCEPT_PRESETS.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => setConcept(cp.name)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      concept === cp.name
                        ? 'bg-gradient-to-r from-pink-900/60 to-purple-900/60 border-pink-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{cp.icon}</span>
                      <span className="text-xs font-bold text-white">{cp.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {cp.tagline}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role Assignments Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              Phân Công Vai Trò Cho Từng Idol ({activePlayer.idols.length} thành viên):
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Mỗi thành viên có thể được chỉ định các vai trò trọng yếu như Leader, Center, Main Vocal, Main Dancer, Producer...
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePlayer.idols.map((idol) => (
                <div
                  key={idol.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IdolAvatar idol={idol} size="sm" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{idol.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{idol.originalGroup}</div>
                    </div>
                  </div>

                  <select
                    value={roleAssignments[idol.id] || ''}
                    onChange={(e) => handleAssignRole(idol.id, e.target.value)}
                    className="text-xs bg-slate-900 border border-slate-700 text-pink-300 font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-pink-500 shrink-0"
                  >
                    <option value="">-- Chọn vị trí --</option>
                    <option value="Leader (Trưởng nhóm)">Leader (Trưởng nhóm)</option>
                    <option value="Center / Visual">Center / Visual</option>
                    <option value="Main Vocalist">Main Vocalist</option>
                    <option value="Lead Vocalist">Lead Vocalist</option>
                    <option value="Main Dancer">Main Dancer</option>
                    <option value="Main Rapper">Main Rapper</option>
                    <option value="Producer Âm Nhạc">Producer Âm Nhạc</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveCurrentGroup}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/20"
              >
                Xác Nhận & Lưu Thông Tin Nhóm
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Group Debut Card Preview */}
        <div className="space-y-6">
          <div className="sticky top-20 bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-950 border border-pink-500/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2.5 py-0.5 rounded-full inline-block mb-3">
              POSTER DEBUT CHÍNH THỨC
            </span>

            <h2 className="text-2xl font-black text-white tracking-tight break-words">
              {groupName || 'TÊN NHÓM NHẠC'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold mt-1">
              <Disc className="w-3.5 h-3.5" /> Ca khúc: {debutSong || 'Chưa đặt'}
            </div>
            <div className="text-xs text-purple-300 font-semibold mt-1">
              Concept: {concept}
            </div>

            {/* Member Portraits Ribbon */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                Đội hình thành viên ({activePlayer.idols.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {activePlayer.idols.map((idol) => (
                  <div key={idol.id} className="relative group text-center">
                    <IdolAvatar idol={idol} size="md" />
                    <span className="block text-[10px] font-bold text-white mt-1 max-w-[64px] truncate">
                      {idol.name}
                    </span>
                    {roleAssignments[idol.id] && (
                      <span className="block text-[9px] text-pink-300 truncate max-w-[64px]">
                        {roleAssignments[idol.id].split(' ')[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ready Status & Next Step */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-400">Tiến độ 5 nhà đầu tư:</span>
                <span className="font-bold text-emerald-400">
                  {allPlayers.filter((p) => p.isReady).length} / 5 nhóm sẵn sàng
                </span>
              </div>

              <button
                onClick={onProceedToShowcase}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Ra Mắt Sân Khấu Debut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Chuyển tiếp đến sân khấu giới thiệu hoành tráng và mở cổng bình chọn qua link cho khán giả!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
