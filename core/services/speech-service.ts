// services/speech-service.ts
import { ISpeechProvider, SpeechConfig, SpeechCallbacks } from '../types/speech.types';
import { WebSpeechProvider } from '../providers/web-speech-provider';
import { ElevenLabsProvider } from '../providers/elevenlabs-provider';

type ProviderType = 'web' | 'elevenlabs';

export class SpeechService {
  private provider: ISpeechProvider;
  private providerType: ProviderType;
  private messageQueue: Array<{ text: string; onComplete?: () => void }> = [];
  private isProcessingQueue: boolean = false;

  // Add storage for the callbacks set through the service
  private currentCallbacks?: SpeechCallbacks;

  constructor(providerType: ProviderType = 'web', apiKey?: string, voiceId?: string) {
    this.providerType = providerType;
    
    if (providerType === 'elevenlabs') {
      if (!apiKey) {
        throw new Error('ElevenLabs API key is required');
      }
      this.provider = new ElevenLabsProvider(apiKey, voiceId);
    } else {
      this.provider = new WebSpeechProvider();
    }
  }

  // Changer de provider à la volée
  async switchProvider(
    providerType: ProviderType,
    apiKey?: string,
    voiceId?: string
  ): Promise<void> {
    this.stop();
    this.providerType = providerType;

    if (providerType === 'elevenlabs') {
      if (!apiKey) {
        throw new Error('ElevenLabs API key is required');
      }
      this.provider = new ElevenLabsProvider(apiKey, voiceId);
    } else {
      this.provider = new WebSpeechProvider();
    }

    // Vérifier que le nouveau provider est disponible
    const available = await this.provider.isAvailable();
    if (!available) {
      throw new Error(`Provider ${providerType} is not available`);
    }

    // Re-apply any callbacks previously set on the service to the new provider
    if (this.currentCallbacks) {
      this.provider.setCallbacks(this.currentCallbacks);
    }
  }

  // Parler immédiatement
  async speak(text: string): Promise<void> {
    return this.provider.speak(text);
  }

  // Parler avec callback
  speakWithCallback(text: string, onComplete?: () => void): void {
    // Use the stored callbacks instead of accessing provider internals
    const originalOnEnd = this.currentCallbacks?.onEnd;

    const composedOnEnd = () => {
      originalOnEnd?.();
      onComplete?.();
    };

    // Preserve other callbacks while overriding onEnd with the composed function
    this.provider.setCallbacks({
      ...(this.currentCallbacks ?? {}),
      onEnd: composedOnEnd,
    });

    this.speak(text);
  }

  // Parler une séquence de messages
  async speakSequence(messages: string[], onComplete?: () => void): Promise<void> {
    for (const message of messages) {
      await this.speak(message);
    }
    onComplete?.();
  }

  // Ajouter à la file d'attente
  enqueue(text: string, onComplete?: () => void): void {
    this.messageQueue.push({ text, onComplete });
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  // Traiter la file d'attente
  private async processQueue(): Promise<void> {
    if (this.messageQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const { text, onComplete } = this.messageQueue.shift()!;

    try {
      await this.speak(text);
      onComplete?.();
    } catch (error) {
      console.error('Error speaking from queue:', error);
    }

    this.processQueue();
  }

  // Méthodes de contrôle
  stop(): void {
    this.provider.stop();
    this.messageQueue = [];
    this.isProcessingQueue = false;
  }

  pause(): void {
    this.provider.pause();
  }

  resume(): void {
    this.provider.resume();
  }

  // Configuration
  setConfig(config: Partial<SpeechConfig>): void {
    this.provider.setConfig(config);
  }

  setCallbacks(callbacks: SpeechCallbacks): void {
    // Store callbacks locally so we can compose/restore them later
    this.currentCallbacks = callbacks;
    this.provider.setCallbacks(callbacks);
  }

  // Informations
  async getVoices(): Promise<string[]> {
    return this.provider.getVoices();
  }

  async isAvailable(): Promise<boolean> {
    return this.provider.isAvailable();
  }

  isSpeaking(): boolean {
    return this.provider.isSpeaking();
  }

  getProviderType(): ProviderType {
    return this.providerType;
  }
}