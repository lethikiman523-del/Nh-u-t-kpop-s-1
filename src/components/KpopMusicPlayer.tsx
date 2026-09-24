import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  ChevronDown,
  ChevronUp,
  Disc3,
  ListMusic,
  Sparkles,
} from 'lucide-react';
import { kpopMusic, KPOP_PLAYLIST } from '../utils/kpopAudio';

export const KpopMusicPlayer: React.FC = () => {
  const [, setTick] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Subscribe to engine state updates
    const unsubscribe = kpopMusic.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const currentTrack = kpopMusic.getTrack();
  const isPlaying = kpopMusic.getIsPlaying();
  const volume = kpopMusic.getVolume();
  const isMuted = kpopMusic.getIsMuted();
  const elapsed = kpopMusic.getElapsed();
  const repeatMode = kpopMusic.getRepeatMode();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTogglePlay = () => {
    kpopMusic.togglePlay();
  };

  const handleSelectTrack = (index: number) => {
    kpopMusic.playTrackByIndex(index);
    setIsPlaylistOpen(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    kpopMusic.seekTo(val);
  };

  const handleToggleRepeat = () => {
    kpopMusic.toggleRepeatMode();
  };

  // If minimized to a small badge
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-fadeIn">
        <div className="flex items-center gap-2 bg-slate-950/95 border border-amber-500/50 shadow-2xl shadow-amber-950/40 rounded-full px-3 py-1.5 backdrop-blur-md">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-rose-400 transition"
            title={`Mở rộng trình phát nhạc ${currentTrack.title}`}
          >
            <Disc3 className={`w-4 h-4 text-rose-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="truncate max-w-[150px] text-[11px] font-semibold">
              {currentTrack.title}
            </span>
          </button>
          <button
            onClick={handleToggleRepeat}
            className={`p-1 rounded-full text-xs transition ${
              repeatMode === 'one'
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tự động lặp lại khi hết bài"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
          </button>
          <button
            onClick={handleTogglePlay}
            className="p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs transition"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 translate-x-[0.5px]" />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 text-slate-400 hover:text-white"
            title="Mở rộng"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-amber-500/30 backdrop-blur-lg px-4 py-2.5 shadow-2xl text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Track Details & Album Art */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            {/* Spinning Vinyl Cover Art */}
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${currentTrack.coverGradient} flex items-center justify-center shadow-lg ring-1 ring-white/20 shrink-0 relative overflow-hidden`}
            >
              <Disc3
                className={`w-5 h-5 text-white/90 ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '3s' }}
              />
              <span className="absolute bottom-0.5 right-0.5 text-[9px]">{currentTrack.emoji}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-white truncate max-w-[170px] sm:max-w-xs">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40 shrink-0 flex items-center gap-1">
                  {currentTrack.isRealAudio ? '🔥 Bản Gốc MP3' : currentTrack.genre}
                </span>
                {repeatMode === 'one' && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 font-mono border border-amber-500/40">
                    <Repeat1 className="w-2.5 h-2.5" /> Tự động lặp lại
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                <span className="font-semibold text-amber-400">{currentTrack.artist}</span>
                <span>•</span>
                <span>{currentTrack.agency}</span>
                <span>•</span>
                <span>{currentTrack.bpm} BPM</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Bản Gốc Full (3:50)</span>
              </div>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-0.5 h-4 px-2 shrink-0">
            {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((h, i) => (
              <span
                key={i}
                className={`w-1 bg-gradient-to-t from-amber-500 to-red-500 rounded-full transition-all duration-150 ${
                  isPlaying ? 'animate-pulse' : 'h-1 opacity-40'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(4, h * 16)}px` : '4px',
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Center: Controls & Timeline */}
        <div className="flex flex-col items-center w-full md:max-w-md gap-1">
          <div className="flex items-center gap-2.5">
            {/* Prev Track */}
            <button
              onClick={() => kpopMusic.prevTrack()}
              className="p-1.5 text-slate-400 hover:text-white rounded-full transition active:scale-90"
              title="Bài trước đó"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-500 via-pink-600 to-amber-500 hover:from-rose-400 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 transition-transform active:scale-95"
              title={isPlaying ? `Tạm dừng nhạc ${currentTrack.title}` : `Phát nhạc ${currentTrack.title} (${currentTrack.artist})`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 translate-x-[1px]" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={() => kpopMusic.nextTrack()}
              className="p-1.5 text-slate-400 hover:text-white rounded-full transition active:scale-90"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Repeat Mode Toggle (Default: Repeat One) */}
            <button
              onClick={handleToggleRepeat}
              className={`p-1.5 rounded-full border transition active:scale-90 flex items-center gap-1 text-xs font-semibold ${
                repeatMode === 'one'
                  ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/20'
                  : repeatMode === 'all'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={
                repeatMode === 'one'
                  ? 'Chế độ lặp lại: Tự động phát lại bài hát khi hết (Đang BẬT)'
                  : repeatMode === 'all'
                  ? 'Chế độ lặp lại: Chuyển tiếp danh sách phát'
                  : 'Chế độ lặp lại: TẮT'
              }
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5" />
              ) : (
                <Repeat className="w-3.5 h-3.5" />
              )}
              <span className="text-[10px] hidden sm:inline">
                {repeatMode === 'one' ? 'Lặp lại 1 bài' : repeatMode === 'all' ? 'Lặp tất cả' : 'Không lặp'}
              </span>
            </button>

            {/* Playlist Button */}
            <button
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                isPlaylistOpen
                  ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Danh sách bài hát K-POP"
            >
              <ListMusic className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Danh Sách</span>
              <span className="text-[10px] bg-amber-500/30 px-1 rounded-full text-amber-300">
                {KPOP_PLAYLIST.length}
              </span>
            </button>
          </div>

          {/* Timeline slider */}
          <div className="w-full flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="w-8 text-right shrink-0">{formatTime(elapsed)}</span>
            <input
              type="range"
              min={0}
              max={currentTrack.durationSeconds}
              value={elapsed}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="w-8 text-left shrink-0">{formatTime(currentTrack.durationSeconds)}</span>
          </div>
        </div>

        {/* Right: Volume & Minimize */}
        <div className="flex items-center justify-end w-full md:w-auto gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => kpopMusic.toggleMute()}
              className="text-slate-400 hover:text-white transition"
              title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                kpopMusic.setVolume(val);
                if (isMuted && val > 0) kpopMusic.toggleMute();
              }}
              className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              title={`Âm lượng: ${Math.round(volume * 100)}%`}
            />
          </div>

          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition"
            title="Thu nhỏ trình phát"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Playlist Popover Modal */}
      {isPlaylistOpen && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 w-80 sm:w-96 bg-slate-900 border border-amber-500/50 rounded-3xl p-4 shadow-2xl shadow-amber-950/50 backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Danh Sách Bài Hát K-POP ({KPOP_PLAYLIST.length} Bài)
              </h4>
            </div>
            <button
              onClick={() => setIsPlaylistOpen(false)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {KPOP_PLAYLIST.map((track, idx) => {
              const isSelected = track.id === currentTrack.id;

              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/70 to-red-950/70 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${track.coverGradient} flex items-center justify-center text-sm shadow shrink-0`}
                    >
                      {track.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                        <span>{track.title}</span>
                        {track.isRealAudio ? (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/30 text-amber-300 rounded font-bold border border-amber-500/40">
                            🎵 MP3 Gốc
                          </span>
                        ) : idx === 0 ? (
                          <span className="text-[9px] px-1 py-0.2 bg-amber-500/30 text-amber-300 rounded font-bold">
                            Chính
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                        <span className="font-semibold text-amber-400">{track.artist}</span>
                        <span>•</span>
                        <span>{track.agency}</span>
                        <span>•</span>
                        <span>{track.year}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatTime(track.durationSeconds)}
                    </span>
                    {isSelected && isPlaying ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 text-center text-[10px] text-slate-400">
            💃 Nhạc nền chính: <strong className="text-rose-400">AOA - 짧은 치마 (Miniskirt)</strong> • Tự động lặp lại liên tục khi phát hết bài
          </div>
        </div>
      )}
    </div>
  );
};
