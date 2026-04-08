# owox Harness Template

人間が技術判断を担い、AI がその判断を速く正確に実行するための、汎用的な AI エージェントハーネスのテンプレートです。

個人開発からチーム開発まで、単一プロジェクトからモノレポまでを対象に、仕様変更に強く、判断根拠を残しながら、高品質な開発を継続できることを目指しています。

## コンセプト

このハーネスは、AI に開発を丸投げするための仕組みではありません。
人間が責任を持って要求、仕様、設計判断を管理し、その前提の上で AI の速度と実行力を活かすための運用基盤です。

このハーネスでは、作業の正本を `.agents/` に集約します。
AI も人間も同じ資料を参照し、同じ手順に従って進めることで、以下を狙います。

- 要求、仕様、設計判断を分離して管理できる
- 変更理由と影響範囲を追跡できる
- AI の出力が場当たり的にならず、判断の土台に沿う
- プロジェクト規模や体制が変わっても運用を崩しにくい

## このハーネスが重視すること

- 人間が最終的な技術判断を行うこと
- AI が参照すべき正本を明確にすること
- 要求、仕様、ADR、チームルールを分離して保持すること
- タスクごとの進め方と完了条件を明文化すること
- 変更に強い構造を最初から用意すること

## `.agents/` の役割

`.agents/` はハーネス本体です。開発時の判断や作業の進め方を支える資料をここに集約します。

- `.agents/requirements/`
  何を実現するかを管理する
- `.agents/specs/`
  要求をどのような振る舞いに落とすかを管理する
- `.agents/adr/`
  重要な判断とその理由を記録する
- `.agents/teams/`
  チームごとの責務やルールを定義する
- `.agents/tasks/`
  進行中の作業と完了条件を記録する
- `.agents/integrations/`
  外部 API やサービスとの関係を整理する
- `.agents/glossary.md`
  用語を統一する
- `.agents/tech-stack.md`
  採用技術を整理する
- `.agents/architecture.md`
  共通の不変条件や設計方針を記録する
- `.agents/validation.md`
  品質確認と検証方針を記録する

## `docs/` の役割

`docs/` はプロジェクトに関する人間向けの資料を配置します。

## 想定する使い方

1. 人間が要求や制約、判断基準をハーネス資料として定義する
2. AI はその正本を参照しながらタスクを進める
3. 実装や修正に伴って必要な資料も更新する
4. 人間は記録された判断根拠と変更内容をもとにレビューする

この流れにより、AI の速さを使いながら、品質と説明可能性を両立しやすくなります。

## 向いているケース

* AI を開発に本格的に組み込みたい
* 仕様変更が頻繁に起こる
* 個人開発でも判断根拠を整理しておきたい
* チームで AI の作業品質を揃えたい
* 単発の補助ではなく、継続的な AI 運用を前提にしたい

## 初期化方法

新しいプロジェクトでこのテンプレートを使い始めるときは、まずハーネスをそのプロジェクト向けに初期化します。

1. このテンプレートをリポジトリに配置する
2. 使用するコーディングエージェント向けに設定ファイルを同期する
3. コーディングエージェントで `harness-init` スキルを実行してプロジェクト向けに初期化する
4. `.agents/project.yaml` が生成されていれば初期化完了

### エージェント設定の同期

このテンプレートでは、`.agents/` を正本として管理します。
各コーディングエージェント向けの設定ファイルや skills ディレクトリは、`.agents/scripts/sync_agent.sh` で生成または同期します。

スクリプトは、`.agents/skills/` と各階層にある `AGENTS.md`、`AGENTS.override.md` をもとに、対象エージェント向けのファイル配置とツール名に変換します。

#### 配置場所

- 同期スクリプト: `.agents/scripts/sync_agent.sh`
- 復元スクリプト: `.agents/scripts/restore_agent`
- バックアップ保存先: `.agents/.backup/`

#### 対応しているエージェント

- Claude Code
- GitHub Copilot CLI
- Cursor CLI
- OpenCode
- Crush
- Gemini CLI
- Aider
- Kiro CLI

#### 実行方法

使用するエージェント名を引数に指定して同期します。

```bash
bash .agents/scripts/sync_agent.sh claude
bash .agents/scripts/sync_agent.sh copilot
bash .agents/scripts/sync_agent.sh cursor
bash .agents/scripts/sync_agent.sh opencode
bash .agents/scripts/sync_agent.sh crush
bash .agents/scripts/sync_agent.sh gemini
bash .agents/scripts/sync_agent.sh aider
bash .agents/scripts/sync_agent.sh kiro
```

同期前に変更内容だけ確認したい場合は `--dry-run` を使います。

```bash
bash .agents/scripts/sync_agent.sh claude --dry-run
```

#### 同期時の動き

* `.agents/skills/` を対象エージェント向けの skills ディレクトリへコピーする
* `AGENTS.md` と `AGENTS.override.md` を対象エージェント向けの配置ルールに合わせて生成または同期する
* Markdown 内のスキル名やツール名を対象エージェント向けに置き換える
* 元のファイルは `.agents/.backup/` にバックアップする

特に Codex CLI 向けに書かれた `request_user_input` は、対象エージェント側で使える質問手段へ変換します。
対象エージェントに同等の質問ツール名がない場合は、`Questions` へ変換します。

#### バックアップからの復元

同期前の状態へ戻したい場合は、復元スクリプトを実行します。

最新のバックアップから復元する場合:

```bash
bash .agents/scripts/restore_agent
```

特定のバックアップを指定して復元する場合:

```bash
bash .agents/scripts/restore_agent --snapshot <snapshot-id>
```

`snapshot-id` は `.agents/.backup/` 配下のディレクトリ名です。

#### 初回セットアップ例

Claude Code を使うプロジェクトとして初期化する場合は、次の順で進めます。

```bash
bash .agents/scripts/sync_agent.sh claude
```

その後、Claude Code 上で `harness-init` スキルを実行します。
`.agents/project.yaml` が生成されれば、プロジェクト向け初期化は完了です。
