# core 仕様

## 役割

このディレクトリは、`core` subproject に閉じる仕様を置くための場所です。

## 置いてよいもの

- workflow model の詳細仕様
- state machine の詳細仕様
- policy evaluation の仕様
- locale-independent internal model の仕様

## 置いてはいけないもの

- `cli` に閉じる仕様
- 複数 subproject にまたがる共有仕様
- 一時的な設計メモ

## 命名規則

- `SPEC-<category>-<short-title>.md`

## 参照ルール

- `core` のみで完結する仕様だけを置く
- 複数 subproject にまたがる仕様は `../shared/` に置く

## 参照

- `SPEC-task-state-machine.md`: task state machine の状態、遷移、保持データ
- `SPEC-policy-evaluation.md`: verify / guard / gate の評価モデル
