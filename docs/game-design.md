# ぷるぷるゼリー足し算ゲーム 詳細設計書

## 1. 指示書監査

### 1.1 良い点

- 「式を見る、ゼリーで確かめる、数字で答える、キャラと喜ぶ」という学習体験の核が明確。
- レベル1から3で、具体物から抽象的な計算へ段階的に移行する設計になっている。
- 保護者メニューを長押しに限定する方針が、幼児向けの誤操作防止として適切。
- 不正解を失敗扱いにしない方針が、幼児向けゲームとして安全。
- MVPと後回し項目が分かれており、初期実装範囲を切りやすい。

### 1.2 不足・考慮漏れ

| 項目 | 不足内容 | 設計での補完方針 |
| --- | --- | --- |
| 初回起動 | スクショにはスプラッシュと初回設定画面があるが、指示書では通常画面のみ中心 | 初回のみ `SplashScreen` と `SetupScreen` を表示し、以後は長押しメニューから設定変更 |
| PWA詳細 | manifest、Service Worker、GitHub Pages の base path が未定 | `vite-plugin-pwa` 想定、`base` はリポジトリ名に合わせて設定可能にする |
| LocalStorage schema | 保存対象とバージョン管理が未定 | `settings`、`progress`、`problemHistory` を明確化し、schema version を持たせる |
| 長押し条件 | 長押し時間、キャンセル条件、視覚フィードバックが未定 | 1000ms以上で開く。移動、pointer cancel、離した場合は中止。進捗リングで示す |
| ドラッグ操作 | スマホでの pointer/touch 対応、ドロップ判定、操作不能時の挙動が未定 | Pointer Events で統一。ドロップエリア矩形との交差で判定。レベル3はドラッグ不可 |
| 回答可能条件 | ゼリー操作完了前に回答できるかが曖昧 | レベル1/2は移動後に回答可能。未操作でも選択肢は見せるが disabled にする |
| ゼロ問題 | `0 + n` や `n + 0` の表示・操作が未定 | 0個側は空枠と `0` を表示。操作不要ならすぐ回答可能 |
| 選択肢生成 | 答えが0または10のとき近傍候補が足りない場合の補完が未定 | 近傍優先後、0から10の未使用値で補完 |
| 連続問題制御 | 「連続しすぎない」の具体ルールが未定 | 直近3問と完全一致を避ける。候補が少ない場合は最大20回リトライ |
| 成功演出 | 次問題への遷移タイミングが未定 | 自動遷移なし。`つぎのもんだいへ` を押したときだけ進む |
| 音 | MVP後回しだが、UIにはON/OFFがある | 初期実装では設定だけ保存し、音源未実装時は効果音処理を no-op にする |
| アクセシビリティ | 低年齢向けの文字サイズ、タップ領域、motion配慮が未定 | 最小タップ44px以上、数字は大きく、`prefers-reduced-motion` 対応 |
| 外部リソース | 外部リンクなしのためフォント/CDN利用が曖昧 | 初期実装はシステムフォントまたは同梱アセットのみ使用 |
| キャラクター実装 | SVG/CSS/Canvas の方式が未定 | MVPはReact SVGコンポーネント。表情はpropsで切替 |
| 引き算 | 将来拡張とMVP外の境界が未定 | 型・生成器・UI分岐は用意し、完全操作は TODO の後続フェーズ |

### 1.3 仕様上の決定

- 通常プレイ画面には閉じる、戻る、設定ボタンを置かない。
- 初回起動だけは、スクショに合わせてスプラッシュ後に保護者向け設定画面を出す。
- モード・レベルは自動変更しない。親が明示的に変更するまで固定する。
- MVPでは足し算を完成させる。引き算は設計と型だけ先に通す。
- レベル1/2の操作は「右側ゼリーを下段の集約エリアへ移動する」方式に統一する。
- レベル1は集約エリア付近に大きく合計値を表示する。レベル2は表示しない。
- レベル3はゼリーを薄く補助表示するが、ドラッグ不可にする。

## 2. プロダクト概要

### 2.1 目的

幼児が一桁の足し算を、ゼリーブロックという具体物を動かしながら直感的に理解するPWAゲームを作る。

### 2.2 体験の核

1. 数式を見る。
2. ゼリーを動かして数を確かめる。
3. 4択から数字で答える。
4. キャラクターと一緒に喜ぶ。

### 2.3 対象

- 主対象: 幼児から小学校低学年。
- 副対象: 初回設定やレベル調整をする保護者。

## 3. 技術設計

### 3.1 技術スタック

- React
- TypeScript
- Vite
- CSS Modules または通常CSS。初期実装では依存を増やさない。
- Pointer Events によるドラッグ操作。
- LocalStorage による状態保存。
- PWAは `vite-plugin-pwa` を想定。
- GitHub Pages 配信を想定し、`vite.config.ts` の `base` を環境変数または定数で切替可能にする。

### 3.2 ディレクトリ案

```txt
src/
  App.tsx
  main.tsx
  styles/
    global.css
    tokens.css
  components/
    SplashScreen.tsx
    SetupScreen.tsx
    GameScreen.tsx
    Equation.tsx
    JellyBoard.tsx
    JellyBlock.tsx
    AnswerChoices.tsx
    Character.tsx
    ParentMenuHandle.tsx
    ParentMenu.tsx
    SuccessOverlay.tsx
    Confetti.tsx
  game/
    types.ts
    constants.ts
    problemGenerator.ts
    choiceGenerator.ts
    storage.ts
    reducer.ts
    jellyLayout.ts
  hooks/
    useLongPress.ts
    useDragJellies.ts
    useReducedMotion.ts
```

## 4. 画面設計

### 4.1 画面一覧

| 画面 | 目的 | 表示条件 |
| --- | --- | --- |
| SplashScreen | 起動導入。タイトルとキャラクターを見せる | 初回起動時、またはアプリ起動直後の短時間 |
| SetupScreen | 保護者がモード・レベル・音を選ぶ | 初回起動で設定未完了の場合 |
| GameScreen | 通常プレイ | 設定完了後 |
| ParentMenu | 保護者設定 | 左上つまみを長押しした場合のみ |
| SuccessOverlay | 正解演出 | `gameState === "correct"` |

### 4.2 GameScreen レイアウト

スマホ縦画面を基準に、最小幅320pxから動作させる。

```txt
┌────────────────────────┐
│ 長押しつまみ   数式     │
│                        │
│      ゼリー表示エリア    │
│                        │
│      集約/移動先エリア   │
│                        │
│      レベル1の数表示     │
│                        │
│      4択回答ボタン       │
│                        │
│                  キャラ  │
└────────────────────────┘
```

### 4.3 レイアウト寸法目安

- 画面: `min-height: 100dvh`。
- コンテンツ幅: `min(100%, 430px)`。
- 回答ボタン: 56px以上の正方形に近いサイズ。
- 長押しつまみ: 44px以上のタップ領域を確保。
- キャラクター: 画面幅の18%から24%。最大96px程度。
- ゼリー: 42pxから52px。狭い画面ではCSS変数で縮小。
- ゼリー配置: 5列2段。`col = index % 5`、`row = Math.floor(index / 5)`。

## 5. 状態設計

### 5.1 型定義

```ts
export type GameMode = "addition" | "subtraction";

export type Level = 1 | 2 | 3;

export type GameState =
  | "presenting"
  | "manipulating"
  | "answering"
  | "correct"
  | "wrong";

export type Problem = {
  id: string;
  mode: GameMode;
  left: number;
  right: number;
  answer: number;
};

export type CharacterState =
  | "idle"
  | "watching"
  | "thinking"
  | "confused"
  | "happy"
  | "excited";

export type AppSettings = {
  schemaVersion: 1;
  mode: GameMode;
  level: Level;
  soundEnabled: boolean;
  setupCompleted: boolean;
};

export type ProgressState = {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  lastProblemIds: string[];
};

export type JellyGroup = "left" | "right" | "merged" | "removed";

export type Jelly = {
  id: string;
  valueGroup: JellyGroup;
  color: "blue" | "red" | "green";
  index: number;
  placed: boolean;
};
```

### 5.2 AppState

```ts
type AppState = {
  settings: AppSettings;
  progress: ProgressState;
  problem: Problem;
  choices: number[];
  gameState: GameState;
  selectedAnswer: number | null;
  characterState: CharacterState;
  jellies: Jelly[];
  mergedCount: number;
  menuOpen: boolean;
};
```

### 5.3 LocalStorage

| key | 内容 |
| --- | --- |
| `sansu-jellies:settings:v1` | mode、level、soundEnabled、setupCompleted |
| `sansu-jellies:progress:v1` | 解答数、正解数、連続正解、直近問題 |

読み込みに失敗した場合は初期値に戻す。schemaVersion が違う場合も破棄して初期化する。

## 6. 問題生成

### 6.1 足し算

- `left` は 0から10。
- `right` は 0から10。
- `left + right <= 10`。
- `answer = left + right`。
- 直近3問と同じ `mode:left:right` は避ける。
- 同じ答えが3回以上続かないよう、可能な範囲で避ける。

### 6.2 引き算

MVPでは完全操作を後回しにするが、生成器は以下の条件に対応できる形にする。

- `left` は 0から10。
- `right` は 0から`left`。
- `answer = left - right`。
- `answer >= 0`。

### 6.3 レベル別の出題範囲

指示書ではレベルごとの数値範囲が未指定のため、初期値は以下にする。

| レベル | 足し算範囲 |
| --- | --- |
| 1 | `left + right <= 5` を優先。慣れた後も自動昇格はしない |
| 2 | `left + right <= 10` |
| 3 | `left + right <= 10` |

自動レベルアップはしないが、レベル1でも無限に同じ狭い範囲だけにならないよう、設定で範囲拡張しやすい定数にする。

## 7. 4択生成

### 7.1 ルール

- 正解を必ず含める。
- 選択肢は4つ。
- 数値範囲は0から10。
- 重複なし。
- 正解に近い数字を優先。
- 表示順はランダム。

### 7.2 アルゴリズム

1. `choices` に正解を追加。
2. `answer - 1`、`answer + 1`、`answer - 2`、`answer + 2` の順で範囲内の候補を追加。
3. 4つに満たない場合、0から10の未使用値をシャッフルして追加。
4. 最後に `choices` 全体をシャッフルする。

## 8. ゼリー操作設計

### 8.1 足し算 レベル1/2

- 上段に左側青ゼリーと右側赤ゼリーを分けて表示する。
- 下段に集約エリアを表示する。
- 最初から左側の青ゼリーは集約済みとして下段にも表示するか、スクショに合わせて「左の数を下段へ、その右に右ゼリーを置く」見た目にする。
- 子どもは右側赤ゼリーを集約エリアへドラッグする。
- 全ての右側ゼリーが集約エリアに入ると `gameState` を `answering` にする。
- `right === 0` の場合は操作不要で `answering` に進める。
- レベル1では集約数を大きく表示する。
- レベル2では集約数を表示しない。

### 8.2 足し算 レベル3

- ゼリーは薄く表示する、または表示しない設定にできる。
- MVPでは薄い補助表示あり。
- ドラッグ不可。
- 初期状態から回答可能。

### 8.3 引き算 将来拡張

- `left` 個のゼリーを表示する。
- `right` 個を外側の削除エリアへドラッグする。
- 削除エリアにはゴミ箱ではなく、幼児向けに怖くない「外へ出す」見た目を使う。
- 残った数を答える。
- レベル1では残数を表示する。

### 8.4 ドラッグ判定

- Pointer Events を使う。
- `pointerdown` で対象ゼリーを active にする。
- `pointermove` で `transform: translate3d(...) scale(...)` を更新する。
- `pointerup` でドロップ先と交差判定する。
- ドロップ成功は、ゼリー中心点が集約エリア内にある場合。
- 成功時は `placed = true` にし、グリッド位置にスナップする。
- 失敗時は元位置へ戻す。
- `prefers-reduced-motion` の場合、跳ねやぷるぷるは短く弱くする。

## 9. ゲームフロー

### 9.1 初回フロー

1. アプリ起動。
2. `SplashScreen` を表示。
3. LocalStorage に設定がなければ `SetupScreen` を表示。
4. 保護者がモード、レベル、音を選択。
5. `このせっていではじめる` でゲーム開始。

### 9.2 通常フロー

1. 問題生成。
2. 数式を `left + right = ?` で表示。
3. レベルに応じてゼリー操作。
4. 回答可能状態へ移行。
5. 4択を選ぶ。
6. 正解なら `correct`。
7. 不正解なら一時的に `wrong` にし、短い演出後 `answering` に戻す。
8. 正解後、`つぎのもんだいへ` を押すと次問へ。

### 9.3 状態遷移

```txt
presenting
  -> manipulating
  -> answering
  -> correct
  -> presenting

answering
  -> wrong
  -> answering
```

レベル3、または操作不要問題は `presenting -> answering` に短縮する。

## 10. UIコンポーネント設計

### 10.1 App

- LocalStorageの読み書きを管理。
- 初回起動、設定完了、ゲーム画面の表示を切り替える。
- PWA更新通知はMVPでは表示しない。

### 10.2 GameScreen

- 数式、ゼリー、回答、キャラクター、長押しつまみを配置する。
- `ParentMenu` と `SuccessOverlay` の表示を管理する。

### 10.3 Equation

Props:

```ts
type EquationProps = {
  problem: Problem;
  revealAnswer: boolean;
};
```

表示:

- 通常: `3 + 1 = ?`
- 正解時: `3 + 1 = 4`
- 足し算は左数を青、右数を赤、答えを黄色寄りで強調する。

### 10.4 JellyBoard

Props:

```ts
type JellyBoardProps = {
  problem: Problem;
  level: Level;
  gameState: GameState;
  jellies: Jelly[];
  mergedCount: number;
  onJellyPlaced: (jellyId: string) => void;
};
```

責務:

- ゼリー配置。
- ドラッグ可能/不可の切替。
- 集約エリア表示。
- レベル1の補助数字表示。

### 10.5 JellyBlock

Props:

```ts
type JellyBlockProps = {
  jelly: Jelly;
  draggable: boolean;
  disabled: boolean;
  onDragStart?: () => void;
  onDragEnd?: (result: DragResult) => void;
};
```

見た目:

- 角丸四角。
- 半透明。
- 光沢の疑似要素。
- 柔らかい影。
- ドラッグ中は少し拡大。
- 配置成功時は短い bounce。

### 10.6 AnswerChoices

Props:

```ts
type AnswerChoicesProps = {
  choices: number[];
  selectedAnswer: number | null;
  correctAnswer: number;
  disabled: boolean;
  gameState: GameState;
  onSelect: (answer: number) => void;
};
```

挙動:

- 回答可能前は disabled。
- 不正解時は選んだボタンだけ軽く揺れる。
- 正解時は正解ボタンを黄色でハイライト。
- 不正解のボタンを強く赤くしすぎない。

### 10.7 Character

Props:

```ts
type CharacterProps = {
  state: CharacterState;
};
```

実装:

- React SVG。
- 赤い身体、ジグザグ頭、手足、長めの足。
- 表情とポーズを `state` で切り替える。
- 常に笑顔にせず、通常は idle または watching。

### 10.8 ParentMenuHandle

- 左上に常時表示。
- 文言は `長押しでメニュー`。
- タップでは開かない。
- 1000ms以上の長押しで `ParentMenu` を開く。
- 長押し中は控えめな進捗表示を出す。

### 10.9 ParentMenu

項目:

- モード選択: 足し算、引き算。
- レベル選択: レベル1、2、3。
- 音: ON/OFF。
- 進捗リセット。
- ゲームに戻る。

補足:

- 引き算はMVPでは `じゅんびちゅう` 表示にして選択不可、または選択できても問題生成のみ簡易対応にする。初期実装では選択不可推奨。
- 進捗リセットは誤操作防止のため確認ステップを挟む。
- メニューは画面中央のモーダルとして表示し、背景を暗くする。

### 10.10 SuccessOverlay

表示:

- `やったね！`
- `つぎのもんだいへ`
- 必要ならスクショに合わせて `もういちど` も追加可能。

演出:

- 紙吹雪少量。
- キャラは `excited`。
- ゼリーは揃ってぷるんとする。

## 11. デザイン指針

### 11.1 色

- 背景: 白から薄いクリーム。
- 青ゼリー: 左の数。
- 赤ゼリー: 右の数。
- 黄色: 正解・回答ボタンの成功強調。
- 緑: 引き算の将来拡張や補助表示。
- 文字: 濃いグレー。黒すぎないが、コントラストは確保する。

### 11.2 タイポグラフィ

- 外部フォントは使わず、システムフォントから開始する。
- 数字は大きく、記号は十分な余白を持たせる。
- 説明文は最小限にする。

### 11.3 モーション

- 基本は150msから300ms。
- 正解演出のみ400msから800ms。
- ぷるぷる、跳ね、紙吹雪は `prefers-reduced-motion` で軽減または停止。
- レイアウトが跳ねないよう、ボタン・ゼリー・キャラの領域を固定する。

## 12. エラー・例外設計

- LocalStorage が使えない場合はメモリ状態で動作する。
- 不正な保存値は破棄する。
- 画面が狭い場合でも横スクロールを出さない。
- ドラッグ中に画面外へ出た場合は元の位置へ戻す。
- メニュー表示中はゲーム操作を停止する。
- 正解後は回答ボタンを押せない。

## 13. テスト方針

### 13.1 単体テスト候補

- 足し算問題生成が `answer <= 10` を守る。
- 引き算問題生成が `right <= left` を守る。
- 4択生成が正解を含み、重複がなく、0から10に収まる。
- LocalStorageの読み込みで壊れたJSONを安全に処理する。
- レベルごとの回答可能条件が正しい。

### 13.2 手動確認

- 375x667、390x844、430x932で表示崩れがない。
- タップ領域が小さすぎない。
- 通常タップでメニューが開かない。
- 長押しでだけメニューが開く。
- レベル1では合計値が出る。
- レベル2では合計値が出ない。
- レベル3ではドラッグできない。
- 不正解後に続けて回答できる。
- 正解後に式が完成し、次問題ボタンで進める。

## 14. MVP完了条件

- 足し算モードが遊べる。
- レベル1、2、3の差が実装されている。
- 4択回答が機能する。
- ゼリーブロックが表示される。
- レベル1では合計値が常時表示される。
- レベル2では合計値が表示されない。
- レベル3ではゼリーが操作不可。
- 正解・不正解判定ができる。
- 赤いキャラクターが状態に応じて最低限変化する。
- 長押しメニューが通常タップで開かない。
- LocalStorage に設定と進捗が保存される。
- スマホ縦画面で破綻しない。
