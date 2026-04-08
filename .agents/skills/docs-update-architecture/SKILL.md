---
name: docs-update-architecture
description: プロジェクトの不変条件や方針・ディレクトリ構造を追加・更新・改訂するときに使用する
argument-hint: "topic=<変更対象> rationale=<理由>"
---

## 目的

共通の不変条件、責務分離、設計理念を一貫して保守し、変更の影響を関連資料と実装へ波及させる。

## 前提資料

- `.agents/project.yaml` を読み以下を把握する
  - `project.name`: architecture が属するプロジェクト名
  - `project.description`: 設計対象の文脈
  - `project.kind`: `simple` か `monorepo` か
  - `project.lang`: 本文で使う言語
  - `project.teams`: 責務分離に関わるチーム
  - `project.integrations`: 外部依存に関する不変条件の有無
  - `project.subprojects`: モノレポ時に共通原則と個別原則をどう扱うか
- `.agents/glossary.md` を参照して用語と命名を統一する
- `.agents/architecture.md` を参照して既存の不変条件、責務分離、設計理念を把握する
- `./references/best-practices.md` を参照して architecture 更新時の粒度と影響範囲を把握する
- `./references/architecture.example.md` を参照して基本フォーマットを把握する
- 関連する requirement / spec / ADR / validation / 実装コード / テストコードを参照して現状との整合を確認する

## 前提知識

- architecture はプロジェクト全体の共通不変条件の正本である
- architecture を変えると spec、実装、テスト、validation の期待も変わり得る
- architecture の更新は文書修正で終わらせず、関連成果物の見直しまで含める

## やること

1. `request_user_input` で、変更したい原則、背景、影響範囲、関連 ADR の有無を確認する
2. 変更対象が architecture に書くべき内容か判断する
   - 共通の不変条件か
   - 責務分離の原則か
   - プロジェクト全体の設計理念か
3. 重要判断を伴う場合は `docs-update-adr` を使って対応する ADR を作成または更新する
4. `.agents/architecture.md` を追加または更新する
5. architecture 変更後に、関連する specs をすべて見直し、必要な修正を行う
6. architecture 変更後に、関連する実装コードをすべて見直し、必要な修正を行う
7. architecture 変更後に、関連するテスト用コードをすべて見直し、必要な修正を行う
8. architecture 変更後に、`.agents/validation.md` を見直し、必要なら `docs-update-validation` を使って更新する
9. 変更に伴って技術選定の前提が変わる場合は `docs-update-tech-stack` も見直す

## ルール

- architecture の変更は関連する spec / 実装 / テスト / validation の見直しを必須とする
- チーム固有ルールや一時運用は architecture に書かない
- 新しい不変条件や設計理念を追加する場合は既存項目との衝突を解消する
- 文書だけ更新して実体を放置しない

## 確認事項

- `request_user_input` または同等の確認で変更意図と影響範囲を確認した
- 必要な ADR を作成または更新した
- `不変条件` / `責務分離` / `設計理念` のどこを変えたか明確である
- 関連する specs / 実装コード / テスト用コード / validation をすべて見直した
- 技術スタック見直しの要否も確認した
