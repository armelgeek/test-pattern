// providers/elevenlabs-provider.ts
import { ISpeechProvider, SpeechConfig, SpeechCallbacks } from '../types/speech.types';

export class ElevenLabsProvider implements ISpeechProvider {
  private apiKey: string;
  private config: SpeechConfig = {
    lang: 'fr-FR',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  };
  private callbacks: SpeechCallbacks = {};
  private speaking: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private voiceId: string = 'default-voice-id'; // ID de la voix ElevenLabs

  constructor(apiKey: string, voiceId?: string) {
    this.apiKey = apiKey;
    if (voiceId) this.voiceId = voiceId;
  }

  async speak(text: string): Promise<void> {
    this.stop();
    this.speaking = true;
    this.callbacks.onStart?.();

    try {
      // Appel à l'API ElevenLabs
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Convertir la réponse en blob audio
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Créer et jouer l'audio
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audio.playbackRate = this.config.rate;
        audio.volume = this.config.volume;

        audio.onended = () => {
          this.speaking = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          this.callbacks.onEnd?.();
          resolve();
        };

        audio.onerror = (error) => {
          this.speaking = false;
          this.currentAudio = null;
          URL.revokeObjectURL(audioUrl);
          const err = new Error('Audio playback error');
          this.callbacks.onError?.(err);
          reject(err);
        };

        audio.ontimeupdate = () => {
          if (audio.duration > 0) {
            const progress = (audio.currentTime / audio.duration) * 100;
            this.callbacks.onProgress?.(progress);
          }
        };

        this.currentAudio = audio;
        audio.play().catch(reject);
      });
    } catch (error) {
      this.speaking = false;
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.callbacks.onError?.(err);
      throw err;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.speaking = false;
  }

  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  }

  setConfig(config: Partial<SpeechConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.voice) {
      this.voiceId = config.voice;
    }
  }

  setCallbacks(callbacks: SpeechCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  async getVoices(): Promise<string[]> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }

      const data = await response.json();
      return data.voices.map((v: any) => v.voice_id);
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      return [];
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  isSpeaking(): boolean {
    return this.speaking;
  }
}