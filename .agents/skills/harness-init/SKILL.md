---
name: harness-init
description: プロジェクトにエージェントハーネスを初期化する際に使用
---

# 目的

`.agents/project.yaml` が存在しない状態で、ハーネス初期化に必要なアンケートを漏れなく回収し、必要最小限のハーネス資料とプロジェクト資料を作成する。

# 前提

- プロジェクトに `.agents/project.yaml` が存在しない
- 既に存在する場合は `request_user_input` ツールで現在のハーネス設定をすべて削除して初期化しなおすかを確認する
- `request_user_input` ツールが使えない場合は通常メッセージで同じ質問を順番に行い、回答を task に転記する

# 前提知識

- `./references/init-questionnaire.md` を参照して固定アンケートと回答状態の管理方法を把握する
- 現在のリポジトリにある `.agents/` 以外のファイル・ディレクトリ構成・内容を確認し、質問時の提案候補に使う
- 初期化時は既存の `.agents/` と `AGENTS.md` に書かれた内容を根拠にしない
- リポジトリから読み取れた内容は推定であり、ユーザー確認前に確定情報として扱わない

# やること

1. `./references/init-questionnaire.md` をコピーして `tasks/task-harness-init.md` を作成して必須質問台帳を作業メモとして使い、各項目を `unasked` `confirmed` `none` `tbd` のいずれかで管理する
2. Phase 1 として `project.yaml` の必須項目を確認し、`harness-update-project-yaml` スキルで `.agents/project.yaml` を作成または更新する
   - `project.name`
   - `project.description`
   - `project.lang`
   - `project.kind`
   - `project.subprojects`
   - `project.teams`
   - `project.integrations`
3. Phase 2 として glossary と tech stack の初期化に必要な項目を確認し、必要に応じて以下を更新する
   - `docs/project/glossary.md`
   - `docs/project/tech-stack.md`
4. Phase 3 として integration の詳細を確認し、`docs-update-integrations` スキルで `docs/project/integrations/` を作成または更新する
5. Phase 4 として architecture と validation の初期化に必要な項目を確認し、必要に応じて以下を更新する
   - `docs/project/architecture.md`
   - `docs/project/validation.md`
6. Phase 5 として team guide の初期化に必要な項目をチームごとに確認し、`docs-update-team-guide` スキルで `docs/project/teams/<team>-guide.md` を作成または更新する
7. 各 Phase の最後に以下を必ず確認する
   - 確定した回答
   - `none` として扱う回答
   - `tbd` として保留する回答
   - まだ `unasked` のまま残っていないか
8. `unasked` が 1 件でも残っている間は次の Phase に進まない
9. 文書生成前に、必須項目すべてに回答または保留理由があることを確認する
10. 初期化完了後に、必要なら `task-prepare` 相当の確認を行い、後続 task に進める状態へ整理する

# 質問ルール

- 必須質問は固定アンケート順に行い、自由に省略しない
- 1 回の質問で複数項目を聞く場合でも、回答状態は項目単位で管理する
- `なし` と `未定` を区別する
- リポジトリから推定した候補は「提案」として示し、採用可否を確認する
- Phase の終了時に要約を提示し、認識違いがないか確認する
- 通常メッセージで確認した場合も、`request_user_input` を使った場合と同じ粒度で回答を task に残す

# 出力

- `.agents/project.yaml`
- `docs/project/glossary.md`
- `docs/project/tech-stack.md`
- `docs/project/integrations/`
- `docs/project/validation.md`
- `docs/project/architecture.md`
- `docs/project/teams/<team>-guide.md`
- その他更新したドキュメント

# 確認事項

- 固定アンケートの必須項目に `unasked` が残っていないか
- 各回答が `confirmed` `none` `tbd` のどれかに整理されているか
- `none` と `tbd` を混同していないか
- 作成したハーネス資料とプロジェクト資料に漏れがないか
- 作成したハーネス資料とプロジェクト資料のフォーマットが正しいか
- 作成したハーネス資料とプロジェクト資料の内容が明確でわかりやすく誤りがないか
- 初期化根拠として既存の `.agents/` と `AGENTS.md` の記述を使っていないか
