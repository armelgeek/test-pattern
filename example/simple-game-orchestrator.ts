import { GameOrchestrator } from '../core/phases/game-orchestrator';
import { StateManager } from '../core/phases/state';
import { PhaseBase } from '../core/phases/abstract-phase';
import type { AbstractBridge } from '../core/services/abstract-bridge';
import { 
  IntroPhase, 
  InteractivePhase, 
  CalculationPhase, 
  ConclusionPhase 
} from './simple-game-phases';

/**
 * Game state pour le jeu simple
 */
interface SimpleGameState {
  score: number;
  level: number;
  lastCalculation?: number;
}

/**
 * SimpleGameOrchestrator: exemple d'orchestration simple
 * Démontre l'utilisation du bridge Unity dans chaque phase
 */
export class SimpleGameOrchestrator extends GameOrchestrator<SimpleGameState> {
  constructor(state: StateManager, bridge?: AbstractBridge) {
    // Pas de speech service pour cet exemple simple
    super(state, undefined, bridge);
  }

  protected getDefaultGameState(): SimpleGameState {
    return {
      score: 0,
      level: 1,
    };
  }

  protected setupPhases(): PhaseBase[] {
    return [
      new IntroPhase(),
      new InteractivePhase(),
      new CalculationPhase(),
      new ConclusionPhase(),
    ];
  }

  protected onComplete(): void {
    console.log('🎉 Jeu simple terminé avec succès!');
    console.log('État final du jeu:', this.getGameState());
  }

  protected onError(error: any): void {
    console.error('❌ Erreur dans le jeu simple:', error);
  }
}
