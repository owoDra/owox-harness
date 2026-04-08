---
name: task-validation
description: 検証、受け入れ確認、品質確認が主目的のタスクを開始し、進め方と判断ゲートを定めて実施結果を整理するときに使用する
argument-hint: "goal=<何を検証するか> mode=<agent-led|collab-led>"
---

## 目的

対象変更または現状について、定められた validation と完了条件に照らして検証し、結果、未達、残課題を明確にする。

## 前提資料

- `../task-prepare/references/task.example.md` を参照して `tasks/task-*.md` の基本フォーマットを把握する
- `docs/project/glossary.md` を参照して用語と命名を統一する
- `docs/project/architecture.md` があれば参照して普遍ルールを確認する
- `.agents/project.yaml` があれば読みプロジェクト、チーム、サブプロジェクト、外部依存を把握する
- `docs/project/validation.md` を参照して既存の検証観点と粒度を把握する
- 関連する requirement、spec、ADR、code、test、docs を参照する
- 該当チームの `docs/project/teams/<team>-guide.md` があれば参照する
- `./references/best-practices.md` を参照して validation task の進め方を把握する

## 前提知識

- validation task は作ることより、満たしているかを確かめることが主目的である
- 検証結果は pass/fail だけでなく、条件、証跡、未確認項目まで含めて残す
- validation の定義不足が見つかった場合は、必要に応じて `docs-update-validation` に戻す

## やること

1. ユーザー依頼と `task-prepare` の確認結果をもとに、`request_user_input` ツールで `goal`、`execution_mode`、検証対象、禁止事項、完了条件を確認する
2. `tasks/task-*.md` を作成し、少なくとも以下を記載する
   - 何を達成するか
   - どこを変えてよいか
   - 守るべき不変条件
   - 更新すべき正本
   - 実行すべき検証
   - 完了条件
   - 進捗
3. `execution_mode` を明示して進め方を決める
   - `agent-led`: 検証計画と停止条件を共有したうえで、Agents 主導で検証実施、結果整理、未達洗い出しまで進める
   - `collab-led`: 検証項目、証跡、未達時の扱いを節目ごとに確認しながら進める
4. ユーザーの判断が必要な項目は `request_user_input` ツールを使って確認する
   - 検証項目の優先順位
   - 合格条件の解釈
   - 証跡として十分なもの
   - 未達時に止めるか進めるか
5. 検証開始前に以下を明文化する
   - 検証対象
   - 検証観点
   - 合格条件
   - 証跡の取り方
   - 未確認項目の扱い
   - 停止条件
6. validation と関連正本に沿って検証を実施する
7. 項目ごとに結果を整理する
   - 実施したか
   - 合格したか
   - 証跡は何か
   - 未達や未確認があるか
8. validation 定義の不足や不整合が見つかった場合は `docs-update-validation` の更新要否を確認する
9. 判断ゲートで停止して確認する
   - `agent-led`: 合格条件の解釈差、重大な未達、validation 不足が見つかった場合のみ `request_user_input` ツールで確認する
   - `collab-led`: 検証計画確定後、主要結果整理後、未達対応方針決定前に `request_user_input` ツールで確認する
10. 完了後に `tasks/task-*.md` の進捗を更新する

## ルール

- 合格条件が曖昧なまま判定しない
- 実施結果と推測を混ぜない
- 未確認項目を pass 扱いしない
- validation の不足を見つけたら放置しない
- ユーザー判断が必要な確認は必ず `request_user_input` ツールを使う

## 確認事項

- `goal` と `execution_mode` の確認に `request_user_input` ツールを使っている
- 検証対象、合格条件、停止条件が明文化されている
- 項目ごとの結果と証跡が整理されている
- validation 更新要否を確認している
- `tasks/task-*.md` の進捗が更新されている
