---
name: harness-init
description: プロジェクトにエージェントハーネスを初期化する際に使用
---

# 前提

プロジェクトに `.agents/project.yaml` が存在しない
既に存在する場合は `request_user_input` ツールで現在のハーネス設定をすべて削除して初期化しなおすかを確認

# 前提知識

- `./references/project.example.yaml` を参照して `project.yaml` のフォーマットを把握
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
4. 以下について `request_user_input` ツールで質問して `docs-update-architecture` スキルで `.agents/architecture.md` を作成または更新
  - 不変条件として何を置くか?
  - 責務分離をどう定義するか?
  - 設計理念として何を重視するか?
  - 変更が必要な spec / 実装コード / テスト用コード / validation は何か?
  - 重要判断として ADR に残すべきものはあるか?
5. 以下について `request_user_input` ツールで質問して `docs-update-validation` スキルで `.agents/validation.md` を作成または更新
  - 共通候補としてどの確認項目を採用するか?
  - 各候補を何で検証するか?
  - それぞれいつ行うか?
  - それぞれ求める結果は何か?
  - 問題があった際にどうするか?
  - 更新に伴って変更すべきテストコードは何か?
  - 必要に応じて ADR や技術スタックも更新すべきか?
6. 以下についてチームごとに `request_user_input` ツールで質問して `docs-update-team-guide` スキルで `.agents/teams/<team>-guide.md` を作成または更新
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
