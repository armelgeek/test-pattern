// providers/web-speech-provider.ts
import { ISpeechProvider, SpeechConfig, SpeechCallbacks } from '../types/speech.types';

export class WebSpeechProvider implements ISpeechProvider {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private config: SpeechConfig = {
    lang: 'fr-FR',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  };
  private callbacks: SpeechCallbacks = {};
  private speaking: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.lang;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      // Sélectionner la voix si spécifiée
      if (this.config.voice) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.name === this.config.voice);
        if (voice) utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.speaking = true;
        this.callbacks.onStart?.();
      };

      utterance.onend = () => {
        this.speaking = false;
        this.currentUtterance = null;
        this.callbacks.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.speaking = false;
        this.currentUtterance = null;
        this.callbacks.onError?.(new Error(event.error));
        reject(new Error(event.error));
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    this.synthesis.cancel();
    this.speaking = false;
    this.currentUtterance = null;
  }

  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  setConfig(config: Partial<SpeechConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setCallbacks(callbacks: SpeechCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async getVoices(): Promise<string[]> {
    return new Promise((resolve) => {
      let voices = this.synthesis.getVoices();
      
      if (voices.length > 0) {
        resolve(voices.map(v => v.name));
      } else {
        // Certains navigateurs chargent les voix de manière asynchrone
        this.synthesis.onvoiceschanged = () => {
          voices = this.synthesis.getVoices();
          resolve(voices.map(v => v.name));
        };
      }
    });
  }

  async isAvailable(): Promise<boolean> {
    return 'speechSynthesis' in window;
  }

  isSpeaking(): boolean {
    return this.speaking;
  }
}