import { SOUND_MANIFEST, type SoundConfig } from "./soundManifest";
import type { SoundId } from "../game/types";

type AudioRecord = {
  config: SoundConfig;
  elements: HTMLAudioElement[];
  nextIndex: number;
  lastPlayedAt: number;
};

export class SoundManager {
  private readonly records = new Map<SoundId, AudioRecord>();
  private enabled = true;
  private masterVolume = 0.8;
  private unlocked = false;

  constructor(configs: SoundConfig[]) {
    for (const config of configs) {
      this.records.set(config.id, {
        config,
        elements: [],
        nextIndex: 0,
        lastPlayedAt: 0
      });
    }
  }

  configure(options: { enabled: boolean; volume: number }): void {
    this.enabled = options.enabled;
    this.masterVolume = Math.min(1, Math.max(0, options.volume));
  }

  async unlock(): Promise<void> {
    if (this.unlocked) {
      return;
    }

    this.unlocked = true;

    await Promise.allSettled(
      Array.from(this.records.values()).map(async (record) => {
        const firstElement = this.ensureElements(record)[0];

        if (!firstElement) {
          return;
        }

        firstElement.muted = true;
        firstElement.currentTime = 0;

        try {
          await firstElement.play();
          firstElement.pause();
          firstElement.currentTime = 0;
        } catch {
          this.unlocked = false;
        } finally {
          firstElement.muted = false;
        }
      })
    );
  }

  play(id: SoundId, options?: { delayMs?: number; enabled?: boolean }): void {
    if (options?.delayMs) {
      window.setTimeout(() => this.play(id, { enabled: options.enabled }), options.delayMs);
      return;
    }

    if (!this.enabled || options?.enabled === false) {
      return;
    }

    const record = this.records.get(id);

    if (!record || record.config.sources.length === 0) {
      return;
    }

    const now = performance.now();

    if (now - record.lastPlayedAt < record.config.minIntervalMs) {
      return;
    }

    const elements = this.ensureElements(record);
    const audio = elements[record.nextIndex];

    if (!audio) {
      return;
    }

    record.nextIndex = (record.nextIndex + 1) % elements.length;
    record.lastPlayedAt = now;
    audio.volume = Math.min(1, Math.max(0, record.config.volume * this.masterVolume));
    audio.currentTime = 0;

    void audio.play().catch(() => {
      this.unlocked = false;
    });
  }

  private ensureElements(record: AudioRecord): HTMLAudioElement[] {
    if (record.elements.length > 0 || record.config.sources.length === 0) {
      return record.elements;
    }

    record.elements = record.config.sources.slice(0, 3).map((source) => {
      const audio = new Audio(source);
      audio.preload = "auto";
      return audio;
    });

    return record.elements;
  }
}

export const soundManager = new SoundManager(SOUND_MANIFEST);
