import { StateManager } from '../core/phases/state';
import { MockUnityBridge } from './mock-unity-bridge';
import { SimpleGameOrchestrator } from './simple-game-orchestrator';
import { SIMPLE_GAME_MESSAGES } from './simple-game-messages';

/**
 * Tests manuels pour l'orchestration
 * Ce fichier démontre comment tester l'orchestration et les transitions de phases
 */

console.log('=== TESTS DE L\'ORCHESTRATION ===\n');

// Test 1: Création et initialisation du bridge
console.log('Test 1: Création du MockUnityBridge');
const bridge = new MockUnityBridge(SIMPLE_GAME_MESSAGES, false);
console.log('✓ Bridge créé');
console.log('  - Ready:', bridge.isReady());
console.log('  - Messages enregistrés:', bridge.getRegisteredMessages().length);
console.log('  - Stats:', bridge.getStats());

// Test 2: Création du StateManager avec bridge
console.log('\nTest 2: Création du StateManager');
interface TestState {
  phase: string;
  messageCount: number;
}

const initialState: TestState = {
  phase: 'init',
  messageCount: 0,
};

const stateManager = new StateManager<TestState>(initialState, undefined, bridge);
console.log('✓ StateManager créé');
console.log('  - Bridge accessible:', !!stateManager.bridge);

// Test 3: Écoute d'événements
console.log('\nTest 3: Système d\'événements');
let phaseStartedCount = 0;
let phaseFinishedCount = 0;

stateManager.on('phaseStarted', (data) => {
  phaseStartedCount++;
  console.log(`  → Phase démarrée: ${data.phaseId} (${phaseStartedCount})`);
});

stateManager.on('phaseFinished', (data) => {
  phaseFinishedCount++;
  console.log(`  ← Phase terminée: ${data.phaseId} (${phaseFinishedCount})`);
});

stateManager.on('gameStateChanged', (data) => {
  console.log('  🎮 Game state changé:', data.updates);
});

// Test 4: Envoi de messages Unity
console.log('\nTest 4: Envoi de messages à Unity');
bridge.setDebug(false); // Désactiver les logs pour ce test
bridge.send('GAME_STARTED', { timestamp: Date.now() });
bridge.send('PHASE_CHANGED', { phase: 'test' });
console.log('✓ Messages envoyés sans erreur');

// Test 5: Réception de messages Unity
console.log('\nTest 5: Réception de messages Unity');
let messageReceived = false;
bridge.on('BUTTON_CLICKED', (data) => {
  messageReceived = true;
  console.log('  ✓ Message BUTTON_CLICKED reçu:', data);
});

bridge.simulateUnityMessage('BUTTON_CLICKED', { button: 'test-button' });
console.log(`  - Message reçu: ${messageReceived}`);

// Test 6: Création de l'orchestrateur
console.log('\nTest 6: Création de l\'orchestrateur');
const orchestrator = new SimpleGameOrchestrator(stateManager, bridge);
console.log('✓ Orchestrateur créé');
console.log('  - Bridge accessible:', !!orchestrator.getBridge());
console.log('  - Game state initial:', orchestrator.getGameState());

// Test 7: Initialisation des phases
console.log('\nTest 7: Initialisation des phases');
orchestrator.initialize();
const phases = orchestrator.getPhases();
console.log('✓ Phases initialisées:', phases.length);
phases.forEach((phase, index) => {
  console.log(`  ${index + 1}. ${phase.id} - ${phase.title || 'Sans titre'}`);
});

// Test 8: Exécution complète de l'orchestration
console.log('\nTest 8: Exécution de l\'orchestration');
console.log('Démarrage...\n');

bridge.setDebug(true); // Réactiver les logs

orchestrator.start().then(() => {
  console.log('\n=== RÉSULTATS DES TESTS ===');
  console.log('✅ Orchestration terminée avec succès');
  console.log(`  - Phases démarrées: ${phaseStartedCount}`);
  console.log(`  - Phases terminées: ${phaseFinishedCount}`);
  console.log(`  - Game state final:`, orchestrator.getGameState());
  console.log('  - Stats du bridge:', bridge.getStats());
  
  // Test 9: Vérification de la cohérence
  console.log('\nTest 9: Vérification de la cohérence');
  const allPhasesCounted = phaseStartedCount === phases.length && 
                           phaseFinishedCount === phases.length;
  if (allPhasesCounted) {
    console.log('✅ Toutes les phases ont été exécutées correctement');
  } else {
    console.log('❌ Incohérence dans le nombre de phases exécutées');
  }
  
  // Test 10: Vérification du game state
  console.log('\nTest 10: Vérification du game state');
  const finalState = orchestrator.getGameState();
  if (finalState.score > 0) {
    console.log('✅ Le score a été mis à jour:', finalState.score);
  } else {
    console.log('⚠️  Le score n\'a pas été mis à jour');
  }
  
  console.log('\n=== TOUS LES TESTS TERMINÉS ===');
}).catch((error) => {
  console.error('\n❌ ERREUR DANS LES TESTS:', error);
});

// Test 11: Test de redémarrage
setTimeout(() => {
  console.log('\n\nTest 11: Redémarrage de l\'orchestration');
  orchestrator.resetGameState();
  console.log('✓ Game state réinitialisé:', orchestrator.getGameState());
  
  orchestrator.initialize();
  orchestrator.start().then(() => {
    console.log('✅ Redémarrage réussi');
  });
}, 5000);
