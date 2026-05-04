import { useEffect } from "react";
import { soundManager } from "./soundManager";
import type { AppSettings } from "../game/types";

export function useSoundSettings(settings: AppSettings): void {
  useEffect(() => {
    soundManager.configure({
      enabled: settings.soundEnabled,
      volume: settings.soundVolume
    });
  }, [settings.soundEnabled, settings.soundVolume]);
}

export function unlockSoundFromUserGesture(): void {
  void soundManager.unlock();
}
