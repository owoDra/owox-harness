## 目標

- `.agents/` がハーネスの正本であり、AI は必ずこのハーネスに従って作業する。
- `docs/project/` がプロジェクト資料の正本であり、要件、設計、チームルール、外部連携、検証方針はここに置く。
- エージェントは必要最低限の文脈だけを読み、不要な全文走査を避ける

## 最初に読むもの

1. `.agents/project.yaml`
2. 作業中の `.agents/tasks/task-*.md`
3. 必要に応じて `docs/project/index.md`
4. 対象 task に必要なプロジェクト資料

## 責務の境界

- `.agents/`: エージェントの制約、作業手順
- `docs/project/`: プロジェクトの用語、設計方針、要件、仕様、パターン、ADR、チームガイド、外部連携、技術スタック、検証方針
- `AGENTS.md`: 入口だけを持つ。詳細な手順やプロジェクト設計はここに重ねない

## 主要ファイル

- `.agents/project.yaml`: ハーネスが参照するプロジェクトの最小情報
- `.agents/skills/`: 作業種別ごとの進め方
- `.agents/tasks/`: 進行中または完了済みの task 記録
- `.agents/scripts/`: ハーネス運用用の補助スクリプト
- `docs/project/index.md`: プロジェクト資料の入口

## 作業ルール

- 必ず最初に `task-prepare` スキルを使用して進める
- `request_user_input` ツールが使えない場合は通常メッセージで確認し、確認結果を task に転記する
- 実装、修正、調査、レビュー、検証のいずれでも、先に task 記録を作成または更新する
- 全ての作業は対応するスキルを使用して進める
- 各作業は対応するチームのルールに従う
- 参照したいファイルの場所がわからない場合は該当ディレクトリの `index.md` を参照する
- 用語は `docs/project/glossary.md`、共通方針は `docs/project/architecture.md` を優先する
- spec や実装で繰り返し現れる判断は pattern 化候補として整理し、必要なら `docs-update-patterns` で正本化する
- `docs-update-*` でプロジェクト資料を更新する際は、`.agents/` と `AGENTS.md` のハーネス制約をプロジェクト資料に持ち込まない

## タスク別の最小参照ルール

### 調査

- `.agents/project.yaml`
- `docs/project/index.md`
- `docs/project/glossary.md`
- `docs/project/architecture.md`
- 対象カテゴリの `index.md`

### 実装・修正

- `.agents/project.yaml`
- `docs/project/glossary.md`
- `docs/project/architecture.md`
- 対象 requirement / spec
- 必要な pattern / ADR / team guide / validation

### レビュー

- `.agents/project.yaml`
- `docs/project/architecture.md`
- レビュー対象に対応する requirement / spec / pattern / ADR
- 必要な team guide / validation

### 検証

- `.agents/project.yaml`
- `docs/project/validation.md`
- 対象 requirement / spec / ADR
- 必要な team guide

### 文書更新

- 更新対象文書
- 同カテゴリの `index.md`
- 必要な glossary / architecture / ADR

## 禁止事項

- すべての設計意図をコードだけに押し込むこと
- すべての資料を人手で二重管理すること
