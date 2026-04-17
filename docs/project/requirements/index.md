# 要求

## 役割

このディレクトリは、何を実現するかを管理する正本です。

## 置いてよいもの

- 目標
- 根拠
- 成功指標
- 対象範囲と対象外
- 制約や品質条件

## 置いてはいけないもの

- 実装手段の詳細
- テスト手順の詳細
- 一時的な作業メモ

## 命名規則

- `REQ-<category>-<short-title>.md`

## 参照ルール

- 要求変更時は spec / validation / ADR への影響を確認する

## 参照

- `REQ-harness-v2-foundation.md`: owox-harness v2 の要求定義
- `REQ-intent-governed-agent-control.md`: intent 契約、`owox` 必須利用、前提不足時停止、`.owox/` 境界の要求
- `REQ-harness-init-consultative-setup.md`: consultative harness-init の要求定義
- `REQ-managed-document-token-budgets.md`: managed document の token budget 要求
- `REQ-init-provider-and-decision-templates.md`: suggestion provider と decision template export の要求
