import React, { useState, useEffect, useRef } from 'react';
import { RoomState, GamePhase, Player, GroupDetails, WsMessage } from './types';
import { Header } from './components/Header';
import { LobbyView } from './components/LobbyView';
import { MarketView } from './components/MarketView';
import { GroupCreationView } from './components/GroupCreationView';
import { ShowcaseView } from './components/ShowcaseView';
import { VotingView } from './components/VotingView';
import { CeremonyView } from './components/CeremonyView';
import { QrModal } from './components/QrModal';
import { AudienceMobileVoting } from './components/AudienceMobileVoting';
import { PlayerMobileView } from './components/PlayerMobileView';
import { PlayerPinLogin } from './components/PlayerPinLogin';
import { PlayerCodesModal } from './components/PlayerCodesModal';
import { KpopMusicPlayer } from './components/KpopMusicPlayer';
import { sound } from './utils/audio';
import { createDefaultRoomState, applyClientRoomAction, mergeRoomStates } from './utils/defaultState';
import { cloudSync } from './utils/cloudSync';

const getRoomIdFromUrl = () => {
  if (typeof window === 'undefined') return 'KPOP1';
  const params = new URLSearchParams(window.location.search);
  return (params.get('room') || 'KPOP1').toUpperCase();
};

export default function App() {
  const currentRoomId = getRoomIdFromUrl();
  const [roomState, setRoomState] = useState<RoomState>(() => createDefaultRoomState(currentRoomId));
  const [activePlayerId, setActivePlayerId] = useState<string>('player-1');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPlayerCodesModalOpen, setIsPlayerCodesModalOpen] = useState(false);
  const [isPlayerLoginModalOpen, setIsPlayerLoginModalOpen] = useState(false);
  const [authenticatedPlayerSeat, setAuthenticatedPlayerSeat] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAudienceView, setIsAudienceView] = useState(false);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Check if opened as audience on mobile via QR scan or as a player
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'audience') {
        setIsAudienceView(true);
      } else if (params.get('role') === 'player') {
        const seatParam = params.get('seat');
        if (seatParam) {
          const seatNum = parseInt(seatParam, 10);
          if (seatNum >= 1 && seatNum <= 5) {
            setAuthenticatedPlayerSeat(seatNum);
          }
        } else {
          setIsPlayerLoginModalOpen(true);
        }
      }
    }
  }, []);

  // Sync state helper (with automatic optimistic local update + WebRTC P2P + REST/WS sync)
  const sendWs = (msg: WsMessage) => {
    // Optimistically update local state so every button click responds in 0ms
    setRoomState((prevRoom) => {
      if (!prevRoom) return prevRoom;
      const nextRoom = JSON.parse(JSON.stringify(prevRoom));
      applyClientRoomAction(nextRoom, msg);
      cloudSync.broadcastState(nextRoom);
      return nextRoom;
    });

    // Send action via WebRTC P2P to Host
    cloudSync.sendActionToHost(msg);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      fetch(`/api/rooms/${currentRoomId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.room) {
            setRoomState((prev) => {
              const merged = mergeRoomStates(prev, data.room);
              cloudSync.broadcastState(merged);
              return merged;
            });
          }
        })
        .catch(console.error);
    }
  };

  // Connect WebRTC P2P DataChannel, WebSocket & Poll as fallback
  useEffect(() => {
    let ws: WebSocket;
    let pollInterval: any;

    // Initialize WebRTC P2P DataChannel Cloud Sync
    if (!isAudienceView && authenticatedPlayerSeat === null) {
      // Host / Main Screen
      cloudSync.initHost(currentRoomId, roomState, (msgFromMobile) => {
        sendWs(msgFromMobile);
      });
    } else {
      // Client / Player Mobile / Audience
      cloudSync.initClient(currentRoomId, (newState) => {
        if (newState) {
          setRoomState((prev) => mergeRoomStates(prev, newState));
        }
      });
    }

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}?roomId=${currentRoomId}`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { roomId: currentRoomId } }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          if (msg.type === 'SYNC_STATE' && msg.payload) {
            setRoomState((prev) => {
              const merged = mergeRoomStates(prev, msg.payload);
              cloudSync.broadcastState(merged);
              return merged;
            });
          }
        } catch (err) {
          console.error('Failed to parse WS state:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error, falling back to WebRTC & REST sync', err);
      };
    };

    connectWebSocket();

    // Regular REST backup polling
    const fetchState = () => {
      fetch(`/api/rooms/${currentRoomId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.roomId) {
            setRoomState((prev) => {
              const merged = mergeRoomStates(prev, data);
              if (JSON.stringify(prev) !== JSON.stringify(merged)) {
                cloudSync.broadcastState(merged);
                return merged;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    };

    fetchState();
    pollInterval = setInterval(fetchState, 3000);

    return () => {
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
      cloudSync.destroy();
    };
  }, [currentRoomId, isAudienceView, authenticatedPlayerSeat]);

  if (!roomState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mb-4" />
        <h2 className="text-xl font-bold">Đang tải bàn chơi "Nhà đầu tư IDOL K-POP số 1"...</h2>
        <p className="text-xs text-slate-400 mt-1">Kết nối máy chủ thời gian thực</p>
      </div>
    );
  }

  // Handlers
  const handleClaimSeat = (seatNumber: number, name: string, agencyName: string, avatar: string) => {
    sendWs({
      type: 'CLAIM_SEAT',
      payload: { seatNumber, name, agencyName, avatar },
    });
  };

  const handleStartGame = () => {
    sendWs({
      type: 'CHANGE_PHASE',
      payload: { phase: 'MARKET' },
    });
  };

  const handleBuyIdol = (playerId: string, idolId: string) => {
    sendWs({
      type: 'BUY_IDOL',
      payload: { playerId, idolId },
    });
  };

  const handleSellIdol = (playerId: string, idolId: string) => {
    sendWs({
      type: 'SELL_IDOL',
      payload: { playerId, idolId },
    });
  };

  const handleSubmitGroup = (playerId: string, groupDetails: GroupDetails) => {
    sendWs({
      type: 'SUBMIT_GROUP',
      payload: { playerId, groupDetails },
    });
  };

  const handleProceedToGroupCreation = () => {
    sendWs({
      type: 'CHANGE_PHASE',
      payload: { phase: 'GROUP_CREATION' },
    });
  };

  const handleProceedToShowcase = () => {
    sendWs({
      type: 'CHANGE_PHASE',
      payload: { phase: 'DEBUT_SHOWCASE' },
    });
  };

  const handleStartVoting = () => {
    sendWs({
      type: 'CHANGE_PHASE',
      payload: { phase: 'VOTING' },
    });
  };

  const handleEndVotingAndAward = () => {
    sendWs({
      type: 'CHANGE_PHASE',
      payload: { phase: 'CEREMONY' },
    });
  };

  const handleCastVote = (
    playerId: string,
    voterName: string,
    comment?: string,
    lightstickColor?: string
  ) => {
    const voterId = localStorage.getItem('kpop_client_voter_id') || `voter-${Date.now()}`;
    localStorage.setItem('kpop_client_voter_id', voterId);

    sendWs({
      type: 'CAST_VOTE',
      payload: {
        voterId,
        voterName,
        playerId,
        comment,
        lightstickColor,
      },
    });
  };

  const handleSendReaction = (emoji: string, sender: string, groupName?: string) => {
    sendWs({
      type: 'SEND_REACTION',
      payload: { emoji, sender, groupName },
    });
  };

  const handleResetGame = () => {
    sendWs({
      type: 'RESET_GAME',
      payload: {},
    });
    setActivePlayerId('player-1');
  };

  const handleSetShowcasePlayer = (playerId: string) => {
    sendWs({
      type: 'SET_SHOWCASE_PLAYER',
      payload: { playerId },
    });
  };

  const handleToggleAnonymousMode = () => {
    sendWs({
      type: 'TOGGLE_ANONYMOUS_MODE',
      payload: {},
    });
  };

  const handleRevealIdentities = () => {
    sendWs({
      type: 'REVEAL_IDENTITIES',
      payload: {},
    });
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  // If mobile player view is active for a specific seat
  if (authenticatedPlayerSeat !== null) {
    const matchedPlayer = roomState.players.find((p) => p.seatNumber === authenticatedPlayerSeat) || roomState.players[0];
    return (
      <PlayerMobileView
        player={matchedPlayer}
        roomState={roomState}
        onBuyIdol={handleBuyIdol}
        onSellIdol={handleSellIdol}
        onSubmitGroup={handleSubmitGroup}
        onSendReaction={handleSendReaction}
        onSwitchSeat={() => {
          setAuthenticatedPlayerSeat(null);
          setIsPlayerLoginModalOpen(true);
        }}
        onOpenMainScreen={() => {
          setAuthenticatedPlayerSeat(null);
        }}
      />
    );
  }

  // If audience role was requested from QR scan
  if (isAudienceView) {
    return (
      <AudienceMobileVoting
        roomState={roomState}
        onCastVote={handleCastVote}
        onSendReaction={handleSendReaction}
        onSwitchToHost={() => setIsAudienceView(false)}
      />
    );
  }

  const activePlayer = roomState.players.find((p) => p.id === activePlayerId) || roomState.players[0];
  const totalVotes = Object.values(roomState.votes).reduce((sum, c) => sum + c, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-28 sm:pb-24">
      {/* Header */}
      <Header
        phase={roomState.phase}
        roomCode={roomState.roomCode}
        onOpenQr={() => setIsQrModalOpen(true)}
        onOpenPlayerCodes={() => setIsPlayerCodesModalOpen(true)}
        onOpenPlayerLogin={() => setIsPlayerLoginModalOpen(true)}
        onResetGame={handleResetGame}
        onChangePhase={(phase) => sendWs({ type: 'CHANGE_PHASE', payload: { phase } })}
        players={roomState.players}
        activePlayerId={activePlayerId}
        onSelectActivePlayer={setActivePlayerId}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        totalVotes={totalVotes}
      />

      {/* Floating Audience Reactions (Live concert broadcast vibe) */}
      <div className="fixed bottom-6 right-6 z-30 pointer-events-none flex flex-col-reverse gap-2 max-h-60 overflow-hidden">
        {roomState.audienceReactions.slice(-6).map((react) => (
          <div
            key={react.id}
            className="animate-bounce bg-slate-900/90 border border-pink-500/40 rounded-full px-3 py-1 text-xs text-white shadow-xl flex items-center gap-1.5 backdrop-blur-sm"
          >
            <span className="text-base">{react.emoji}</span>
            <span className="font-bold text-pink-300">{react.sender}</span>
          </div>
        ))}
      </div>

      {/* Main Game Stage Area */}
      <main className="flex-1 pb-16">
        {roomState.phase === 'LOBBY' && (
          <LobbyView
            players={roomState.players}
            onClaimSeat={handleClaimSeat}
            onStartGame={handleStartGame}
            onOpenQr={() => setIsQrModalOpen(true)}
            onOpenPlayerCodes={() => setIsPlayerCodesModalOpen(true)}
            roomCode={roomState.roomCode}
          />
        )}

        {roomState.phase === 'MARKET' && (
          <MarketView
            activePlayer={activePlayer}
            allPlayers={roomState.players}
            onSelectPlayer={setActivePlayerId}
            onBuyIdol={handleBuyIdol}
            onSellIdol={handleSellIdol}
            onProceedToGroupCreation={handleProceedToGroupCreation}
            activities={roomState.recentActivities}
            isAnonymousMode={roomState.isAnonymousMode}
            onOpenPlayerCodes={() => setIsPlayerCodesModalOpen(true)}
          />
        )}

        {roomState.phase === 'GROUP_CREATION' && (
          <GroupCreationView
            activePlayer={activePlayer}
            allPlayers={roomState.players}
            onSelectPlayer={setActivePlayerId}
            onSubmitGroup={handleSubmitGroup}
            onProceedToShowcase={handleProceedToShowcase}
            onBackToMarket={() =>
              sendWs({ type: 'CHANGE_PHASE', payload: { phase: 'MARKET' } })
            }
            isAnonymousMode={roomState.isAnonymousMode}
            onOpenPlayerCodes={() => setIsPlayerCodesModalOpen(true)}
          />
        )}

        {roomState.phase === 'DEBUT_SHOWCASE' && (
          <ShowcaseView
            players={roomState.players}
            activeShowcasePlayerId={roomState.activeShowcasePlayerId || 'player-1'}
            onSetShowcasePlayer={handleSetShowcasePlayer}
            onStartVoting={handleStartVoting}
            onOpenQr={() => setIsQrModalOpen(true)}
            isAnonymousMode={roomState.isAnonymousMode}
            revealIdentities={roomState.revealIdentities}
          />
        )}

        {roomState.phase === 'VOTING' && (
          <VotingView
            players={roomState.players}
            votes={roomState.votes}
            voteRecords={roomState.voteRecords}
            audienceReactions={roomState.audienceReactions}
            roomCode={roomState.roomCode}
            onCastVote={handleCastVote}
            onSendReaction={handleSendReaction}
            onEndVotingAndAward={handleEndVotingAndAward}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            isAnonymousMode={roomState.isAnonymousMode}
            revealIdentities={roomState.revealIdentities}
            shuffledVotingOrder={roomState.shuffledVotingOrder}
            onShuffleVotingOrder={() => sendWs({ type: 'SHUFFLE_VOTING_ORDER' })}
          />
        )}

        {roomState.phase === 'CEREMONY' && (
          <CeremonyView
            players={roomState.players}
            votes={roomState.votes}
            voteRecords={roomState.voteRecords}
            winnerPlayerId={roomState.winnerPlayerId}
            onRestartGame={handleResetGame}
            isAnonymousMode={roomState.isAnonymousMode}
            revealIdentities={roomState.revealIdentities}
            onRevealIdentities={handleRevealIdentities}
          />
        )}
      </main>

      {/* QR Code Audience Voting Modal */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        roomCode={roomState.roomCode}
        onSimulateVote={(fanName, comment) => {
          handleCastVote(activePlayerId, fanName, comment, '#ec4899');
        }}
      />

      {/* 5 Players Codes & Individual Phone Access Modal */}
      <PlayerCodesModal
        isOpen={isPlayerCodesModalOpen}
        onClose={() => setIsPlayerCodesModalOpen(false)}
        players={roomState.players}
        roomCode={roomState.roomCode}
        onLaunchSeat={(seatNumber) => {
          setAuthenticatedPlayerSeat(seatNumber);
          setIsPlayerCodesModalOpen(false);
        }}
      />

      {/* Player PIN Authentication Modal */}
      {isPlayerLoginModalOpen && (
        <PlayerPinLogin
          players={roomState.players}
          onLoginSuccess={(player) => {
            setAuthenticatedPlayerSeat(player.seatNumber);
            setIsPlayerLoginModalOpen(false);
          }}
          onCancel={() => setIsPlayerLoginModalOpen(false)}
        />
      )}

      {/* Background K-Pop Music Player (AOA - Miniskirt with Auto-Replay) */}
      <KpopMusicPlayer />
    </div>
  );
}
