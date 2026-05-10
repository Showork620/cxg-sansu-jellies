import type { Problem } from "../game/types";
import Character from "./Character";
import Confetti from "./Confetti";

type SuccessOverlayProps = {
  problem: Problem;
  reducedMotion: boolean;
  trueClear: boolean;
  onNext: (target: HTMLElement) => void;
};

function SuccessOverlay({ problem, reducedMotion, trueClear, onNext }: SuccessOverlayProps) {
  return (
    <div className={`success-layer ${trueClear ? "is-true-clear" : ""}`} aria-live="assertive">
      {!reducedMotion && <Confetti />}
      <section className="success-panel">
        <h2>{trueClear ? "100こ あつまった！" : "やったね！"}</h2>
        <p>
          {problem.left} {problem.mode === "addition" ? "+" : "-"} {problem.right} = {problem.answer}
        </p>
        <Character state="happy" />
        <button className="primary-action" type="button" onClick={(event) => onNext(event.currentTarget)}>
          {trueClear ? "もういちどあそぶ" : "つぎのもんだいへ"}
        </button>
      </section>
    </div>
  );
}

export default SuccessOverlay;
