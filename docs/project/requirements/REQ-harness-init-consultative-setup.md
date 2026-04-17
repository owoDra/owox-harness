# REQ: consultative harness-init

## 目的

この文書は、`owox-harness` v2 における `harness-init` を、機械的に進めつつ AI 提案と人間判断を組み合わせる初期化 workflow として要求定義します。

## 背景

`harness-init` は単に `owox.harness.yaml` を生成するだけでは不十分です。実際の導入時には、新規 project か既存 project か、既存資料をどう扱うか、技術選定や profile をどう決めるかを、機械的な収集と AI 支援を組み合わせて進める必要があります。

## 目標

- 新規 project と既存 project の両方を扱える
- 既存 repo の構造、設定、docs を機械的に収集できる
- AI による stack / profile / adapter / docs 取り込み方針の提案を workflow に組み込める
- 最終決定は人間確認を通して人間が確定できる
- 確定結果を `owox.harness.yaml` と生成物に一貫して反映できる

## 非目標

- LLM が単独で技術選定を確定すること
- すべての既存文書を自動で正本へ昇格すること
- vendor ごとのエージェント実行環境を再実装すること

## P0: 絶対に外せない要求

### P0-1. init mode 判定

`harness-init` は少なくとも次を区別できる必要があります。

- 新規 project
- 既存 project

### P0-2. リポジトリ走査

`harness-init` は少なくとも次の情報を機械的に収集できる必要があります。

- repo shape
- package manager や主要な実行環境
- 既存 build / lint / test scripts
- 既存 docs や rules files
- AI CLI ごとの既存設定ファイル

### P0-3. reference classification

参照資料は少なくとも次に分類できる必要があります。

- source_of_truth
- reference_only
- archive
- ignore

### P0-4. 相談型提案

`harness-init` は少なくとも次について提案を生成できる必要があります。

- profile
- visible language
- adapter 対象
- task defaults
- policy defaults
- docs 取り込み方針
- stack 候補と懸念点

### P0-5. human confirmation

AI 提案だけでは確定せず、人間が最終決定を確認する gate を持つ必要があります。少なくとも次は確認対象です。

- init mode
- 採用 stack
- visible language
- adapter 対象
- 正本の扱い方針
- managed files の生成範囲

### P0-6. resumable workflow

`harness-init` は途中状態をセッションとして保存し、scan、suggest、confirm、materialize を段階的に再開できる必要があります。

## 機能要求

### FR-1. 初期化セッション

`harness-init` はセッションを保持し、少なくとも次を記録する必要があります。

- セッション ID
- current state
- detected repo facts
- reference documents
- 提案内容
- pending decisions
- confirmed decisions

### FR-2. 走査ステップ

走査ステップはリポジトリの事実収集を担当し、事実と推定を分離して保持する必要があります。

### FR-3. suggest step

提案ステップは走査結果をもとに、推奨案、代替案、理由、リスク、未確定事項を生成する必要があります。

### FR-4. confirm step

確認ステップは人間が決定した内容だけをセッションに反映する必要があります。

### FR-5. 出力確定ステップ

出力確定ステップは確認済みのセッションから `owox.harness.yaml` と生成物を出力し、最後に validate を実行する必要があります。

## 非機能要求

### NFR-1. 決定的な走査

リポジトリ走査は同じ入力に対して安定した検出結果を返す必要があります。

### NFR-2. 説明可能な提案

提案には根拠、代替案、リスクを含め、後から人間が説明可能である必要があります。

### NFR-3. source / generated separation

セッションや提案は生成物の正本ではなく、`owox.harness.yaml` への確定前状態として扱う必要があります。

## 成功指標

- 新規 / 既存 project の初期化が単一 workflow で扱える
- AI 提案が人間確認を通して確定される
- scan → suggest → confirm → materialize が中断・再開可能である
- 初期化後に `validate` が通る

## 関連資料

- `REQ-harness-v2-foundation.md`
- `../architecture.md`
- `../specs/cli/SPEC-command-surface.md`
- `../specs/cli/SPEC-generation-pipeline.md`
- `../validation.md`
