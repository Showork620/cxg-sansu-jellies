import type { Jelly } from "../game/types";

const COLOR_LABELS: Record<Jelly["color"], string> = {
  blue: "あお",
  green: "みどり",
  red: "あか"
};

type JellyBlockProps = {
  jelly: Jelly;
  compact?: boolean;
  draggable?: boolean;
  ghost?: boolean;
  onPress?: (event: React.PointerEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
  dragHandlers?: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  };
};

function JellyBlock({
  jelly,
  compact = false,
  draggable = false,
  ghost = false,
  onPress,
  style,
  dragHandlers
}: JellyBlockProps) {
  const handlePointerDown =
    onPress || dragHandlers
      ? (event: React.PointerEvent<HTMLElement>) => {
          if (!draggable) {
            onPress?.(event);
          }

          dragHandlers?.onPointerDown(event);
        }
      : undefined;

  return (
    <span
      aria-label={`${COLOR_LABELS[jelly.color]}ゼリー`}
      className={`jelly-block ${jelly.color} ${compact ? "is-compact" : ""} ${draggable ? "is-draggable" : ""} ${
        ghost ? "is-ghost" : ""
      }`}
      data-jelly-id={jelly.id}
      role={draggable ? "button" : "img"}
      style={style}
      tabIndex={draggable ? 0 : undefined}
      onPointerCancel={dragHandlers?.onPointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={dragHandlers?.onPointerMove}
      onPointerUp={dragHandlers?.onPointerUp}
    >
      <span aria-hidden="true" className="jelly-core">
        <span className="jelly-gloss" />
        <span className="jelly-bubble jelly-bubble-one" />
        <span className="jelly-bubble jelly-bubble-two" />
        <span className="jelly-sparkle jelly-sparkle-one" />
        <span className="jelly-sparkle jelly-sparkle-two" />
      </span>
    </span>
  );
}

export default JellyBlock;
