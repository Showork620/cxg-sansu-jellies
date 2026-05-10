type ProgressMeterProps = {
  value: number;
  target: number;
  collecting: boolean;
  completed: boolean;
  visualUnits?: number;
};

const DEFAULT_VISUAL_UNITS = 50;

function ProgressMeter({ value, target, collecting, completed, visualUnits = DEFAULT_VISUAL_UNITS }: ProgressMeterProps) {
  const clampedValue = Math.min(target, Math.max(0, value));
  const ratio = target > 0 ? clampedValue / target : 0;
  const filledUnits = Math.min(visualUnits, Math.floor(ratio * visualUnits));
  const showCurrent = clampedValue > 0 && clampedValue < target;

  return (
    <section
      aria-label="あつめたゼリー"
      aria-valuemax={target}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      aria-valuetext={`${clampedValue}こ`}
      className={`jelly-progress-meter is-embedded ${collecting ? "is-collecting" : ""} ${completed ? "is-complete" : ""}`}
      role="meter"
    >
      <span className="progress-value" aria-hidden="true">
        {clampedValue}
        <span className="progress-value-divider">/</span>
        <span className="progress-value-target">{target}</span>
      </span>
      <div className="progress-capsule-track" aria-hidden="true">
        {Array.from({ length: visualUnits }, (_, index) => {
          const filled = index < filledUnits;
          const current = showCurrent && index === filledUnits;
          const className = [
            "progress-capsule",
            filled ? "is-filled" : "",
            current ? "is-current" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <span
              className={className}
              key={index}
              style={{ "--capsule-index": index } as React.CSSProperties}
            />
          );
        })}
      </div>
    </section>
  );
}

export default ProgressMeter;
