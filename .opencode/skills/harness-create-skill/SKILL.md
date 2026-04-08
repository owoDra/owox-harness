---
name: harness-create-skill
description: ハーネスにスキルを新たに追加するときに使用する
---

## 目的

ハーネスにおいて共通化したい特定の作業のスキルを作成する

## 前提資料

- `./references/SKILL.example.md` を参照して `.opencode/skills/<skill-name>/SKILL.md` のフォーマットを把握
- `.agents/project.yaml` を読み以下を把握する
  - `project.name`: スキルを適用するプロジェクト名
  - `project.description`: スキルが扱う対象ドメインの説明
  - `project.kind`: `simple` か `monorepo` か
  - `project.lang`: スキル本文・質問・生成物で使う言語
  - `project.teams`: どのチーム向けスキルか判断する材料
  - `project.integrations`: スキル化したい外部依存の有無
  - `project.subprojects`: モノレポ時にサブプロジェクト固有の分岐が必要か
- `docs/project/glossary.md` を参照して既存の用語と命名を把握する

## 前提知識

- 既存のスキル（`.opencode/skills/`）— 構成の参考にする
- テンプレート・サンプルが必要な場合は対象ドキュメントの既存サンプル

### 命名規則

| プレフィックス | 用途 |
| ------------ | -------------------------------------- |
| `docs-`      |プロジェクト資料の生成・更新を行うスキル |
| `harness-`   | ハーネスライフサイクルとハーネス設定更新のスキル |
| `task-`      | ハーネス資料またはコードをもとに作業を行うスキル  |
| `util-`      | 何かのツールを実行するためのスキル |

### スキルのディレクトリ構造

```
.opencode/skills/<skill-name>/
  SKILL.md                          # 必須: スキル定義
  references/
    best-practices.md               # 任意: 補足ルール・背景
```

references は **必要なときだけ** 作成する。シンプルなスキルは `SKILL.md` 1 ファイルで十分。

## やること

1. ユーザーリクエストに対して以下を `question` ツールで提案も含めて質問して確認してください
  - **スキル名**: プレフィックス（`docs-` / `harness-` / その他）と名前
  - **用途**: スキルが何をするか 1 文で
  - **発動条件**: どのような状況でこのスキルを使うか
  - **referencesが必要か**: テンプレートやサンプル、ベストプラクティスファイルが必要かどうか
2. `.opencode/skills/<skill-name>/SKILL.md` を作成する。
3. references が必要な場合は、対応するサブディレクトリを作成してファイルを配置する。

## 確認事項

- askQuestions でスキル名・用途・発動条件・assets 要否を確認した
- `SKILL.md` の frontmatter に `name` と `description` がある
