---
name: docs-update-requirement
description: プロジェクトへの要件を追加・更新・改訂するときに使用する
argument-hint: "category=<category> title=<title> team=<owner-team>"
---

## 目的

実現したいこと、なぜ必要か、何が成功かを、既存要件との整合を保ちながら requirement として一貫した形式で管理する。

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
- `.agents/validation.md` があれば参照して、要求と検証観点の整合を確認する
- `.agents/requirements/index.md` のルールを参照して、`project.kind` に応じた requirement の配置先を確認する

## 前提知識

- requirement は「何を実現するか」の正本であり、実装方法の正本ではない
- 1 requirement = 1 file を守る
- 変更時は requirement が最初の更新点になる
- requirement の見出しは日本語で統一する

## やること

1. `request_user_input` で、要求の目的、背景、根拠、成功指標、対象範囲、対象外、制約、責任チーム、影響範囲を確認する
2. `project.kind` に応じて requirement の配置先を決める
   - `simple`: `.agents/requirements/` 直下に配置する
   - `monorepo` かつプロジェクト共通: `.agents/requirements/shared/` に配置する
   - `monorepo` かつ特定 subproject 向け: `.agents/requirements/<subproject>/` に配置する
3. 既存の `.agents/requirements/` と `.agents/requirements/index.md` を確認し、重複 requirement や近い要求を調べる
4. 関連する `.agents/specs/`、`.agents/adr/`、`.agents/validation.md` を確認し、既存 requirement と矛盾する要求や前提変更がないかを調べる
5. 重複・矛盾確認の結果を整理する
   - 同じ目標や成功指標を別 requirement で既に扱っていないか
   - 既存 requirement の対象範囲、対象外、制約と衝突していないか
   - 既存 spec や ADR にある制約、判断、前提と矛盾していないか
   - 重複または矛盾がある場合は、新規追加ではなく統合、分割、改訂のどれが妥当か判断する
6. requirement として独立させるべき粒度か判断する
   - 1 つの **目標** を持つか
   - **成功指標** が独立して定義できるか
   - **対象範囲**、**対象外**、**制約 / 品質特性** を切り出せるか
   - 既存 requirement へ追記した方が自然ではないか
7. 次の ID を決め、`REQ-<CATEGORY>-<NNN>` 形式で採番する
8. フォーマットに従って requirement を追加または更新する
   - 配置先は手順 2 で決めたディレクトリを使う
   - 必要なディレクトリがなければ作成する
9. `.agents/requirements/index.md` に索引を追加または更新する
10. requirement 追加・変更に伴って spec が必要なら `docs-update-spec` を使って対応する spec を作成または更新する
11. 重要判断や制約変更を含む場合は `docs-update-adr` を使って ADR を作成または更新する
12. 重複・矛盾確認の結果に応じて、関連 requirement / spec / ADR / validation の追従更新要否を確認する

## ルール

- requirement には実装手段ではなく目的、根拠、成功指標、境界条件を書く
- **成功指標** は観測可能な形で書く
- **対象外** を省略せず、やらないことを明示する
- **制約 / 品質特性** には性能、信頼性、セキュリティ、アクセシビリティ、運用、法令など後続判断に効く条件を書く
- requirement の配置先は `project.kind` に従う
  - `simple` は `.agents/requirements/` 直下
  - `monorepo` の共通 requirement は `.agents/requirements/shared/`
  - `monorepo` の subproject 固有 requirement は `.agents/requirements/<subproject>/`
- 既存 requirement、spec、ADR と重複・矛盾する内容を新規 requirement として増やさない
- requirement の変更が先、spec や実装の変更はその後に行う
- 見出しはテンプレートに従い日本語で記述する

## 確認事項

- `request_user_input` または同等の確認で目的、根拠、成功指標を確認した
- 既存 requirement との重複を確認した
- 既存 requirement、spec、ADR、validation との矛盾有無を確認した
- `project.kind` と影響範囲に応じた配置先を選んだ
- front matter と本文構成がテンプレートに従っている
- `.agents/requirements/index.md` と整合している
- 必要な spec / ADR への追従要否を確認した
