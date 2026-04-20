## 最初に読むもの

1. `.owox/project.md`
2. 対象の `.owox/tasks/task-*.md` と必要なら `.owox/tasks/task-current.json`
3. 必要に応じて `docs/project/index.md`

## 作業ルール

- source of truth は `owox.harness.yaml` と `docs/project/` を優先する
- generated artifacts を手編集の正本として扱わない
- task 開始時は `owox task-create` / `owox task-update` / `owox task-set-current` / `owox task-transition`、`owox task-check-prerequisites`、`owox validate` を使う
- task 完了前は `owox verify` を実行する
- 重要判断は `owox decision-record`、意図更新は `owox intent-save` を使う
- 完了前に `owox drift-audit` を実行する
- 危険操作、設計変更、外部影響、完了判断では `owox gate` を確認する
- generated artifacts の再同期は `owox sync` を使う
