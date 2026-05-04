import { useLongPress } from "../hooks/useLongPress";

type ParentMenuHandleProps = {
  progressLabel: string;
  onOpen: (target: HTMLElement) => void;
};

function ParentMenuHandle({ progressLabel, onOpen }: ParentMenuHandleProps) {
  const { progress, handlers } = useLongPress(() => {
    const target = document.querySelector<HTMLElement>(".parent-menu-handle");
    if (target) {
      onOpen(target);
    }
  });

  return (
    <button
      aria-label={progressLabel}
      className="parent-menu-handle"
      style={{ "--press-progress": progress } as React.CSSProperties}
      type="button"
      {...handlers}
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
