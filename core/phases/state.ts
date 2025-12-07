import { SpeechService } from "../services/speech-service";

/**
 * StateManager générique pour n'importe quel jeu
 * Chaque jeu définit son propre type d'état
 */
export class StateManager<TState = any> {
  private state: TState;
  private prevState: TState;
  private listeners: Set<(state: TState, prevState: TState) => void> = new Set();
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  public speech?: SpeechService;

  constructor(initialState: TState, speech?: SpeechService) {
    this.state = initialState;
    this.prevState = { ...initialState };
    this.speech = speech;
  }

  getState(): TState {
    return this.state;
  }

  setState(updater: Partial<TState> | ((prev: TState) => Partial<TState>)): void {
    this.prevState = { ...this.state };
    
    const updates = typeof updater === 'function' 
      ? updater(this.state) 
      : updater;
    
    this.state = { ...this.state, ...updates };
    
    this.listeners.forEach(listener => {
      listener(this.state, this.prevState);
    });
  }

  subscribe(listener: (state: TState, prevState: TState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  on(event: string, listener: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    
    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  emit(event: string, data?: any): void {
    this.eventListeners.get(event)?.forEach(listener => {
      listener(data);
    });
  }

  async speak(message: string): Promise<void> {
    if (this.speech) {
      await this.speech.speak(message);
    }
  }
}
