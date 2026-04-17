# 仕様

## 役割

このディレクトリは、要求を具体的な振る舞いへ落とし込む正本です。

## 置いてよいもの

- 入出力契約
- 状態遷移
- エラー条件
- 横断ルール
- 検証観点

## 置いてはいけないもの

- 要求の背景説明の大半
- 一時的な設計メモ
- ハーネス運用ルール

## 命名規則

- 共有仕様: `shared/SPEC-<category>-<short-title>.md`
- subproject 固有仕様: `<subproject>/SPEC-<category>-<short-title>.md`

## 参照ルール

- 2 つ以上の subproject にまたがる仕様は `shared/` に置く
- 1 つの subproject に閉じる仕様はその subproject 配下に置く

## 参照

- `shared/index.md`: 複数 subproject にまたがる共有仕様の入口
- `core/index.md`: `core` subproject 固有仕様の入口
- `cli/index.md`: `cli` subproject 固有仕様の入口
- `shared/SPEC-workflow-core-contracts.md`: workflow / task / verify / gate / handoff の共通仕様
- `shared/SPEC-integration-adapter-contracts.md`: CLI adapter の共通仕様
- `cli/SPEC-harness-init-consultative-workflow.md`: consultative harness-init workflow 仕様
- `cli/SPEC-managed-document-token-budgets.md`: managed documents の token budget 仕様
- `cli/SPEC-init-provider-and-decision-templates.md`: init provider 抽象と decision template export の仕様
