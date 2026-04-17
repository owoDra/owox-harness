# SPEC: managed document token budgets

## 目的

この文書は、`@owox-harness/cli` が managed documents に対して token budget を適用する方法を定義します。

## 対象範囲

- `owox.harness.yaml` における token budget 設定
- generation 時の budget enforcement
- validate 時の token over-limit 検知

## 設定契約

`owox.harness.yaml` は少なくとも次を持ちます。

- `contentBudgets.documents.defaultMaxTokens`
- `contentBudgets.documents.splitThreshold`
- `contentBudgets.documents.trimOptionalSections`
- `contentBudgets.documents.managedPaths`
- `contentBudgets.documents.overrides[]`

override は少なくとも次を持ちます。

- `path` または `pathPrefix`
- `maxTokens`

## 適用対象

- markdown であること
- managedPaths に含まれること

## generation-time enforcement

1. markdown content を生成する
2. token estimate を計算する
3. budget 以下ならそのまま出力する
4. over-limit かつ trim 許可時は空行や冗長な改行を圧縮する
5. なお over-limit かつ split threshold 超過時は `part-N` へ分割し、元ファイルは index 化する

## validation-time enforcement

- managed document の実ファイルを読み、token estimate を計算する
- budget を超えている場合は `token_limit` issue を返す

## token estimate 契約

- deterministic である
- locale ごとの差を完全再現しなくてもよいが、一貫して過大になりすぎないこと
- validation と generation で同じ estimator を使う

## 失敗条件

- invalid budget setting
- split 後も over-limit の part が残る設計
- validate で token_limit issue が見つかる

## 検証観点

- default budget が適用される
- override が path / pathPrefix に適用される
- low budget 時に分割が起きる
- validate が token_limit issue を返す

## 関連資料

- `SPEC-generation-pipeline.md`
- `SPEC-command-surface.md`
- `../../requirements/REQ-managed-document-token-budgets.md`
- `../../validation.md`
