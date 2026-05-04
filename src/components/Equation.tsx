import type { Problem } from "../game/types";

type EquationProps = {
  problem: Problem;
  revealAnswer: boolean;
};

function Equation({ problem, revealAnswer }: EquationProps) {
  const operator = problem.mode === "addition" ? "+" : "-";

  return (
    <div className={`equation ${revealAnswer ? "is-complete" : ""}`} aria-label="もんだい">
      <span className="equation-number left">{problem.left}</span>
      <span className="equation-operator">{operator}</span>
      <span className="equation-number right">{problem.right}</span>
      <span className="equation-operator">=</span>
      <span className="equation-answer">{revealAnswer ? problem.answer : "?"}</span>
    </div>
  );
}

export default Equation;
