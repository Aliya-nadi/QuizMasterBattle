import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientBackground } from '../components/GradientBackground';
import { colors, spacing } from '../constants/theme';
import { bluetoothService } from '../bluetooth/BluetoothService';
import { wifiLanService } from '../wifi/WifiLanService';
import { onlineService } from '../multiplayer/OnlineService';
import { MainStackParamList } from '../navigation/types';
import { RootState } from '../store';

type Props = NativeStackScreenProps<MainStackParamList, 'MultiplayerConnect'>;

export function MultiplayerConnectScreen({ navigation, route }: Props) {
  const { mode, type } = route.params;
  const { user } = useSelector((s: RootState) => s.auth);
  const [devices, setDevices] = useState<{ id: string; name: string }[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [room, setRoom] = useState<{ code: string; id: string } | null>(null);

  useEffect(() => {
    return () => {
      bluetoothService.stopScan();
      wifiLanService.stopDiscovery();
    };
  }, []);

  const startScan = async () => {
    setScanning(true);
    setDevices([]);
    if (type === 'bluetooth') {
      const enabled = await bluetoothService.isEnabled();
      if (!enabled) {
        Alert.alert('Bluetooth', 'Activez le Bluetooth');
        setScanning(false);
        return;
      }
      await bluetoothService.scanDevices(device => {
        setDevices(prev => {
          if (prev.find(d => d.id === device.id)) {
            return prev;
          }
          return [...prev, { id: device.id, name: device.name ?? 'Appareil' }];
        });
      });
      setTimeout(() => setScanning(false), 10000);
    } else if (type === 'wifi') {
      wifiLanService.discoverRooms(info => {
        setDevices(prev => [
          ...prev,
          { id: info.host, name: `${info.name} (${info.roomCode})` },
        ]);
      });
      setTimeout(() => {
        wifiLanService.stopDiscovery();
        setScanning(false);
      }, 8000);
    }
  };

  const createRoom = () => {
    const hostId = user?.id?.toString() ?? 'host';
    const hostName = user?.pseudo ?? 'Hôte';
    let r;
    if (type === 'bluetooth') {
      r = bluetoothService.createRoom(hostId, hostName, mode);
    } else if (type === 'wifi') {
      r = wifiLanService.startServer(hostId, hostName, mode);
    } else {
      r = onlineService.createRoom(hostId, hostName, mode, false);
    }
    setRoom({ code: r.code, id: r.id });
    Alert.alert('Salle créée', `Code : ${r.code}`);
  };

  const joinRoom = () => {
    const playerId = user?.id?.toString() ?? 'guest';
    const playerName = user?.pseudo ?? 'Joueur';
    let joined = null;
    if (type === 'bluetooth') {
      joined = bluetoothService.joinRoom(playerId, playerName, roomCode.toUpperCase());
    } else if (type === 'online') {
      joined = onlineService.joinByCode(playerId, playerName, roomCode);
    }
    if (!joined) {
      Alert.alert('Erreur', 'Impossible de rejoindre la salle');
      return;
    }
    navigateToGame(joined.players);
  };

  const navigateToGame = (players: import('../types').BattlePlayer[]) => {
    if (mode === 'battle') {
      navigation.navigate('BattleGame', {
        topicId: 'git_cmds',
        players,
        connection: type,
      });
    } else {
      navigation.navigate('RoyaleGame', { topicId: 'git_cmds' });
    }
  };

  const matchmake = () => {
    const r = onlineService.findMatch(
      user?.id?.toString() ?? '1',
      user?.pseudo ?? 'Joueur',
      mode,
    );
    setRoom({ code: r.code, id: r.id });
    Alert.alert('Match trouvé', `Code salon : ${r.code}`);
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Multijoueur — {type}
        </Text>
        <Button mode="contained" onPress={createRoom} style={styles.btn}>
          Créer une salle
        </Button>
        {room && (
          <Text style={styles.code}>Code : {room.code}</Text>
        )}
        <TextInput
          label="Code d'invitation"
          value={roomCode}
          onChangeText={setRoomCode}
          mode="outlined"
          style={styles.input}
          textColor={colors.text}
        />
        <Button mode="contained-tonal" onPress={joinRoom} style={styles.btn}>
          Rejoindre
        </Button>
        {type === 'online' && (
          <Button mode="outlined" onPress={matchmake} style={styles.btn}>
            Matchmaking rapide
          </Button>
        )}
        {(type === 'bluetooth' || type === 'wifi') && (
          <>
            <Button mode="outlined" onPress={startScan} loading={scanning} style={styles.btn}>
              {scanning ? 'Recherche...' : 'Rechercher'}
            </Button>
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <Button onPress={() => Alert.alert(item.name, 'Connexion en cours...')}>
                  {item.name}
                </Button>
              )}
            />
          </>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  title: { color: colors.text, fontWeight: '700', marginBottom: spacing.lg },
  btn: { marginBottom: spacing.sm },
  input: { marginVertical: spacing.md, backgroundColor: colors.surface },
  code: { color: colors.accent, fontSize: 24, fontWeight: '800', textAlign: 'center', marginVertical: spacing.md },
});
