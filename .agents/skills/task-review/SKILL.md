---
name: task-review
description: コード、資料、設計のレビューが主目的の task を開始し、指摘と結論を整理するときに使用する
argument-hint: "goal=<何をレビューするか> mode=<agent-led|collab-led>"
---

## 目的

対象の変更や資料を確認し、バグ、仕様不整合、設計リスク、検証不足を洗い出して、判断可能なレビュー結果を残す。

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/execution-modes.md`
- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/architecture.md` が存在する場合は参照する
- レビュー対象に対応する requirement / spec / pattern / ADR / validation / code / test

## やること

1. 対象 `.agents/tasks/task-*.md` を作成または更新し、対象、対象外、優先観点、停止条件を明文化する
2. 必要なら `request_user_input` でレビュー観点の優先順位や対象範囲を確認する
3. 正本とレビュー対象を読み比べ、指摘候補を集める
4. 指摘ごとに問題点、根拠、重大度、影響範囲を整理する
5. 問題がない場合も残留リスクや検証不足を整理する
6. 推奨する次 task を task に残す

## ルール

- 指摘は重大度順に整理する
- 根拠のない推測を断定しない
- 指摘より先に要約を書かない
- 問題なしの場合も残留リスクを明示する

## 確認事項

- 対象と対象外が明確である
- 指摘事項に根拠と重大度がある
- 問題なしの場合も残留リスクまたは検証不足があるか確認した
- 次アクションが整理されている