---
name: task-prepare
description: ユーザーからの依頼を受けて、対象範囲、禁止事項、完了条件を整理し、次に使う task 系 skill を決めるときに使用する
---

## 目的

依頼内容の認識ずれを減らし、この turn で何を達成するかを明確にしてから後続 task に渡す。

## 初期化例外

- `.agents/project.md` が未初期化、または placeholder のままなら `harness-init` を先に使う
- `harness-init` の完了後に、この skill 相当の整理へ戻る

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/request-user-input-policy.md`
- `docs/project/README.md`
- `docs/project/glossary/core.md`
- `docs/project/architecture.md` が存在する場合は参照する

## やること

1. 依頼内容を読み、達成したいこと、禁止事項、曖昧な点を切り分ける
2. 必要なら `request_user_input` で次を確認する
   - 何を変えたいか
   - どこまで変えてよいか
   - 何を変えてはいけないか
   - 完了条件は何か
3. 対象 task に対応する skill を選ぶ
   - 調査中心なら `task-discovery`
   - 実装中心なら `task-implementation`
   - 不具合修正なら `task-fix`
   - レビューなら `task-review`
   - 検証なら `task-validation`
4. `.agents/tasks/task-<short-title>.md` を作成または更新し、後続 skill へ引き継ぐ

## ルール

- task は進捗メモではなく文脈キャッシュとして扱う
- 未確定事項を確定前提に混ぜない
- 実装や編集に入る前に対象範囲と対象外を明文化する
- 必要な確認を通常会話だけで済ませず、可能なら `request_user_input` を使う

## 確認事項

- 次に使う task 系 skill が明確である
- 対象範囲と対象外が分かれている
- 完了条件が task に書かれている
- 後続が最初に読む task が更新されている