import { SpeechService } from "../services/speech-service";
import { StateManager } from "./state";

export abstract class PhaseBase<TState = any> {
  public readonly id: string;
  public readonly title?: string;

  private _completed = false;
  private _resolve?: () => void;
  private _promise: Promise<void>;
  private _cleanups: Array<() => void> = [];
  private _orchestrator?: any; // Référence à l'orchestrateur

  constructor(id: string, title?: string) {
    this.id = id;
    this.title = title;
    this._promise = new Promise<void>((r) => { this._resolve = r; });
  }

  setOrchestrator(orchestrator: any) {
    this._orchestrator = orchestrator;
  }

  abstract start(stateManager: StateManager<TState>): void | Promise<void>;

  /** Nettoie la phase */
  stop() {
    this._cleanups.forEach(fn => fn());
    this._cleanups = [];
  }

  /** Marque la phase comme complète - déclenche auto l'avancement */
  protected complete() {
    if (this._completed) return;
    this._completed = true;
    this._resolve?.();
  }

  /** Attend la complétion de la phase */
  whenComplete(): Promise<void> {
    return this._promise;
  }

  isCompleted(): boolean {
    return this._completed;
  }

  /** Enregistre un cleanup à exécuter lors du stop */
  protected addCleanup(fn: () => void) {
    this._cleanups.push(fn);
  }

  /** Helper pour écouter un event et auto-cleanup */
  protected onEvent<T = any>(stateManager: StateManager<TState>, event: string, handler: (data: T) => void): void {
    const off = stateManager.on(event, handler);
    this.addCleanup(off);
  }

  /** Helper pour modifier le state global depuis une phase */
  protected setState(stateManager: StateManager<TState>, updates: Partial<TState>) {
    stateManager.setState(updates);
  }

  /** Helper pour obtenir le state global depuis une phase */
  protected getState(stateManager: StateManager<TState>): TState {
    return stateManager.getState();
  }

  /** Helper pour émettre un événement depuis une phase */
  protected emit(stateManager: StateManager<TState>, event: string, data?: any) {
    stateManager.emit(event, data);
  }

  /** Helper pour faire parler le personnage */
  protected async speak(stateManager: StateManager<TState>, message: string): Promise<void> {
    await stateManager.speak(message);
  }

  /** Helper pour obtenir le SpeechService */
  protected getSpeech(stateManager: StateManager<TState>): SpeechService | undefined {
    return stateManager.speech;
  }

  /** Helper pour mettre à jour le game state depuis une phase */
  protected updateGameState<T = any>(updates: Partial<T>) {
    if (!this._orchestrator) {
      console.warn('updateGameState appelé sans orchestrateur');
      return;
    }
    this._orchestrator.updateGameState(updates);
  }

  /** Helper pour obtenir le game state depuis une phase */
  protected getGameState<T = any>(): T | undefined {
    if (!this._orchestrator) {
      console.warn('getGameState appelé sans orchestrateur');
      return undefined;
    }
    return this._orchestrator.getGameState();
  }

  /** Helper pour obtenir le Unity Bridge depuis une phase */
  protected getBridge(stateManager: StateManager<TState>) {
    return stateManager.bridge;
  }

  /** Vérifie si le bridge est disponible et log un warning si non */
  private ensureBridge(stateManager: StateManager<TState>, methodName: string) {
    const bridge = stateManager.bridge;
    if (!bridge) {
      console.warn(`${methodName} appelé sans bridge`);
    }
    return bridge;
  }

  /** Helper pour envoyer un message à Unity depuis une phase */
  protected sendToUnity<T extends string, P = any>(
    stateManager: StateManager<TState>,
    messageType: T,
    data: P
  ): void {
    const bridge = this.ensureBridge(stateManager, 'sendToUnity');
    if (!bridge) return;
    bridge.send(messageType, data);
  }

  /** Helper pour écouter un message Unity depuis une phase */
  protected onUnityMessage<P = any>(
    stateManager: StateManager<TState>,
    messageType: string,
    handler: (data: P) => void
  ): void {
    const bridge = this.ensureBridge(stateManager, 'onUnityMessage');
    if (!bridge) return;
    const unsubscribe = bridge.on(messageType, handler);
    this.addCleanup(unsubscribe);
  }
}