import { StateManager } from "./state";
import { PhaseBase } from "./abstract-phase";

/**
 * SpeakPhase: fait parler le personnage
 */
export class SpeakPhase<TState = any> extends PhaseBase<TState> {
  constructor(
    id: string,
    private text: string | ((sm: StateManager<TState>) => string),
    title?: string
  ) {
    super(id, title);
  }

  async start(sm: StateManager<TState>) {
    const text = typeof this.text === 'function' ? this.text(sm) : this.text;
    await this.speak(sm, text);
    this.complete();
  }
}