# SPEC: policy 評価モデル

## 目的

この文書は、`@owox-harness/core` が提供する `verify`、`guard`、`gate` の評価モデルを定義します。

## 対象範囲

- policy の入力と出力
- 評価結果の最低契約
- task state machine との接続点

## 対象外

- CLI ごとの hook 実装
- 各環境の権限設定 UI
- shell command の具体的な実行手順

## verify

### 入力

- task 本文
- acceptance criteria
- required checks
- 実行結果または evidence

### 出力

- `pass`
- `fail`
- `blocked`

### 契約

- `pass` は required checks と acceptance criteria の両方を満たす場合のみ返す
- `fail` は未達または失敗がある場合に返す
- `blocked` は実行前提が欠ける場合に返す

## guard

### 入力

- 実行しようとしている操作
- 対象パスまたは対象資源
- task 文脈
- project policy

### 出力

- `allow`
- `ask`
- `deny`

### 契約

- `allow` は追加確認なしで進めてよい
- `ask` は人間確認を要求する
- `deny` は操作拒否とし、代替案または理由を返す

## gate

### 入力

- 変更種別
- 外部影響の有無
- 設計変更の有無
- 完了判定の有無

### 出力

- `not_required`
- `required`
- `resolved`

### 契約

- `required` は task を `blocked` または保留状態にできる
- `resolved` には確認結果の記録が必要

## 合成ルール

- `guard = deny` の場合は `verify` を実行せず停止する
- `gate = required` の場合は `done` へ進めない
- `verify = fail` の場合は `in_progress` へ戻す
- `verify = blocked` の場合は不足している前提を evidence ではなく block 情報として記録する

## 実装境界

- 評価ロジックは pure に近く保つ
- CLI 固有差分は入力整形層で吸収し、core の評価ロジックへ混ぜない
- locale は評価結果の意味に影響させず、表示時だけ反映する

## 検証観点

- 同じ入力に対して同じ判定を返す
- `guard`、`gate`、`verify` の合成結果が task state machine と矛盾しない
- CLI 差分が core に漏れない

## 関連資料

- `../shared/SPEC-workflow-core-contracts.md`
- `../../architecture.md`
- `../../validation.md`
