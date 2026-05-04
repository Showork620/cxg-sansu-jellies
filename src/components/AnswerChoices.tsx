import type { GameState } from "../game/types";

type AnswerChoicesProps = {
  choices: number[];
  selectedAnswer: number | null;
  correctAnswer: number;
  disabled: boolean;
  gameState: GameState;
  onSelect: (answer: number, target: HTMLElement) => void;
};

function AnswerChoices({ choices, selectedAnswer, correctAnswer, disabled, gameState, onSelect }: AnswerChoicesProps) {
  return (
    <div className="answer-area">
      <p className="answer-label">こたえをえらぼう</p>
      <div className="answer-grid">
        {choices.map((choice) => {
          const isSelected = selectedAnswer === choice;
          const isCorrect = gameState === "correct" && choice === correctAnswer;
          const isWrong = gameState === "wrong" && isSelected && choice !== correctAnswer;

          return (
            <button
              className={`answer-button ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
              disabled={disabled}
              key={choice}
              type="button"
              onClick={(event) => onSelect(choice, event.currentTarget)}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AnswerChoices;
