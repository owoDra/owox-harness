# REQ: owox-harness v2 基盤要求

## 目的

この文書は、`owox-harness` v2 の要求を定義します。v2 は、v1 の機能要件を網羅しつつ、AI の能力差に依存しにくい workflow-driven なメタハーネスを実現します。

## 背景

v1 は `AGENTS.md`、skills、`docs/project` を中心とした文書ハーネスとして有効です。一方で、次の課題があります。

- 初期化が AI エージェント任せになりやすい
- task の進め方が AI の判断品質に強く依存する
- 必須確認や検証が instructions 依存になりやすい
- サブエージェント活用の契約が未定義である
- ハーネス開発用の運用データと、生成物としてのハーネスが混ざりやすい

## 目標

- v1 の機能要件を網羅したうえで v2 を新しい標準にする
- `owox` を AI エージェント向けの共通開発ツールとして提供する
- 複数の AI coding CLI で一貫した運用品質を実現する
- AI の能力差に依存しすぎない状態遷移と強制力を持つ
- サブエージェント活用を first-class workflow として確立する
- visible language を project 単位で切り替えられるようにする
- hidden context は英語を基本にしてトークン消費を抑える

## 非目標

- 完全自立の無人開発を保証すること
- すべての CLI の内部ランタイムを再実装すること
- すべての言語・分野の開発を v2 初期リリースで完全対応すること
- 生成物を手書き正本として運用すること

## 対象ユーザー

- 複数の AI coding CLI を併用したい開発者
- 人間主導のまま AI の実行力を安定化したい個人・チーム
- ローカル LLM を含む低コンテキスト運用を志向する開発者

## P0: 絶対に外せない要求

### P0-1. v1 機能要件の網羅

v2 は少なくとも v1 が提供していた次の価値を網羅する必要があります。

- ハーネス初期化
- project 情報の定義と更新
- task 文脈の作成と更新
- docs 正本の参照導線
- 複数 CLI 向け同期
- ハーネス整合性の検証

### P0-2. new owox の利用必須化

v2 では `owox` の利用を必須にします。`AGENTS.md` や `.agents/` だけで最低限回る互換モードは必須要件にしません。

### P0-3. 複数 CLI での一貫運用

少なくとも次の 4 つで一貫した運用品質を目指します。

- OpenCode
- Claude Code
- Codex
- GitHub Copilot CLI

### P0-4. 人間主導

v2 は完全自立ではなく、人間の意図を壊さずに具現化しやすくするためのハーネスである必要があります。

### P0-5. AI 能力差への耐性

v2 は、初期化、task 進行、検証、handoff を機械化し、AI の能力差に依存しすぎないことが必要です。

### P0-6. 低コンテキスト運用

- 常時コンテキストは最小化する
- 重い手順はツールや on-demand skill に寄せる
- hidden context は英語を基本にする

### P0-7. サブエージェント活用の確立

v2 は少なくとも次を制度化する必要があります。

- サブエージェントの役割定義
- 親から子への handoff 契約
- 子から親への報告契約
- 結果集約の責任者
- 非対応環境での fallback

### P0-8. 生成物と正本の分離

`.agents/`、`AGENTS.md`、CLI 向け adapter files、task 雛形、docs 雛形は、初期状態の手書き正本ではなく、`harness-init` によって機械生成される必要があります。

### P0-9. locale 切替

プロジェクトごとに visible language を切り替えられる必要があります。

対象は少なくとも次です。

- AI の可視返答
- 生成される docs
- task 文書
- handoff 文書
- 人間向け説明

## P1: 強くほしい要求

### P1-1. CLI の native 機能を活かす

- 会話履歴
- 継続セッション
- custom agents / skills
- hooks
- permissions
- native UI

これらは可能な限り各 CLI の機能を使う方針とします。

### P1-2. 実行時の強制力

instructions 依存だけではなく、次のような強制力を持たせます。

- 危険操作の拒否
- 必須検証の強制
- 必須確認ゲートの強制
- 完了条件を満たすまで停止させない制御

### P1-3. profile 拡張性

初期ターゲットは web 開発寄りとする一方で、将来は Python、Rust、Go、Unity、Infra などへ profile 追加できる構造にします。

### P1-4. 段階導入のしやすさ

v2 を新しい標準にしつつ、既存資産を読み替えやすい移行導線を持つことが望ましいです。

## P2: 将来要求

- より深い orchestration runtime
- GUI / dashboard
- リモート実行や共有実行の統制強化
- CLI 以外の agent runtime との接続

## 機能要求

### FR-1. harness-init

`harness-init` は少なくとも次を満たす必要があります。

- 必須設定を段階的に収集する
- `owox.harness.yaml` を生成または更新する
- `.agents/` と `AGENTS.md` を生成する
- docs 雛形を生成する
- CLI adapter files を生成する
- 最後に validate を実行する

### FR-2. workflow / task 管理

`owox` は task を状態遷移で管理できる必要があります。最低限、次の情報を扱います。

- task ID
- title
- objective
- scope
- out-of-scope
- acceptance criteria
- current state
- required checks
- human gate
- attached evidence

### FR-3. verify / guard / gate

`owox` は、少なくとも次の決定的処理を提供する必要があります。

- verify: 完了条件と必須検証の評価
- guard: 危険操作や禁止操作の評価
- gate: 人間確認が必要かどうかの評価

### FR-4. subagent handoff

`owox` は親子エージェント間の handoff を構造化して作成できる必要があります。

### FR-5. sync / validate

`owox` は生成物の同期と整合性検査を実行できる必要があります。

### FR-6. multilingual output

`owox` は visible language を project 設定に従って切り替えられる必要があります。

## 非機能要求

### NFR-1. source of truth の一元化

生成物ではなく、`owox.harness.yaml` と code / templates / schema が正本である必要があります。

### NFR-2. idempotent generation

同じ入力からの生成は再現可能で、無駄な差分を極力出さない必要があります。

### NFR-3. deterministic enforcement

危険操作の拒否や必須検証など、規則で決まるものは deterministic に評価される必要があります。

### NFR-4. testability

core の状態遷移と判定は pure に近い形で実装され、単体検証しやすい必要があります。

### NFR-5. adapter isolation

CLI ごとの差異は adapter に閉じ込め、core に散らさない必要があります。

## 制約

- npm package を前提とする
- package 名は `@owox-harness/core` と `@owox-harness/cli` を使う
- 設定ファイル名は `owox.harness.yaml` とする
- 見えない内部表現は英語を基本とする
- visible documents は project locale に従う

## 成功指標

- v1 で手作業または AI 依存だった初期化の大半が `harness-init` で再現可能である
- task 状態遷移が `owox` によって追跡できる
- 少なくとも 4 CLI で同等の最低限 workflow を提供できる
- サブエージェント利用時と非利用時で task 契約が破綻しない
- 生成物が再生成可能であり、source of truth の二重化が発生しない

## 関連資料

- `../architecture.md`
- `../specs/shared/SPEC-workflow-core-contracts.md`
- `../specs/shared/SPEC-integration-adapter-contracts.md`
- `../tech-stack.md`
- `../validation.md`
- `../glossary/core.md`
- `../integrations/ai-coding-clis.md`
