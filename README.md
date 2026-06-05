# QuizMaster Battle

Application mobile de quiz multijoueur — React Native CLI (sans Expo), TypeScript, Android.

## Prérequis

- Node.js >= 22
- JDK 17
- Android SDK (ANDROID_HOME configuré)
- Émulateur Android ou appareil USB avec débogage activé

## Installation

```bash
cd QuizMasterBattle
npm install
```

## Lancer sur Android

```bash
npx react-native run-android
```

Dans un second terminal (si le Metro bundler ne démarre pas automatiquement) :

```bash
npm start
```

## Stack technique

| Domaine | Technologie |
|---------|-------------|
| Framework | React Native CLI 0.85 |
| Langage | TypeScript |
| Navigation | React Navigation 7 |
| État global | Redux Toolkit |
| UI | React Native Paper (MD3) |
| Animations | Reanimated 3 + Gesture Handler |
| Icônes | react-native-vector-icons |
| Base locale | react-native-quick-sqlite |
| Préférences | AsyncStorage |
| Multijoueur | BLE (react-native-ble-plx), TCP/Zeroconf (Wi-Fi LAN), salons simulés en ligne |

## Structure du projet

```
src/
├── assets/           # Images, sons
├── components/       # Composants réutilisables
├── screens/          # Écrans
├── navigation/       # React Navigation
├── store/            # Redux slices
├── database/         # SQLite, migrations, repositories
├── bluetooth/        # Service Bluetooth
├── wifi/             # Service Wi-Fi LAN
├── multiplayer/      # Service en ligne (simulation locale)
├── hooks/
├── services/
├── constants/
├── utils/
└── types/
```

## Modes de jeu

- **Solo** : quiz QCM par thème (Culture, Informatique, React Native). Une erreur = fin de partie.
- **Battle** : tour par tour, citez des réponses valides sans doublon. Dernier joueur actif gagne.
- **Battle Royale** : enchères sur le nombre de réponses, puis phase de preuve.

## Multijoueur

- **Local** : joueurs sur le même appareil (Battle / Royale).
- **Bluetooth** : scan et salons (nécessite Bluetooth activé + permissions).
- **Wi-Fi LAN** : serveur TCP + découverte Zeroconf sur le réseau local.
- **En ligne** : salons par code d'invitation et matchmaking (couche simulée côté client ; brancher un backend pour la production).

## Base de données

Tables créées automatiquement au premier lancement : `users`, `profiles`, `quiz_categories`, `quiz_questions`, `quiz_answers`, `game_history`, `battle_history`, `royale_history`, `achievements`, `settings`.

Données de démonstration (questions) insérées automatiquement.

## Permissions Android

Bluetooth, localisation (scan BLE), réseau local — déclarées dans `AndroidManifest.xml`.

## Dépannage

```bash
cd android && ./gradlew clean && cd ..
npx react-native start --reset-cache
```

Sur Windows :

```powershell
cd android; .\gradlew.bat clean; cd ..
```
