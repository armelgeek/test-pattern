import { AbstractBridge } from '../core/services/abstract-bridge';
import type { TypedMessage, MessageRegistry } from '../core/types/bridge-messages.types';

/**
 * MockUnityBridge: simule le bridge Unity pour tester l'orchestration sans Unity
 * Permet de tester les messages et l'orchestration en environnement web pur
 */
export class MockUnityBridge extends AbstractBridge {
  private consoleLogging = true;

  constructor(registry: MessageRegistry, debug: boolean = true) {
    super(registry, debug);
    this.setupReceiver();
    // Simuler que le bridge est prêt immédiatement
    this.setReady(true);
  }

  protected setupReceiver(): void {
    // Dans un vrai bridge, on écouterait les messages de Unity
    // Ici on simule juste la réception
    if (this.consoleLogging) {
      console.log('[Mock Unity Bridge] Receiver setup complete');
    }
  }

  protected sendRaw(message: TypedMessage): void {
    // Dans un vrai bridge, on enverrait à Unity
    // Ici on log simplement le message
    if (this.consoleLogging) {
      console.log('[Mock Unity Bridge] → Unity:', message);
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  /**
   * Simule la réception d'un message depuis Unity
   * Utile pour tester les handlers
   */
  public simulateUnityMessage<T extends string, P = any>(type: T, data: P): void {
    const message: TypedMessage<T, P> = {
      type,
      data,
      timestamp: Date.now(),
    };
    
    if (this.consoleLogging) {
      console.log('[Mock Unity Bridge] ← Unity:', message);
    }
    
    this.receiveMessage(message as TypedMessage);
  }

  public setConsoleLogging(enabled: boolean): void {
    this.consoleLogging = enabled;
  }
}
