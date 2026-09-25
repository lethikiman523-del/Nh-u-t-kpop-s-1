import { RoomState, Player, WsMessage, VoteRecord, GamePhase, ActivityEvent, AudienceReaction } from '../types';
import { DEFAULT_PLAYER_SEATS, TOTAL_BUDGET, IDOL_ROSTER } from '../data/idols';

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

export function pushActivity(room: RoomState, activity: ActivityEvent) {
  if (!room.recentActivities) room.recentActivities = [];
  room.recentActivities.unshift(activity);
  if (room.recentActivities.length > 50) {
    room.recentActivities = room.recentActivities.slice(0, 50);
  }
}

export function mergeRoomStates(existing: RoomState | null, incoming: RoomState | null): RoomState {
  if (!incoming && existing) return existing;
  if (!existing && incoming) return incoming;
  if (!existing && !incoming) return createDefaultRoomState('KPOP1');

  const ex = existing as RoomState;
  const inc = incoming as RoomState;

  // Merge activities (de-duplicate by ID)
  const activityMap = new Map<string, ActivityEvent>();
  (ex.recentActivities || []).forEach((a) => activityMap.set(a.id, a));
  (inc.recentActivities || []).forEach((a) => activityMap.set(a.id, a));
  const mergedActivities = Array.from(activityMap.values()).sort((a, b) => b.timestamp - a.timestamp);

  // Merge players (keep whichever player has more idols or updated groupDetails)
  const mergedPlayers = ex.players.map((exPlayer) => {
    const incPlayer = inc.players.find((p) => p.id === exPlayer.id);
    if (!incPlayer) return exPlayer;

    const useIncIdols = (incPlayer.idols || []).length >= (exPlayer.idols || []).length;
    return {
      ...exPlayer,
      ...incPlayer,
      name: incPlayer.name !== `Nhà đầu tư ${exPlayer.seatNumber}` ? incPlayer.name : exPlayer.name,
      agencyName: incPlayer.agencyName !== `Agency ${exPlayer.seatNumber}` ? incPlayer.agencyName : exPlayer.agencyName,
      avatar: incPlayer.avatar || exPlayer.avatar,
      idols: useIncIdols ? (incPlayer.idols || []) : (exPlayer.idols || []),
      balance: useIncIdols ? incPlayer.balance : exPlayer.balance,
      groupDetails: incPlayer.groupDetails || exPlayer.groupDetails,
      isReady: incPlayer.isReady || exPlayer.isReady,
    };
  });

  // Merge votes & reactions
  const votes = { ...ex.votes, ...inc.votes };
  const reactionMap = new Map<string, AudienceReaction>();
  (ex.audienceReactions || []).forEach((r) => reactionMap.set(r.id, r));
  (inc.audienceReactions || []).forEach((r) => reactionMap.set(r.id, r));

  return {
    ...inc,
    phase: inc.phase && inc.phase !== 'LOBBY' ? inc.phase : ex.phase,
    players: mergedPlayers,
    recentActivities: mergedActivities,
    votes,
    audienceReactions: Array.from(reactionMap.values()).slice(-50),
  };
}

export function applyClientRoomAction(activeRoom: RoomState, msg: WsMessage): boolean {
  if (!msg || !msg.type) return false;

  switch (msg.type) {
    case 'CLAIM_SEAT': {
      const { seatNumber, name, agencyName, avatar, image } = msg.payload || {};
      const player = activeRoom.players.find((p) => p.seatNumber === seatNumber);
      if (player) {
        if (name) player.name = name.trim();
        if (agencyName) player.agencyName = agencyName.trim();
        if (avatar) player.avatar = avatar;
        if (image) player.image = image;

        pushActivity(activeRoom, {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          seatNumber: player.seatNumber,
          anonymousActor: player.anonymousCodename,
          realActor: player.name,
          actionType: 'CLAIM',
          details: `đã nhận vị trí Nhà đầu tư #${player.seatNumber} (${player.name} - ${player.agencyName})`,
        });
        return true;
      }
      break;
    }

    case 'BUY_IDOL': {
      const { playerId, idolId } = msg.payload || {};
      const player = activeRoom.players.find((p) => p.id === playerId);
      const idol = IDOL_ROSTER.find((i) => i.id === idolId);

      if (player && idol) {
        const hasIdol = player.idols.some((i) => i.id === idol.id);
        if (!hasIdol && player.balance >= idol.price) {
          player.idols.push(idol);
          player.balance -= idol.price;

          const priceStr = (idol.price / 1_000_000).toLocaleString('vi-VN');
          pushActivity(activeRoom, {
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            seatNumber: player.seatNumber,
            anonymousActor: player.anonymousCodename,
            realActor: player.name,
            actionType: 'BUY',
            details: `vừa chiêu mộ ${idol.name} (${idol.originalGroup}) với giá ${priceStr} Triệu Won!`,
            amount: idol.price,
          });
          return true;
        }
      }
      break;
    }

    case 'SELL_IDOL': {
      const { playerId, idolId } = msg.payload || {};
      const player = activeRoom.players.find((p) => p.id === playerId);
      const idolIndex = player?.idols.findIndex((i) => i.id === idolId);

      if (player && idolIndex !== undefined && idolIndex !== -1) {
        const [removed] = player.idols.splice(idolIndex, 1);
        player.balance += removed.price;

        const priceStr = (removed.price / 1_000_000).toLocaleString('vi-VN');
        pushActivity(activeRoom, {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          seatNumber: player.seatNumber,
          anonymousActor: player.anonymousCodename,
          realActor: player.name,
          actionType: 'SELL',
          details: `vừa chuyển nhượng ${removed.name}, thu hồi ${priceStr} Triệu Won!`,
          amount: removed.price,
        });
        return true;
      }
      break;
    }

    case 'SUBMIT_GROUP': {
      const { playerId, groupDetails } = msg.payload || {};
      const player = activeRoom.players.find((p) => p.id === playerId);
      if (player) {
        player.groupDetails = groupDetails;
        player.isReady = true;

        pushActivity(activeRoom, {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          seatNumber: player.seatNumber,
          anonymousActor: player.anonymousCodename,
          realActor: player.name,
          actionType: 'GROUP_SUBMIT',
          details: `vừa hoàn tất cấu hình nhóm nhạc "${groupDetails.groupName || 'Đội Hình Mới'}" (Concept: ${groupDetails.concept || 'Tự do'})!`,
        });
        return true;
      }
      break;
    }

    case 'TOGGLE_ANONYMOUS_MODE': {
      activeRoom.isAnonymousMode = !activeRoom.isAnonymousMode;
      return true;
    }

    case 'REVEAL_IDENTITIES': {
      activeRoom.revealIdentities = true;
      activeRoom.isAnonymousMode = false;
      return true;
    }

    case 'SET_READY': {
      const { playerId, isReady } = msg.payload || {};
      const player = activeRoom.players.find((p) => p.id === playerId);
      if (player) {
        player.isReady = isReady;
        return true;
      }
      break;
    }

    case 'CHANGE_PHASE': {
      const newPhase: GamePhase = msg.payload?.phase;
      if (newPhase) {
        activeRoom.phase = newPhase;
        if (newPhase === 'VOTING') {
          activeRoom.votingOpen = true;
          const ids = activeRoom.players.map((p) => p.id);
          for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
          }
          activeRoom.shuffledVotingOrder = ids;
        }
        if (newPhase === 'CEREMONY') {
          activeRoom.votingOpen = false;
          let maxVotes = -1;
          let winnerId = activeRoom.players[0]?.id;
          for (const p of activeRoom.players) {
            const count = activeRoom.votes[p.id] || 0;
            if (count > maxVotes) {
              maxVotes = count;
              winnerId = p.id;
            }
          }
          activeRoom.winnerPlayerId = winnerId;
        }
        return true;
      }
      break;
    }

    case 'SET_SHOWCASE_PLAYER': {
      if (msg.payload?.playerId) {
        activeRoom.activeShowcasePlayerId = msg.payload.playerId;
        return true;
      }
      break;
    }

    case 'CAST_VOTE': {
      const { voterId, voterName, playerId, comment, lightstickColor } = msg.payload || {};
      const targetPlayer = activeRoom.players.find((p) => p.id === playerId);
      if (targetPlayer) {
        const effectiveVoterId = voterId || `voter-${Date.now()}`;
        const existingIdx = activeRoom.voteRecords.findIndex((v) => v.voterId === effectiveVoterId);
        if (existingIdx !== -1) {
          const old = activeRoom.voteRecords[existingIdx];
          activeRoom.votes[old.playerId] = Math.max(0, (activeRoom.votes[old.playerId] || 1) - 1);
          activeRoom.voteRecords.splice(existingIdx, 1);
        }

        const record: VoteRecord = {
          id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          voterName: voterName?.trim() || 'Khán giả K-POP',
          voterId: effectiveVoterId,
          playerId,
          groupName: targetPlayer.groupDetails?.groupName || `Nhóm Ứng Viên #${targetPlayer.seatNumber}`,
          timestamp: Date.now(),
          comment: comment?.trim(),
          lightstickColor: lightstickColor || '#ec4899',
        };

        activeRoom.voteRecords.unshift(record);
        activeRoom.votes[playerId] = (activeRoom.votes[playerId] || 0) + 1;

        activeRoom.audienceReactions.push({
          id: `react-${Date.now()}`,
          emoji: '✨',
          sender: record.voterName,
          groupName: record.groupName,
          timestamp: Date.now(),
        });
        if (activeRoom.audienceReactions.length > 50) {
          activeRoom.audienceReactions = activeRoom.audienceReactions.slice(-50);
        }

        pushActivity(activeRoom, {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          seatNumber: targetPlayer.seatNumber,
          anonymousActor: record.voterName,
          realActor: record.voterName,
          actionType: 'GROUP_SUBMIT',
          details: `vừa bình chọn cho nhóm ${record.groupName}! ${record.comment ? `("${record.comment}")` : ''}`,
        });
        return true;
      }
      break;
    }

    case 'SEND_REACTION': {
      const { emoji, sender, groupName } = msg.payload || {};
      activeRoom.audienceReactions.push({
        id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        emoji: emoji || '💖',
        sender: sender || 'Fan',
        groupName,
        timestamp: Date.now(),
      });
      if (activeRoom.audienceReactions.length > 50) {
        activeRoom.audienceReactions = activeRoom.audienceReactions.slice(-50);
      }
      return true;
    }

    case 'RESET_GAME': {
      const defaultPlayers = createDefaultPlayers();
      activeRoom.phase = 'LOBBY';
      activeRoom.players = defaultPlayers;
      activeRoom.votes = {
        'player-1': 0,
        'player-2': 0,
        'player-3': 0,
        'player-4': 0,
        'player-5': 0,
      };
      activeRoom.voteRecords = [];
      activeRoom.audienceReactions = [];
      activeRoom.recentActivities = [];
      activeRoom.votingOpen = false;
      activeRoom.activeShowcasePlayerId = 'player-1';
      activeRoom.winnerPlayerId = undefined;
      activeRoom.isAnonymousMode = false;
      activeRoom.revealIdentities = true;
      return true;
    }
  }

  return false;
}
