import { useState } from "react";
import { createDefaultProgress } from "../game/constants";
import type { AppSettings, Level, ProgressState } from "../game/types";

type ParentMenuProps = {
  settings: AppSettings;
  progress: ProgressState;
  onSettingsChange: (settings: AppSettings | ((current: AppSettings) => AppSettings)) => void;
  onProgressChange: (progress: ProgressState | ((current: ProgressState) => ProgressState)) => void;
  onClose: () => void;
};

const levels: Level[] = [1, 2, 3];

function ParentMenu({ settings, progress, onSettingsChange, onProgressChange, onClose }: ParentMenuProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="parent-menu" role="dialog" aria-modal="true" aria-labelledby="parent-menu-title">
        <h2 id="parent-menu-title">メニュー</h2>

        <div className="menu-section">
          <p>もーど</p>
          <div className="segmented-grid compact">
            <button
              className={`segment blue ${settings.mode === "addition" ? "is-selected" : ""}`}
              type="button"
              onClick={() => onSettingsChange((current) => ({ ...current, mode: "addition" }))}
            >
              たしざん
            </button>
            <button
              className={`segment green ${settings.mode === "subtraction" ? "is-selected" : ""}`}
              type="button"
              onClick={() => onSettingsChange((current) => ({ ...current, mode: "subtraction" }))}
            >
              ひきざん
            </button>
          </div>
        </div>

        <div className="menu-section">
          <p>れべる</p>
          <div className="level-row compact">
            {levels.map((level) => (
              <button
                className={`level-button ${settings.level === level ? "is-selected" : ""}`}
                key={level}
                type="button"
                onClick={() => onSettingsChange((current) => ({ ...current, level }))}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => onSettingsChange((current) => ({ ...current, soundEnabled: event.target.checked }))}
            />
            <span>おと</span>
            <strong>{settings.soundEnabled ? "ON" : "OFF"}</strong>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(event) => onSettingsChange((current) => ({ ...current, hapticsEnabled: event.target.checked }))}
            />
            <span>ブルブル</span>
            <strong>{settings.hapticsEnabled ? "ON" : "OFF"}</strong>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.assistEnabled}
              onChange={(event) => onSettingsChange((current) => ({ ...current, assistEnabled: event.target.checked }))}
            />
            <span>アシスト</span>
            <strong>{settings.assistEnabled ? "ON" : "OFF"}</strong>
          </label>
          <small>きかないたんまつもあります</small>
        </div>

        <div className="progress-summary" aria-label="せいせき">
          <span>こたえた {progress.totalAnswered}</span>
          <span>せいかい {progress.totalCorrect}</span>
          <span>れんぞく {progress.currentStreak}</span>
        </div>

        <div className="menu-actions">
          {confirmReset ? (
            <button
              className="plain-danger"
              type="button"
              onClick={() => {
                onProgressChange(createDefaultProgress());
                setConfirmReset(false);
              }}
            >
              ほんとうにリセット
            </button>
          ) : (
            <button className="plain-danger" type="button" onClick={() => setConfirmReset(true)}>
              しんちょくリセット
            </button>
          )}
          <button className="primary-action small" type="button" onClick={onClose}>
            ゲームにもどる
          </button>
        </div>
      </section>
    </div>
  );
}

export default ParentMenu;
