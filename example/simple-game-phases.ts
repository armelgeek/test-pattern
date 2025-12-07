import { PhaseBase } from '../core/phases/abstract-phase';
import { StateManager } from '../core/phases/state';

/**
 * Phase d'introduction qui envoie un message à Unity
 */
export class IntroPhase extends PhaseBase {
  constructor() {
    super('intro', 'Introduction');
  }

  async start(stateManager: StateManager): Promise<void> {
    console.log('=== Phase Introduction ===');
    
    // Envoyer un message à Unity pour indiquer le début du jeu
    this.sendToUnity(stateManager, 'GAME_STARTED', { 
      timestamp: Date.now() 
    });
    
    // Envoyer le changement de phase à Unity
    this.sendToUnity(stateManager, 'PHASE_CHANGED', { 
      phase: this.id,
      title: this.title 
    });

    // Afficher un message
    this.sendToUnity(stateManager, 'SHOW_MESSAGE', {
      text: 'Bienvenue dans le jeu exemple!'
    });

    // Simuler un délai avant de passer à la phase suivante
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Phase Introduction terminée');
    this.complete();
  }
}

/**
 * Phase interactive qui attend une action de Unity
 */
export class InteractivePhase extends PhaseBase {
  private clickCount = 0;
  private targetClicks = 3;

  constructor() {
    super('interactive', 'Phase Interactive');
  }

  async start(stateManager: StateManager): Promise<void> {
    console.log('=== Phase Interactive ===');
    
    // Notifier Unity du changement de phase
    this.sendToUnity(stateManager, 'PHASE_CHANGED', { 
      phase: this.id,
      title: this.title 
    });

    // Afficher les instructions
    this.sendToUnity(stateManager, 'SHOW_MESSAGE', {
      text: `Clique ${this.targetClicks} fois sur le bouton`
    });

    // Écouter les clics depuis Unity
    this.onUnityMessage<{ button: string }>(
      stateManager,
      'BUTTON_CLICKED',
      (data) => {
        this.clickCount++;
        console.log(`Clic reçu: ${this.clickCount}/${this.targetClicks}`);
        
        // Envoyer la mise à jour du compteur à Unity
        this.sendToUnity(stateManager, 'COUNTER_UPDATED', {
          count: this.clickCount,
          target: this.targetClicks
        });

        // Si on a atteint le nombre de clics requis
        if (this.clickCount >= this.targetClicks) {
          console.log('Objectif atteint!');
          this.complete();
        }
      }
    );

    // Pour la démo sans Unity, compléter automatiquement après 2 secondes
    setTimeout(() => {
      if (!this.isCompleted()) {
        console.log('Auto-complétion (démo sans Unity)');
        this.complete();
      }
    }, 2000);
  }
}

/**
 * Phase de calcul qui met à jour le game state
 */
export class CalculationPhase extends PhaseBase {
  constructor() {
    super('calculation', 'Phase de Calcul');
  }

  async start(stateManager: StateManager): Promise<void> {
    console.log('=== Phase de Calcul ===');
    
    // Notifier Unity du changement de phase
    this.sendToUnity(stateManager, 'PHASE_CHANGED', { 
      phase: this.id,
      title: this.title 
    });

    // Afficher un message
    this.sendToUnity(stateManager, 'SHOW_MESSAGE', {
      text: 'Calcul en cours...'
    });

    // Simuler un calcul
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mettre à jour le game state
    const currentState = this.getGameState<any>();
    const score = (currentState?.score || 0) + 10;
    
    this.updateGameState({ 
      score,
      lastCalculation: Date.now()
    });

    // Envoyer le résultat à Unity
    this.sendToUnity(stateManager, 'COUNTER_UPDATED', {
      score,
      label: 'Score'
    });

    console.log(`Score mis à jour: ${score}`);
    console.log('Phase de Calcul terminée');
    
    this.complete();
  }
}

/**
 * Phase finale qui conclut le jeu
 */
export class ConclusionPhase extends PhaseBase {
  constructor() {
    super('conclusion', 'Conclusion');
  }

  async start(stateManager: StateManager): Promise<void> {
    console.log('=== Phase Conclusion ===');
    
    // Notifier Unity du changement de phase
    this.sendToUnity(stateManager, 'PHASE_CHANGED', { 
      phase: this.id,
      title: this.title 
    });

    // Récupérer le score final
    const gameState = this.getGameState<any>();
    const finalScore = gameState?.score || 0;

    // Afficher le message de fin
    this.sendToUnity(stateManager, 'SHOW_MESSAGE', {
      text: `Jeu terminé! Score final: ${finalScore}`
    });

    // Notifier Unity que le jeu est terminé
    this.sendToUnity(stateManager, 'GAME_COMPLETED', {
      score: finalScore,
      timestamp: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Phase Conclusion terminée');
    this.complete();
  }
}
