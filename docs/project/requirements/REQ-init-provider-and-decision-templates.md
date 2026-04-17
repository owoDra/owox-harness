# REQ: 初期化プロバイダーと判断テンプレート

## 目的

この文書は、相談型 `harness-init` における外部提案プロバイダーと判断テンプレート出力の要求を定義します。

## 背景

現在の builtin suggestion だけでは、project 固有の技術調査や組織固有の推奨ルールを十分に反映できません。また、人間確認を行う際には、編集しやすい decision template が必要です。

## 目標

- 提案プロバイダーを差し替え可能にする
- 外部プロバイダーを command 経由で実装できる
- 人間確認前に編集しやすい判断テンプレートを出力できる
- 人間確認前提を崩さずに自動化を増やす

## P0: 絶対に外せない要求

### P0-1. 外部提案プロバイダー

外部提案プロバイダーは少なくとも次を満たす必要があります。

- command 実行で提案を返せる
- input / output は機械可読である
- 内蔵プロバイダーに代替できる

### P0-2. 判断テンプレート出力

相談型初期化は人間が編集しやすい判断テンプレートを出力できる必要があります。

## 機能要求

### FR-1. プロバイダー設定

`owox.harness.yaml` は提案プロバイダーの選択と外部プロバイダーの command 設定を保持できる必要があります。

### FR-2. プロバイダー実行

外部プロバイダーはリポジトリの事実、参照文書、確認済みの判断を入力として提案を返す必要があります。

### FR-3. 判断テンプレート出力

判断テンプレート出力は少なくとも次を出力できる必要があります。

- pending decisions
- current recommended values
- suggestions summary
- selected reference paths

### FR-4. 検証

validate はプロバイダー設定の妥当性と初期化後の正本 / 生成物の整合性を確認できる必要があります。

## 関連資料

- `REQ-harness-init-consultative-setup.md`
- `../specs/cli/SPEC-harness-init-consultative-workflow.md`
- `../specs/cli/SPEC-command-surface.md`
- `../validation.md`
