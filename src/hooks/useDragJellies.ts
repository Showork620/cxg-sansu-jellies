import { useCallback, useRef } from "react";
import type { FeedbackOptions } from "../feedback/feedbackManager";
import { playFeedback } from "../feedback/feedbackManager";

type DragState = {
  id: string;
  element: HTMLElement;
  dragPreview: HTMLElement;
  sourceGroup: HTMLElement | null;
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  rafId: number | null;
};

function createDragPreview(element: HTMLElement): HTMLElement {
  const rect = element.getBoundingClientRect();
  const preview = element.cloneNode(true) as HTMLElement;

  preview.setAttribute("aria-hidden", "true");
  preview.classList.add("is-dragging", "is-drag-preview");
  preview.style.removeProperty("visibility");
  preview.style.removeProperty("opacity");
  preview.style.setProperty("position", "fixed");
  preview.style.setProperty("left", `${rect.left}px`);
  preview.style.setProperty("top", `${rect.top}px`);
  preview.style.setProperty("width", `${rect.width}px`);
  preview.style.setProperty("height", `${rect.height}px`);
  preview.style.setProperty("z-index", "9999");
  preview.style.setProperty("pointer-events", "none");
  preview.style.setProperty("margin", "0");
  document.body.appendChild(preview);

  return preview;
}

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
    element.style.setProperty("--jelly-skew", "0deg");
    element.style.setProperty("--jelly-scale-x", "1");
    element.style.setProperty("--jelly-scale-y", "1");
    element.style.removeProperty("opacity");
    element.style.removeProperty("pointer-events");
    element.style.removeProperty("visibility");
    element.classList.remove("is-dragging");
  }, []);

  const hidePlacedElement = useCallback((element: HTMLElement) => {
    element.style.setProperty("opacity", "0");
    element.style.setProperty("pointer-events", "none");
    element.style.setProperty("visibility", "hidden");
    element.classList.remove("is-dragging");
  }, []);

  const removeDragPreview = useCallback((state: DragState) => {
    state.dragPreview.remove();
  }, []);

  const scheduleMove = useCallback((state: DragState, dx: number, dy: number, velocityX: number) => {
    if (state.rafId !== null) {
      window.cancelAnimationFrame(state.rafId);
    }

    state.rafId = window.requestAnimationFrame(() => {
      const velocity = Math.abs(velocityX);
      const lagX = Math.max(-16, Math.min(16, velocityX * -0.12));
      const rotation = Math.max(-14, Math.min(14, velocityX * 0.16));
      const skew = Math.max(-10, Math.min(10, velocityX * -0.18));
      const stretchX = Math.min(1.22, 1.06 + velocity * 0.012);
      const stretchY = Math.max(0.88, 1.02 - velocity * 0.007);

      state.dragPreview.style.setProperty("--jelly-x", `${dx + lagX}px`);
      state.dragPreview.style.setProperty("--jelly-y", `${dy}px`);
      state.dragPreview.style.setProperty("--jelly-rotate", `${rotation}deg`);
      state.dragPreview.style.setProperty("--jelly-skew", `${skew}deg`);
      state.dragPreview.style.setProperty("--jelly-scale-x", stretchX.toFixed(3));
      state.dragPreview.style.setProperty("--jelly-scale-y", stretchY.toFixed(3));
    });
  }, []);

  const startDrag = useCallback(
    (jellyId: string, element: HTMLElement, event: React.PointerEvent<HTMLElement>) => {
      if (options.disabled || event.button !== 0) {
        return false;
      }

      event.preventDefault();
      element.setPointerCapture(event.pointerId);
      element.classList.add("is-dragging");
      element.style.setProperty("visibility", "hidden");

      dragStateRef.current = {
        id: jellyId,
        element,
        dragPreview: createDragPreview(element),
        sourceGroup: element.closest(".source-group"),
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        rafId: null
      };
      dragStateRef.current.sourceGroup?.classList.add("has-dragging-jelly");

      playFeedback("jellyPress", {
        ...options.feedbackOptions,
        visualTarget: element
      });
      playFeedback("jellyDragStart", {
        ...options.feedbackOptions,
        visualTarget: element
      });

      return true;
    },
    [options.disabled, options.feedbackOptions]
  );

  const getHandlers = useCallback(
    (jellyId: string) => ({
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        startDrag(jellyId, event.currentTarget, event);
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
        const jellyRect = state.dragPreview.getBoundingClientRect();
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
        state.sourceGroup?.classList.remove("has-dragging-jelly");
        removeDragPreview(state);

        if (dropped) {
          playFeedback("jellyDropSuccess", {
            ...options.feedbackOptions,
            visualTarget: event.currentTarget
          });
          hidePlacedElement(event.currentTarget);
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
          state.sourceGroup?.classList.remove("has-dragging-jelly");
          removeDragPreview(state);
          resetElement(event.currentTarget);
          dragStateRef.current = null;
        }
      }
    }),
    [hidePlacedElement, options, removeDragPreview, resetElement, scheduleMove, startDrag]
  );

  return { getHandlers, startDrag };
}
