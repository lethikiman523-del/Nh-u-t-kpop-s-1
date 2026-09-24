export interface Idol {
  id: string;
  name: string;
  stageName: string;
  realName?: string;
  gender: 'male' | 'female';
  type: 'idol' | 'producer';
  originalGroup: string;
  price: number; // in KRW (Won)
  roles: string[];
  stats: {
    vocal: number;
    dance: number;
    rap: number;
    visual: number;
    charisma: number;
    production: number;
  };
  perk: string;
  quote: string;
  image: string;
  fallbackGradient: string;
}

export interface GroupDetails {
  groupName: string;
  concept: string;
  debutSong: string;
  fandomName: string;
  motto: string;
  roleAssignments: Record<string, string>; // idolId -> assigned role title
}

export interface Player {
  id: string;
  seatNumber: number; // 1 to 5
  name: string;
  agencyName: string;
  avatar: string;
  image?: string; // High-resolution portrait photograph
  secretPin: string; // 4-digit code for phone access (e.g. 1081)
  anonymousCodename: string; // e.g. "Nhà Đầu Tư Bí Ẩn #1 (Phượng Hoàng)"
  anonymousBadge: string; // e.g. "🦅"
  anonymousMask: string; // e.g. "Mặt Nạ Hoàng Kim"
  balance: number; // Starting with 1,000,000,000 KRW
  idols: Idol[];
  isReady: boolean;
  groupDetails?: GroupDetails;
  isHost?: boolean;
}

export interface ActivityEvent {
  id: string;
  timestamp: number;
  seatNumber: number;
  anonymousActor: string;
  realActor: string;
  actionType: 'BUY' | 'SELL' | 'GROUP_SUBMIT' | 'CLAIM';
  details: string;
  amount?: number;
}

export interface VoteRecord {
  id: string;
  voterName: string;
  voterId: string;
  playerId: string;
  groupName: string;
  timestamp: number;
  comment?: string;
  lightstickColor?: string;
}

export interface AudienceReaction {
  id: string;
  emoji: string;
  sender: string;
  groupName?: string;
  timestamp: number;
}

export type GamePhase = 
  | 'LOBBY' 
  | 'MARKET' 
  | 'GROUP_CREATION' 
  | 'DEBUT_SHOWCASE' 
  | 'VOTING' 
  | 'CEREMONY';

export interface RoomState {
  roomId: string;
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  votes: Record<string, number>; // playerId -> count
  voteRecords: VoteRecord[];
  audienceReactions: AudienceReaction[];
  recentActivities: ActivityEvent[];
  isAnonymousMode: boolean; // Hide real identity from audience to ensure 100% fair voting
  revealIdentities: boolean; // Triggered at the end of Ceremony for dramatic reveal
  votingOpen: boolean;
  activeShowcasePlayerId?: string;
  votingTimer?: number;
  winnerPlayerId?: string;
  shuffledVotingOrder?: string[];
}

export interface WsMessage {
  type: 
    | 'SYNC_STATE'
    | 'JOIN_ROOM'
    | 'CLAIM_SEAT'
    | 'LEAVE_SEAT'
    | 'BUY_IDOL'
    | 'SELL_IDOL'
    | 'SUBMIT_GROUP'
    | 'SET_READY'
    | 'CHANGE_PHASE'
    | 'SET_SHOWCASE_PLAYER'
    | 'CAST_VOTE'
    | 'SEND_REACTION'
    | 'TOGGLE_ANONYMOUS_MODE'
    | 'REVEAL_IDENTITIES'
    | 'SHUFFLE_VOTING_ORDER'
    | 'RESET_GAME'
    | 'DEMO_FILL_SAMPLE_DATA'
    | 'ERROR';
  payload?: any;
}
