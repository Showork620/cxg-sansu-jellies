import { useCallback, useState } from "react";
import { useSoundSettings, unlockSoundFromUserGesture } from "./audio/useSound";
import CharacterSpriteGallery from "./components/CharacterSpriteGallery";
import GameScreen from "./components/GameScreen";
import SetupScreen from "./components/SetupScreen";
import SplashScreen from "./components/SplashScreen";
import { loadProgress, loadSettings, saveProgress, saveSettings } from "./game/storage";
import type { AppSettings, ProgressState } from "./game/types";

type Screen = "splash" | "setup" | "game";

function isCharacterGalleryRequested() {
  return new URLSearchParams(window.location.search).get("gallery") === "characters";
}

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [screen, setScreen] = useState<Screen>("splash");
  const [showCharacterGallery, setShowCharacterGallery] = useState(isCharacterGalleryRequested);

  useSoundSettings(settings);

  const updateSettings = useCallback((nextSettings: AppSettings | ((current: AppSettings) => AppSettings)) => {
    setSettings((current) => {
      const resolved = typeof nextSettings === "function" ? nextSettings(current) : nextSettings;
      saveSettings(resolved);
      return resolved;
    });
  }, []);

  const updateProgress = useCallback((nextProgress: ProgressState | ((current: ProgressState) => ProgressState)) => {
    setProgress((current) => {
      const resolved = typeof nextProgress === "function" ? nextProgress(current) : nextProgress;
      saveProgress(resolved);
      return resolved;
    });
  }, []);

  const handleSplashContinue = () => {
    unlockSoundFromUserGesture();
    setScreen(settings.setupCompleted ? "game" : "setup");
  };

  const handleSetupComplete = (nextSettings: AppSettings) => {
    unlockSoundFromUserGesture();
    updateSettings({ ...nextSettings, setupCompleted: true });
    setScreen("game");
  };

  const handleCloseCharacterGallery = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("gallery");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setShowCharacterGallery(false);
  }, []);

  if (showCharacterGallery) {
    return (
      <main className="app-root is-gallery">
        <CharacterSpriteGallery onClose={handleCloseCharacterGallery} />
      </main>
    );
  }

  return (
    <main className="app-root" onPointerDownCapture={unlockSoundFromUserGesture}>
      {screen === "splash" && <SplashScreen onContinue={handleSplashContinue} />}
      {screen === "setup" && <SetupScreen settings={settings} onComplete={handleSetupComplete} />}
      {screen === "game" && (
        <GameScreen
          settings={settings}
          progress={progress}
          onSettingsChange={updateSettings}
          onProgressChange={updateProgress}
        />
      )}
    </main>
  );
}

export default App;
