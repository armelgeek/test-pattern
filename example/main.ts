import { StateManager } from '../core/phases/state';
import { MockUnityBridge } from './mock-unity-bridge';
import { SimpleGameOrchestrator } from './simple-game-orchestrator';
import { SIMPLE_GAME_MESSAGES } from './simple-game-messages';

/**
 * Exemple d'orchestration simple sans Unity
 * Démontre:
 * - La configuration du bridge avec message registry
 * - L'orchestration de phases
 * - L'envoi et la réception de messages Unity dans chaque phase
 * - Les transitions entre phases
 */

// Créer le mock Unity bridge avec le message registry du jeu
const bridge = new MockUnityBridge(SIMPLE_GAME_MESSAGES, true);

// État initial de l'application
interface AppState {
  currentPhase: string;
  message: string;
}

const initialState: AppState = {
  currentPhase: 'idle',
  message: '',
};

// Créer le state manager
const stateManager = new StateManager<AppState>(initialState, undefined, bridge);

// Créer l'orchestrateur de jeu
const gameOrchestrator = new SimpleGameOrchestrator(stateManager, bridge);

// Écouter les événements de l'orchestrateur
stateManager.on('phaseStarted', (data) => {
  console.log(`\n📍 Phase démarrée: ${data.phaseId} - ${data.title}`);
  stateManager.setState({ currentPhase: data.phaseId });
});

stateManager.on('phaseFinished', (data) => {
  console.log(`✅ Phase terminée: ${data.phaseId}\n`);
});

stateManager.on('gameStateChanged', (data) => {
  console.log('🎮 Game state mis à jour:', data.gameState);
});

stateManager.on('gameFinished', () => {
  console.log('\n🏁 Orchestration terminée!');
});

// Afficher les informations de démarrage
console.log('=================================');
console.log('🎮 Exemple d\'Orchestration Simple');
console.log('=================================\n');
console.log('Messages enregistrés:', bridge.getRegisteredMessages());
console.log('Stats du bridge:', bridge.getStats());
console.log('\n--- Démarrage du jeu ---\n');

// Initialiser et démarrer l'orchestrateur
gameOrchestrator.initialize();

// Fonction pour tester la réception de messages Unity
// Utile pour simuler des interactions Unity
function simulateUnityClick() {
  console.log('🖱️  Simulation d\'un clic Unity...');
  bridge.simulateUnityMessage('BUTTON_CLICKED', { button: 'test' });
}

// Exposer globalement pour tests dans la console
(window as any).gameOrchestrator = gameOrchestrator;
(window as any).stateManager = stateManager;
(window as any).bridge = bridge;
(window as any).simulateUnityClick = simulateUnityClick;

// Démarrer le jeu
gameOrchestrator.start().then(() => {
  console.log('\n✨ Programme terminé');
}).catch((error) => {
  console.error('\n❌ Erreur fatale:', error);
});

// Afficher les fonctions disponibles dans la console
console.log('\n💡 Fonctions disponibles dans la console:');
console.log('  - gameOrchestrator: accès à l\'orchestrateur');
console.log('  - stateManager: accès au gestionnaire d\'état');
console.log('  - bridge: accès au bridge Unity');
console.log('  - simulateUnityClick(): simuler un clic Unity');
