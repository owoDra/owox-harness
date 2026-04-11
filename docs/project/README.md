# プロジェクト資料

## 目的

`docs/project/` は、このプロジェクトの正本を置く場所です。要求、仕様、判断、用語、検証、外部連携、チーム資料をここで管理します。

## 読む順序

1. `glossary/core.md`
2. `architecture.md`
3. 対象カテゴリの `README.md`
4. 必要な個票

## 資料種別の使い分け

- `research/`: 技術調査、制約調査、実現性確認
- `proposals/`: 正式化前の設計草案、提案、移行案
- `requirements/`: 何を実現するか
- `specs/`: どう振る舞うか
- `adr/`: 重要判断と理由
- `patterns/`: 横断的に再利用する設計・実装パターン

## AI 参照導線

AI は通常、この README から `glossary/core.md`、`architecture.md`、対象カテゴリ README、対象個票の順で参照します。archive は明示的に必要な場合だけ参照します。