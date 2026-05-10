import {
  CHARACTER_SPRITE_BY_STATE,
  type CharacterSpriteState
} from "../assets/characters/spriteGallery";
import type { CharacterState } from "../game/types";
import { SpriteAnimation } from "./SpriteAnimation";

type CharacterProps = {
  state: CharacterState;
  size?: "normal" | "large";
};

const CHARACTER_SPRITE_STATE_BY_CHARACTER_STATE: Record<CharacterState, CharacterSpriteState> = {
  idle: "thinking",
  watching: "thinking",
  thinking: "thinking",
  confused: "wrong",
  happy: "praise",
  excited: "correct"
};

function Character({ state, size = "normal" }: CharacterProps) {
  const spriteState = CHARACTER_SPRITE_STATE_BY_CHARACTER_STATE[state];
  const sprite = CHARACTER_SPRITE_BY_STATE[spriteState];

  return (
    <div
      className={`jelly-character ${size === "large" ? "is-large" : ""} is-${state}`}
    >
      <SpriteAnimation ariaLabel="ゼリーのキャラクター" key={spriteState} sprite={sprite} />
    </div>
  );
}

export default Character;
