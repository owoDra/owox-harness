---
name: task-validation
description: 検証、受け入れ確認、品質確認が主目的の task を開始し、実施結果を整理するときに使用する
argument-hint: "goal=<何を検証するか> mode=<agent-led|collab-led>"
---

## 目的

対象変更または現状について、定められた validation と完了条件に照らして検証し、結果、未達、残課題を明確にする。

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/execution-modes.md`
- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/validation.md`
- 関連 requirement / spec / ADR / code / test

## やること

1. 対象 `.agents/tasks/task-*.md` を作成または更新し、検証対象、合格条件、証跡の取り方、停止条件を明文化する
2. 必要なら `request_user_input` で優先検証項目や合格条件の解釈を確認する
3. validation と関連正本に沿って検証を実施する
4. 項目ごとに結果、証跡、未達、未確認を整理する
5. validation 自体の不足があれば、その更新要否を task に残す

## ルール

- 合格条件が曖昧なまま判定しない
- 実施結果と推測を混ぜない
- 未確認項目を合格扱いしない
- 重大な未達は隠さない

## 確認事項

- 合格条件が明確である
- 項目ごとの結果と証跡が整理されている
- 未達と未確認が分かれている
- validation 更新要否を確認した