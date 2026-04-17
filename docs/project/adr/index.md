# 重要判断

## 役割

このディレクトリは、重要な判断とその理由を記録する正本です。

## 置いてよいもの

- 継続的な影響を持つ判断
- 代替案と採否理由
- 後続資料への関連付け

## 置いてはいけないもの

- 単なる作業ログ
- 会議メモだけの記録
- 手順詳細

## 命名規則

- `active/ADR-<NNN>-<short-title>.md`
- `archive/ADR-<NNN>-<short-title>.md`

## 参照ルール

- 現在有効な判断は `active/`
- 参照優先度を落とした過去資料は `archive/`
- 置換関係は状態名ではなく本文または front matter の関連情報で示す

## 参照

- `active/ADR-001-consultative-harness-init.md`: consultative harness-init を v2 の標準導線にする判断
- `active/ADR-002-managed-document-token-budgets.md`: managed documents に token budget を導入する判断
- `active/ADR-003-init-provider-and-decision-templates.md`: init provider 抽象と decision template export を追加する判断
- `active/ADR-004-intent-governed-agent-control.md`: intent 契約、`owox` 必須利用、`.owox/` 集約を採用する判断
- `archive/`: 参照優先度を落とした ADR の配置先。現在は個票なし
