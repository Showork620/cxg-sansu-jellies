import {
  CHARACTER_SPRITE_FRAME_HEIGHT,
  CHARACTER_SPRITE_FRAME_WIDTH,
  CHARACTER_SPRITES
} from "../assets/characters/spriteGallery";
import { SpriteAnimation } from "./SpriteAnimation";

type CharacterSpriteGalleryProps = {
  onClose: () => void;
};

function CharacterSpriteGallery({ onClose }: CharacterSpriteGalleryProps) {
  return (
    <section className="character-gallery-screen">
      <header className="character-gallery-header">
        <div>
          <p>キャラクター素材</p>
          <h1>状態別アニメスプライト</h1>
        </div>
        <button className="gallery-back-button" type="button" onClick={onClose}>
          ゲームへ戻る
        </button>
      </header>

      <div className="sprite-gallery-grid">
        {CHARACTER_SPRITES.map((sprite) => (
          <article className={`sprite-state-card is-${sprite.id}`} key={sprite.id}>
            <div className="sprite-state-copy">
              <p>{sprite.trigger}</p>
              <h2>{sprite.label}</h2>
              <span>{sprite.motion}</span>
            </div>

            <div className="sprite-preview-panel">
              <SpriteAnimation sprite={sprite} />
            </div>

            <div className="sprite-frame-strip" aria-label={`${sprite.label}のフレーム一覧`}>
              {sprite.frames.map((frame, index) => (
                <figure key={frame}>
                  <img
                    alt={`${sprite.label} フレーム${index + 1}`}
                    height={CHARACTER_SPRITE_FRAME_HEIGHT}
                    loading="lazy"
                    src={frame}
                    width={CHARACTER_SPRITE_FRAME_WIDTH}
                  />
                  <figcaption>{index + 1}</figcaption>
                </figure>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CharacterSpriteGallery;
