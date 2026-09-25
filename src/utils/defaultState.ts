import { RoomState, Player } from '../types';
import { DEFAULT_PLAYER_SEATS, TOTAL_BUDGET } from '../data/idols';

export function createDefaultPlayers(): Player[] {
  return DEFAULT_PLAYER_SEATS.map((seat) => ({
    id: `player-${seat.seatNumber}`,
    seatNumber: seat.seatNumber,
    name: seat.name,
    agencyName: seat.agencyName,
    avatar: seat.avatar,
    image: seat.image,
    secretPin: seat.secretPin,
    anonymousCodename: seat.anonymousCodename,
    anonymousBadge: seat.anonymousBadge,
    anonymousMask: seat.anonymousMask,
    balance: TOTAL_BUDGET,
    idols: [],
    isReady: false,
    isHost: seat.seatNumber === 1,
  }));
}

export function createDefaultRoomState(roomId: string = 'KPOP1'): RoomState {
  const normalizedId = roomId.trim().toUpperCase() || 'KPOP1';
  return {
    roomId: normalizedId,
    roomCode: normalizedId,
    phase: 'LOBBY',
    players: createDefaultPlayers(),
    votes: {
      'player-1': 0,
      'player-2': 0,
      'player-3': 0,
      'player-4': 0,
      'player-5': 0,
    },
    voteRecords: [],
    audienceReactions: [],
    recentActivities: [],
    isAnonymousMode: false,
    revealIdentities: true,
    votingOpen: false,
    activeShowcasePlayerId: 'player-1',
  };
}
