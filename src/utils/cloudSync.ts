import Peer, { DataConnection } from 'peerjs';
import { RoomState, WsMessage } from '../types';

type SyncCallback = (newState: RoomState) => void;
type ActionHandler = (msg: WsMessage) => void;

class CloudSyncManager {
  private peer: Peer | null = null;
  private connections: Set<DataConnection> = new Set();
  private hostConnection: DataConnection | null = null;
  private sseSource: EventSource | null = null;
  private sseStateSource: EventSource | null = null;
  private isHost: boolean = false;
  private roomId: string = 'KPOP1';
  private onStateChange: SyncCallback | null = null;
  private onActionReceived: ActionHandler | null = null;
  private currentRoomState: RoomState | null = null;

  public initHost(roomId: string, initialState: RoomState, onAction: ActionHandler) {
    this.roomId = roomId.toUpperCase();
    this.isHost = true;
    this.currentRoomState = initialState;
    this.onActionReceived = onAction;

    const hostPeerId = `kpop-game-host-${this.roomId.toLowerCase()}`;
    const ntfyActionTopic = `kpop_game_actions_${this.roomId.toLowerCase()}`;

    // 1. WebRTC PeerJS setup
    try {
      this.peer = new Peer(hostPeerId, { debug: 1 });
      this.peer.on('connection', (conn) => {
        this.connections.add(conn);
        conn.on('open', () => {
          if (this.currentRoomState) {
            conn.send({ type: 'SYNC_STATE', payload: this.currentRoomState });
          }
        });
        conn.on('data', (data: any) => {
          try {
            const msg: WsMessage = typeof data === 'string' ? JSON.parse(data) : data;
            if (this.onActionReceived) this.onActionReceived(msg);
          } catch (err) {}
        });
        conn.on('close', () => this.connections.delete(conn));
      });
    } catch (err) {}

    // 2. HTTP SSE Real-Time Stream setup (Zero-config instant pubsub)
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        if (this.sseSource) this.sseSource.close();
        this.sseSource = new EventSource(`https://ntfy.sh/${ntfyActionTopic}/sse`);
        this.sseSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.message) {
              const msg: WsMessage = JSON.parse(data.message);
              if (msg && msg.type && this.onActionReceived) {
                this.onActionReceived(msg);
              }
            }
          } catch (err) {}
        };
      }
    } catch (err) {}
  }

  public initClient(roomId: string, onState: SyncCallback) {
    this.roomId = roomId.toUpperCase();
    this.isHost = false;
    this.onStateChange = onState;

    const hostPeerId = `kpop-game-host-${this.roomId.toLowerCase()}`;
    const ntfyStateTopic = `kpop_game_state_${this.roomId.toLowerCase()}`;

    // 1. WebRTC PeerJS setup
    try {
      this.peer = new Peer({ debug: 1 });
      this.peer.on('open', () => {
        this.connectToHost(hostPeerId);
      });
    } catch (err) {}

    // 2. SSE State listener for Client
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        if (this.sseStateSource) this.sseStateSource.close();
        this.sseStateSource = new EventSource(`https://ntfy.sh/${ntfyStateTopic}/sse`);
        this.sseStateSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.message) {
              const roomState: RoomState = JSON.parse(data.message);
              if (roomState && roomState.roomId && this.onStateChange) {
                this.onStateChange(roomState);
              }
            }
          } catch (err) {}
        };
      }
    } catch (err) {}
  }

  private connectToHost(hostPeerId: string) {
    if (!this.peer) return;
    try {
      const conn = this.peer.connect(hostPeerId, { reliable: true });
      this.hostConnection = conn;
      conn.on('data', (data: any) => {
        try {
          const msg: WsMessage = typeof data === 'string' ? JSON.parse(data) : data;
          if (msg.type === 'SYNC_STATE' && msg.payload && this.onStateChange) {
            this.onStateChange(msg.payload);
          }
        } catch (err) {}
      });
    } catch (err) {}
  }

  public broadcastState(newState: RoomState) {
    this.currentRoomState = newState;
    if (!this.isHost) return;

    // WebRTC broadcast
    const msg = { type: 'SYNC_STATE', payload: newState };
    this.connections.forEach((conn) => {
      if (conn.open) {
        try { conn.send(msg); } catch (err) {}
      }
    });

    // ntfy.sh SSE state broadcast
    try {
      const ntfyStateTopic = `kpop_game_state_${this.roomId.toLowerCase()}`;
      fetch(`https://ntfy.sh/${ntfyStateTopic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      }).catch(() => {});
    } catch (err) {}
  }

  public sendActionToHost(msg: WsMessage) {
    // WebRTC send
    if (this.hostConnection && this.hostConnection.open) {
      try { this.hostConnection.send(msg); } catch (err) {}
    }

    // ntfy.sh SSE action send
    try {
      const ntfyActionTopic = `kpop_game_actions_${this.roomId.toLowerCase()}`;
      fetch(`https://ntfy.sh/${ntfyActionTopic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      }).catch(() => {});
    } catch (err) {}
  }

  public destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.sseStateSource) {
      this.sseStateSource.close();
      this.sseStateSource = null;
    }
    this.connections.clear();
    this.hostConnection = null;
  }
}

export const cloudSync = new CloudSyncManager();
