# 共有仕様

## 役割

このディレクトリは、複数の subproject にまたがる仕様を置くための場所です。

## 置いてよいもの

- 共通 API 契約
- 共通状態ルール
- 共通認可や横断要件に関する詳細仕様

## 置いてはいけないもの

- 1 つの subproject に閉じる仕様
- 設計草案や調査メモ

## 命名規則

- `SPEC-<category>-<short-title>.md`

## 参照ルール

- subproject 固有仕様が必要な場合は、対象の `<subproject>/index.md` と個票を追加する

## 参照

- `SPEC-workflow-core-contracts.md`: `owox` の workflow / task / verify / gate / handoff の共通契約
- `SPEC-integration-adapter-contracts.md`: CLI adapter が満たすべき共通契約
- `SPEC-intent-governed-agent-control.md`: intent、decision ledger、mandatory `owox` execution、`.owox/` 境界の共通仕様
