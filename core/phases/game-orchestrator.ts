import { SpeechService } from "../services/speech-service";
import { StateManager } from "./state";
import { PhaseBase } from "./abstract-phase";

/**
 * GameOrchestrator: classe abstraite que chaque jeu doit implémenter
 * Le jeu définit toutes ses phases dans setupPhases() et son état initial dans getDefaultState()
 */
export abstract class GameOrchestrator<TGameState = any> {
  protected state: StateManager;
  protected speech?: SpeechService;
  protected gameState: TGameState;
  private phases: PhaseBase[] = [];
  private currentIndex = -1;
  private isRunning = false;

  constructor(state: StateManager, speech?: SpeechService) {
    this.state = state;
    this.speech = speech;
    
    // Injecter speech dans state pour les phases
    (this.state as any).speech = speech;
    
    // Initialiser le game state
    this.gameState = this.getDefaultGameState();
  }

  /** Méthode abstraite: le jeu doit définir son état initial */
  protected abstract getDefaultGameState(): TGameState;

  /** Méthode abstraite: le jeu doit définir toutes ses phases ici */
  protected abstract setupPhases(): PhaseBase[];

  /** Initialise l'orchestrateur */
  initialize() {
    this.phases = this.setupPhases();
  }

  /** Réinitialise le game state */
  resetGameState() {
    this.gameState = this.getDefaultGameState();
  }

  /** Obtenir le game state actuel */
  getGameState(): TGameState {
    return this.gameState;
  }

  /** Mettre à jour le game state et émettre un événement */
  updateGameState(updates: Partial<TGameState>) {
    this.gameState = { ...this.gameState, ...updates };
    // Émettre l'événement pour notifier les composants UI en temps réel
    this.state.emit('gameStateChanged', { 
      gameState: this.gameState,
      updates 
    });
  }

  /** Démarre l'orchestration - exécute toutes les phases en séquence */
  async start() {
    if (this.isRunning) {
      console.warn('L\'orchestrateur est déjà en cours d\'exécution');
      return;
    }

    this.isRunning = true;
    this.currentIndex = 0;

    try {
      while (this.currentIndex < this.phases.length) {
        const phase = this.phases[this.currentIndex];
        await this.runPhase(phase);
        this.currentIndex++;
      }
      
      // Toutes les phases terminées
      this.onComplete();
    } catch (err) {
      console.error('Erreur dans l\'orchestrateur', err);
      this.onError(err);
    } finally {
      this.isRunning = false;
      //this.state.setPhase('idle');
      this.state.emit('gameFinished', {});
    }
  }

  /** Exécute une phase individuelle */
  private async runPhase(phase: PhaseBase): Promise<void> {
    //this.state.setPhase(phase.id);
    this.state.emit('phaseStarted', { phaseId: phase.id, title: phase.title });

    // Injecter l'orchestrateur dans la phase
    phase.setOrchestrator(this);

    await phase.start(this.state);
    await phase.whenComplete();
    phase.stop();

    this.state.emit('phaseFinished', { phaseId: phase.id });
  }

  /** Arrête l'orchestration */
  stop() {
    if (this.currentIndex >= 0 && this.currentIndex < this.phases.length) {
      this.phases[this.currentIndex].stop();
    }
    this.isRunning = false;
  }

  /** Hook: appelé quand toutes les phases sont terminées */
  protected onComplete() {
    console.log('Jeu terminé avec succès');
  }

  /** Hook: appelé en cas d'erreur */
  protected onError(error: any) {
    console.error('Erreur dans le jeu:', error);
  }

  /** Obtenir la phase actuelle */
  getCurrentPhase(): PhaseBase | undefined {
    if (this.currentIndex >= 0 && this.currentIndex < this.phases.length) {
      return this.phases[this.currentIndex];
    }
    return undefined;
  }

  /** Obtenir toutes les phases */
  getPhases(): PhaseBase[] {
    return this.phases;
  }
}