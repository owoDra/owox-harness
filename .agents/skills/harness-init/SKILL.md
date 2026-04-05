---
name: harness-init
description: プロジェクトにエージェントハーネスを初期化する際に使用
---

# 前提

プロジェクトに `.agents/project.yaml` が存在しない
既に存在する場合は `request_user_input` ツールで現在のハーネス設定をすべて削除して初期化しなおすかを確認

# 前提知識

- `./references/project.example.yaml` を参照して `project.yaml` のフォーマットを把握
- `./references/architecture.example.md` を参照して `architecture.md` のフォーマットを把握
- `./references/team-guide.example.md` を参照して `<team>-guide.md` のフォーマットを把握
- `./references/validation.example.md` を参照して `validation.md` のフォーマットを把握
- 現在のリポジトリにある `.agents/` 以外のファイル・ディレクトリ構成・内容

# やること

1. 以下について `request_user_input` ツールで質問して `.agents/project.yaml` を作成
  - プロジェクト名は何か? -> `project.name` に記載
  - 何を作るプロジェクトか? -> `project.description` に記載
  - プロジェクトの共有言語は何か? (例: 日本語) -> `project.lang` に記載
  - 単一プロジェクトかサブプロジェクトが含まれるか? -> `project.kind` と `project.subprojects` に記載
  - どんなチームが存在して何を担当するか? -> `project.teams` に記載
  - 外部依存はあるか? -> `project.integrations` に記載
2. 以下について `request_user_input` ツールで質問して `docs-update-glossary` スキルで `.agents/glossary.md` に用語を登録
  - 現状のリポジトリから追加したほうが用語を提案
  - その他追加したい用語はあるか?
3. 以下について `request_user_input` ツールで質問して `docs-update-tech-stack` スキルで `.agents/tech-stack.md` を更新
  - 現状のリポジトリから使用技術スタックを提案
  - その他確定している技術スタックはあるか?
4. 以下について `request_user_input` ツールで質問して `.agents/architecture.md` を作成
  - 確認すべき項目は何か?
  - それぞれの項目についていつ行うべきか?
  - それぞれの項目についてどう行うべきか?
  - それぞれの項目について求める結果は?
  - それぞれの項目について問題があった場合どうするか?
5. 以下について `request_user_input` ツールで質問して `.agents/validation.md` を作成
  - 不変条件は何か?
  - 責務分離はどうするか?
  - 設計理念は何を重視するか?
6. 以下についてチームごとに `request_user_input` ツールで質問して `.agents/teams/<team>-guide.md` を作成
  - どんな役割を担うのか?
  - どこまでが担当範囲なのか?
  - ルールや決め事はあるか?
  - このチームだけが知るべき知識はあるか?
7. その他現状のリポジトリ状態から作成できそうなハーネス資料があれば `request_user_input` ツールで確認の上、対応するスキルを使用して更新

# 出力
- `.agents/project.yaml`
- `.agents/glossary.md`
- `.agents/tech-stack.md`
- `.agents/validation.md`
- `.agents/architecture.md`
- `.agents/teams/<team>-guide.md`
- その他更新したドキュメント

# 確認事項
- 作成したハーネス資料に漏れがないか?
- 作成したハーネス資料のフォーマットが正しいか?
- 作成したハーネス資料の内容が明確でわかりやすく誤りがないか?
