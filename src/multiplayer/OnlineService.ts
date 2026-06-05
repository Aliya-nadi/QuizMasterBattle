import type { MultiplayerRoom } from '../types';
import { generateRoomCode } from '../utils/gameLogic';

type MessageHandler = (data: Record<string, unknown>) => void;

/** Service en ligne — simulation locale avec salons et matchmaking */
class OnlineService {
  private rooms: Map<string, MultiplayerRoom> = new Map();
  private publicQueue: string[] = [];
  private messageHandlers: MessageHandler[] = [];
  private currentRoomId: string | null = null;

  createRoom(
    hostId: string,
    hostName: string,
    mode: 'battle' | 'royale',
    isPrivate = false,
  ): MultiplayerRoom {
    const code = generateRoomCode();
    const room: MultiplayerRoom = {
      id: `online_${Date.now()}`,
      code,
      hostId,
      mode,
      players: [
        {
          id: hostId,
          name: hostName,
          avatarId: 'avatar_1',
          isEliminated: false,
          score: 0,
        },
      ],
      maxPlayers: 8,
      isPrivate,
    };
    this.rooms.set(room.id, room);
    this.currentRoomId = room.id;
    if (!isPrivate) {
      this.publicQueue.push(room.id);
    }
    this.broadcast({ type: 'room_created', room });
    return room;
  }

  joinByCode(playerId: string, playerName: string, code: string): MultiplayerRoom | null {
    const room = Array.from(this.rooms.values()).find(r => r.code === code.toUpperCase());
    if (!room || room.players.length >= room.maxPlayers) {
      return null;
    }
    room.players.push({
      id: playerId,
      name: playerName,
      avatarId: 'avatar_1',
      isEliminated: false,
      score: 0,
    });
    this.currentRoomId = room.id;
    this.broadcast({ type: 'player_joined', room, player: { id: playerId, name: playerName } });
    return room;
  }

  findMatch(playerId: string, playerName: string, mode: 'battle' | 'royale'): MultiplayerRoom {
    const available = this.publicQueue
      .map(id => this.rooms.get(id))
      .find(r => r && r.mode === mode && r.players.length < r.maxPlayers);

    if (available) {
      return this.joinByCode(playerId, playerName, available.code)!;
    }
    return this.createRoom(playerId, playerName, mode, false);
  }

  getCurrentRoom(): MultiplayerRoom | null {
    if (!this.currentRoomId) {
      return null;
    }
    return this.rooms.get(this.currentRoomId) ?? null;
  }

  leaveRoom(): void {
    this.currentRoomId = null;
  }

  syncGameState(state: Record<string, unknown>): void {
    this.broadcast({ type: 'game_sync', state });
  }

  broadcast(data: Record<string, unknown>): void {
    this.messageHandlers.forEach(h => h(data));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
}

export const onlineService = new OnlineService();
