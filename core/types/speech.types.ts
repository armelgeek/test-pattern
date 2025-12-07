// types/speech.types.ts
export type SpeechConfig = {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice?: string;
};

export type SpeechCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
};

export interface ISpeechProvider {
  speak(text: string): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  setConfig(config: Partial<SpeechConfig>): void;
  setCallbacks(callbacks: SpeechCallbacks): void;
  getVoices(): Promise<string[]>;
  isAvailable(): Promise<boolean>;
  isSpeaking(): boolean;
}