import { BleManager, Device, State } from 'react-native-ble-plx';
import type { MultiplayerRoom } from '../types';

type MessageHandler = (data: Record<string, unknown>) => void;

class BluetoothService {
  private manager: BleManager;
  private devices: Device[] = [];
  private connectedDevice: Device | null = null;
  private messageHandlers: MessageHandler[] = [];
  private room: MultiplayerRoom | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async isEnabled(): Promise<boolean> {
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  async scanDevices(onDeviceFound: (device: Device) => void, durationMs = 10000): Promise<void> {
    this.devices = [];
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error || !device?.name) {
        return;
      }
      if (!this.devices.find(d => d.id === device.id)) {
        this.devices.push(device);
        onDeviceFound(device);
      }
    });
    setTimeout(() => this.stopScan(), durationMs);
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  async connect(deviceId: string): Promise<boolean> {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      return true;
    } catch {
      return false;
    }
  }

  disconnect(): void {
    this.connectedDevice?.cancelConnection();
    this.connectedDevice = null;
    this.room = null;
  }

  createRoom(hostId: string, hostName: string, mode: 'battle' | 'royale'): MultiplayerRoom {
    this.room = {
      id: `bt_${Date.now()}`,
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
      maxPlayers: 4,
      isPrivate: true,
    };
    this.broadcast({ type: 'room_created', room: this.room });
    return this.room;
  }

  joinRoom(playerId: string, playerName: string, code: string): MultiplayerRoom | null {
    if (!this.room || this.room.code !== code) {
      return null;
    }
    if (this.room.players.length >= this.room.maxPlayers) {
      return null;
    }
    this.room.players.push({
      id: playerId,
      name: playerName,
      avatarId: 'avatar_1',
      isEliminated: false,
      score: 0,
    });
    this.broadcast({ type: 'player_joined', player: { id: playerId, name: playerName } });
    return this.room;
  }

  getRoom(): MultiplayerRoom | null {
    return this.room;
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

  destroy(): void {
    this.stopScan();
    this.disconnect();
    this.manager.destroy();
  }
}

export const bluetoothService = new BluetoothService();
