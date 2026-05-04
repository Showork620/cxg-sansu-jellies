import { useRef, useState } from "react";
import { LONG_PRESS_MOVE_TOLERANCE, LONG_PRESS_MS } from "../game/constants";

export type LongPressHandlers = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
};

export function useLongPress(onLongPress: () => void): { progress: number; handlers: LongPressHandlers } {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startAtRef = useRef(0);
  const startPointRef = useRef({ x: 0, y: 0 });
  const triggeredRef = useRef(false);

  function clear(): void {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setProgress(0);
  }

  function tick(): void {
    const elapsed = performance.now() - startAtRef.current;
    setProgress(Math.min(1, elapsed / LONG_PRESS_MS));

    if (elapsed < LONG_PRESS_MS && !triggeredRef.current) {
      frameRef.current = window.requestAnimationFrame(tick);
    }
  }

  function cancel(): void {
    clear();
    triggeredRef.current = false;
  }

  const handlers: LongPressHandlers = {
    onPointerDown: (event) => {
      if (event.button !== 0) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      triggeredRef.current = false;
      startAtRef.current = performance.now();
      startPointRef.current = { x: event.clientX, y: event.clientY };
      setProgress(0);

      timerRef.current = window.setTimeout(() => {
        triggeredRef.current = true;
        clear();
        onLongPress();
      }, LONG_PRESS_MS);

      frameRef.current = window.requestAnimationFrame(tick);
    },
    onPointerMove: (event) => {
      const dx = event.clientX - startPointRef.current.x;
      const dy = event.clientY - startPointRef.current.y;

      if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE) {
        cancel();
      }
    },
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerLeave: cancel
  };

  return { progress, handlers };
}
