import { useCallback, useRef } from "react";
import { useLongPress } from "../hooks/useLongPress";

type ParentMenuHandleProps = {
  progressLabel: string;
  onOpen: (target: HTMLElement) => void;
};

function ParentMenuHandle({ progressLabel, onOpen }: ParentMenuHandleProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const handleProgressChange = useCallback((progress: number) => {
    buttonRef.current?.style.setProperty("--press-progress", progress.toFixed(3));
  }, []);
  const { handlers } = useLongPress(
    () => {
      if (buttonRef.current) {
        onOpen(buttonRef.current);
      }
    },
    handleProgressChange
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.style.getPropertyValue("--press-progress") !== "0") {
      event.currentTarget.style.setProperty("--press-progress", "0");
    }

    handlers.onPointerDown(event);
  };

  return (
    <button
      aria-label={progressLabel}
      className="parent-menu-handle"
      ref={buttonRef}
      style={{ "--press-progress": 0 } as React.CSSProperties}
      type="button"
      onPointerCancel={handlers.onPointerCancel}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlers.onPointerLeave}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
    >
      <span className="handle-dots" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>{progressLabel}</span>
    </button>
  );
}

export default ParentMenuHandle;
