# REQ: managed document token budgets

## 目的

この文書は、`owox-harness` v2 が管理する資料の token 量を制御し、AI が読む常時コンテキストを過大にしないための要求を定義します。

## 背景

v2 は low-context 運用を重視します。しかし project ごとに docs や rules files が肥大化すると、AI が読むべき資料量が増え、token 消費と判断精度の両方を悪化させます。このため、ハーネスが管理する資料には token budget を持たせ、超過時は分割や簡素化を行う必要があります。

## 目標

- ハーネス管理下の資料に token 上限を持たせる
- 上限は `owox.harness.yaml` で project ごとに設定できる
- 生成時に over-limit を抑制できる
- validate 時に over-limit を検知できる

## P0: 絶対に外せない要求

### P0-1. YAML 設定可能

資料の token budget は `owox.harness.yaml` で設定できる必要があります。

### P0-2. managed documents の対象化

少なくとも次のようなハーネス管理資料を対象にできる必要があります。

- `AGENTS.md`
- `.agents/` 配下の markdown
- `docs/project/` 配下の markdown
- adapter が生成する markdown 資料

### P0-3. over-limit 時の処理

over-limit の資料は、少なくとも次のいずれかで対処できる必要があります。

- 不要な説明や空行の圧縮
- 論理単位での分割
- validate failure として停止

### P0-4. project ごとの差分設定

project ごとに default 上限と path ごとの override を持てる必要があります。

## 機能要求

### FR-1. default budget

全 managed documents に適用される default token budget を持つ。

### FR-2. per-path override

path または path prefix ごとに token budget override を持てる。

### FR-3. generation-time enforcement

生成時に budget を評価し、必要に応じて簡素化または分割する。

### FR-4. validation-time detection

validate は over-limit の managed documents を検知できる。

## 非機能要求

### NFR-1. deterministic estimation

token estimation は deterministic である必要があります。

### NFR-2. locale-safe compaction

圧縮や分割は locale に依存する可視内容の意味を壊しにくい方法で行う必要があります。

## 関連資料

- `REQ-harness-v2-foundation.md`
- `../specs/cli/SPEC-generation-pipeline.md`
- `../validation.md`
