import { useCallback, useRef } from "react";
import type { FeedbackOptions } from "../feedback/feedbackManager";
import { playFeedback } from "../feedback/feedbackManager";

type DragState = {
  id: string;
  element: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  rafId: number | null;
};

export function useDragJellies(options: {
  disabled: boolean;
  dropZoneRef: React.RefObject<HTMLElement | null>;
  feedbackOptions: Omit<FeedbackOptions, "visualTarget">;
  onDropSuccess: (jellyId: string) => void;
}) {
  const dragStateRef = useRef<DragState | null>(null);

  const resetElement = useCallback((element: HTMLElement) => {
    element.style.setProperty("--jelly-x", "0px");
    element.style.setProperty("--jelly-y", "0px");
    element.style.setProperty("--jelly-rotate", "0deg");
    element.style.setProperty("--jelly-scale-x", "1");
    element.style.setProperty("--jelly-scale-y", "1");
    element.classList.remove("is-dragging");
  }, []);

  const scheduleMove = useCallback((state: DragState, dx: number, dy: number, velocityX: number) => {
    if (state.rafId !== null) {
      window.cancelAnimationFrame(state.rafId);
    }

    state.rafId = window.requestAnimationFrame(() => {
      const lagX = Math.max(-12, Math.min(12, velocityX * -0.04));
      const rotation = Math.max(-8, Math.min(8, velocityX * 0.08));

      state.element.style.setProperty("--jelly-x", `${dx + lagX}px`);
      state.element.style.setProperty("--jelly-y", `${dy}px`);
      state.element.style.setProperty("--jelly-rotate", `${rotation}deg`);
      state.element.style.setProperty("--jelly-scale-x", "1.08");
      state.element.style.setProperty("--jelly-scale-y", "1.04");
    });
  }, []);

  const getHandlers = useCallback(
    (jellyId: string) => ({
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        if (options.disabled || event.button !== 0) {
          return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add("is-dragging");

        dragStateRef.current = {
          id: jellyId,
          element: event.currentTarget,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          lastX: event.clientX,
          lastY: event.clientY,
          rafId: null
        };

        playFeedback("jellyPress", {
          ...options.feedbackOptions,
          visualTarget: event.currentTarget
        });
        playFeedback("jellyDragStart", {
          ...options.feedbackOptions,
          visualTarget: event.currentTarget
        });
      },
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
        const state = dragStateRef.current;

        if (!state || state.id !== jellyId || state.pointerId !== event.pointerId) {
          return;
        }

        event.preventDefault();
        const dx = event.clientX - state.startX;
        const dy = event.clientY - state.startY;
        const velocityX = event.clientX - state.lastX;
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        scheduleMove(state, dx, dy, velocityX);
      },
      onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
        const state = dragStateRef.current;

        if (!state || state.id !== jellyId || state.pointerId !== event.pointerId) {
          return;
        }

        event.currentTarget.releasePointerCapture(event.pointerId);
        const dropZone = options.dropZoneRef.current;
        const jellyRect = event.currentTarget.getBoundingClientRect();
        const centerX = jellyRect.left + jellyRect.width / 2;
        const centerY = jellyRect.top + jellyRect.height / 2;
        const zoneRect = dropZone?.getBoundingClientRect();
        const dropped =
          !!zoneRect &&
          centerX >= zoneRect.left &&
          centerX <= zoneRect.right &&
          centerY >= zoneRect.top &&
          centerY <= zoneRect.bottom;

        if (state.rafId !== null) {
          window.cancelAnimationFrame(state.rafId);
        }

        if (dropped) {
          playFeedback("jellyDropSuccess", {
            ...options.feedbackOptions,
            visualTarget: event.currentTarget
          });
          resetElement(event.currentTarget);
          options.onDropSuccess(jellyId);
        } else {
          playFeedback("jellyDropMiss", {
            ...options.feedbackOptions,
            visualTarget: event.currentTarget
          });
          resetElement(event.currentTarget);
        }

        dragStateRef.current = null;
      },
      onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
        const state = dragStateRef.current;

        if (state?.id === jellyId) {
          resetElement(event.currentTarget);
          dragStateRef.current = null;
        }
      }
    }),
    [options, resetElement, scheduleMove]
  );

  return { getHandlers };
}
