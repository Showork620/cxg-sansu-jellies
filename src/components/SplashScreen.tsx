import Character from "./Character";

type SplashScreenProps = {
  onContinue: () => void;
};

function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <section className="screen splash-screen">
      <div className="splash-orbit" aria-hidden="true">
        <span className="mini-jelly blue" />
        <span className="mini-jelly red" />
        <span className="mini-jelly yellow" />
      </div>
      <h1>
        ぷるぷる
        <span>ゼリー</span>
        さんすう
      </h1>
      <Character state="happy" size="large" />
      <button className="primary-action splash-action" type="button" onClick={onContinue}>
        タップしてはじめる
      </button>
    </section>
  );
}

export default SplashScreen;
