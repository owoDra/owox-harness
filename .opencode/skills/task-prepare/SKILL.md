---
name: task-prepare
description: ユーザーからリクエストを受けて何かを行うときに必ず使用する
---

# 目的

ユーザーのリクエストに対してエージェントがやるべき内容に齟齬がないように必要な情報を整理してタスク内容の確認を行う

# 初期化例外

- `.agents/project.yaml` が存在しない場合、このスキルで確認を進めず `harness-init` を先に実行する
- `harness-init` 完了後に、このスキル相当の確認へ戻る

# 前提資料

- `./references/task.example.md` を参照して `tasks/task-*.md` のフォーマットを把握
- `docs/project/glossary.md` を参照して共通用語と命名を把握する
- `docs/project/architecture.md` を参照して普遍的なルール・指針を把握する
- `.agents/project.yaml` を読み以下を把握する
  - `project.name`: プロジェクト名
  - `project.description`: プロジェクト説明
  - `project.kind`: プロジェクトの種類 (`simple`: 単一プロジェクト構成, `monorepo`: 複数のサブプロジェクトが含まれるプロジェクト構成)
  - `project.lang`: プロジェクトで使用する言語。すべての返答・コメント・ドキュメントはこの言語を使用する
  - `project.teams`: プロジェクトにかかわるチームとその役割のマップ
  - `project.integrations`: プロジェクトで参照する外部API・サービスとその役割のマップ
  - `project.subprojects`: プロジェクトが `monorepo` だった際に内包するサブプロジェクトのマップ

# やること

1. ユーザーリクエストに対して以下を `question` ツールで提案も含めて質問して確認してください
  - 作業内容に齟齬がないか
  - どのように進めるか
  - 禁止事項はあるか
  - その他不明確で質問すべきものがあれば質問を追加
2. 確認したタスクについてどのチームの分野かを判断して該当チームの `docs/project/teams/<team>-guide.md` を参照
3. タスク内容に応じた `task-*` スキルを使用して `tasks/task-*.md` を作成してタスクを進める
4. 完了後に作成した `tasks/task-*.md` の進捗を更新する
