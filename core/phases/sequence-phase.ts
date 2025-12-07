import { StateManager } from "./state";
import { PhaseBase } from "./abstract-phase";

/**
 * SequencePhase: exécute plusieurs phases en séquence
 */
export class SequencePhase<TState = any> extends PhaseBase<TState> {
  constructor(
    id: string,
    private phases: PhaseBase<TState>[],
    title?: string
  ) {
    super(id, title);
  }

  async start(stateManager: StateManager<TState>) {
    for (const phase of this.phases) {
      // Propager l'orchestrateur aux sous-phases
      if ((this as any)._orchestrator) {
        phase.setOrchestrator((this as any)._orchestrator);
      }
      await phase.start(stateManager);
      await phase.whenComplete();
      phase.stop();
    }
    this.complete();
  }
}