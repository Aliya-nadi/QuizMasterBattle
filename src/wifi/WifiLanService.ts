import TcpSocket from 'react-native-tcp-socket';
import Zeroconf from 'react-native-zeroconf';
import type { MultiplayerRoom } from '../types';

const SERVICE_TYPE = '_quizmaster._tcp.';
const SERVICE_NAME = 'QuizMasterBattle';
const DEFAULT_PORT = 41234;

type MessageHandler = (data: Record<string, unknown>) => void;

class WifiLanService {
  private zeroconf: Zeroconf;
  private server: ReturnType<typeof TcpSocket.createServer> | null = null;
  private clients: ReturnType<typeof TcpSocket.createConnection>[] = [];
  private messageHandlers: MessageHandler[] = [];
  private room: MultiplayerRoom | null = null;
  private isHost = false;

  constructor() {
    this.zeroconf = new Zeroconf();
  }

  startServer(hostId: string, hostName: string, mode: 'battle' | 'royale'): MultiplayerRoom {
    this.isHost = true;
    this.room = {
      id: `wifi_${Date.now()}`,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
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
      maxPlayers: 6,
      isPrivate: false,
    };

    this.server = TcpSocket.createServer(socket => {
      this.clients.push(socket);
      socket.on('data', data => {
        try {
          const parsed = JSON.parse(data.toString());
          this.handleMessage(parsed);
        } catch {
          // ignore invalid JSON
        }
      });
      socket.on('close', () => {
        this.clients = this.clients.filter(c => c !== socket);
      });
    });

    this.server.listen({ port: DEFAULT_PORT, host: '0.0.0.0' });
    this.zeroconf.publishService(SERVICE_NAME, SERVICE_TYPE, 'local.', DEFAULT_PORT, {
      roomCode: this.room.code,
    });

    return this.room;
  }

  discoverRooms(onFound: (info: { name: string; host: string; port: number; roomCode?: string }) => void): void {
    this.zeroconf.on('resolved', (service: Record<string, unknown>) => {
      const name = String(service.name ?? '');
      const addresses = service.addresses as string[] | undefined;
      const txt = service.txt as Record<string, string> | undefined;
      if (name.includes('QuizMaster')) {
        onFound({
          name,
          host: String(service.host ?? addresses?.[0] ?? ''),
          port: Number(service.port ?? 0),
          roomCode: txt?.roomCode,
        });
      }
    });
    this.zeroconf.scan(SERVICE_TYPE);
  }

  stopDiscovery(): void {
    this.zeroconf.stop();
  }

  connectToHost(host: string, port: number, playerId: string, playerName: string): Promise<boolean> {
    return new Promise(resolve => {
      const socket = TcpSocket.createConnection({ host, port }, () => {
        this.clients.push(socket);
        this.send({ type: 'join', playerId, playerName });
        resolve(true);
      });
      socket.on('error', () => resolve(false));
      socket.on('data', data => {
        try {
          const parsed = JSON.parse(data.toString());
          this.handleMessage(parsed);
        } catch {
          // ignore
        }
      });
    });
  }

  private handleMessage(data: Record<string, unknown>): void {
    if (data.type === 'join' && this.room && this.isHost) {
      const playerId = data.playerId as string;
      const playerName = data.playerName as string;
      if (this.room.players.length < this.room.maxPlayers) {
        this.room.players.push({
          id: playerId,
          name: playerName,
          avatarId: 'avatar_1',
          isEliminated: false,
          score: 0,
        });
        this.broadcast({ type: 'player_joined', player: { id: playerId, name: playerName } });
      }
    }
    this.messageHandlers.forEach(h => h(data));
  }

  send(data: Record<string, unknown>): void {
    const payload = JSON.stringify(data);
    this.clients.forEach(client => {
      try {
        client.write(payload);
      } catch {
        // connection lost
      }
    });
  }

  broadcast(data: Record<string, unknown>): void {
    this.send(data);
    this.messageHandlers.forEach(h => h(data));
  }

  getRoom(): MultiplayerRoom | null {
    return this.room;
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  destroy(): void {
    this.stopDiscovery();
    this.zeroconf.unpublishService(SERVICE_NAME);
    this.server?.close();
    this.clients.forEach(c => c.destroy());
    this.clients = [];
    this.room = null;
  }
}

export const wifiLanService = new WifiLanService();
