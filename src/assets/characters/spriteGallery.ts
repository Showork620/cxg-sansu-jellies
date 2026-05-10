import correct01 from "./generated/frames/correct-01.png";
import correct02 from "./generated/frames/correct-02.png";
import correct03 from "./generated/frames/correct-03.png";
import praise01 from "./generated/frames/praise-01.png";
import praise02 from "./generated/frames/praise-02.png";
import thinking01 from "./generated/frames/thinking-01.png";
import thinking02 from "./generated/frames/thinking-02.png";
import thinking03 from "./generated/frames/thinking-03.png";
import thinking04 from "./generated/frames/thinking-04.png";
import wrong01 from "./generated/frames/wrong-01.png";
import wrong02 from "./generated/frames/wrong-02.png";
import wrong03 from "./generated/frames/wrong-03.png";
import correctSprite from "./generated/sprites/correct-sprite.png";
import praiseSprite from "./generated/sprites/praise-sprite.png";
import thinkingSprite from "./generated/sprites/thinking-sprite.png";
import wrongSprite from "./generated/sprites/wrong-sprite.png";

export const CHARACTER_SPRITE_FRAME_WIDTH = 384;
export const CHARACTER_SPRITE_FRAME_HEIGHT = 576;

export type CharacterSpriteState = "thinking" | "wrong" | "correct" | "praise";

export type CharacterSpriteStepEffect = "land-squash";

export type CharacterSpriteSpec = {
  id: CharacterSpriteState;
  label: string;
  trigger: string;
  motion: string;
  sprite: string;
  frames: string[];
  sequence: number[];
  frameDurationsMs: number[];
  stepEffects?: (CharacterSpriteStepEffect | null)[];
};

export const CHARACTER_SPRITES: CharacterSpriteSpec[] = [
  {
    id: "thinking",
    label: "考え中",
    trigger: "ユーザーがゼリーを操作中",
    motion: "通常は小さくぽよぽよ、たまに顎に手を当てて瞬きする",
    sprite: thinkingSprite,
    frames: [thinking01, thinking02, thinking03, thinking04],
    sequence: [0, 0, 0, 1, 2, 3, 2, 1],
    frameDurationsMs: [820, 820, 820, 160, 700, 95, 260, 160]
  },
  {
    id: "wrong",
    label: "間違えた",
    trigger: "ユーザーが間違った回答をした",
    motion: "困り顔のまま首を左右にふりふり",
    sprite: wrongSprite,
    frames: [wrong01, wrong02, wrong03],
    sequence: [1, 0, 1, 2, 1],
    frameDurationsMs: [150, 120, 90, 120, 190]
  },
  {
    id: "correct",
    label: "正解！ぴょんっと喜ぶ",
    trigger: "ユーザーが正解を押した",
    motion: "しゃがみ、ジャンプ、ピーク、ぽよんと地面に着地する小さな喜び",
    sprite: correctSprite,
    frames: [correct01, correct02, correct03],
    sequence: [0, 1, 2, 2],
    frameDurationsMs: [130, 110, 170, 460],
    stepEffects: [null, null, null, "land-squash"]
  },
  {
    id: "praise",
    label: "褒める「すごいね」（拍手）",
    trigger: "結果モーダルで表示",
    motion: "一定のテンポで胸の前で拍手する",
    sprite: praiseSprite,
    frames: [praise01, praise02],
    sequence: [0, 1],
    frameDurationsMs: [230, 230]
  }
];

export const CHARACTER_SPRITE_BY_STATE: Record<CharacterSpriteState, CharacterSpriteSpec> = CHARACTER_SPRITES.reduce(
  (acc, sprite) => {
    acc[sprite.id] = sprite;
    return acc;
  },
  {} as Record<CharacterSpriteState, CharacterSpriteSpec>
);
