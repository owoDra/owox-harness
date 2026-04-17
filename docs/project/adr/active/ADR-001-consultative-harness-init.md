# ADR-001: consultative harness-init を v2 の標準導線にする

## 状態

active

## 文脈

`owox-harness` v2 は workflow-driven と human-governed を重視します。一方、project 初期化では、新規 / 既存の違い、既存 docs の取り込み、技術選定、adapter 対象の確定といった判断が多く、単発の設定ファイル生成だけでは不十分です。

## 決定

`harness-init` は単一コマンドの一括生成ではなく、scan、suggest、confirm、materialize、validate から成る consultative workflow を v2 の標準導線として扱います。

この workflow では、機械的に決められる部分は deterministic に進め、技術選定や source of truth policy のような判断点では AI 提案を作り、人間が最終確認します。

## 理由

- 新規 project と既存 project の初期化要求を単一モデルで扱いやすい
- adapter 実装より先に init workflow の入力モデルを固められる
- AI を suggestion に限定し、人間主導を保ちやすい
- scan / suggest / confirm / materialize を段階化することで resume と検証がしやすい

## 代替案

### 1. 先に adapter を実装する

却下。init workflow の入力と決定点が固まる前に adapter を作ると、各 CLI で初期化体験がばらつきやすく、再設計コストが高い。

### 2. `harness-init` を完全自動化する

却下。技術選定や docs 取り込み方針は human gate が必要であり、v2 の human-governed 原則に反する。

## 影響

- `harness-init` に session モデルが必要になる
- command surface に段階実行コマンドが追加される
- generation pipeline の前段に scan / suggest / confirm が入る
- validation に init session と decision completeness の検証が追加される

## 関連資料

- `../../requirements/REQ-harness-init-consultative-setup.md`
- `../../specs/cli/SPEC-harness-init-consultative-workflow.md`
- `../../architecture.md`
