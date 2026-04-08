---
name: task-discovery
description: 調査・現状把握・影響範囲整理が主目的のタスクを開始し、進め方と判断ゲートを定めて実行するときに使用する
argument-hint: "goal=<何を明らかにしたいか> mode=<agent-led|collab-led>"
---

## 目的

実装や資料更新に入る前に、現状、制約、影響範囲、論点、未確定事項を整理し、後続作業に使える調査結果を残す。

## 前提資料

- `../task-prepare/references/task.example.md` を参照して `tasks/task-*.md` の基本フォーマットを把握する
- `docs/project/glossary.md` を参照して用語と命名を統一する
- `docs/project/architecture.md` があれば参照して普遍ルールを確認する
- `.agents/project.yaml` があれば読み以下を把握する
  - `project.name`: プロジェクト名
  - `project.description`: 調査対象の背景
  - `project.kind`: `simple` か `monorepo` か
  - `project.lang`: 調査メモと返答で使う言語
  - `project.teams`: どのチーム観点で調べるべきか
  - `project.integrations`: 外部依存の有無
  - `project.subprojects`: モノレポ時の対象範囲
- `docs/project/requirements/`, `docs/project/specs/`, `docs/project/adr/`, `.agents/tasks/`, `docs/project/integrations/`, `docs/project/validation.md`, `docs/project/tech-stack.md` のうち関連する資料を参照する
- 該当チームの `docs/project/teams/<team>-guide.md` があれば参照する
- `./references/best-practices.md` を参照して discovery の進め方を把握する

## 前提知識

- discovery は答えを急いで固定する段階ではなく、後続の判断に必要な不確実性を減らす段階である
- 調査結果は後続の requirement、spec、ADR、implementation、validation に再利用できる形で残す
- 調査の粒度は「次の意思決定に必要十分」で止める

## やること

1. ユーザー依頼と `task-prepare` の確認結果をもとに、`question` ツールで `goal`、`execution_mode`、禁止事項、完了条件を確認する
2. `tasks/task-*.md` を作成し、少なくとも以下を記載する
   - 何を達成するか
   - どこを変えてよいか
   - 守るべき不変条件
   - 更新すべき正本
   - 実行すべき検証
   - 完了条件
   - 進捗
3. `execution_mode` に応じて進め方を決める
   - `agent-led`: 先に調査計画と停止条件を共有したうえで、Agents 主導で探索、整理、要約まで進める
   - `collab-led`: 調査観点、優先順位、論点整理、次アクションを節目ごとに確認しながら進める
4. ユーザーの判断が必要な項目は `question` ツールを使って確認する
   - 調査対象の優先順位
   - 調査しない範囲
   - 論点ごとの深掘り要否
   - 次に進む task 種別
5. 最初に以下を明文化する
   - 調査対象
   - 調査しない範囲
   - 主要な仮説または確認したい論点
   - 参照候補の正本
   - 停止条件
6. 正本を優先して調査し、現状を把握する
   - requirement: 何を実現したいか
   - spec: 期待される振る舞い
   - ADR: 既存判断と制約
   - code / test / docs: 実際の状態
   - integrations / validation / tech-stack: 周辺制約
7. 調査結果を以下の観点で整理する
   - 事実として確認できたこと
   - 推測を含むこと
   - 未解決の論点
   - 影響を受ける資料、コード、テスト
   - 次に必要な意思決定
8. 判断ゲートで停止して確認する
   - `agent-led`: 次の作業に進む前に、重要な前提変更、権限外変更、高リスク判断が出た場合のみ `question` ツールで確認する
   - `collab-led`: 調査方針確定後、主要論点整理後、次アクション提案前に `question` ツールで確認する
9. 後続に渡せる成果物を残す
   - 調査サマリ
   - 影響範囲一覧
   - 未解決事項一覧
   - 推奨する次タスク種別
10. 完了後に `tasks/task-*.md` の進捗を更新する

## ルール

- 事実と推測を混在させない
- 正本よりコードが先に変わっている場合は差分として明示する
- 調査の途中で実装に踏み込まない。ただし再現確認や読解のための最小限の検証はよい
- 参照した資料と未参照の資料を区別して記録する
- 重要判断が必要になったら discovery のまま決め打ちせず、ADR や後続 task に送る
- `agent-led` でも高リスク操作、破壊的操作、機密に触れる操作は確認を挟む
- ユーザー判断が必要な確認は口頭確認だけで済ませず、必ず `question` ツールを使う

## 確認事項

- `execution_mode` が明示されている
- `goal` と `execution_mode` の確認に `question` ツールを使っている
- 調査対象、対象外、停止条件が明文化されている
- ユーザー判断が必要な項目で `question` ツールを使っている
- 事実、推測、未解決事項が分離されている
- 後続の task 種別提案まで含めて整理されている
- `tasks/task-*.md` の進捗が更新されている
