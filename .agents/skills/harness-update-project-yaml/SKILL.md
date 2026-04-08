---
name: harness-update-project-yaml
description: ハーネス用の project.yaml を追加・更新・正規化するときに使用する
argument-hint: "field=<name|description|kind|teams|integrations|subprojects> change=<内容>"
---

## 目的

ハーネスが参照する最小の `project.yaml` を、既存のプロジェクト資料と整合する形で一貫して保守する。

## 前提資料

- `.agents/project.yaml` を参照して既存の最小プロジェクト定義を把握する
- `docs/project/glossary.md` を参照してチーム名、integration 名、サブプロジェクト名の命名を統一する
- `./references/project.example.yaml` を参照して `project.yaml` の基本フォーマットを把握する
- `./references/best-practices.md` を参照して更新方針を把握する
- 関連する `docs/project/teams/`、`docs/project/integrations/`、`docs/project/tech-stack.md`、`docs/project/architecture.md` を参照して整合性を確認する

## 前提知識

- `project.yaml` はハーネスが参照する最小情報の正本である
- 新しい team や integration をプロジェクト資料に追加したら、`project.yaml` も更新しなければ整合しない
- 名前だけを足すのではなく、役割が読める説明を保つ

## やること

1. `request_user_input` で、更新したい項目、変更理由、追加・削除・改名の別を確認する
2. 既存の `project.yaml` と関連するプロジェクト資料を確認し、差分が必要か判断する
3. `project.yaml` を更新する
   - `project.name`
   - `project.description`
   - `project.kind`
   - `project.lang`
   - `project.teams`
   - `project.integrations`
   - `project.subprojects`
4. 新規 team を追加した場合は、対応する Team Guide の存在を確認し、必要なら `docs-update-team-guide` で追加する
5. 新規 integration を追加した場合は、対応する integration 資料の存在を確認し、必要なら `docs-update-integrations` で追加する
6. `project.kind` や `subprojects` の変更がある場合は、tech-stack、ADR、requirements、specs の配置や対象範囲に影響がないか確認する

## ルール

- `project.yaml` の項目名は固定し、独自キーを勝手に増やさない
- team と integration は名称だけでなく役割説明も更新する
- 他の正本資料と食い違う状態で放置しない

## 確認事項

- `request_user_input` または同等の確認で更新対象と変更理由を確認した
- `project.yaml` と team / integration / subproject のプロジェクト資料が整合している
- 影響範囲がある場合は関連資料の更新要否を確認した
