import type { Jelly } from "../game/types";

type JellyBlockProps = {
  jelly: Jelly;
  compact?: boolean;
  draggable?: boolean;
  ghost?: boolean;
  dragHandlers?: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  };
};

function JellyBlock({ jelly, compact = false, draggable = false, ghost = false, dragHandlers }: JellyBlockProps) {
  return (
    <span
      aria-label={`${jelly.color === "blue" ? "あお" : "あか"}ゼリー`}
      className={`jelly-block ${jelly.color} ${compact ? "is-compact" : ""} ${draggable ? "is-draggable" : ""} ${
        ghost ? "is-ghost" : ""
      }`}
      role={draggable ? "button" : "img"}
      tabIndex={draggable ? 0 : undefined}
      {...dragHandlers}
    />
  );
}

export default JellyBlock;
