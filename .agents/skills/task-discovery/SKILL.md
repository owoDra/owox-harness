---
name: task-discovery
description: 調査、現状把握、影響範囲整理が主目的の task を開始し、後続判断に使える結果へ整理するときに使用する
argument-hint: "goal=<何を明らかにしたいか> mode=<agent-led|collab-led>"
---

## 目的

実装や資料更新に入る前に、現状、制約、影響範囲、論点、未確定事項を整理し、次の意思決定に使える調査結果を残す。

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/reference-order.md`
- `.agents/skills/_shared/execution-modes.md`
- `.agents/skills/_shared/request-user-input-policy.md`
- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/architecture.md` が存在する場合は参照する

## やること

1. 対象 `.agents/tasks/task-*.md` を作成または更新し、調査対象、対象外、停止条件を明文化する
2. 必要なら `request_user_input` で `goal`、`mode`、調査しない範囲、完了条件を確認する
3. 正本を優先して読み、事実として確認できたことを収集する
4. 影響を受ける資料、コード、テスト、外部依存を整理する
5. 事実、推測、未解決事項、次に必要な判断を分けて task に残す
6. 後続に推奨する skill を整理する

## ルール

- 事実と推測を混ぜない
- 調査の途中で実装へ踏み込まない
- archive は必要になった場合だけ読む
- 必要な確認は `request_user_input` を使う

## 確認事項

- 調査対象と対象外が明確である
- 事実、推測、未解決事項が分かれている
- 影響範囲が task に残っている
- 次に進む skill が提案されている