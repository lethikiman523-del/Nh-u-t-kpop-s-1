import Peer, { DataConnection } from 'peerjs';
import { RoomState, WsMessage } from '../types';

type SyncCallback = (newState: RoomState) => void;
type ActionHandler = (msg: WsMessage) => void;

class CloudSyncManager {
  private peer: Peer | null = null;
  private connections: Set<DataConnection> = new Set();
  private hostConnection: DataConnection | null = null;
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

    try {
      this.peer = new Peer(hostPeerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        console.log(`[CloudSync] Host WebRTC Peer active: ${id}`);
      });

      this.peer.on('connection', (conn) => {
        console.log(`[CloudSync] Player/Audience connected to Host: ${conn.peer}`);
        this.connections.add(conn);

        conn.on('open', () => {
          if (this.currentRoomState) {
            conn.send({ type: 'SYNC_STATE', payload: this.currentRoomState });
          }
        });

        conn.on('data', (data: any) => {
          try {
            const msg: WsMessage = typeof data === 'string' ? JSON.parse(data) : data;
            if (this.onActionReceived) {
              this.onActionReceived(msg);
            }
          } catch (err) {
            console.error('[CloudSync] Error parsing player action:', err);
          }
        });

        conn.on('close', () => {
          this.connections.delete(conn);
        });

        conn.on('error', () => {
          this.connections.delete(conn);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('[CloudSync] Host PeerJS info:', err.type);
        // If host ID is already taken or reconnected, fallback gracefully
      });
    } catch (err) {
      console.error('[CloudSync] Host init error:', err);
    }
  }

  public initClient(roomId: string, onState: SyncCallback) {
    this.roomId = roomId.toUpperCase();
    this.isHost = false;
    this.onStateChange = onState;

    const hostPeerId = `kpop-game-host-${this.roomId.toLowerCase()}`;

    try {
      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', (id) => {
        console.log(`[CloudSync] Client Peer active: ${id}`);
        this.connectToHost(hostPeerId);
      });

      this.peer.on('error', (err) => {
        console.warn('[CloudSync] Client PeerJS info:', err.type);
      });
    } catch (err) {
      console.error('[CloudSync] Client init error:', err);
    }
  }

  private connectToHost(hostPeerId: string) {
    if (!this.peer) return;

    try {
      const conn = this.peer.connect(hostPeerId, {
        reliable: true,
      });

      this.hostConnection = conn;

      conn.on('open', () => {
        console.log(`[CloudSync] Connected to Host ${hostPeerId} via WebRTC DataChannel!`);
      });

      conn.on('data', (data: any) => {
        try {
          const msg: WsMessage = typeof data === 'string' ? JSON.parse(data) : data;
          if (msg.type === 'SYNC_STATE' && msg.payload && this.onStateChange) {
            this.onStateChange(msg.payload);
          }
        } catch (err) {
          console.error('[CloudSync] Error parsing host state:', err);
        }
      });

      conn.on('close', () => {
        console.log('[CloudSync] Connection to host closed, reconnecting in 3s...');
        setTimeout(() => this.connectToHost(hostPeerId), 3000);
      });

      conn.on('error', () => {
        setTimeout(() => this.connectToHost(hostPeerId), 3000);
      });
    } catch (err) {
      console.error('[CloudSync] Connect to host error:', err);
    }
  }

  public broadcastState(newState: RoomState) {
    this.currentRoomState = newState;
    if (!this.isHost) return;

    const msg = { type: 'SYNC_STATE', payload: newState };
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch (err) {
          console.error('[CloudSync] Broadcast error:', err);
        }
      }
    });

    // Also persist to localStorage for local fast sync
    try {
      localStorage.setItem(`kpop_room_state_${this.roomId}`, JSON.stringify(newState));
    } catch {}
  }

  public sendActionToHost(msg: WsMessage) {
    if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(msg);
      } catch (err) {
        console.error('[CloudSync] Send action error:', err);
      }
    }
  }

  public destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.hostConnection = null;
  }
}

export const cloudSync = new CloudSyncManager();
