# SPEC: 生成パイプライン

## 目的

この文書は、`@owox-harness/cli` が source of truth を読み、検証し、生成物へ変換し、再同期するまでの流れを定義します。

## 対象範囲

- `owox.harness.yaml` の読込
- schema validation
- internal model への変換
- locale rendering
- adapter ごとの出力生成

## 対象外

- 各生成物テンプレートの全文
- CLI ごとの配布方法
- IDE extension 側の読込方法

## 処理段階

### 0. init session 準備

- consultative `harness-init` では session を読み書きする
- scan / suggest / confirm の途中結果を保持する

### 1. source 読込

- `owox.harness.yaml` を読む
- 必須設定欠落時は即時停止する

### 2. schema validation

- 設定値を schema で検証する
- locale、profile、adapter 設定の妥当性を確認する
- init session がある場合は decision completeness を確認する

### 3. internal model 化

- locale 非依存の内部表現へ正規化する
- hidden context と visible document の分離を保つ
- scan facts と confirmed decisions を分離する

### 4. 生成計画の作成

- 生成対象ファイル一覧を決定する
- 上書き対象と維持対象を区別する
- adapter ごとの差分をここで吸収する

### 5. rendering

- visible documents を project locale で描画する
- rules file、skills、config、docs skeleton を出力する
- hidden runtime artifact は `.owox/` に出力する
- managed markdown documents には token budget を適用する

### 6. sync

- 既存生成物との差分を比較する
- 同じ入力では実質同じ出力になるようにする

### 7. validate

- 配置、命名、参照、責務分離を確認する
- managed documents の token over-limit を確認する
- 問題があれば generation mismatch として停止する

## ファイル分類

- source of truth: `owox.harness.yaml`、schema、templates、adapter definitions、profiles
- generated artifacts: `.owox/`、CLI 固有の rules file、CLI 固有の生成ディレクトリ、docs skeleton、adapter files
- project docs source of truth: `docs/project/` の正本

`.owox/` は hidden context、runtime state、intent、decision ledger、context packet、evidence index などの AI 専用 artifact を保持する。

## 失敗条件

- schema validation failure
- renderer failure
- generation mismatch
- validate failure

## 検証観点

- 同じ入力で無駄な差分が出ない
- visible output が locale に従う
- adapter 差分が core へ漏れない

## 関連資料

- `../shared/SPEC-integration-adapter-contracts.md`
- `../shared/SPEC-intent-governed-agent-control.md`
- `SPEC-command-surface.md`
- `SPEC-harness-init-consultative-workflow.md`
- `SPEC-managed-document-token-budgets.md`
- `../../architecture.md`
- `../../validation.md`
