export type UnityEvent = 
  | { type: 'COLUMN_VALUE_CHANGED'; columnIndex: number; value: number }
  | { type: 'PHASE_CHANGED'; phase: string }
  | { type: 'FEEDBACK_UPDATED'; message: string }
  | { type: 'INSTRUCTION_UPDATED'; message: string }
  | { type: 'COLUMN_UNLOCKED'; columnIndex: number }
  | { type: 'COLUMN_LOCKED'; columnIndex: number }
  | { type: 'VALIDATE_PRESSED' }
  | { type: 'BUTTON_PRESSED'; action: 'add' | 'subtract'; columnIndex: number }
  | { type: 'SPEECH_STARTED' }
  | { type: 'SPEECH_ENDED' }
  | { type: 'GAME_READY' };

export interface IUnityBridge {
  sendToUnity(eventType: string, data: any): void;
  onUnityMessage(callback: (event: UnityEvent) => void): () => void;
  isReady(): boolean;
}