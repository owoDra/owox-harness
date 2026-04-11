---
name: task-close
description: task 完了時に成果、未完了事項、更新した正本、次アクションを整理して閉じるときに使用する
argument-hint: "goal=<何を閉じるか> mode=<agent-led|collab-led>"
---

## 目的

task の成果、未完了事項、残課題、更新済み正本、次アクションを整理し、再開や引き継ぎが可能な状態で閉じる。

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/task-statuses.md`
- `docs/project/index.md`
- 関連する requirement / spec / ADR / validation / code / test / docs

## やること

1. 対象 `.agents/tasks/task-*.md` を更新し、完了したこと、未完了事項、残課題、更新した正本、検証結果を整理する
2. 必要なら `request_user_input` で完了とみなす範囲や次アクションを確認する
3. 完了条件を満たしているか確認する
4. `状態` を適切な値へ更新し、`次に読むもの` を残す

## ルール

- 完了と未完了を混ぜない
- 完了条件未達なら完了扱いにしない
- 残課題は曖昧にぼかさない
- 次の作業で最初に読む情報を残す

## 確認事項

- 完了したことと未完了事項が分離されている
- 更新済み正本と検証結果が整理されている
- 次アクションまたは次に読むものが残っている
- task の状態が最終化されている