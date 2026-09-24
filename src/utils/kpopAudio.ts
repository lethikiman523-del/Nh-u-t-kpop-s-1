// Web Audio API Synthesizer Engine for K-POP Background Music
// Featuring signature K-POP classics, lead track:
// 1. BANG BANG BANG (뱅뱅뱅) - BIGBANG (Full Song, Auto-Replay)
// 2. BEEN THROUGH (지나갈 테니) - EXO
// 3. BOOMBAYAH - BLACKPINK
// 4. I'M THE BEST - 2NE1
// 5. SUPER - SEVENTEEN
// 6. KO KO BOP - EXO

export type RepeatMode = 'one' | 'all' | 'off';

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  agency: string;
  year: number;
  bpm: number;
  genre: string;
  durationSeconds: number;
  coverGradient: string;
  accentColor: string;
  emoji: string;
  audioSrc?: string;
  isRealAudio?: boolean;
}

export const KPOP_PLAYLIST: TrackInfo[] = [
  {
    id: 'aoa-miniskirt',
    title: '짧은 치마 (Miniskirt)',
    artist: 'AOA (에이오에이)',
    agency: 'FNC Entertainment',
    year: 2014,
    bpm: 120,
    genre: 'K-Pop Dance-Pop / Sexy Vibe',
    durationSeconds: 254, // Full official song duration (4:14)
    coverGradient: 'from-rose-600 via-pink-600 to-amber-500',
    accentColor: '#f43f5e',
    emoji: '💃',
    audioSrc: '/audio/aoa_miniskirt.mp3',
    isRealAudio: true,
  },
  {
    id: 'bang-bang-bang',
    title: 'BANG BANG BANG (뱅뱅뱅)',
    artist: 'BIGBANG (빅뱅)',
    agency: 'YG Entertainment',
    year: 2015,
    bpm: 135,
    genre: 'K-Pop Trap / EDM Banger',
    durationSeconds: 230, // Full official song duration (3:50)
    coverGradient: 'from-amber-600 via-red-600 to-slate-900',
    accentColor: '#f59e0b',
    emoji: '💥',
    audioSrc: '/audio/bigbang_bang_bang_bang.mp3',
    isRealAudio: true,
  },
  {
    id: 'been-through',
    title: 'BEEN THROUGH (지나갈 테니)',
    artist: 'EXO',
    agency: 'SM Entertainment',
    year: 2017,
    bpm: 112,
    genre: 'Acoustic Indie Pop / R&B',
    durationSeconds: 168,
    coverGradient: 'from-amber-600 via-stone-800 to-indigo-950',
    accentColor: '#f59e0b',
    emoji: '🪐',
  },
  {
    id: 'boombayah',
    title: 'BOOMBAYAH (붐바야)',
    artist: 'BLACKPINK',
    agency: 'YG Entertainment',
    year: 2016,
    bpm: 125,
    genre: 'Dancehall / EDM Trap',
    durationSeconds: 155,
    coverGradient: 'from-rose-500 via-pink-600 to-black',
    accentColor: '#fb7185',
    emoji: '💖',
  },
  {
    id: 'im-the-best',
    title: "I'M THE BEST (내가 제일 잘 나가)",
    artist: '2NE1',
    agency: 'YG Entertainment',
    year: 2011,
    bpm: 128,
    genre: 'Electro-House Anthem',
    durationSeconds: 150,
    coverGradient: 'from-pink-600 via-purple-600 to-indigo-950',
    accentColor: '#ec4899',
    emoji: '👑',
  },
  {
    id: 'super',
    title: 'SUPER (손오공)',
    artist: 'SEVENTEEN',
    agency: 'Pledis / HYBE',
    year: 2023,
    bpm: 138,
    genre: 'Drill / Martial Arts Trap',
    durationSeconds: 165,
    coverGradient: 'from-cyan-600 via-blue-700 to-slate-950',
    accentColor: '#06b6d4',
    emoji: '⚡',
  },
  {
    id: 'ko-ko-bop',
    title: 'KO KO BOP',
    artist: 'EXO',
    agency: 'SM Entertainment',
    year: 2017,
    bpm: 146,
    genre: 'Reggae-Pop / Tropical Trap',
    durationSeconds: 150,
    coverGradient: 'from-emerald-500 via-teal-700 to-slate-900',
    accentColor: '#10b981',
    emoji: '🌴',
  },
];

// Note frequencies map
const NOTE_FREQS: Record<string, number> = {
  C2: 65.41, 'C#2': 69.30, Db2: 69.30, D2: 73.42, 'D#2': 77.78, Eb2: 77.78, E2: 82.41, F2: 87.31, 'F#2': 92.50, Gb2: 92.50, G2: 98.00, 'G#2': 103.83, Ab2: 103.83, A2: 110.00, 'A#2': 116.54, Bb2: 116.54, B2: 123.47,
  C3: 130.81, 'C#3': 138.59, Db3: 138.59, D3: 146.83, 'D#3': 155.56, Eb3: 155.56, E3: 164.81, F3: 174.61, 'F#3': 185.00, Gb3: 185.00, G3: 196.00, 'G#3': 207.65, Ab3: 207.65, A3: 220.00, 'A#3': 233.08, Bb3: 233.08, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, Db4: 277.18, D4: 293.66, 'D#4': 311.13, Eb4: 311.13, E4: 329.63, F4: 349.23, 'F#4': 369.99, Gb4: 369.99, G4: 392.00, 'G#4': 415.30, Ab4: 415.30, A4: 440.00, 'A#4': 466.16, Bb4: 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, Db5: 554.37, D5: 587.33, 'D#5': 622.25, Eb5: 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, Gb5: 739.99, G5: 783.99, 'G#5': 830.61, Ab5: 830.61, A5: 880.00, 'A#5': 932.33, Bb5: 932.33, B5: 987.77,
  C6: 1046.50,
};

type NoteEvent = {
  step: number; // in 16th notes (0 to 63 for 4-bar loop)
  note: string;
  duration: number; // in beats
  type?: OscillatorType;
  gain?: number;
};

type DrumEvent = {
  step: number;
  type: 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap';
  velocity?: number;
};

// // Patterns for each track
interface SongPattern {
  bpm: number;
  totalSteps?: number;
  leadNotes: NoteEvent[];
  bassNotes: NoteEvent[];
  chords: { step: number; notes: string[]; duration: number }[];
  drums: DrumEvent[];
}

function buildBangBangBangFull(): SongPattern {
  const leadNotes: NoteEvent[] = [];
  const bassNotes: NoteEvent[] = [];
  const chords: { step: number; notes: string[]; duration: number }[] = [];
  const drums: DrumEvent[] = [];
  const totalSteps = 1984; // 124 bars = 220.44s @ 135 BPM (Full official song)

  const addLead = (step: number, note: string, duration: number, type: OscillatorType = 'sawtooth', gain: number = 0.23) => {
    leadNotes.push({ step, note, duration, type, gain });
  };
  const addBass = (step: number, note: string, duration: number, type: OscillatorType = 'triangle', gain: number = 0.35) => {
    bassNotes.push({ step, note, duration, type, gain });
  };
  const addChord = (step: number, notes: string[], duration: number = 1.8) => {
    chords.push({ step, notes, duration });
  };
  const addDrum = (step: number, type: DrumEvent['type'], velocity: number = 0.9) => {
    drums.push({ step, type, velocity });
  };

  // Helper for Fanfare Horns (4 bars / 64 steps)
  const addFanfarePhrase = (barStart: number, energy: number = 1.0, octaveUp: boolean = false) => {
    const s = barStart * 16;
    const o = octaveUp ? 1 : 0;
    const Bb4 = o ? 'Bb5' : 'Bb4';
    const G4 = o ? 'G5' : 'G4';
    const F4 = o ? 'F5' : 'F4';
    const C5 = o ? 'C6' : 'C5';
    const Ab4 = o ? 'Ab5' : 'Ab4';
    const C4 = o ? 'C5' : 'C4';

    // Bar 1: Bb4 - Bb4 - G4 - F4 - G4 - C5
    addLead(s + 0, Bb4, 0.35, 'sawtooth', 0.22 * energy);
    addLead(s + 2, Bb4, 0.35, 'sawtooth', 0.22 * energy);
    addLead(s + 4, G4, 0.5, 'sawtooth', 0.24 * energy);
    addLead(s + 6, F4, 0.35, 'sawtooth', 0.2 * energy);
    addLead(s + 8, G4, 0.7, 'sawtooth', 0.25 * energy);
    addLead(s + 12, C5, 0.8, 'sawtooth', 0.27 * energy);

    // Bar 2: Bb4 - Bb4 - G4 - F4 - G4 - F4
    addLead(s + 16, Bb4, 0.35, 'sawtooth', 0.22 * energy);
    addLead(s + 18, Bb4, 0.35, 'sawtooth', 0.22 * energy);
    addLead(s + 20, G4, 0.5, 'sawtooth', 0.24 * energy);
    addLead(s + 22, F4, 0.35, 'sawtooth', 0.2 * energy);
    addLead(s + 24, G4, 0.9, 'sawtooth', 0.26 * energy);
    addLead(s + 28, F4, 0.4, 'sawtooth', 0.2 * energy);

    // Bar 3: Ppangya ppangya ppangya! (F4 - F4 - Ab4 - G4 - F4 - C4)
    addLead(s + 32, F4, 0.3, 'square', 0.22 * energy);
    addLead(s + 34, F4, 0.3, 'square', 0.22 * energy);
    addLead(s + 36, Ab4, 0.4, 'square', 0.24 * energy);
    addLead(s + 38, G4, 0.4, 'square', 0.22 * energy);
    addLead(s + 40, F4, 0.5, 'square', 0.22 * energy);
    addLead(s + 44, C4, 0.4, 'square', 0.2 * energy);

    // Bar 4: Brass run into drop climax
    addLead(s + 48, F4, 0.25, 'sawtooth', 0.22 * energy);
    addLead(s + 50, G4, 0.25, 'sawtooth', 0.22 * energy);
    addLead(s + 52, Ab4, 0.35, 'sawtooth', 0.24 * energy);
    addLead(s + 54, Bb4, 0.35, 'sawtooth', 0.26 * energy);
    addLead(s + 56, C5, 0.6, 'sawtooth', 0.28 * energy);
    addLead(s + 60, Bb4, 0.4, 'sawtooth', 0.24 * energy);
  };

  // Helper for Drop Harmonies (Bass & Chords for 4 bars)
  const addDropHarmonies = (barStart: number, barCount: number = 4) => {
    for (let i = 0; i < barCount; i++) {
      const b = barStart + i;
      const s = b * 16;
      if (i % 4 === 0) {
        addBass(s + 0, 'F2', 1.5, 'triangle', 0.38);
        addBass(s + 8, 'F2', 1.5, 'triangle', 0.35);
        addChord(s + 0, ['F3', 'Ab3', 'C4'], 1.8);
      } else if (i % 4 === 1) {
        addBass(s + 0, 'Eb2', 1.5, 'triangle', 0.38);
        addBass(s + 8, 'Eb2', 1.5, 'triangle', 0.35);
        addChord(s + 0, ['Eb3', 'G3', 'Bb3'], 1.8);
      } else if (i % 4 === 2) {
        addBass(s + 0, 'Db2', 1.5, 'triangle', 0.38);
        addBass(s + 8, 'Db2', 1.5, 'triangle', 0.35);
        addChord(s + 0, ['Db3', 'F3', 'Ab3'], 1.8);
      } else {
        addBass(s + 0, 'C2', 1.5, 'triangle', 0.38);
        addBass(s + 8, 'C2', 1.5, 'triangle', 0.35);
        addChord(s + 0, ['C3', 'E3', 'G3'], 1.8);
      }
    }
  };

  // Helper for Trap Drums
  const addTrapDrums = (barStart: number, barCount: number, rollIntensity: number = 1) => {
    for (let b = 0; b < barCount; b++) {
      const s = (barStart + b) * 16;
      addDrum(s + 0, 'kick', 1.0);
      addDrum(s + 6, 'kick', 0.85);
      addDrum(s + 10, 'kick', 0.9);
      if (b % 2 === 1) addDrum(s + 14, 'kick', 0.8);

      addDrum(s + 8, 'snare', 0.95);
      addDrum(s + 8, 'clap', 0.85);

      for (let h = 0; h < 16; h += 2) {
        addDrum(s + h, 'hihat', 0.5);
      }
      if (rollIntensity > 1 && b % 2 === 1) {
        addDrum(s + 13, 'hihat', 0.4);
        addDrum(s + 15, 'hihat', 0.45);
      }
      addDrum(s + 4, 'openhat', 0.35);
      addDrum(s + 12, 'openhat', 0.35);
    }
  };

  // Helper for Pre-Chorus vocal phrases ("Neol heundeureo...")
  const addPreChorusVocal = (barStart: number, octaveUp: boolean = false) => {
    const s = barStart * 16;
    const o = octaveUp ? 1 : 0;
    const Ab = o ? 'Ab5' : 'Ab4';
    const Bb = o ? 'Bb5' : 'Bb4';
    const C = o ? 'C6' : 'C5';
    const Db = o ? 'Db6' : 'Db5';
    const Eb = o ? 'Eb6' : 'Eb5';
    const F = o ? 'F5' : 'F4';
    const G = o ? 'G5' : 'G4';

    // Bar 1: "Neol heundeureo..."
    addLead(s + 0, Ab, 0.4, 'sine', 0.25);
    addLead(s + 3, Bb, 0.4, 'sine', 0.26);
    addLead(s + 6, C, 0.6, 'sine', 0.28);
    addLead(s + 10, Db, 0.4, 'sine', 0.26);
    addLead(s + 12, C, 0.4, 'sine', 0.26);

    // Bar 2: "nal heundeureo..."
    addLead(s + 16, Bb, 0.4, 'sine', 0.25);
    addLead(s + 19, Ab, 0.4, 'sine', 0.25);
    addLead(s + 22, G, 0.6, 'sine', 0.26);
    addLead(s + 26, F, 0.6, 'sine', 0.24);

    // Bar 3: "geojit eopsi da hamkke..."
    addLead(s + 32, C, 0.4, 'sine', 0.27);
    addLead(s + 35, Db, 0.4, 'sine', 0.27);
    addLead(s + 38, Eb, 0.6, 'sine', 0.28);
    addLead(s + 42, Db, 0.4, 'sine', 0.26);
    addLead(s + 44, C, 0.4, 'sine', 0.26);

    // Bar 4: "geunyang michyeobwa!"
    addLead(s + 48, Bb, 0.5, 'triangle', 0.26);
    addLead(s + 52, C, 0.5, 'triangle', 0.28);
    addLead(s + 56, Db, 0.6, 'triangle', 0.28);
    addLead(s + 60, C, 0.6, 'triangle', 0.28);
  };

  // --- SECTION 1: INTRO (Bars 0 - 7 / Steps 0 - 127) ---
  // Bars 0-3: Atmospheric half-time intro
  for (let i = 0; i < 4; i++) {
    const s = i * 16;
    addDrum(s + 0, 'kick', 1.0);
    addDrum(s + 14, 'openhat', 0.35);
  }
  addDropHarmonies(0, 4);
  // Intro teaser brass
  addLead(0, 'Bb4', 0.35, 'sawtooth', 0.2);
  addLead(2, 'Bb4', 0.35, 'sawtooth', 0.2);
  addLead(4, 'G4', 0.5, 'sawtooth', 0.22);
  addLead(8, 'G4', 0.6, 'sawtooth', 0.22);
  addLead(12, 'C5', 0.8, 'sawtooth', 0.24);
  // Bars 4-7: Snare & hats join, full fanfare theme begins
  for (let i = 4; i < 8; i++) {
    const s = i * 16;
    addDrum(s + 0, 'kick', 0.95);
    addDrum(s + 8, 'snare', 0.85);
    for (let h = 0; h < 16; h += 2) addDrum(s + h, 'hihat', 0.4);
  }
  addDropHarmonies(4, 4);
  addFanfarePhrase(4, 0.85);

  // --- SECTION 2: VERSE 1 - Taeyang & T.O.P (Bars 8 - 15 / Steps 128 - 255) ---
  addTrapDrums(8, 8, 1);
  for (let b = 8; b < 16; b++) {
    const s = b * 16;
    addBass(s + 0, 'F2', 0.7, 'sawtooth', 0.32);
    addBass(s + 6, 'Ab2', 0.7, 'sawtooth', 0.32);
    addBass(s + 10, 'Bb2', 0.7, 'sawtooth', 0.32);
    // Bouncy staccato rap cadence
    addLead(s + 0, 'F4', 0.25, 'square', 0.22);
    addLead(s + 3, 'Ab4', 0.3, 'square', 0.24);
    addLead(s + 6, 'F4', 0.25, 'square', 0.2);
    addLead(s + 10, 'Bb4', 0.3, 'square', 0.24);
    addLead(s + 13, 'C5', 0.35, 'square', 0.24);
  }
  // Snare buildup at end of verse 1
  for (let s = 15 * 16 + 8; s < 16 * 16; s++) {
    addDrum(s, 'snare', 0.7 + (s % 8) * 0.04);
  }

  // --- SECTION 3: PRE-CHORUS 1 (Bars 16 - 23 / Steps 256 - 383) ---
  // Bars 16-19: Vocal melody + 4-on-the-floor kick
  addPreChorusVocal(16, false);
  for (let b = 16; b < 20; b++) {
    const s = b * 16;
    addDrum(s + 0, 'kick', 0.95);
    addDrum(s + 4, 'kick', 0.9);
    addDrum(s + 8, 'kick', 0.95);
    addDrum(s + 12, 'kick', 0.9);
    for (let h = 0; h < 16; h += 2) addDrum(s + h, 'hihat', 0.45);
  }
  addDropHarmonies(16, 4);

  // Bars 20-22: Accelerating snare roll build
  for (let b = 20; b < 23; b++) {
    const s = b * 16;
    addDropHarmonies(b, 1);
    if (b === 20) {
      for (let i = 0; i < 16; i += 4) addDrum(s + i, 'snare', 0.75);
    } else if (b === 21) {
      for (let i = 0; i < 16; i += 2) addDrum(s + i, 'snare', 0.85);
    } else if (b === 22) {
      for (let i = 0; i < 16; i++) addDrum(s + i, 'snare', 0.7 + i * 0.02);
    }
  }
  // Bar 23: The iconic tension drop into silence ("B.I.G B.A.N.G!")
  const bar23 = 23 * 16;
  addDrum(bar23 + 0, 'snare', 0.9);
  addDrum(bar23 + 4, 'snare', 0.95);
  addDrum(bar23 + 8, 'snare', 1.0);
  addLead(bar23 + 8, 'C5', 0.3, 'sawtooth', 0.3);
  // Steps 378 - 383: Silence right before the blast!

  // --- SECTION 4: CHORUS 1 / THE FAMOUS TRAP DROP (Bars 24 - 39 / Steps 384 - 639) ---
  // Bars 24-27: Drop 1 Phase A
  addDropHarmonies(24, 4);
  addFanfarePhrase(24, 1.15);
  addTrapDrums(24, 4, 2);

  // Bars 28-31: Drop 1 Phase B (Repeat with higher energy)
  addDropHarmonies(28, 4);
  addFanfarePhrase(28, 1.25);
  addTrapDrums(28, 4, 2);

  // Bars 32-35: "Da hamkke chongmajeun geotcheoreom!"
  addDropHarmonies(32, 4);
  for (let b = 32; b < 36; b++) {
    const s = b * 16;
    addLead(s + 0, 'F4', 0.35, 'sawtooth', 0.28);
    addLead(s + 4, 'Ab4', 0.35, 'sawtooth', 0.3);
    addLead(s + 8, 'Bb4', 0.45, 'sawtooth', 0.3);
    addLead(s + 12, 'C5', 0.6, 'sawtooth', 0.32);
  }
  addTrapDrums(32, 4, 2);

  // Bars 36-39: Heavy brass finish
  addDropHarmonies(36, 4);
  addFanfarePhrase(36, 1.2);
  addTrapDrums(36, 4, 2);

  // --- SECTION 5: VERSE 2 - GD Swag Rap (Bars 40 - 47 / Steps 640 - 767) ---
  addTrapDrums(40, 8, 1);
  for (let b = 40; b < 48; b++) {
    const s = b * 16;
    // Bouncy syncopated 808 bass
    addBass(s + 0, 'F2', 0.6, 'sawtooth', 0.35);
    addBass(s + 4, 'Db2', 0.5, 'sawtooth', 0.32);
    addBass(s + 8, 'Eb2', 0.6, 'sawtooth', 0.34);
    addBass(s + 12, 'C2', 0.5, 'sawtooth', 0.32);
    // GD playful syncopated rap notes
    addLead(s + 2, 'C5', 0.25, 'square', 0.24);
    addLead(s + 5, 'Bb4', 0.3, 'square', 0.22);
    addLead(s + 8, 'Ab4', 0.35, 'square', 0.25);
    addLead(s + 11, 'F4', 0.3, 'square', 0.2);
    addLead(s + 14, 'G4', 0.25, 'square', 0.22);
  }
  // Pre-roll into Pre-Chorus 2
  for (let s = 47 * 16 + 8; s < 48 * 16; s++) {
    addDrum(s, 'snare', 0.75 + (s % 8) * 0.03);
  }

  // --- SECTION 6: PRE-CHORUS 2 (Bars 48 - 55 / Steps 768 - 895) ---
  addPreChorusVocal(48, true); // Octave up!
  for (let b = 48; b < 52; b++) {
    const s = b * 16;
    addDrum(s + 0, 'kick', 1.0);
    addDrum(s + 4, 'kick', 0.95);
    addDrum(s + 8, 'kick', 1.0);
    addDrum(s + 12, 'kick', 0.95);
    for (let h = 0; h < 16; h += 2) addDrum(s + h, 'hihat', 0.5);
  }
  addDropHarmonies(48, 4);

  // Snare climb
  for (let b = 52; b < 55; b++) {
    const s = b * 16;
    addDropHarmonies(b, 1);
    if (b === 52) {
      for (let i = 0; i < 16; i += 4) addDrum(s + i, 'snare', 0.8);
    } else if (b === 53) {
      for (let i = 0; i < 16; i += 2) addDrum(s + i, 'snare', 0.9);
    } else if (b === 54) {
      for (let i = 0; i < 16; i++) addDrum(s + i, 'snare', 0.75 + i * 0.02);
    }
  }
  // Bar 55: Silence drop before Drop 2
  const bar55 = 55 * 16;
  addDrum(bar55 + 0, 'snare', 0.95);
  addDrum(bar55 + 4, 'snare', 1.0);
  addDrum(bar55 + 8, 'snare', 1.0);
  addLead(bar55 + 8, 'C6', 0.3, 'sawtooth', 0.35);

  // --- SECTION 7: CHORUS 2 / THE SECOND MEGA DROP (Bars 56 - 71 / Steps 896 - 1151) ---
  addDropHarmonies(56, 16);
  // Layered octave fanfare with maximum power
  addFanfarePhrase(56, 1.3, false);
  addFanfarePhrase(56, 0.8, true);
  addTrapDrums(56, 4, 2);

  addFanfarePhrase(60, 1.35, false);
  addFanfarePhrase(60, 0.85, true);
  addTrapDrums(60, 4, 2);

  // Second half
  for (let b = 64; b < 68; b++) {
    const s = b * 16;
    addLead(s + 0, 'F5', 0.35, 'sawtooth', 0.3);
    addLead(s + 4, 'Ab5', 0.35, 'sawtooth', 0.32);
    addLead(s + 8, 'Bb5', 0.45, 'sawtooth', 0.32);
    addLead(s + 12, 'C6', 0.6, 'sawtooth', 0.35);
  }
  addTrapDrums(64, 4, 2);

  addFanfarePhrase(68, 1.3, false);
  addTrapDrums(68, 4, 2);

  // --- SECTION 8: BRIDGE (Bars 72 - 87 / Steps 1152 - 1407) ---
  // Soulful breakdown (Dbmaj7 - Eb - Fm - Ab)
  for (let b = 72; b < 84; b++) {
    const s = b * 16;
    const mod = (b - 72) % 4;
    if (mod === 0) {
      addBass(s + 0, 'Db2', 1.8, 'triangle', 0.32);
      addChord(s + 0, ['Db3', 'F3', 'Ab3', 'C4'], 1.8);
      addLead(s + 0, 'C5', 1.0, 'sine', 0.25);
      addLead(s + 8, 'Bb4', 0.6, 'sine', 0.22);
    } else if (mod === 1) {
      addBass(s + 0, 'Eb2', 1.8, 'triangle', 0.32);
      addChord(s + 0, ['Eb3', 'G3', 'Bb3'], 1.8);
      addLead(s + 0, 'Ab4', 0.8, 'sine', 0.24);
      addLead(s + 6, 'G4', 0.5, 'sine', 0.2);
    } else if (mod === 2) {
      addBass(s + 0, 'F2', 1.8, 'triangle', 0.32);
      addChord(s + 0, ['F3', 'Ab3', 'C4'], 1.8);
      addLead(s + 0, 'F4', 1.2, 'sine', 0.25);
      addLead(s + 10, 'G4', 0.5, 'sine', 0.22);
    } else {
      addBass(s + 0, 'Ab2', 1.8, 'triangle', 0.32);
      addChord(s + 0, ['Ab3', 'C4', 'Eb4'], 1.8);
      addLead(s + 0, 'Ab4', 0.8, 'sine', 0.25);
      addLead(s + 8, 'C5', 0.8, 'sine', 0.26);
    }
    // Gentle rim clicks and light hats
    addDrum(s + 4, 'hihat', 0.3);
    addDrum(s + 8, 'snare', 0.5);
    addDrum(s + 12, 'hihat', 0.3);
  }
  // Bars 84-87: The beat accelerates towards the wild party climax!
  for (let b = 84; b < 88; b++) {
    const s = b * 16;
    addDrum(s + 0, 'kick', 0.95);
    addDrum(s + 4, 'kick', 0.95);
    addDrum(s + 8, 'kick', 0.95);
    addDrum(s + 12, 'kick', 0.95);
    for (let i = 0; i < 16; i += 2) addDrum(s + i, 'snare', 0.6 + (b - 84) * 0.1);
  }

  // --- SECTION 9: OUTRO - WILD SPEED-UP PARTY DROP (Bars 88 - 119 / Steps 1408 - 1919) ---
  // "Ddon-ddon-ddon-ddon-ddon-ddon / Da ppeongyeora da ppeongyeora / BANG BANG BANG / Dwi dollyeora dwi dollyeora!"
  for (let b = 88; b < 120; b++) {
    const s = b * 16;
    // 4-on-the-floor stomping rave kick
    addDrum(s + 0, 'kick', 1.0);
    addDrum(s + 4, 'kick', 1.0);
    addDrum(s + 8, 'kick', 1.0);
    addDrum(s + 12, 'kick', 1.0);

    // Hard snare & claps on 4 and 12
    addDrum(s + 4, 'snare', 0.9);
    addDrum(s + 12, 'snare', 0.95);
    addDrum(s + 4, 'clap', 0.8);
    addDrum(s + 12, 'clap', 0.85);

    // Frantic 16th hats
    for (let h = 0; h < 16; h++) {
      addDrum(s + h, 'hihat', h % 2 === 0 ? 0.55 : 0.4);
    }
    // Off-beat open hats
    addDrum(s + 2, 'openhat', 0.4);
    addDrum(s + 6, 'openhat', 0.4);
    addDrum(s + 10, 'openhat', 0.4);
    addDrum(s + 14, 'openhat', 0.4);

    // Bassline for rave party
    addBass(s + 0, 'F2', 0.45, 'sawtooth', 0.38);
    addBass(s + 4, 'F2', 0.45, 'sawtooth', 0.38);
    addBass(s + 8, 'Ab2', 0.45, 'sawtooth', 0.38);
    addBass(s + 12, 'Bb2', 0.45, 'sawtooth', 0.38);

    // Rave synth party chant melody ("Ddon-ddon-ddon... Da ppeongyeora!")
    addLead(s + 0, 'F4', 0.25, 'sawtooth', 0.28);
    addLead(s + 2, 'F4', 0.25, 'sawtooth', 0.28);
    addLead(s + 4, 'Ab4', 0.25, 'sawtooth', 0.28);
    addLead(s + 6, 'F4', 0.25, 'sawtooth', 0.28);
    addLead(s + 8, 'C5', 0.3, 'sawtooth', 0.32);
    addLead(s + 10, 'Bb4', 0.25, 'sawtooth', 0.3);
    addLead(s + 12, 'Ab4', 0.3, 'sawtooth', 0.28);
    addLead(s + 14, 'F4', 0.3, 'sawtooth', 0.28);
  }

  // --- SECTION 10: FINAL HIT & DECAY TAIL (Bars 120 - 123 / Steps 1920 - 1983) ---
  const finalStep = 120 * 16; // 1920
  addDrum(finalStep, 'kick', 1.0);
  addDrum(finalStep, 'snare', 1.0);
  addDrum(finalStep, 'openhat', 0.8);
  addBass(finalStep, 'F2', 2.5, 'triangle', 0.45);
  addChord(finalStep, ['F3', 'Ab3', 'C4', 'F4'], 2.5);
  addLead(finalStep, 'C5', 2.0, 'sawtooth', 0.35);

  return {
    bpm: 135,
    totalSteps,
    leadNotes,
    bassNotes,
    chords,
    drums,
  };
}

function buildPatterns(): Record<string, SongPattern> {
  // 1. BEEN THROUGH (지나갈 테니) - EXO (112 BPM) - Acoustic Indie Pop / R&B
  const beenLead: NoteEvent[] = [
    { step: 0, note: 'F#4', duration: 0.6, type: 'sine', gain: 0.25 },
    { step: 3, note: 'F#4', duration: 0.4, type: 'sine', gain: 0.22 },
    { step: 6, note: 'F#4', duration: 0.6, type: 'sine', gain: 0.25 },
    { step: 9, note: 'E4', duration: 0.5, type: 'sine', gain: 0.22 },
    { step: 12, note: 'D4', duration: 0.8, type: 'sine', gain: 0.26 },
    { step: 15, note: 'F#4', duration: 0.35, type: 'triangle', gain: 0.2 },
    { step: 16, note: 'F#4', duration: 0.5, type: 'sine', gain: 0.24 },
    { step: 19, note: 'A4', duration: 0.6, type: 'sine', gain: 0.26 },
    { step: 22, note: 'F#4', duration: 0.5, type: 'sine', gain: 0.23 },
    { step: 25, note: 'E4', duration: 0.5, type: 'sine', gain: 0.22 },
    { step: 28, note: 'D4', duration: 0.8, type: 'sine', gain: 0.26 },
    { step: 31, note: 'E4', duration: 0.35, type: 'triangle', gain: 0.2 },
    { step: 32, note: 'B4', duration: 0.7, type: 'triangle', gain: 0.28 },
    { step: 35, note: 'A4', duration: 0.5, type: 'sine', gain: 0.24 },
    { step: 38, note: 'F#4', duration: 0.6, type: 'sine', gain: 0.24 },
    { step: 41, note: 'E4', duration: 0.5, type: 'sine', gain: 0.22 },
    { step: 44, note: 'D4', duration: 0.5, type: 'sine', gain: 0.22 },
    { step: 46, note: 'E4', duration: 0.6, type: 'sine', gain: 0.24 },
    { step: 48, note: 'B4', duration: 0.7, type: 'triangle', gain: 0.28 },
    { step: 51, note: 'A4', duration: 0.5, type: 'sine', gain: 0.24 },
    { step: 54, note: 'F#4', duration: 0.6, type: 'sine', gain: 0.24 },
    { step: 57, note: 'E4', duration: 0.5, type: 'sine', gain: 0.22 },
    { step: 59, note: 'D4', duration: 0.6, type: 'sine', gain: 0.24 },
    { step: 61, note: 'B3', duration: 0.9, type: 'sine', gain: 0.25 },
  ];

  const beenBass: NoteEvent[] = [
    { step: 0, note: 'B2', duration: 1.2, type: 'triangle', gain: 0.35 },
    { step: 6, note: 'B2', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 10, note: 'D3', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 14, note: 'F#2', duration: 0.6, type: 'triangle', gain: 0.3 },
    { step: 16, note: 'G2', duration: 1.2, type: 'triangle', gain: 0.35 },
    { step: 22, note: 'G2', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 26, note: 'B2', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 30, note: 'G2', duration: 0.6, type: 'triangle', gain: 0.3 },
    { step: 32, note: 'D2', duration: 1.2, type: 'triangle', gain: 0.35 },
    { step: 38, note: 'D2', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 42, note: 'F#2', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 46, note: 'D2', duration: 0.6, type: 'triangle', gain: 0.3 },
    { step: 48, note: 'A2', duration: 1.2, type: 'triangle', gain: 0.35 },
    { step: 54, note: 'A2', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 58, note: 'C#3', duration: 0.8, type: 'triangle', gain: 0.32 },
    { step: 62, note: 'A2', duration: 0.6, type: 'triangle', gain: 0.3 },
  ];

  const beenChords = [
    { step: 0, notes: ['B3', 'D4', 'F#4', 'A4'], duration: 1.8 },
    { step: 8, notes: ['D4', 'F#4', 'A4'], duration: 1.2 },
    { step: 16, notes: ['G3', 'B3', 'D4', 'F#4'], duration: 1.8 },
    { step: 24, notes: ['B3', 'D4', 'F#4'], duration: 1.2 },
    { step: 32, notes: ['D3', 'F#3', 'A3', 'D4'], duration: 1.8 },
    { step: 40, notes: ['F#3', 'A3', 'D4'], duration: 1.2 },
    { step: 48, notes: ['A3', 'C#4', 'E4', 'A4'], duration: 1.8 },
    { step: 56, notes: ['F#3', 'A3', 'C#4'], duration: 1.2 },
  ];

  const beenDrums: DrumEvent[] = [];
  for (let bar = 0; bar < 4; bar++) {
    const base = bar * 16;
    beenDrums.push({ step: base + 0, type: 'kick', velocity: 0.95 });
    beenDrums.push({ step: base + 6, type: 'kick', velocity: 0.75 });
    beenDrums.push({ step: base + 10, type: 'kick', velocity: 0.85 });
    beenDrums.push({ step: base + 4, type: 'snare', velocity: 0.8 });
    beenDrums.push({ step: base + 12, type: 'snare', velocity: 0.85 });
    for (let h = 0; h < 16; h += 2) {
      beenDrums.push({ step: base + h, type: 'hihat', velocity: h % 4 === 0 ? 0.45 : 0.3 });
    }
    beenDrums.push({ step: base + 14, type: 'openhat', velocity: 0.35 });
  }

  // 2. I'M THE BEST (128 BPM) - 2NE1 Electro-House Anthem
  const itbLead: NoteEvent[] = [
    // "Naega jeil jal naga!": F#4 - F#4 - E4 - F#4 - A4 - G#4 - E4 - F#4
    { step: 0, note: 'F#4', duration: 0.35, type: 'sawtooth', gain: 0.22 },
    { step: 2, note: 'F#4', duration: 0.35, type: 'sawtooth', gain: 0.22 },
    { step: 4, note: 'E4', duration: 0.35, type: 'sawtooth', gain: 0.2 },
    { step: 6, note: 'F#4', duration: 0.4, type: 'sawtooth', gain: 0.24 },
    { step: 8, note: 'A4', duration: 0.6, type: 'sawtooth', gain: 0.25 },
    { step: 11, note: 'G#4', duration: 0.4, type: 'sawtooth', gain: 0.22 },
    { step: 13, note: 'E4', duration: 0.4, type: 'sawtooth', gain: 0.2 },
    { step: 14, note: 'F#4', duration: 0.7, type: 'sawtooth', gain: 0.25 },

    // Bar 2
    { step: 16, note: 'F#4', duration: 0.35, type: 'sawtooth', gain: 0.22 },
    { step: 18, note: 'F#4', duration: 0.35, type: 'sawtooth', gain: 0.22 },
    { step: 20, note: 'E4', duration: 0.35, type: 'sawtooth', gain: 0.2 },
    { step: 22, note: 'F#4', duration: 0.4, type: 'sawtooth', gain: 0.24 },
    { step: 24, note: 'C#5', duration: 0.7, type: 'sawtooth', gain: 0.28 },
    { step: 28, note: 'B4', duration: 0.5, type: 'sawtooth', gain: 0.24 },
    { step: 30, note: 'A4', duration: 0.4, type: 'sawtooth', gain: 0.22 },

    // Bar 3 - Electro Synth Riff
    { step: 32, note: 'F#4', duration: 0.3, type: 'square', gain: 0.22 },
    { step: 34, note: 'A4', duration: 0.3, type: 'square', gain: 0.22 },
    { step: 36, note: 'C#5', duration: 0.4, type: 'square', gain: 0.25 },
    { step: 38, note: 'E5', duration: 0.4, type: 'square', gain: 0.25 },
    { step: 40, note: 'C#5', duration: 0.4, type: 'square', gain: 0.23 },
    { step: 42, note: 'A4', duration: 0.4, type: 'square', gain: 0.22 },
    { step: 44, note: 'F#4', duration: 0.6, type: 'square', gain: 0.24 },

    // Bar 4 - Staccato Accent
    { step: 48, note: 'F#4', duration: 0.2, type: 'sawtooth', gain: 0.25 },
    { step: 50, note: 'F#4', duration: 0.2, type: 'sawtooth', gain: 0.25 },
    { step: 52, note: 'G#4', duration: 0.2, type: 'sawtooth', gain: 0.25 },
    { step: 54, note: 'A4', duration: 0.3, type: 'sawtooth', gain: 0.26 },
    { step: 56, note: 'B4', duration: 0.3, type: 'sawtooth', gain: 0.26 },
    { step: 58, note: 'C#5', duration: 0.7, type: 'sawtooth', gain: 0.28 },
  ];

  const itbBass: NoteEvent[] = [
    // Punchy 4-on-the-floor electro bass
    { step: 0, note: 'F#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 4, note: 'F#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 8, note: 'F#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 12, note: 'E2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 16, note: 'D2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 20, note: 'D2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 24, note: 'E2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 28, note: 'C#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 32, note: 'F#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 36, note: 'F#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 40, note: 'A2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 44, note: 'B2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 48, note: 'C#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 52, note: 'C#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 56, note: 'E2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
    { step: 60, note: 'F#2', duration: 0.8, type: 'sawtooth', gain: 0.32 },
  ];

  const itbDrums: DrumEvent[] = [];
  // 4-on-the-floor electro-house beat
  for (let bar = 0; bar < 4; bar++) {
    const base = bar * 16;
    for (let b = 0; b < 16; b += 4) {
      itbDrums.push({ step: base + b, type: 'kick', velocity: 1.0 });
    }
    itbDrums.push({ step: base + 4, type: 'clap', velocity: 0.9 });
    itbDrums.push({ step: base + 12, type: 'clap', velocity: 0.9 });
    // Off-beat open hi-hat
    for (let b = 2; b < 16; b += 4) {
      itbDrums.push({ step: base + b, type: 'openhat', velocity: 0.6 });
    }
    // Closed hi-hats
    for (let b = 0; b < 16; b += 2) {
      itbDrums.push({ step: base + b, type: 'hihat', velocity: 0.4 });
    }
  }

  // 3. BOOMBAYAH (125 BPM) - BLACKPINK Dancehall / Trap
  const boomLead: NoteEvent[] = [
    // Horn / Siren hook: A4 - G4 - E4 - G4 - A4 - C5 - A4
    { step: 0, note: 'A4', duration: 0.5, type: 'sawtooth', gain: 0.24 },
    { step: 3, note: 'G4', duration: 0.3, type: 'sawtooth', gain: 0.2 },
    { step: 5, note: 'E4', duration: 0.4, type: 'sawtooth', gain: 0.2 },
    { step: 8, note: 'G4', duration: 0.4, type: 'sawtooth', gain: 0.22 },
    { step: 10, note: 'A4', duration: 0.6, type: 'sawtooth', gain: 0.25 },
    { step: 13, note: 'C5', duration: 0.5, type: 'sawtooth', gain: 0.26 },
    { step: 15, note: 'A4', duration: 0.7, type: 'sawtooth', gain: 0.24 },

    // Bar 2
    { step: 16, note: 'A4', duration: 0.5, type: 'sawtooth', gain: 0.24 },
    { step: 19, note: 'G4', duration: 0.3, type: 'sawtooth', gain: 0.2 },
    { step: 21, note: 'E4', duration: 0.4, type: 'sawtooth', gain: 0.2 },
    { step: 24, note: 'G4', duration: 0.4, type: 'sawtooth', gain: 0.22 },
    { step: 26, note: 'D5', duration: 0.6, type: 'sawtooth', gain: 0.27 },
    { step: 29, note: 'C5', duration: 0.4, type: 'sawtooth', gain: 0.24 },
    { step: 31, note: 'A4', duration: 0.6, type: 'sawtooth', gain: 0.24 },

    // Bar 3 - "Boombayah! Yah yah yah!"
    { step: 32, note: 'E5', duration: 0.3, type: 'square', gain: 0.24 },
    { step: 34, note: 'D5', duration: 0.3, type: 'square', gain: 0.22 },
    { step: 36, note: 'C5', duration: 0.3, type: 'square', gain: 0.22 },
    { step: 38, note: 'A4', duration: 0.5, type: 'square', gain: 0.24 },
    { step: 42, note: 'A4', duration: 0.25, type: 'square', gain: 0.22 },
    { step: 44, note: 'A4', duration: 0.25, type: 'square', gain: 0.22 },
    { step: 46, note: 'C5', duration: 0.5, type: 'square', gain: 0.25 },

    // Bar 4
    { step: 48, note: 'D5', duration: 0.35, type: 'sawtooth', gain: 0.25 },
    { step: 51, note: 'C5', duration: 0.35, type: 'sawtooth', gain: 0.23 },
    { step: 54, note: 'A4', duration: 0.6, type: 'sawtooth', gain: 0.25 },
    { step: 58, note: 'G4', duration: 0.4, type: 'sawtooth', gain: 0.2 },
    { step: 60, note: 'A4', duration: 0.8, type: 'sawtooth', gain: 0.26 },
  ];

  const boomBass: NoteEvent[] = [
    { step: 0, note: 'A2', duration: 1.0, type: 'triangle', gain: 0.35 },
    { step: 6, note: 'A2', duration: 0.8, type: 'triangle', gain: 0.35 },
    { step: 10, note: 'C3', duration: 0.8, type: 'triangle', gain: 0.35 },
    { step: 14, note: 'D3', duration: 0.8, type: 'triangle', gain: 0.35 },
    { step: 16, note: 'F2', duration: 1.0, type: 'triangle', gain: 0.35 },
    { step: 22, note: 'F2', duration: 0.8, type: 'triangle', gain: 0.35 },
    { step: 26, note: 'G2', duration: 0.8, type: 'triangle', gain: 0.35 },
    { step: 30, note: 'E2', duration: 0.8, type: 'triangle', gain: 0.35 },
    { step: 32, note: 'A2', duration: 1.2, type: 'triangle', gain: 0.35 },
    { step: 40, note: 'G2', duration: 1.0, type: 'triangle', gain: 0.35 },
    { step: 48, note: 'F2', duration: 1.0, type: 'triangle', gain: 0.35 },
    { step: 56, note: 'E2', duration: 1.2, type: 'triangle', gain: 0.35 },
  ];

  const boomDrums: DrumEvent[] = [];
  // Dancehall riddim
  for (let bar = 0; bar < 4; bar++) {
    const base = bar * 16;
    boomDrums.push({ step: base + 0, type: 'kick', velocity: 1.0 });
    boomDrums.push({ step: base + 6, type: 'snare', velocity: 0.85 });
    boomDrums.push({ step: base + 10, type: 'kick', velocity: 0.9 });
    boomDrums.push({ step: base + 12, type: 'snare', velocity: 0.95 });
    for (let h = 0; h < 16; h += 2) {
      boomDrums.push({ step: base + h, type: 'hihat', velocity: 0.45 });
    }
  }

  const boomChords = [
    // Bar 1: Am (A3, C4, E4)
    { step: 0, notes: ['A3', 'C4', 'E4'], duration: 1.2 },
    { step: 8, notes: ['A3', 'C4', 'E4'], duration: 1.2 },
    // Bar 2: F (F3, A3, C4) & G (G3, B3, D4)
    { step: 16, notes: ['F3', 'A3', 'C4'], duration: 1.2 },
    { step: 24, notes: ['G3', 'B3', 'D4'], duration: 1.2 },
    // Bar 3: Am / G
    { step: 32, notes: ['A3', 'C4', 'E4'], duration: 1.2 },
    { step: 40, notes: ['G3', 'B3', 'D4'], duration: 1.2 },
    // Bar 4: F -> E
    { step: 48, notes: ['F3', 'A3', 'C4'], duration: 1.2 },
    { step: 56, notes: ['E3', 'G#3', 'B3'], duration: 1.2 },
  ];

  // 4. SUPER (138 BPM) - SEVENTEEN Drill & Martial Arts Trap
  const superLead: NoteEvent[] = [
    // "Darumdarimda!": D4 - F4 - G4 - A4 - C5 - A4 - G4 - F4 - D4
    { step: 0, note: 'D4', duration: 0.3, type: 'sawtooth', gain: 0.24 },
    { step: 2, note: 'F4', duration: 0.3, type: 'sawtooth', gain: 0.24 },
    { step: 4, note: 'G4', duration: 0.35, type: 'sawtooth', gain: 0.25 },
    { step: 6, note: 'A4', duration: 0.4, type: 'sawtooth', gain: 0.26 },
    { step: 8, note: 'C5', duration: 0.6, type: 'sawtooth', gain: 0.28 },
    { step: 11, note: 'A4', duration: 0.35, type: 'sawtooth', gain: 0.24 },
    { step: 13, note: 'G4', duration: 0.3, type: 'sawtooth', gain: 0.22 },
    { step: 15, note: 'F4', duration: 0.3, type: 'sawtooth', gain: 0.2 },

    // Bar 2
    { step: 16, note: 'D4', duration: 0.4, type: 'sawtooth', gain: 0.24 },
    { step: 18, note: 'D4', duration: 0.3, type: 'sawtooth', gain: 0.22 },
    { step: 20, note: 'F4', duration: 0.3, type: 'sawtooth', gain: 0.24 },
    { step: 22, note: 'G4', duration: 0.35, type: 'sawtooth', gain: 0.25 },
    { step: 24, note: 'D5', duration: 0.7, type: 'sawtooth', gain: 0.29 },
    { step: 28, note: 'C5', duration: 0.4, type: 'sawtooth', gain: 0.24 },
    { step: 30, note: 'A4', duration: 0.5, type: 'sawtooth', gain: 0.24 },

    // Bar 3 - High speed chant synth
    { step: 32, note: 'A4', duration: 0.25, type: 'square', gain: 0.23 },
    { step: 34, note: 'A4', duration: 0.25, type: 'square', gain: 0.23 },
    { step: 36, note: 'C5', duration: 0.35, type: 'square', gain: 0.25 },
    { step: 38, note: 'D5', duration: 0.5, type: 'square', gain: 0.27 },
    { step: 41, note: 'C5', duration: 0.3, type: 'square', gain: 0.23 },
    { step: 43, note: 'A4', duration: 0.3, type: 'square', gain: 0.22 },
    { step: 45, note: 'G4', duration: 0.4, type: 'square', gain: 0.2 },

    // Bar 4 - Epic resolution
    { step: 48, note: 'F4', duration: 0.3, type: 'sawtooth', gain: 0.23 },
    { step: 50, note: 'G4', duration: 0.3, type: 'sawtooth', gain: 0.24 },
    { step: 52, note: 'A4', duration: 0.4, type: 'sawtooth', gain: 0.25 },
    { step: 54, note: 'C5', duration: 0.4, type: 'sawtooth', gain: 0.27 },
    { step: 56, note: 'D5', duration: 0.9, type: 'sawtooth', gain: 0.3 },
  ];

  const superBass: NoteEvent[] = [
    { step: 0, note: 'D2', duration: 1.2, type: 'sawtooth', gain: 0.35 },
    { step: 8, note: 'D2', duration: 0.8, type: 'sawtooth', gain: 0.35 },
    { step: 12, note: 'F2', duration: 0.8, type: 'sawtooth', gain: 0.35 },
    { step: 16, note: 'Bb2', duration: 1.2, type: 'sawtooth', gain: 0.35 },
    { step: 24, note: 'C3', duration: 0.8, type: 'sawtooth', gain: 0.35 },
    { step: 28, note: 'A2', duration: 0.8, type: 'sawtooth', gain: 0.35 },
    { step: 32, note: 'G2', duration: 1.0, type: 'sawtooth', gain: 0.35 },
    { step: 40, note: 'A2', duration: 1.0, type: 'sawtooth', gain: 0.35 },
    { step: 48, note: 'D2', duration: 1.5, type: 'sawtooth', gain: 0.38 },
  ];

  const superDrums: DrumEvent[] = [];
  for (let bar = 0; bar < 4; bar++) {
    const base = bar * 16;
    superDrums.push({ step: base + 0, type: 'kick', velocity: 1.0 });
    superDrums.push({ step: base + 8, type: 'snare', velocity: 0.95 });
    superDrums.push({ step: base + 11, type: 'kick', velocity: 0.85 });
    if (bar === 1 || bar === 3) {
      superDrums.push({ step: base + 14, type: 'kick', velocity: 0.8 });
    }
    // Drill hi-hat rolls
    for (let h = 0; h < 16; h++) {
      superDrums.push({ step: base + h, type: 'hihat', velocity: h % 2 === 0 ? 0.5 : 0.3 });
    }
  }

  // 5. KO KO BOP (146 BPM) - EXO Reggae-Pop / Tropical Bop
  const kokoLead: NoteEvent[] = [
    // Sunny whistle & vocal hook: G#4 - B4 - C#5 - B4 - G#4 - F#4 - E4
    { step: 0, note: 'G#4', duration: 0.4, type: 'sine', gain: 0.25 },
    { step: 3, note: 'B4', duration: 0.4, type: 'sine', gain: 0.26 },
    { step: 6, note: 'C#5', duration: 0.6, type: 'sine', gain: 0.28 },
    { step: 10, note: 'B4', duration: 0.4, type: 'sine', gain: 0.24 },
    { step: 12, note: 'G#4', duration: 0.4, type: 'sine', gain: 0.22 },
    { step: 14, note: 'F#4', duration: 0.4, type: 'sine', gain: 0.2 },

    // Bar 2: "Shimmy shimmy Ko Ko Bop!"
    { step: 16, note: 'E4', duration: 0.6, type: 'triangle', gain: 0.24 },
    { step: 20, note: 'E4', duration: 0.3, type: 'triangle', gain: 0.22 },
    { step: 22, note: 'F#4', duration: 0.3, type: 'triangle', gain: 0.22 },
    { step: 24, note: 'G#4', duration: 0.5, type: 'triangle', gain: 0.25 },
    { step: 28, note: 'B4', duration: 0.6, type: 'triangle', gain: 0.26 },

    // Bar 3
    { step: 32, note: 'C#5', duration: 0.4, type: 'sine', gain: 0.28 },
    { step: 35, note: 'E5', duration: 0.5, type: 'sine', gain: 0.29 },
    { step: 38, note: 'D#5', duration: 0.4, type: 'sine', gain: 0.26 },
    { step: 41, note: 'C#5', duration: 0.5, type: 'sine', gain: 0.26 },
    { step: 44, note: 'B4', duration: 0.4, type: 'sine', gain: 0.24 },
    { step: 46, note: 'G#4', duration: 0.4, type: 'sine', gain: 0.22 },

    // Bar 4
    { step: 48, note: 'A4', duration: 0.4, type: 'triangle', gain: 0.23 },
    { step: 51, note: 'G#4', duration: 0.4, type: 'triangle', gain: 0.23 },
    { step: 54, note: 'F#4', duration: 0.5, type: 'triangle', gain: 0.22 },
    { step: 58, note: 'E4', duration: 0.9, type: 'triangle', gain: 0.25 },
  ];

  const kokoBass: NoteEvent[] = [
    // Bouncy reggae bass
    { step: 2, note: 'C#2', duration: 0.7, type: 'triangle', gain: 0.35 },
    { step: 6, note: 'C#2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 10, note: 'E2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 14, note: 'G#2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 18, note: 'B2', duration: 0.7, type: 'triangle', gain: 0.35 },
    { step: 22, note: 'B2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 26, note: 'F#2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 30, note: 'G#2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 34, note: 'A2', duration: 0.7, type: 'triangle', gain: 0.35 },
    { step: 38, note: 'A2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 42, note: 'E2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 46, note: 'G#2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 50, note: 'G#2', duration: 0.7, type: 'triangle', gain: 0.35 },
    { step: 54, note: 'B2', duration: 0.6, type: 'triangle', gain: 0.35 },
    { step: 58, note: 'C#2', duration: 0.8, type: 'triangle', gain: 0.35 },
  ];

  const kokoChords = [
    // Reggae skank chords on off-beats
    { step: 4, notes: ['C#4', 'E4', 'G#4'], duration: 0.3 },
    { step: 12, notes: ['C#4', 'E4', 'G#4'], duration: 0.3 },
    { step: 20, notes: ['B3', 'D#4', 'F#4'], duration: 0.3 },
    { step: 28, notes: ['B3', 'D#4', 'F#4'], duration: 0.3 },
    { step: 36, notes: ['A3', 'C#4', 'E4'], duration: 0.3 },
    { step: 44, notes: ['A3', 'C#4', 'E4'], duration: 0.3 },
    { step: 52, notes: ['G#3', 'B3', 'D#4'], duration: 0.3 },
    { step: 60, notes: ['G#3', 'B3', 'D#4'], duration: 0.3 },
  ];

  const kokoDrums: DrumEvent[] = [];
  for (let bar = 0; bar < 4; bar++) {
    const base = bar * 16;
    kokoDrums.push({ step: base + 0, type: 'kick', velocity: 0.9 });
    kokoDrums.push({ step: base + 8, type: 'snare', velocity: 0.85 });
    kokoDrums.push({ step: base + 12, type: 'snare', velocity: 0.75 });
    // Reggae rim / hats
    for (let h = 0; h < 16; h += 2) {
      kokoDrums.push({ step: base + h, type: 'hihat', velocity: 0.4 });
    }
  }

  return {
    'bang-bang-bang': buildBangBangBangFull(),
    'been-through': {
      bpm: 112,
      leadNotes: beenLead,
      bassNotes: beenBass,
      chords: beenChords,
      drums: beenDrums,
    },
    'boombayah': {
      bpm: 125,
      leadNotes: boomLead,
      bassNotes: boomBass,
      chords: boomChords,
      drums: boomDrums,
    },
    'im-the-best': {
      bpm: 128,
      leadNotes: itbLead,
      bassNotes: itbBass,
      chords: [],
      drums: itbDrums,
    },
    'super': {
      bpm: 138,
      leadNotes: superLead,
      bassNotes: superBass,
      chords: [],
      drums: superDrums,
    },
    'ko-ko-bop': {
      bpm: 146,
      leadNotes: kokoLead,
      bassNotes: kokoBass,
      chords: kokoChords,
      drums: kokoDrums,
    },
  };
}

class KpopMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentTrackIndex: number = 0; // Starts with 짧은 치마 (Miniskirt) - AOA (index 0)
  private volume: number = 0.75;
  private isMuted: boolean = false;
  private repeatMode: RepeatMode = 'one'; // Default to repeating AOA - Miniskirt continuously when finished
  private timerId: any = null;
  private trackStartTime: number = 0;
  private currentStep: number = 0;
  private patterns: Record<string, SongPattern>;
  private listeners: Set<() => void> = new Set();
  private elapsedSeconds: number = 0;
  private progressTimerId: any = null;

  constructor() {
    this.patterns = buildPatterns();
  }

  private initAudio() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private initAudioElement() {
    if (!this.audioEl && typeof window !== 'undefined') {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';

      this.audioEl.addEventListener('timeupdate', () => {
        if (this.audioEl && !isNaN(this.audioEl.currentTime)) {
          this.elapsedSeconds = this.audioEl.currentTime;
          this.notify();
        }
      });

      this.audioEl.addEventListener('loadedmetadata', () => {
        if (this.audioEl && !isNaN(this.audioEl.duration) && this.audioEl.duration > 0) {
          const track = this.getTrack();
          track.durationSeconds = Math.round(this.audioEl.duration);
          this.notify();
        }
      });

      this.audioEl.addEventListener('ended', () => {
        if (this.repeatMode === 'one') {
          if (this.audioEl) {
            this.audioEl.currentTime = 0;
            this.audioEl.play().catch(() => {});
          }
        } else if (this.repeatMode === 'all') {
          this.nextTrack();
        } else {
          this.pause();
        }
      });

      this.audioEl.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify();
      });

      this.audioEl.addEventListener('pause', () => {
        if (!this.timerId) {
          this.isPlaying = false;
          this.notify();
        }
      });
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getTrack(): TrackInfo {
    return KPOP_PLAYLIST[this.currentTrackIndex] || KPOP_PLAYLIST[0];
  }

  public getPlaylist(): TrackInfo[] {
    return KPOP_PLAYLIST;
  }

  public getTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getElapsed(): number {
    return Math.floor(this.elapsedSeconds);
  }

  public getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  public setRepeatMode(mode: RepeatMode) {
    this.repeatMode = mode;
    if (this.audioEl) {
      this.audioEl.loop = (this.repeatMode === 'one');
    }
    this.notify();
  }

  public toggleRepeatMode() {
    if (this.repeatMode === 'one') {
      this.repeatMode = 'all';
    } else if (this.repeatMode === 'all') {
      this.repeatMode = 'off';
    } else {
      this.repeatMode = 'one';
    }
    if (this.audioEl) {
      this.audioEl.loop = (this.repeatMode === 'one');
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    this.notify();
  }

  public playTrackByIndex(index: number) {
    const validIdx = (index + KPOP_PLAYLIST.length) % KPOP_PLAYLIST.length;
    this.currentTrackIndex = validIdx;
    this.elapsedSeconds = 0;
    this.currentStep = 0;

    const track = this.getTrack();
    this.initAudioElement();

    if (track.audioSrc && this.audioEl) {
      this.stopSequencer();
      this.audioEl.src = track.audioSrc;
      this.audioEl.currentTime = 0;
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
      this.audioEl.loop = (this.repeatMode === 'one');
      this.isPlaying = true;
      this.audioEl.play().catch((err) => {
        console.warn('Audio play error, falling back to synth sequencer:', err);
        this.startSequencer();
      });
    } else {
      if (this.audioEl) {
        this.audioEl.pause();
      }
      this.stopSequencer();
      this.startSequencer();
    }
    this.notify();
  }

  public play() {
    if (this.isPlaying) return;
    this.initAudioElement();
    const track = this.getTrack();

    if (track.audioSrc && this.audioEl) {
      if (!this.audioEl.src || (!this.audioEl.src.endsWith(track.audioSrc) && !this.audioEl.src.includes(track.audioSrc))) {
        this.audioEl.src = track.audioSrc;
        this.audioEl.currentTime = this.elapsedSeconds;
      }
      this.audioEl.volume = this.isMuted ? 0 : this.volume;
      this.audioEl.loop = (this.repeatMode === 'one');
      this.isPlaying = true;
      this.audioEl.play().catch((err) => {
        console.warn('Audio play error, falling back to synth:', err);
        this.startSequencer();
      });
      this.notify();
    } else {
      this.initAudio();
      this.startSequencer();
      this.notify();
    }
  }

  public pause() {
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.stopSequencer();
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % KPOP_PLAYLIST.length;
    this.playTrackByIndex(nextIdx);
  }

  public prevTrack() {
    const prevIdx = (this.currentTrackIndex - 1 + KPOP_PLAYLIST.length) % KPOP_PLAYLIST.length;
    this.playTrackByIndex(prevIdx);
  }

  public seekTo(seconds: number) {
    const currentTrack = this.getTrack();
    this.elapsedSeconds = Math.max(0, Math.min(currentTrack.durationSeconds, seconds));
    if (currentTrack.audioSrc && this.audioEl) {
      this.audioEl.currentTime = this.elapsedSeconds;
    } else {
      const pattern = this.patterns[currentTrack.id] || this.patterns['bang-bang-bang'];
      const totalSteps = pattern.totalSteps || 64;
      const stepDuration = (60 / pattern.bpm) / 4;
      this.currentStep = Math.floor(this.elapsedSeconds / stepDuration) % totalSteps;
    }
    this.notify();
  }

  public autoStartOnInteraction() {
    if (typeof window === 'undefined') return;
    if (this.isPlaying) return;

    const startAudio = () => {
      this.play();
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('pointerdown', startAudio, { once: true });
    window.addEventListener('click', startAudio, { once: true });
    window.addEventListener('touchstart', startAudio, { once: true });
    window.addEventListener('keydown', startAudio, { once: true });
  }

  private startSequencer() {
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    const track = this.getTrack();
    const pattern = this.patterns[track.id] || this.patterns['bang-bang-bang'];
    const stepDuration = (60 / pattern.bpm) / 4; // 16th note in seconds
    const totalSteps = pattern.totalSteps || 64;

    // Accurate lookahead scheduler
    let nextNoteTime = this.ctx.currentTime + 0.05;
    const scheduleAheadTime = 0.2; // seconds

    const schedule = () => {
      if (!this.isPlaying || !this.ctx) return;

      while (nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        this.scheduleStep(pattern, this.currentStep, nextNoteTime);
        nextNoteTime += stepDuration;
        this.currentStep = (this.currentStep + 1) % totalSteps;
      }

      this.timerId = setTimeout(schedule, 40);
    };

    schedule();

    // Progress counter and auto-advance / auto-replay check
    clearInterval(this.progressTimerId);
    this.progressTimerId = setInterval(() => {
      if (this.isPlaying) {
        this.elapsedSeconds += 1;
        const currentTrack = this.getTrack();
        if (this.elapsedSeconds >= currentTrack.durationSeconds) {
          if (this.repeatMode === 'one') {
            // Replay same song from beginning automatically!
            this.elapsedSeconds = 0;
            this.currentStep = 0;
            this.notify();
          } else if (this.repeatMode === 'all') {
            // Auto-advance to next song
            this.nextTrack();
          } else {
            this.pause();
          }
        } else {
          this.notify();
        }
      }
    }, 1000);
  }

  private stopSequencer() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.progressTimerId) {
      clearInterval(this.progressTimerId);
      this.progressTimerId = null;
    }
  }

  private scheduleStep(pattern: SongPattern, step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // 1. Play Lead
    const leads = pattern.leadNotes.filter((n) => n.step === step);
    leads.forEach((l) => {
      this.playSynthNote(l.note, time, l.duration * (60 / pattern.bpm), l.type || 'sawtooth', l.gain || 0.2);
    });

    // 2. Play Bass
    const basses = pattern.bassNotes.filter((n) => n.step === step);
    basses.forEach((b) => {
      this.playBassNote(b.note, time, b.duration * (60 / pattern.bpm), b.type || 'sawtooth', b.gain || 0.32);
    });

    // 3. Play Chords
    if (pattern.chords) {
      const chords = pattern.chords.filter((c) => c.step === step);
      chords.forEach((c) => {
        c.notes.forEach((note) => {
          this.playSynthNote(note, time, c.duration * (60 / pattern.bpm), 'triangle', 0.12);
        });
      });
    }

    // 4. Play Drums
    const drums = pattern.drums.filter((d) => d.step === step);
    drums.forEach((d) => {
      if (d.type === 'kick') this.playKick(time, d.velocity || 1.0);
      else if (d.type === 'snare') this.playSnare(time, d.velocity || 0.9);
      else if (d.type === 'clap') this.playClap(time, d.velocity || 0.9);
      else if (d.type === 'hihat') this.playHiHat(time, d.velocity || 0.5);
      else if (d.type === 'openhat') this.playOpenHat(time, d.velocity || 0.5);
    });
  }

  private playSynthNote(note: string, time: number, duration: number, type: OscillatorType, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQS[note];
    if (!freq) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    // Warm punch envelope
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playBassNote(note: string, time: number, duration: number, type: OscillatorType, gainVal: number) {
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQS[note];
    if (!freq) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainVal, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playKick(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // 808 pitch dive: 150Hz -> 45Hz
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

    gain.gain.setValueAtTime(0.45 * velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  private playSnare(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(90, time + 0.1);
    oscGain.gain.setValueAtTime(0.25 * velocity, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.12);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28 * velocity, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.18);
  }

  private playClap(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    // Multi-tap noise burst
    [0, 0.015, 0.03].forEach((offset) => {
      const bufferSize = this.ctx!.sampleRate * 0.15;
      const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx!.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, time + offset);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.25 * velocity, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      noise.start(time + offset);
      noise.stop(time + offset + 0.12);
    });
  }

  private playHiHat(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private playOpenHat(time: number, velocity: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15 * velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.22);
  }
}

export const kpopMusic = new KpopMusicEngine();
