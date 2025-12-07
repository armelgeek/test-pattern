# Test Pattern - Orchestration avec Unity Bridge

Ce projet démontre comment créer un système d'orchestration de jeu avec intégration Unity Bridge.

## 🎯 Objectifs

Ce projet illustre:
- **Orchestration de phases**: Enchaînement automatique de phases de jeu
- **Unity Bridge**: Communication bidirectionnelle avec Unity (simulée pour la démo)
- **State Management**: Gestion centralisée de l'état du jeu
- **Message Registry**: Définition des messages par jeu
- **Phase Lifecycle**: Accès au bridge dans chaque phase

## 📁 Structure du projet

```
test-pattern/
├── core/                           # Code core réutilisable
│   ├── phases/
│   │   ├── abstract-phase.ts      # Classe de base pour les phases
│   │   ├── game-orchestrator.ts   # Orchestrateur de jeu abstrait
│   │   ├── state.ts               # Gestionnaire d'état
│   │   ├── sequence-phase.ts      # Phase séquentielle
│   │   └── speak-phase.ts         # Phase de speech
│   ├── services/
│   │   ├── abstract-bridge.ts     # Bridge abstrait
│   │   └── unity-bridge.ts        # Implémentation Unity Bridge
│   └── types/
│       ├── bridge-messages.types.ts # Types pour messages
│       └── phase.types.ts         # Types pour phases
│
├── example/                        # Exemple simple d'utilisation
│   ├── index.html                 # Page HTML de démonstration
│   ├── main.ts                    # Point d'entrée de l'exemple
│   ├── mock-unity-bridge.ts       # Bridge simulé pour tests
│   ├── simple-game-orchestrator.ts # Orchestrateur du jeu exemple
│   ├── simple-game-phases.ts      # Phases du jeu exemple
│   └── simple-game-messages.ts    # Messages du jeu exemple
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

```bash
npm install
```

### Lancer l'exemple

```bash
npm run dev
```

Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:1234`)

### Build pour production

```bash
npm run build
```

## 📚 Guide d'utilisation

### 1. Créer un Message Registry pour votre jeu

Chaque jeu définit ses propres messages dans un registry:

```typescript
import type { MessageRegistry } from '../core/types/bridge-messages.types';

export const MY_GAME_MESSAGES: MessageRegistry = {
  'GAME_STARTED': {
    type: 'GAME_STARTED',
    direction: 'toUnity',
  },
  'BUTTON_CLICKED': {
    type: 'BUTTON_CLICKED',
    direction: 'fromUnity',
  },
  // ... autres messages
};
```

### 2. Créer des phases pour votre jeu

Les phases héritent de `PhaseBase` et peuvent utiliser le Unity Bridge:

```typescript
import { PhaseBase } from '../core/phases/abstract-phase';
import { StateManager } from '../core/phases/state';

export class MyPhase extends PhaseBase {
  constructor() {
    super('my-phase', 'Ma Phase');
  }

  async start(stateManager: StateManager): Promise<void> {
    // Envoyer un message à Unity
    this.sendToUnity(stateManager, 'PHASE_CHANGED', { 
      phase: this.id 
    });

    // Écouter les messages de Unity
    this.onUnityMessage(stateManager, 'BUTTON_CLICKED', (data) => {
      console.log('Bouton cliqué:', data);
      this.complete(); // Terminer la phase
    });
  }
}
```

### 3. Créer un orchestrateur pour votre jeu

```typescript
import { GameOrchestrator } from '../core/phases/game-orchestrator';

interface MyGameState {
  score: number;
}

export class MyGameOrchestrator extends GameOrchestrator<MyGameState> {
  protected getDefaultGameState(): MyGameState {
    return { score: 0 };
  }

  protected setupPhases(): PhaseBase[] {
    return [
      new IntroPhase(),
      new GameplayPhase(),
      new ConclusionPhase(),
    ];
  }
}
```

### 4. Initialiser et démarrer le jeu

```typescript
import { StateManager } from '../core/phases/state';
import { MockUnityBridge } from './mock-unity-bridge';

// Créer le bridge (mock pour tests ou vrai pour Unity)
const bridge = new MockUnityBridge(MY_GAME_MESSAGES);

// Créer le state manager
const stateManager = new StateManager(initialState, undefined, bridge);

// Créer et démarrer l'orchestrateur
const orchestrator = new MyGameOrchestrator(stateManager, bridge);
orchestrator.initialize();
orchestrator.start();
```

## 🔧 API des Phases

### Méthodes disponibles dans les phases

#### Communication Unity

```typescript
// Envoyer un message à Unity
this.sendToUnity(stateManager, 'MESSAGE_TYPE', { data });

// Écouter un message de Unity (auto-cleanup)
this.onUnityMessage(stateManager, 'MESSAGE_TYPE', (data) => {
  // Handler
});

// Accéder au bridge directement
const bridge = this.getBridge(stateManager);
```

#### State Management

```typescript
// Lire le game state
const gameState = this.getGameState();

// Mettre à jour le game state
this.updateGameState({ score: 100 });

// Lire/modifier le state global
const state = this.getState(stateManager);
this.setState(stateManager, { currentPhase: 'intro' });
```

#### Événements

```typescript
// Émettre un événement
this.emit(stateManager, 'customEvent', { data });

// Écouter un événement (auto-cleanup)
this.onEvent(stateManager, 'customEvent', (data) => {
  // Handler
});
```

#### Lifecycle

```typescript
// Terminer la phase
this.complete();

// Vérifier si complétée
if (this.isCompleted()) { }

// Enregistrer un cleanup
this.addCleanup(() => {
  // Code de nettoyage
});
```

## 🧪 Tests et Débogage

### Console du navigateur

L'exemple expose plusieurs objets globaux pour le débogage:

```javascript
// Accéder à l'orchestrateur
window.gameOrchestrator

// Accéder au state manager
window.stateManager

// Accéder au bridge
window.bridge

// Simuler un clic Unity
window.simulateUnityClick()
```

### Simuler des messages Unity

```typescript
// Dans le code
bridge.simulateUnityMessage('BUTTON_CLICKED', { button: 'test' });
```

## 📖 Concepts clés

### Orchestration
L'orchestrateur gère automatiquement l'enchaînement des phases. Chaque phase:
1. Démarre (`start()`)
2. Exécute sa logique
3. Se termine (`complete()`)
4. Passe à la suivante

### Unity Bridge
Le bridge permet la communication bidirectionnelle:
- **toUnity**: Messages envoyés à Unity
- **fromUnity**: Messages reçus de Unity
- **bidirectional**: Messages dans les deux sens

Le bridge gère automatiquement:
- La file d'attente si Unity n'est pas prêt
- Le nettoyage des handlers
- La validation des messages

### Message Registry
Chaque jeu définit ses messages dans un registry qui spécifie:
- Le type de message
- La direction (toUnity/fromUnity/bidirectional)
- Optionnellement: schema de validation et handlers

### State Management
Deux niveaux d'état:
- **App State**: État global de l'application (géré par StateManager)
- **Game State**: État spécifique au jeu (géré par GameOrchestrator)

## 🎓 Exemple fourni

L'exemple `simple-game` démontre:
- ✅ 4 phases avec transitions automatiques
- ✅ Envoi de messages à Unity dans chaque phase
- ✅ Écoute de messages Unity (simulation)
- ✅ Mise à jour du game state
- ✅ Interface web pour tester

## 📝 Licence

ISC
