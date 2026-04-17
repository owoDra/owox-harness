# SPEC: 初期化プロバイダーと判断テンプレート

## 目的

この文書は、相談型初期化における提案プロバイダー抽象と判断テンプレート出力の契約を定義します。

## 対象範囲

- builtin / external プロバイダー
- 判断テンプレート出力

## 外部プロバイダー契約

外部プロバイダーは command 実行で呼び出される。

### input

- JSON object
- `rootDir`
- `repoFacts`
- `referenceDocuments`
- `confirmedDecisions`

### output

- 提案配列
- 各提案は `topic`, `recommended`, `alternatives`, `reasons`, `risks`, `openQuestions` を持つ

### failure

- command error
- invalid JSON
- invalid suggestion schema

失敗時は内蔵プロバイダーへ代替してよい。

## 判断テンプレート

判断テンプレートは少なくとも次を含む。

- pending decisions
- 現在の推奨値
- 提案概要
- selected reference paths

JSON 形式で出力する。

## validation

- 外部プロバイダー設定は schema に通る
- 初期化後の正本と生成物は validate に通る
- プロバイダー失敗時も内蔵の代替処理が保たれる

## 関連資料

- `SPEC-command-surface.md`
- `SPEC-harness-init-consultative-workflow.md`
- `../../requirements/REQ-init-provider-and-decision-templates.md`
