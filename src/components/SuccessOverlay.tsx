import type { Problem } from "../game/types";
import Character from "./Character";
import Confetti from "./Confetti";

type SuccessOverlayProps = {
  problem: Problem;
  reducedMotion: boolean;
  onNext: (target: HTMLElement) => void;
};

function SuccessOverlay({ problem, reducedMotion, onNext }: SuccessOverlayProps) {
  return (
    <div className="success-layer" aria-live="assertive">
      {!reducedMotion && <Confetti />}
      <section className="success-panel">
        <h2>やったね！</h2>
        <p>
          {problem.left} {problem.mode === "addition" ? "+" : "-"} {problem.right} = {problem.answer}
        </p>
        <Character state="excited" />
        <button className="primary-action" type="button" onClick={(event) => onNext(event.currentTarget)}>
          つぎのもんだいへ
        </button>
      </section>
    </div>
  );
}

export default SuccessOverlay;
