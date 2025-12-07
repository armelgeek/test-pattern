import { AbstractBridge } from './abstract-bridge';
import { MESSAGE_REGISTRY } from '../config/message-registry';
import type { TypedMessage } from '../types/bridge-messages.types';

export class UnityBridge extends AbstractBridge {
  private unityInstance: any = null;
  private checkReadyInterval: number | null = null;

  constructor(debug: boolean = false) {
    super(MESSAGE_REGISTRY, debug);
    this.setupReceiver();
    this.startReadyCheck();
  }

  protected setupReceiver(): void {
    (window as any).receiveUnityMessage = (messageJson: string) => {
      try {
        const message: TypedMessage = JSON.parse(messageJson);
        this.receiveMessage(message);
      } catch (error) {
        console.error('[Unity Bridge] Error parsing message:', error);
      }
    };
  }

  private startReadyCheck(): void {
    this.checkReadyInterval = window.setInterval(() => {
      if ((window as any).unityInstance) {
        this.unityInstance = (window as any).unityInstance;
        this.setReady(true);
        
        if (this.checkReadyInterval) {
          clearInterval(this.checkReadyInterval);
          this.checkReadyInterval = null;
        }

        this.send('REACT_READY', '');
      }
    }, 100);
  }

  protected sendRaw(message: TypedMessage): void {
    if (!this.unityInstance?.SendMessage) {
      console.warn('[Unity Bridge] Unity instance not ready, message queued');
      return;
    }

    try {
      this.unityInstance.SendMessage(
        'WebBridge',
        'ReceiveStringMessageFromJs',
        message.type + + message.data
      );
    } catch (error) {
      console.error('[Unity Bridge] Error sending to Unity:', error);
    }
  }

  public isReady(): boolean {
    return this.ready;
  }

  setValue(value: number): void {
    this.send('SET_VALUE', { value });
  }

  lockColumn(columnIndex: number, locked: boolean): void {
    this.send(locked ? 'COLUMN_LOCKED' : 'COLUMN_UNLOCKED', { columnIndex });
  }

  highlightColumn(columnIndex: number, highlight: boolean): void {
    this.send('HIGHLIGHT_COLUMN', { columnIndex, highlight });
  }

  sendChallengeList(targets: number[]): void {
    this.send('CHALLENGE_LIST', { targets });
  }

  sendCorrectFeedback(): void {
    this.send('CORRECT_ANSWER', {});
  }

  sendWrongFeedback(): void {
    this.send('WRONG_ANSWER', {});
  }

  sendNextGoal(): void {
    this.send('NEXT_GOAL', {});
  }

  playAnimation(animationType: string, columnIndex?: number, duration?: number): void {
    this.send('PLAY_ANIMATION', { animationType, columnIndex, duration });
  }

  lockUnitRoll(locked: boolean): void {
    this.send('LOCK_UNIT_ROLL', { locked });
  }

  lockTenRoll(locked: boolean): void {
    this.send('LOCK_TEN_ROLL', { locked });
  }

  lockHundredRoll(locked: boolean): void {
    this.send('LOCK_HUNDRED_ROLL', { locked });
  }

  lockThousandRoll(locked: boolean): void {
    this.send('LOCK_THOUSAND_ROLL', { locked });
  }

  highlightUnitButtons(highlight: boolean): void {
    this.send('HIGHLIGHT_UNIT_BUTTONS', { highlight });
  }

  destroy(): void {
    if (this.checkReadyInterval) {
      clearInterval(this.checkReadyInterval);
    }
    this.clearHandlers();
    this.clearQueue();
    delete (window as any).receiveUnityMessage;
  }
}

export const unityBridge = new UnityBridge(
  true
);