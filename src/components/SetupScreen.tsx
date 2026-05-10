import { useState } from "react";
import type { AppSettings, Level } from "../game/types";
import Character from "./Character";

type SetupScreenProps = {
  settings: AppSettings;
  onComplete: (settings: AppSettings) => void;
};

const levels: Level[] = [1, 2, 3];

function SetupScreen({ settings, onComplete }: SetupScreenProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  return (
    <section className="screen setup-screen">
      <div className="setup-character">
        <Character state="watching" />
      </div>

      <h1>もーどをえらんでね</h1>

      <div className="segmented-grid" aria-label="もーど">
        <button
          className={`segment blue ${draft.mode === "addition" ? "is-selected" : ""}`}
          type="button"
          onClick={() => setDraft((current) => ({ ...current, mode: "addition" }))}
        >
          たしざん
          <span>3 + 1 = 4</span>
        </button>
        <button
          className={`segment green ${draft.mode === "subtraction" ? "is-selected" : ""}`}
          type="button"
          onClick={() => setDraft((current) => ({ ...current, mode: "subtraction" }))}
        >
          ひきざん
          <span>5 - 2 = 3</span>
        </button>
      </div>

      <h2>れべるをえらんでね</h2>
      <div className="level-row" aria-label="れべる">
        {levels.map((level) => (
          <button
            className={`level-button ${draft.level === level ? "is-selected" : ""}`}
            key={level}
            type="button"
            onClick={() => setDraft((current) => ({ ...current, level }))}
          >
            レベル{level}
          </button>
        ))}
      </div>

      <div className="toggle-row">
        <label className="toggle">
          <input
            type="checkbox"
            checked={draft.soundEnabled}
            onChange={(event) => setDraft((current) => ({ ...current, soundEnabled: event.target.checked }))}
          />
          <span>おと</span>
          <strong>{draft.soundEnabled ? "ON" : "OFF"}</strong>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={draft.hapticsEnabled}
            onChange={(event) => setDraft((current) => ({ ...current, hapticsEnabled: event.target.checked }))}
          />
          <span>ブルブル</span>
          <strong>{draft.hapticsEnabled ? "ON" : "OFF"}</strong>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={draft.assistEnabled}
            onChange={(event) => setDraft((current) => ({ ...current, assistEnabled: event.target.checked }))}
          />
          <span>アシスト</span>
          <strong>{draft.assistEnabled ? "ON" : "OFF"}</strong>
        </label>
      </div>

      <button className="primary-action" type="button" onClick={() => onComplete(draft)}>
        このせっていではじめる
      </button>
    </section>
  );
}

export default SetupScreen;
