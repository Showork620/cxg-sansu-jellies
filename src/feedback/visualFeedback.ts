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

function getJellyCore(target: HTMLElement | null | undefined): HTMLElement | null | undefined {
  return target?.querySelector<HTMLElement>(".jelly-core") ?? target;
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
        getJellyCore(visualTarget),
        [
          { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" },
          { transform: "translateX(5px) skewX(-7deg) scaleX(1.16) scaleY(0.82)", offset: 0.18 },
          { transform: "translateX(-7px) skewX(8deg) scaleX(0.9) scaleY(1.18)", offset: 0.4 },
          { transform: "translateX(4px) skewX(-4deg) scaleX(1.08) scaleY(0.93)", offset: 0.62 },
          { transform: "translateX(-2px) skewX(2deg) scaleX(0.98) scaleY(1.04)", offset: 0.82 },
          { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" }
        ],
        { duration: reducedMotion ? quick : 620, easing: "cubic-bezier(.18,.89,.22,1)" }
      );
      break;
    case "jellyDropSuccess":
      safeAnimate(
        getJellyCore(visualTarget),
        [
          { transform: "translateX(0) skewX(0deg) scaleX(1.18) scaleY(.78)" },
          { transform: "translateX(-8px) skewX(8deg) scaleX(.88) scaleY(1.22)", offset: 0.3 },
          { transform: "translateX(6px) skewX(-5deg) scaleX(1.08) scaleY(.94)", offset: 0.55 },
          { transform: "translateX(-2px) skewX(2deg) scaleX(.98) scaleY(1.04)", offset: 0.78 },
          { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" }
        ],
        { duration: reducedMotion ? 140 : 700, easing: "cubic-bezier(.18,.89,.22,1)" }
      );
      break;
    case "jellyDropMiss":
      safeAnimate(
        getJellyCore(visualTarget),
        [
          { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" },
          { transform: "translateX(-6px) skewX(7deg) scaleX(.9) scaleY(1.14)" },
          { transform: "translateX(7px) skewX(-7deg) scaleX(1.12) scaleY(.9)" },
          { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" }
        ],
        { duration: reducedMotion ? 120 : 360, easing: "cubic-bezier(.36,.07,.19,.97)" }
      );
      safeAnimate(
        visualTarget,
        [
          {
            transform:
              "translate3d(var(--jelly-x, 0), var(--jelly-y, 0), 0) rotate(var(--jelly-rotate, 0deg)) scaleX(var(--jelly-scale-x, 1)) scaleY(var(--jelly-scale-y, 1))"
          },
          { transform: "translateX(-8px) rotate(-5deg)" },
          { transform: "translateX(7px) rotate(4deg)" },
          { transform: "translateX(0) rotate(0deg)" }
        ],
        { duration: reducedMotion ? 120 : 260, easing: "cubic-bezier(.36,.07,.19,.97)" }
      );
      break;
    case "jellyPackTighten":
      visualTarget?.querySelectorAll<HTMLElement>(".jelly-block .jelly-core").forEach((core, index) => {
        safeAnimate(
          core,
          [
            { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" },
            { transform: "translateX(4px) skewX(-5deg) scaleX(1.08) scaleY(.92)", offset: 0.24 },
            { transform: "translateX(-5px) skewX(6deg) scaleX(.94) scaleY(1.1)", offset: 0.52 },
            { transform: "translateX(2px) skewX(-2deg) scaleX(1.02) scaleY(.99)", offset: 0.76 },
            { transform: "translateX(0) skewX(0deg) scaleX(1) scaleY(1)" }
          ],
          {
            delay: reducedMotion ? 0 : index * 28,
            duration: reducedMotion ? 110 : 520,
            easing: "cubic-bezier(.18,.89,.22,1)"
          }
        );
      });
      break;
    case "jellyMergeComplete":
      visualTarget?.querySelectorAll<HTMLElement>(".jelly-core").forEach((core, index) => {
        safeAnimate(
          core,
          [
            { transform: "translateX(0) scaleX(1) scaleY(1)" },
            { transform: "translateX(5px) scaleX(1.1) scaleY(.88)", offset: 0.22 },
            { transform: "translateX(-6px) scaleX(.92) scaleY(1.15)", offset: 0.48 },
            { transform: "translateX(2px) scaleX(1.03) scaleY(.98)", offset: 0.72 },
            { transform: "translateX(0) scaleX(1) scaleY(1)" }
          ],
          {
            delay: reducedMotion ? 0 : index * 24,
            duration: reducedMotion ? 120 : 640,
            easing: "cubic-bezier(.18,.89,.22,1)"
          }
        );
      });
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
