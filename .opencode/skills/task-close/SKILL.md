---
name: task-close
description: タスク完了時に成果、未完了事項、正本更新、引き継ぎを整理してクローズするときに使用する
argument-hint: "goal=<何を閉じるか> mode=<agent-led|collab-led>"
---

## 目的

タスクの成果、未完了事項、残課題、更新済み正本、次アクションを整理し、再開や引き継ぎが可能な状態でタスクを閉じる。

## 前提資料

- `../task-prepare/references/task.example.md` を参照して `tasks/task-*.md` の基本フォーマットを把握する
- `docs/project/glossary.md` を参照して用語と命名を統一する
- `docs/project/architecture.md` があれば参照して普遍ルールを確認する
- `.agents/project.yaml` があれば読みプロジェクト、チーム、サブプロジェクト、外部依存を把握する
- 対象 task に関連する requirement、spec、ADR、validation、code、test、docs、`tasks/task-*.md` を参照する
- 該当チームの `docs/project/teams/<team>-guide.md` があれば参照する
- `./references/best-practices.md` を参照して close の進め方を把握する

## 前提知識

- close は単なる終了宣言ではなく、成果と残課題の整理である
- 完了したことと、意図的に残したことを分けて残す
- 後続が再開できる状態まで整えて初めて close といえる

## やること

1. ユーザー依頼と `task-prepare` の確認結果をもとに、`question` ツールで `goal`、`execution_mode`、クローズ対象、禁止事項、完了条件を確認する
2. `tasks/task-*.md` を更新し、少なくとも以下を見直す
   - 何を達成したか
   - どこを変えたか
   - 守った不変条件
   - 更新した正本
   - 実行した検証
   - 完了条件の充足状況
   - 進捗
3. `execution_mode` を明示して進め方を決める
   - `agent-led`: 整理観点と停止条件を共有したうえで、Agents 主導で成果整理、残課題整理、クローズ更新まで進める
   - `collab-led`: 完了判定、残課題の扱い、次アクション提案を節目ごとに確認しながら進める
4. ユーザーの判断が必要な項目は `question` ツールを使って確認する
   - 完了とみなす範囲
   - 未完了事項の扱い
   - 引き継ぎ先または次タスク
   - 追加で残すべきサマリ
5. クローズ前に以下を明文化する
   - 完了したこと
   - 未完了事項
   - 既知の残課題
   - 更新済み正本
   - 実施済み検証
   - 停止条件
6. 完了条件を見直し、満たしているか確認する
7. 後続に渡す情報を整理する
   - 成果サマリ
   - 未完了事項
   - 残課題
   - 次の推奨 task 種別
8. 判断ゲートで停止して確認する
   - `agent-led`: 完了条件未達、残課題の優先度が高い、追加作業が必要な場合のみ `question` ツールで確認する
   - `collab-led`: 完了判定前、残課題整理後、次アクション確定前に `question` ツールで確認する
9. `tasks/task-*.md` の進捗を最終更新する

## ルール

- 完了と未完了を混ぜない
- 完了条件未達なら close せず次 task へ送る
- 残課題は曖昧にぼかさない
- ユーザー判断が必要な確認は必ず `question` ツールを使う

## 確認事項

- `goal` と `execution_mode` の確認に `question` ツールを使っている
- 完了したこと、未完了事項、残課題が分離されている
- 更新済み正本と実施済み検証が整理されている
- 次の推奨 task 種別が示されている
- `tasks/task-*.md` の進捗が最終更新されている
