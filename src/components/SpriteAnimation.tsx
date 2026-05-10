import { useEffect, useState, type CSSProperties } from "react";
import {
  CHARACTER_SPRITE_BY_STATE,
  type CharacterSpriteSpec
} from "../assets/characters/spriteGallery";
import { useReducedMotion } from "../hooks/useReducedMotion";

type SpriteStyle = CSSProperties & {
  "--frame-count": number;
};

function getSpriteStyle(sprite: CharacterSpriteSpec, frameIndex: number): SpriteStyle {
  return {
    "--frame-count": sprite.frames.length,
    transform: `translateX(-${(frameIndex * 100) / sprite.frames.length}%)`
  };
}

type SpriteAnimationProps = {
  ariaLabel?: string;
  sprite: CharacterSpriteSpec;
};

export function SpriteAnimation({ ariaLabel, sprite }: SpriteAnimationProps) {
  const reducedMotion = useReducedMotion();
  const [playback, setPlayback] = useState({ spriteId: sprite.id, stepIndex: 0 });
  const stepIndex = reducedMotion || playback.spriteId !== sprite.id ? 0 : playback.stepIndex;
  const rawFrameIndex = sprite.sequence[stepIndex] ?? 0;
  const frameIndex = Math.min(Math.max(rawFrameIndex, 0), sprite.frames.length - 1);
  const breathing = sprite.id === "thinking" && frameIndex === 0;
  const stepEffect = sprite.stepEffects?.[stepIndex] ?? null;

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPlayback((current) => ({
        spriteId: sprite.id,
        stepIndex: current.spriteId === sprite.id ? (current.stepIndex + 1) % sprite.sequence.length : 1 % sprite.sequence.length
      }));
    }, sprite.frameDurationsMs[stepIndex] ?? 200);

    return () => window.clearTimeout(timeoutId);
  }, [reducedMotion, sprite.frameDurationsMs, sprite.id, sprite.sequence.length, stepIndex]);

  return (
    <div
      aria-label={ariaLabel ?? `${sprite.label}のアニメーション`}
      className={`sprite-animation is-${sprite.id} ${breathing ? "is-breathing" : ""}`}
      role="img"
    >
      <div className={`sprite-frame-window ${stepEffect ? `is-${stepEffect}` : ""}`} data-frame-index={frameIndex} key={stepIndex}>
        <img alt="" className="sprite-sheet-image" src={sprite.sprite} style={getSpriteStyle(sprite, frameIndex)} />
      </div>
    </div>
  );
}

export function ThinkingSprite() {
  return <SpriteAnimation sprite={CHARACTER_SPRITE_BY_STATE.thinking} />;
}

export function WrongSprite() {
  return <SpriteAnimation sprite={CHARACTER_SPRITE_BY_STATE.wrong} />;
}

export function CorrectSprite() {
  return <SpriteAnimation sprite={CHARACTER_SPRITE_BY_STATE.correct} />;
}

export function PraiseSprite() {
  return <SpriteAnimation sprite={CHARACTER_SPRITE_BY_STATE.praise} />;
}
