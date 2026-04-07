---
name: docs-update-requirement
description: ハーネス用の requirement を追加・更新・改訂するときに使用する
argument-hint: "category=<category> title=<title> team=<owner-team>"
---

## 目的

実現したいこと、なぜ必要か、何が成功かを requirement として一貫した形式で管理する。

## 前提資料

- `.agents/project.yaml` を読み以下を把握する
  - `project.name`: requirement が属するプロジェクト名
  - `project.description`: 要求の対象ドメイン
  - `project.kind`: `simple` か `monorepo` か
  - `project.lang`: requirement 本文で使う言語
  - `project.teams`: `primary_owner_team` と関係チームの候補
  - `project.integrations`: 外部依存に関する要求の有無
  - `project.subprojects`: モノレポ時の影響範囲
- `.agents/glossary.md` を参照して用語、命名、カテゴリ名を統一する
- `.agents/requirements/index.md` を参照して既存要件を把握する
- `./references/requirement.template.md` を参照して基本フォーマットを把握する
- `./references/best-practices.md` を参照して requirement の粒度と書き方を把握する
- 関連する ADR / architecture / spec / tech-stack を参照して背景と制約を確認する

## 前提知識

- requirement は「何を実現するか」の正本であり、実装方法の正本ではない
- 1 requirement = 1 file を守る
- 変更時は requirement が最初の更新点になる

## やること

1. `request_user_input` で、要求の目的、背景、成功条件、非目標、制約、責任チーム、影響範囲を確認する
2. 既存の `.agents/requirements/` と `.agents/requirements/index.md` を確認し、重複 requirement や近い要求を調べる
3. requirement として独立させるべき粒度か判断する
   - 1 つの **目標** を持つか
   - **成功条件** が独立して定義できるか
   - **やらないこと** と **制約** を切り出せるか
4. 次の ID を決め、`REQ-<CATEGORY>-<NNN>` 形式で採番する
5. フォーマットに従って requirement を追加または更新する
6. `.agents/requirements/index.md` に索引を追加または更新する
7. requirement 追加・変更に伴って spec が必要なら `docs-update-spec` を使って対応する spec を作成または更新する
8. 重要判断や制約変更を含む場合は `docs-update-adr` を使って ADR を作成または更新する

## ルール

- requirement には実装手段ではなく目的と成功条件を書く
- **成功条件** は観測可能な形で書く
- **やらないこと** を省略せず、やらないことを明示する
- requirement の変更が先、spec や実装の変更はその後に行う

## 確認事項

- `request_user_input` または同等の確認で目的と成功条件を確認した
- 既存 requirement との重複を確認した
- front matter と本文構成がテンプレートに従っている
- `.agents/requirements/index.md` と整合している
- 必要な spec / ADR への追従要否を確認した
