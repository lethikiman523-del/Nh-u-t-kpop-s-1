import express, { Request, Response } from "express";
import http from "http";
import path from "path";
import os from "os";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { RoomState, Player, WsMessage, VoteRecord, AudienceReaction, GamePhase, ActivityEvent } from "./src/types.js";
import { IDOL_ROSTER, TOTAL_BUDGET, DEFAULT_PLAYER_SEATS } from "./src/data/idols.js";

const PORT = 3000;
const app = express();

// CORS Headers for cross-device mobile REST access & tunnel bypass
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Bypass-Tunnel-Remainder");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Bypass-Tunnel-Remainder", "true");
  if (_req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// In-memory room store
const rooms: Map<string, RoomState> = new Map();
// Active websocket connections per room
const roomClients: Map<string, Set<WebSocket>> = new Map();

function createDefaultPlayers(): Player[] {
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

function getOrCreateRoom(roomId: string = "KPOP1"): RoomState {
  const normalizedId = roomId.trim().toUpperCase() || "KPOP1";
  let room = rooms.get(normalizedId);
  if (!room) {
    room = {
      roomId: normalizedId,
      roomCode: normalizedId,
      phase: "LOBBY",
      players: createDefaultPlayers(),
      votes: {
        "player-1": 0,
        "player-2": 0,
        "player-3": 0,
        "player-4": 0,
        "player-5": 0,
      },
      voteRecords: [],
      audienceReactions: [],
      recentActivities: [],
      isAnonymousMode: false, // All masks removed per user request: open transparent competition
      revealIdentities: true,
      votingOpen: false,
      activeShowcasePlayerId: "player-1",
    };
    rooms.set(normalizedId, room);
  }
  return room;
}

function pushActivity(room: RoomState, activity: ActivityEvent) {
  room.recentActivities.unshift(activity);
  if (room.recentActivities.length > 40) {
    room.recentActivities = room.recentActivities.slice(0, 40);
  }
}

// Broadcast room state to all clients in the room
function broadcastRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const clients = roomClients.get(roomId);
  if (!clients) return;

  const message = JSON.stringify({
    type: "SYNC_STATE",
    payload: room,
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function getServerNetworkIps(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) continue;
    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        ips.push(alias.address);
      }
    }
  }
  return ips;
}

// REST endpoints
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/server-info", (_req: Request, res: Response) => {
  const ips = getServerNetworkIps();
  res.json({
    status: "ok",
    port: PORT,
    ips,
    primaryIp: ips[0] || "127.0.0.1",
    timestamp: Date.now(),
  });
});

app.get("/api/idols", (_req: Request, res: Response) => {
  res.json(IDOL_ROSTER);
});

app.get("/api/rooms/:roomId", (req: Request, res: Response) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json(room);
});

// REST Fallback for Room Actions (for mobile browsers / disconnected sockets)
app.post("/api/rooms/:roomId/action", (req: Request, res: Response) => {
  const roomId = (req.params.roomId || "KPOP1").trim().toUpperCase();
  const room = getOrCreateRoom(roomId);
  const msg: WsMessage = req.body;

  if (msg && msg.type) {
    const shouldBroadcast = processRoomAction(room, msg);
    if (shouldBroadcast) {
      broadcastRoom(roomId);
    }
  }
  res.json({ success: true, room });
});

// Helper function to execute room actions
function processRoomAction(activeRoom: RoomState, msg: WsMessage): boolean {
  switch (msg.type) {
    case "CLAIM_SEAT": {
      const { seatNumber, name, agencyName, avatar, image } = msg.payload;
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
          actionType: "CLAIM",
          details: `đã nhận vị trí Nhà đầu tư #${player.seatNumber}`,
        });
        return true;
      }
      break;
    }

    case "BUY_IDOL": {
      const { playerId, idolId } = msg.payload;
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
            actionType: "BUY",
            details: `vừa chiêu mộ ${idol.name} (${idol.originalGroup}) với giá ${priceStr} Triệu Won!`,
            amount: idol.price,
          });
          return true;
        }
      }
      break;
    }

    case "SELL_IDOL": {
      const { playerId, idolId } = msg.payload;
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
          actionType: "SELL",
          details: `vừa chuyển nhượng ${removed.name}, thu hồi ${priceStr} Triệu Won!`,
          amount: removed.price,
        });
        return true;
      }
      break;
    }

    case "SUBMIT_GROUP": {
      const { playerId, groupDetails } = msg.payload;
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
          actionType: "GROUP_SUBMIT",
          details: `vừa hoàn tất cấu hình nhóm nhạc "${groupDetails.groupName || 'Đội Hình Mới'}" (Concept: ${groupDetails.concept || 'Tự do'})!`,
        });
        return true;
      }
      break;
    }

    case "TOGGLE_ANONYMOUS_MODE": {
      activeRoom.isAnonymousMode = !activeRoom.isAnonymousMode;
      return true;
    }

    case "REVEAL_IDENTITIES": {
      activeRoom.revealIdentities = true;
      activeRoom.isAnonymousMode = false;
      return true;
    }

    case "SET_READY": {
      const { playerId, isReady } = msg.payload;
      const player = activeRoom.players.find((p) => p.id === playerId);
      if (player) {
        player.isReady = isReady;
        return true;
      }
      break;
    }

    case "CHANGE_PHASE": {
      const newPhase: GamePhase = msg.payload.phase;
      activeRoom.phase = newPhase;
      if (newPhase === "VOTING") {
        activeRoom.votingOpen = true;
        const ids = activeRoom.players.map((p) => p.id);
        for (let i = ids.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        activeRoom.shuffledVotingOrder = ids;

        pushActivity(activeRoom, {
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          seatNumber: 0,
          anonymousActor: "Trọng Tài Cuộc Thi",
          realActor: "Hệ Thống Trọng Tài",
          actionType: "GROUP_SUBMIT",
          details: "Cổng bình chọn mở! Khán giả có thể bình chọn trực tiếp cho các nhóm nhạc và nhà đầu tư yêu thích.",
        });
      }
      if (newPhase === "CEREMONY") {
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

    case "SHUFFLE_VOTING_ORDER": {
      const ids = activeRoom.players.map((p) => p.id);
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      activeRoom.shuffledVotingOrder = ids;

      pushActivity(activeRoom, {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        seatNumber: 0,
        anonymousActor: "Trọng Tài",
        realActor: "Trọng Tài",
        actionType: "GROUP_SUBMIT",
        details: "vừa xáo trộn lại thứ tự hiển thị các nhóm ứng viên trên màn hình bình chọn!",
      });
      return true;
    }

    case "SET_SHOWCASE_PLAYER": {
      activeRoom.activeShowcasePlayerId = msg.payload.playerId;
      return true;
    }

    case "CAST_VOTE": {
      const { voterId, voterName, playerId, comment, lightstickColor } = msg.payload;
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
          voterName: voterName?.trim() || "Khán giả K-POP",
          voterId: effectiveVoterId,
          playerId,
          groupName: targetPlayer.groupDetails?.groupName || `Nhóm Ứng Viên #${targetPlayer.seatNumber}`,
          timestamp: Date.now(),
          comment: comment?.trim(),
          lightstickColor: lightstickColor || "#ec4899",
        };

        activeRoom.voteRecords.unshift(record);
        activeRoom.votes[playerId] = (activeRoom.votes[playerId] || 0) + 1;

        activeRoom.audienceReactions.push({
          id: `react-${Date.now()}`,
          emoji: "✨",
          sender: record.voterName,
          groupName: record.groupName,
          timestamp: Date.now(),
        });
        if (activeRoom.audienceReactions.length > 50) {
          activeRoom.audienceReactions = activeRoom.audienceReactions.slice(-50);
        }
        return true;
      }
      break;
    }

    case "SEND_REACTION": {
      const { emoji, sender, groupName } = msg.payload;
      activeRoom.audienceReactions.push({
        id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        emoji: emoji || "💖",
        sender: sender || "Fan",
        groupName,
        timestamp: Date.now(),
      });
      if (activeRoom.audienceReactions.length > 50) {
        activeRoom.audienceReactions = activeRoom.audienceReactions.slice(-50);
      }
      return true;
    }

    case "RESET_GAME": {
      const defaultPlayers = createDefaultPlayers();
      activeRoom.phase = "LOBBY";
      activeRoom.players = defaultPlayers;
      activeRoom.votes = {
        "player-1": 0,
        "player-2": 0,
        "player-3": 0,
        "player-4": 0,
        "player-5": 0,
      };
      activeRoom.voteRecords = [];
      activeRoom.audienceReactions = [];
      activeRoom.recentActivities = [];
      activeRoom.votingOpen = false;
      activeRoom.activeShowcasePlayerId = "player-1";
      activeRoom.winnerPlayerId = undefined;
      activeRoom.isAnonymousMode = false;
      activeRoom.revealIdentities = true;
      return true;
    }

    case "DEMO_FILL_SAMPLE_DATA": {
      const sampleGroupConfigs = [
        {
          groupName: "HYPER ECLIPSE",
          concept: "Cyberpunk Trap & Vocal",
          debutSong: "DNA OVERDRIVE",
          fandomName: "AURA",
          motto: "Bứt phá mọi giới hạn âm nhạc!",
          idolIndices: [0, 1, 2, 3],
        },
        {
          groupName: "NEO SPECTRUM",
          concept: "Futuristic Electro-Pop",
          debutSong: "NEXT EVOLUTION",
          fandomName: "NEXUS",
          motto: "Tương lai âm nhạc đã bắt đầu.",
          idolIndices: [4, 5, 6, 7],
        },
        {
          groupName: "JYP GROOVE STAR",
          concept: "Retro Synthwave & Hip-Hop",
          debutSong: "GROOVE OVERLOAD",
          fandomName: "SOULMATES",
          motto: "Giai điệu chạm đến từng nhịp tim.",
          idolIndices: [8, 9, 10, 11],
        },
        {
          groupName: "BLACK VELVET CRUSH",
          concept: "Badass EDM / Banger",
          debutSong: "REIGN SUPREME",
          fandomName: "DYNASTY",
          motto: "Nữ quyền và phong cách đỉnh cao.",
          idolIndices: [12, 13, 14, 15],
        },
        {
          groupName: "VELVET HORIZON",
          concept: "Dreamy Pop / High Teen",
          debutSong: "STARRY NIGHTFALL",
          fandomName: "CELESTIAL",
          motto: "Ánh sao soi sáng thanh xuân.",
          idolIndices: [16, 17, 18, 19],
        },
      ];

      activeRoom.players.forEach((player, pIdx) => {
        const cfg = sampleGroupConfigs[pIdx];
        if (cfg) {
          const selectedIdols = cfg.idolIndices
            .map((idx) => IDOL_ROSTER[idx])
            .filter(Boolean);
          const spent = selectedIdols.reduce((sum, idol) => sum + idol.price, 0);
          player.idols = selectedIdols;
          player.balance = Math.max(0, TOTAL_BUDGET - spent);
          const roles: Record<string, string> = {};
          selectedIdols.forEach((idol, i) => {
            roles[idol.id] = i === 0 ? "Leader & Main Vocal" : i === 1 ? "Main Rapper" : i === 2 ? "Main Dancer" : "Visual & Sub-Vocal";
          });
          player.groupDetails = {
            groupName: cfg.groupName,
            concept: cfg.concept,
            debutSong: cfg.debutSong,
            fandomName: cfg.fandomName,
            motto: cfg.motto,
            roleAssignments: roles,
          };
          player.isReady = true;
        }
      });

      activeRoom.votes = {
        "player-1": 18,
        "player-2": 14,
        "player-3": 11,
        "player-4": 22,
        "player-5": 16,
      };
      activeRoom.isAnonymousMode = false;
      activeRoom.revealIdentities = true;

      pushActivity(activeRoom, {
        id: `act-${Date.now()}`,
        timestamp: Date.now(),
        seatNumber: 0,
        anonymousActor: "Trợ Lý Demo",
        realActor: "Hệ Thống",
        actionType: "GROUP_SUBMIT",
        details: "Đã nạp sẵn đội hình mẫu cho cả 5 Nhà đầu tư! Bạn có thể chuyển qua bất kỳ bước nào để thuyết trình và phổ cập game.",
      });
      return true;
    }
  }
  return false;
}

// Direct HTTP Voting for audience scanning QR code on phone
app.post("/api/rooms/:roomId/vote", (req: Request, res: Response) => {
  const { voterId, voterName, playerId, comment, lightstickColor } = req.body;
  const room = getOrCreateRoom(req.params.roomId);

  if (!playerId) {
    res.status(400).json({ error: "Missing playerId" });
    return;
  }

  const targetPlayer = room.players.find((p) => p.id === playerId);
  if (!targetPlayer) {
    res.status(404).json({ error: "Investor player not found" });
    return;
  }

  // Deduplicate vote by voterId
  const effectiveVoterId = voterId || `voter-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const existingVoteIndex = room.voteRecords.findIndex((v) => v.voterId === effectiveVoterId);

  if (existingVoteIndex !== -1) {
    const oldVote = room.voteRecords[existingVoteIndex];
    room.votes[oldVote.playerId] = Math.max(0, (room.votes[oldVote.playerId] || 1) - 1);
    room.voteRecords.splice(existingVoteIndex, 1);
  }

  const newRecord: VoteRecord = {
    id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    voterName: voterName?.trim() || "Khán giả ẩn danh",
    voterId: effectiveVoterId,
    playerId,
    groupName: targetPlayer.groupDetails?.groupName || `Nhóm Ứng Viên #${targetPlayer.seatNumber}`,
    timestamp: Date.now(),
    comment: comment?.trim() || undefined,
    lightstickColor: lightstickColor || "#ec4899",
  };

  room.voteRecords.unshift(newRecord);
  room.votes[playerId] = (room.votes[playerId] || 0) + 1;

  // Add cheering reaction
  room.audienceReactions.push({
    id: `react-${Date.now()}`,
    emoji: "💖",
    sender: newRecord.voterName,
    groupName: newRecord.groupName,
    timestamp: Date.now(),
  });
  if (room.audienceReactions.length > 50) {
    room.audienceReactions = room.audienceReactions.slice(-50);
  }

  broadcastRoom(room.roomId);
  res.json({ success: true, record: newRecord, room });
});

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {
    let currentRoomId = "KPOP1";

    // Extract roomId from query if available
    try {
      const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
      const queryRoom = url.searchParams.get("roomId");
      if (queryRoom) {
        currentRoomId = queryRoom.trim().toUpperCase();
      }
    } catch {
      // keep default
    }

    if (!roomClients.has(currentRoomId)) {
      roomClients.set(currentRoomId, new Set());
    }
    roomClients.get(currentRoomId)!.add(ws);

    // Send initial state
    const room = getOrCreateRoom(currentRoomId);
    ws.send(JSON.stringify({ type: "SYNC_STATE", payload: room }));

    ws.on("message", (raw) => {
      try {
        const msg: WsMessage = JSON.parse(raw.toString());
        const activeRoom = getOrCreateRoom(currentRoomId);

        if (msg.type === "JOIN_ROOM") {
          const targetRoomId = (msg.payload?.roomId || "KPOP1").trim().toUpperCase();
          if (targetRoomId !== currentRoomId) {
            roomClients.get(currentRoomId)?.delete(ws);
            currentRoomId = targetRoomId;
            if (!roomClients.has(currentRoomId)) {
              roomClients.set(currentRoomId, new Set());
            }
            roomClients.get(currentRoomId)!.add(ws);
          }
          const targetRoom = getOrCreateRoom(currentRoomId);
          ws.send(JSON.stringify({ type: "SYNC_STATE", payload: targetRoom }));
        } else {
          const modified = processRoomAction(activeRoom, msg);
          if (modified) {
            broadcastRoom(currentRoomId);
          }
        }
      } catch (err) {
        console.error("WS error handling message:", err);
      }
    });

    ws.on("close", () => {
      roomClients.get(currentRoomId)?.delete(ws);
    });
  });

  // Prefer built production bundle in dist/ if available for 100x faster load speed over tunnels & mobile
  const distIndex = path.join(process.cwd(), "dist", "index.html");
  if (fs.existsSync(distIndex) || process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: '1d' }));
    app.get("*", (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, "0.0.0.0", () => {
    const ips = getServerNetworkIps();
    console.log(`\n==================================================`);
    console.log(`🚀 SERVER GAME "NHÀ ĐẦU TƯ IDOL K-POP SỐ 1" ĐANG CHẠY!`);
    console.log(`--------------------------------------------------`);
    console.log(`💻 Trình duyệt máy chủ (Local Host):  http://localhost:${PORT}`);
    if (ips.length > 0) {
      console.log(`📱 Mạng Wi-Fi nội bộ cho người chơi & khán giả (LAN IP):`);
      ips.forEach((ip) => {
        console.log(`   👉 http://${ip}:${PORT}`);
      });
    } else {
      console.log(`⚠️  Không tìm thấy IP Wi-Fi nội bộ. Hãy kiểm tra kết nối mạng.`);
    }
    console.log(`==================================================\n`);
  });
}

export { app, getOrCreateRoom, processRoomAction, rooms };

if (!process.env.VERCEL) {
  startServer();
}
