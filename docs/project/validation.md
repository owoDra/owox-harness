# 検証

## 目的

この文書は、`owox-harness` v2 を開発する際に確認すべき検証項目を定義します。

## 検証の基本方針

- 正本と生成物の二重管理を防ぐ
- workflow の状態遷移を壊さない
- locale と hidden context の境界を壊さない
- CLI adapter の差分を core に漏らさない
- サブエージェント利用時と代替動作時の両方を検証する

## 実装開始時の最小完了条件

- 変更対象に対応する requirement と spec を読んでいる
- task に acceptance criteria と required checks がある
- intent と required decisions が必要な場合は定義されている
- 実施した検証結果が evidence として残る
- `validate` 相当の整合性確認が通る
- 未実施検証がある場合は残リスクを明記する

## P0: 毎回確認したい項目

### V-1. スキーマ検証

- `owox.harness.yaml` が schema に通る
- 必須項目の欠落を検知できる
- locale 設定が妥当である
- profile 設定が妥当である

### V-2. 生成の冪等性

- 同じ入力で再生成して無駄な差分が出ない
- 生成順序によって内容が変わらない
- source → generated の対応が安定している

### V-2a. 初期化セッション完全性

- scan / suggest / confirm / materialize の状態が壊れない
- confirm 前に materialize できない
- 再開後も未確定の判断項目が失われない

### V-2b. 管理文書のトークン上限

- 管理対象の Markdown 文書が設定した上限を超えない
- 上限が低い場合に分割または圧縮が働く
- validate がトークン上限超過を返せる

### V-3. 正本と生成物の分離

- `.owox/`、CLI 固有の rules file、CLI 固有の生成ディレクトリを source として読んでいない
- 生成物を手編集した結果が source に逆流しない
- AI 専用 artifact が `docs/project/` に混入していない

### V-4. workflow 状態遷移

- task 状態遷移が定義どおりに動く
- 不正な状態遷移を拒否できる
- intent 未確定や required decision 未解決で `executing` へ進まない
- gate 条件と verify 条件が正しく評価される

### V-5. verify / guard / gate

- 必須検証が実行される
- execution verify と intent verify が区別される
- 危険操作が期待どおり deny / ask / allow される
- 人間確認が必要な条件で gate が立つ

### V-5a. prerequisite enforcement

- 必読 docs 未確認で `planning` や `executing` へ進まない
- required checks 未定義で `done` へ進まない
- required evidence 未添付で `done` へ進まない
- `task-check-prerequisites` が `allow` / `ask` / `deny` を返す
- hidden artifact の intent / decision ledger 不足を検出できる

### V-5b. intent / decision / drift artifacts

- `.owox/intents/` に intent artifact が保存される
- `.owox/decisions/ledger.json` に decision record が保存される
- `.owox/drift-audits/` に drift audit 結果が保存される
- drift audit が intent / decision / evidence のずれを検出できる

### V-6. 多言語境界

- visible output が project locale に従う
- hidden context が英語ベースで維持される
- AI-facing Markdown (`AGENTS.md`、`.opencode/`、handoff Markdown など) が英語で維持される
- `.owox/` runtime artifact への参照が `owox` CLI 導線に寄っている
- locale 切替で internal key が崩れない

## P0: adapter ごとに確認したい項目

実機確認の手順、期待結果、残す証跡は repo 直下の `Checklist.md` を参照します。

### V-7. Codex adapter

- 生成された設定 / skills / hooks が有効な形式で出力される
- hooks 未対応環境でも壊れずに段階的に機能縮退できる
- MCP / skills 連携が壊れていない

### V-8. Claude Code adapter

- 生成された `CLAUDE.md` / skills / hooks / subagents が有効な形式で出力される
- hooks で決定的な強制ができる
- サブエージェント handoff が壊れない

### V-9. OpenCode adapter

- 生成された `AGENTS.md` / `.opencode` / tools / agents / plugins が有効な形式で出力される
- command / subtask / agent routing が期待どおりに働く
- MCP / custom tools 導線が壊れない

### V-10. Copilot CLI adapter

- 生成された custom agents / skills / hooks / plugin files が有効な形式で出力される
- project-level precedence 前提でも意図した挙動になる
- current working directory から hooks が読まれる前提を満たす

## P0: サブエージェント workflow で確認したい項目

### V-11. parent → child handoff

- 目的、範囲、対象外、完了条件、参照資料が欠落しない
- intent summary と relevant decisions が欠落しない
- locale 依存の visible 部分と hidden 構造が崩れない

### V-12. child → parent report

- 事実と提案が分離される
- 実施内容と未確定事項が分離される
- evidence が task に紐づく

### V-13. 代替動作

- subagent 非対応または無効時に単独 workflow へ移行できる
- degrade 時も acceptance criteria と verify 契約が保たれる

## P1: 継続的に確認したい項目

### V-14. fixture E2E

最低でも次の fixture を持つのが望ましいです。

- 最小 web project
- monorepo web project
- locale: Japanese
- locale: English
- subagent enabled
- subagent disabled

### V-15. snapshot coverage

- CLI 固有の rules file
- CLI 固有の生成ディレクトリの代表出力
- `.owox/` 配下の代表 artifact
- task template
- 文書ひな型
- CLI adapter files
- locale rendered docs

## 失敗時の扱い

- schema failure は即時停止
- generation mismatch は即時停止
- verify failure は task 完了不可
- guard failure は操作拒否
- gate required は human confirmation 待ち

## 推奨テスト構成

- unit: core
- snapshot: generators / renderers
- integration: cli command chains
- e2e: fixture repository workflows

## package ごとの優先検証

### core

- state machine の unit test
- policy evaluation の unit test
- locale 非依存な内部表現のテスト

### cli

- command chain の integration test
- generation idempotency の snapshot test
- validate / sync の失敗系テスト
- 相談型初期化セッションの再開 / 確認 / 出力確定テスト

### adapters

- generated files の形式検証
- 機能縮退時の代替動作検証
- project-level precedence と hook 有無の差分検証

## 関連資料

- `requirements/REQ-harness-v2-foundation.md`
- `requirements/REQ-intent-governed-agent-control.md`
- `specs/shared/SPEC-workflow-core-contracts.md`
- `specs/shared/SPEC-intent-governed-agent-control.md`
- `specs/shared/SPEC-integration-adapter-contracts.md`
- `specs/core/SPEC-task-state-machine.md`
- `specs/core/SPEC-policy-evaluation.md`
- `specs/cli/SPEC-command-surface.md`
- `specs/cli/SPEC-generation-pipeline.md`
- `specs/cli/SPEC-harness-init-consultative-workflow.md`
- `specs/cli/SPEC-managed-document-token-budgets.md`
- `patterns/test-evidence-driven-validation.md`
- `architecture.md`
- `integrations/ai-coding-clis.md`
