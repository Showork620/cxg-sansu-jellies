import type { Problem } from "../game/types";

type EquationProps = {
  animateKey: string;
  problem: Problem;
  revealAnswer: boolean;
  settling?: boolean;
  variant: "featured" | "compact";
};

function Equation({ animateKey, problem, revealAnswer, settling = false, variant }: EquationProps) {
  const operator = problem.mode === "addition" ? "+" : "-";
  const tokens = [
    { className: "left", label: problem.left, readIndex: 0 },
    { className: "operator", label: operator, readIndex: 1 },
    { className: "right", label: problem.right, readIndex: 2 },
    { className: "operator", label: "=", readIndex: null },
    { className: "answer", label: revealAnswer ? problem.answer : "?", readIndex: 3 }
  ];

  return (
    <div className={`question-panel-slot is-${variant} ${settling ? "is-settling" : ""}`} key={animateKey}>
      <section className={`question-panel is-${variant} ${revealAnswer ? "is-complete" : ""}`} aria-label="もんだい">
        <div className="equation">
          {tokens.map((token, index) => (
            <span
              className={`equation-token ${token.className} ${token.readIndex === null ? "" : "is-read-token"}`}
              key={`${token.className}-${index}`}
              style={
                token.readIndex === null
                  ? undefined
                  : ({ "--token-index": token.readIndex } as React.CSSProperties)
              }
            >
              {token.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Equation;
