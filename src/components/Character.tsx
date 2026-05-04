import type { CharacterState } from "../game/types";

type CharacterProps = {
  state: CharacterState;
  size?: "normal" | "large";
};

function Character({ state, size = "normal" }: CharacterProps) {
  const happy = state === "happy" || state === "excited";
  const confused = state === "confused";
  const thinking = state === "thinking";
  const armsUp = state === "excited" || state === "happy";

  return (
    <svg
      className={`jelly-character ${size === "large" ? "is-large" : ""} is-${state}`}
      viewBox="0 0 140 210"
      aria-label="ゼリーのキャラクター"
      role="img"
    >
      <path
        className="character-arm left"
        d={armsUp ? "M42 104 C18 90 15 66 29 52" : "M42 112 C18 116 11 136 24 150"}
        fill="none"
        stroke="#52433c"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path
        className="character-arm right"
        d={armsUp ? "M98 104 C122 88 125 63 111 49" : "M98 112 C123 118 128 138 115 152"}
        fill="none"
        stroke="#52433c"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path
        className="character-body"
        d="M78 11 C62 29 47 30 33 43 C44 50 48 60 43 75 C34 101 19 119 19 147 C19 181 42 200 70 200 C98 200 121 181 121 147 C121 111 93 94 88 68 C84 49 94 31 78 11 Z"
      />
      <path
        className="character-shine"
        d="M49 56 C57 45 69 40 82 35"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <ellipse cx="54" cy="103" fill="#312b2b" rx={confused ? 5 : 7} ry={thinking ? 9 : 11} />
      <ellipse cx="86" cy="103" fill="#312b2b" rx={confused ? 5 : 7} ry={thinking ? 9 : 11} />
      {confused && (
        <>
          <path d="M47 83 L61 89" stroke="#312b2b" strokeLinecap="round" strokeWidth="5" />
          <path d="M93 83 L79 89" stroke="#312b2b" strokeLinecap="round" strokeWidth="5" />
        </>
      )}
      <path
        d={happy ? "M50 131 C60 148 81 148 91 131" : confused ? "M56 137 C65 129 76 129 85 137" : "M55 132 C64 139 77 139 86 132"}
        fill="none"
        stroke="#312b2b"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path d="M54 196 C48 206 42 207 36 201" fill="none" stroke="#52433c" strokeLinecap="round" strokeWidth="6" />
      <path d="M86 196 C92 206 98 207 104 201" fill="none" stroke="#52433c" strokeLinecap="round" strokeWidth="6" />
    </svg>
  );
}

export default Character;
