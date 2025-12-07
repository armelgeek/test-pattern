# Guide de Test - Orchestration

Ce document explique comment tester l'orchestration de phases et le Unity Bridge.

## 🧪 Exécution des tests

### Test automatique via interface web

1. Démarrer le serveur de développement:
```bash
npm run dev
```

2. Ouvrir dans le navigateur:
   - **Page principale**: http://localhost:1234 - Démo interactive
   - **Page de test**: http://localhost:1234/test.html - Tests automatiques

### Test manuel dans la console

Les tests automatiques exposent plusieurs objets dans la console du navigateur:

```javascript
// Accéder à l'orchestrateur
window.gameOrchestrator

// Obtenir l'état actuel du jeu
window.gameOrchestrator.getGameState()

// Obtenir les phases
window.gameOrchestrator.getPhases()

// Obtenir la phase actuelle
window.gameOrchestrator.getCurrentPhase()

// Accéder au bridge
window.bridge

// Voir les statistiques du bridge
window.bridge.getStats()

// Voir les messages enregistrés
window.bridge.getRegisteredMessages()
```

## ✅ Checklist de test

### 1. Test d'initialisation

- [ ] Le bridge se crée sans erreur
- [ ] Le bridge est marqué comme "ready"
- [ ] Le StateManager est créé avec le bridge accessible
- [ ] L'orchestrateur est créé avec le bridge accessible
- [ ] Les phases sont initialisées correctement

**Comment tester:**
```javascript
console.log('Bridge ready:', bridge.isReady()); // doit être true
console.log('Bridge stats:', bridge.getStats());
console.log('Phases:', gameOrchestrator.getPhases().length); // doit être 4
```

### 2. Test des messages Unity

- [ ] Les messages peuvent être envoyés à Unity
- [ ] Les messages peuvent être reçus de Unity
- [ ] Les handlers sont correctement enregistrés
- [ ] Les handlers sont correctement nettoyés après une phase

**Comment tester:**
```javascript
// Enregistrer un handler
const unsubscribe = bridge.on('BUTTON_CLICKED', (data) => {
  console.log('Bouton cliqué:', data);
});

// Simuler un message Unity
bridge.simulateUnityMessage('BUTTON_CLICKED', { button: 'test' });

// Nettoyer
unsubscribe();
```

### 3. Test des transitions de phases

- [ ] Les phases démarrent dans l'ordre correct
- [ ] Les phases se terminent correctement
- [ ] Les événements phaseStarted sont émis
- [ ] Les événements phaseFinished sont émis
- [ ] Le game state est mis à jour entre les phases

**Comment tester:**
```javascript
let phaseOrder = [];

stateManager.on('phaseStarted', (data) => {
  phaseOrder.push(data.phaseId);
  console.log('Phases exécutées:', phaseOrder);
});

// Après l'exécution, vérifier l'ordre:
// ['intro', 'interactive', 'calculation', 'conclusion']
```

### 4. Test du State Management

- [ ] Le state global peut être lu
- [ ] Le state global peut être modifié
- [ ] Le game state peut être lu
- [ ] Le game state peut être modifié
- [ ] Les événements de changement d'état sont émis

**Comment tester:**
```javascript
// State global
const state = stateManager.getState();
stateManager.setState({ currentPhase: 'test' });

// Game state
const gameState = gameOrchestrator.getGameState();
gameOrchestrator.updateGameState({ score: 100 });
```

### 5. Test de l'accès au bridge dans les phases

- [ ] Le bridge est accessible via `getBridge()`
- [ ] `sendToUnity()` fonctionne dans les phases
- [ ] `onUnityMessage()` fonctionne dans les phases
- [ ] Les handlers Unity sont auto-nettoyés à la fin de la phase

**Comment tester:**
Voir les implémentations dans `example/simple-game-phases.ts`:
- `IntroPhase`: envoie des messages
- `InteractivePhase`: écoute des messages
- `CalculationPhase`: met à jour le game state

### 6. Test du cycle de vie complet

- [ ] L'orchestration démarre correctement
- [ ] Toutes les phases s'exécutent
- [ ] L'orchestration se termine correctement
- [ ] L'événement gameFinished est émis
- [ ] Le game state final est correct

**Comment tester:**
```javascript
gameOrchestrator.start().then(() => {
  console.log('Orchestration terminée');
  console.log('State final:', gameOrchestrator.getGameState());
});
```

### 7. Test de redémarrage

- [ ] Le game state peut être réinitialisé
- [ ] L'orchestration peut redémarrer
- [ ] Le deuxième run s'exécute correctement
- [ ] Pas de fuite mémoire (handlers, timers, etc.)

**Comment tester:**
```javascript
gameOrchestrator.resetGameState();
gameOrchestrator.initialize();
gameOrchestrator.start();
```

## 🔍 Tests détaillés par phase

### IntroPhase
```javascript
// Vérifications:
// 1. Message GAME_STARTED envoyé
// 2. Message PHASE_CHANGED envoyé
// 3. Message SHOW_MESSAGE envoyé
// 4. Phase se termine après 1 seconde
```

### InteractivePhase
```javascript
// Vérifications:
// 1. Message PHASE_CHANGED envoyé
// 2. Message SHOW_MESSAGE avec instructions envoyé
// 3. Handler pour BUTTON_CLICKED enregistré
// 4. Compteur de clics mis à jour
// 5. Message COUNTER_UPDATED envoyé à chaque clic
// 6. Phase se termine après 3 clics OU 2 secondes
```

### CalculationPhase
```javascript
// Vérifications:
// 1. Message PHASE_CHANGED envoyé
// 2. Game state mis à jour (score +10)
// 3. Message COUNTER_UPDATED envoyé avec le score
// 4. Phase se termine après calcul
```

### ConclusionPhase
```javascript
// Vérifications:
// 1. Message PHASE_CHANGED envoyé
// 2. Game state récupéré correctement
// 3. Message SHOW_MESSAGE avec score final envoyé
// 4. Message GAME_COMPLETED envoyé
// 5. Phase se termine après 1 seconde
```

## 📊 Métriques à surveiller

### Performance
- Temps d'initialisation < 100ms
- Temps de transition entre phases < 10ms
- Pas de memory leaks (utiliser Chrome DevTools)

### Fiabilité
- 100% des phases doivent se terminer
- 100% des messages doivent être envoyés/reçus
- Aucune erreur dans la console

### Cohérence
- Nombre de phaseStarted === nombre de phases
- Nombre de phaseFinished === nombre de phases
- Game state cohérent à chaque étape

## 🐛 Debugging

### Activer les logs détaillés

```javascript
// Activer le debug du bridge
bridge.setDebug(true);

// Voir les stats du bridge
console.log(bridge.getStats());

// Voir la file d'attente
console.log('Queue size:', bridge.getQueueSize());
```

### Inspecteur de phases

```javascript
// Voir toutes les phases
const phases = gameOrchestrator.getPhases();
phases.forEach((phase, i) => {
  console.log(`${i}. ${phase.id} - Complétée: ${phase.isCompleted()}`);
});

// Voir la phase actuelle
const currentPhase = gameOrchestrator.getCurrentPhase();
console.log('Phase actuelle:', currentPhase?.id);
```

### Tracer les événements

```javascript
// Tracer tous les événements
const events = [
  'phaseStarted',
  'phaseFinished',
  'gameStateChanged',
  'gameFinished'
];

events.forEach(event => {
  stateManager.on(event, (data) => {
    console.log(`[EVENT] ${event}:`, data);
  });
});
```

## 🎯 Scénarios de test avancés

### Test 1: Simulation d'interactions Unity
```javascript
// Simuler 3 clics pendant la phase interactive
setTimeout(() => bridge.simulateUnityMessage('BUTTON_CLICKED', {}), 500);
setTimeout(() => bridge.simulateUnityMessage('BUTTON_CLICKED', {}), 1000);
setTimeout(() => bridge.simulateUnityMessage('BUTTON_CLICKED', {}), 1500);
```

### Test 2: Test de multiples runs
```javascript
async function testMultipleRuns() {
  for (let i = 0; i < 3; i++) {
    console.log(`Run ${i + 1}`);
    gameOrchestrator.resetGameState();
    gameOrchestrator.initialize();
    await gameOrchestrator.start();
  }
  console.log('3 runs terminés avec succès');
}
```

### Test 3: Test de charge de messages
```javascript
// Envoyer beaucoup de messages rapidement
for (let i = 0; i < 100; i++) {
  bridge.send('COUNTER_UPDATED', { count: i });
}
console.log('100 messages envoyés');
```

## 📝 Rapport de test

Après avoir exécuté les tests, vérifiez:

```
✅ Initialisation: OK
✅ Messages Unity: OK
✅ Transitions: OK
✅ State Management: OK
✅ Bridge dans phases: OK
✅ Cycle de vie: OK
✅ Redémarrage: OK

Performance:
- Init: <100ms
- Transitions: <10ms
- Memory: stable

Fiabilité:
- Phases terminées: 4/4
- Messages envoyés: 100%
- Erreurs: 0
```

## 🚀 Tests en intégration avec Unity

Pour tester avec le vrai Unity (quand disponible):

1. Remplacer `MockUnityBridge` par `UnityBridge`
2. S'assurer que Unity expose `window.unityInstance`
3. Vérifier que Unity a un GameObject `WebBridge` avec la méthode `ReceiveStringMessageFromJs`
4. Tester la communication bidirectionnelle

```typescript
// Dans votre code de production
import { UnityBridge } from '../core/services/unity-bridge';
const bridge = new UnityBridge(MY_GAME_MESSAGES, true);
```
