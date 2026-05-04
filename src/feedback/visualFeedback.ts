import type { FeedbackEventId } from "./feedbackTypes";

function safeAnimate(
  target: HTMLElement | null | undefined,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions
): void {
  if (!target || typeof target.animate !== "function") {
    return;
  }

  target.animate(keyframes, options);
}

export function playVisualFeedback(
  eventId: FeedbackEventId,
  visualTarget: HTMLElement | null | undefined,
  reducedMotion: boolean
): void {
  const quick = reducedMotion ? 80 : 180;

  switch (eventId) {
    case "jellyPress":
      safeAnimate(
        visualTarget,
        [
          { transform: "scaleX(1) scaleY(1)" },
          { transform: "scaleX(1.06) scaleY(0.94)" },
          { transform: "scaleX(1) scaleY(1)" }
        ],
        { duration: quick, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
      break;
    case "jellyDropSuccess":
      safeAnimate(
        visualTarget,
        [
          { transform: "translate3d(var(--jelly-x, 0), var(--jelly-y, 0), 0) scaleX(1.14) scaleY(.86)" },
          { transform: "translate3d(var(--jelly-x, 0), var(--jelly-y, 0), 0) scaleX(.94) scaleY(1.1)" },
          { transform: "translate3d(var(--jelly-x, 0), var(--jelly-y, 0), 0) scaleX(1) scaleY(1)" }
        ],
        { duration: reducedMotion ? 140 : 390, easing: "cubic-bezier(.18,.89,.32,1.28)" }
      );
      break;
    case "jellyDropMiss":
      safeAnimate(
        visualTarget,
        [
          { transform: "translateX(0) rotate(0deg)" },
          { transform: "translateX(-7px) rotate(-4deg)" },
          { transform: "translateX(6px) rotate(3deg)" },
          { transform: "translateX(0) rotate(0deg)" }
        ],
        { duration: reducedMotion ? 120 : 260, easing: "cubic-bezier(.36,.07,.19,.97)" }
      );
      break;
    case "jellyMergeComplete":
      safeAnimate(
        visualTarget,
        [
          { transform: "scale(1)" },
          { transform: "scale(1.025, .97)" },
          { transform: "scale(.985, 1.03)" },
          { transform: "scale(1)" }
        ],
        { duration: reducedMotion ? 120 : 420, easing: "cubic-bezier(.18,.89,.32,1.28)" }
      );
      break;
    case "answerWrong":
      safeAnimate(
        visualTarget,
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(0)" }
        ],
        { duration: reducedMotion ? 100 : 230, easing: "ease-in-out" }
      );
      break;
    case "answerCorrect":
      safeAnimate(
        visualTarget,
        [
          { transform: "scale(1)" },
          { transform: "scale(1.08)" },
          { transform: "scale(1)" }
        ],
        { duration: reducedMotion ? 150 : 520, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
      break;
    case "menuOpen":
      safeAnimate(
        visualTarget,
        [
          { opacity: 0, transform: "scale(.96)" },
          { opacity: 1, transform: "scale(1)" }
        ],
        { duration: reducedMotion ? 80 : 180, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
      break;
    default:
      break;
  }
}
