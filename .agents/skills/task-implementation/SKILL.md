---
name: task-implementation
description: 実装が主目的の task を開始し、コード、検証、関連正本の更新まで進めるときに使用する
argument-hint: "goal=<何を実装するか> mode=<agent-led|collab-led>"
---

## 目的

要求、仕様、判断に沿って実装を進め、必要な検証と関連正本更新まで含めて完了させる。

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/reference-order.md`
- `.agents/skills/_shared/document-update-checklist.md`
- `.agents/skills/_shared/trace-tags.md`
- `.agents/skills/_shared/execution-modes.md`
- `docs/project/README.md`
- `docs/project/glossary/core.md`
- `docs/project/architecture.md` が存在する場合は参照する
- 対象 requirement / spec / ADR / validation / pattern

## やること

1. 対象 `.agents/tasks/task-*.md` を作成または更新し、実装対象、対象外、不変条件、検証方法を明文化する
2. 必要なら `request_user_input` で `goal`、`mode`、変更可能範囲、完了条件を確認する
3. 正本、既存コード、既存テストを読み、現状と変更差分を把握する
4. 実装方針を決め、小さい一貫した変更単位で進める
5. 必要なテスト、lint、型チェック、手動確認を実行する
6. 変更に応じて requirement / spec / pattern / ADR / validation / tech-stack の更新要否を確認する
7. task に実施内容、検証結果、未実施項目、次に読むものを残す

## ルール

- 正本と矛盾する実装を確定させない
- 変更理由が説明できない変更を混ぜない
- 重要な変更では必要に応じて trace tag を使う
- 未実施検証がある場合は残リスクを明記する
- 高リスク変更や仕様変更が必要なら `request_user_input` を使う

## 確認事項

- 実装対象と対象外が明確である
- 検証方法が task に書かれている
- 正本更新の要否を確認した
- 未実施検証と残リスクが整理されている