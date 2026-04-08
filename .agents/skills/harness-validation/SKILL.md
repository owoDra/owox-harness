---
name: harness-validation
description: ハーネスとプロジェクト資料の一貫性・整合性・配置ルール順守を確認するときに使用する
argument-hint: "scope=<all|requirements|specs|patterns|adr|tasks|skills> mode=<agent-led|collab-led>"
---

## 目的

`.agents/` 配下のハーネス資料と `docs/project/` 配下のプロジェクト資料について、存在、配置、命名、索引、相互参照、責務分離、project 設定との整合を確認し、不整合を後続で修正できる状態に整理する。

## 前提資料

- `.agents/project.yaml` があれば読み、`project.kind`、`project.teams`、`project.integrations`、`project.subprojects` を把握する
- `docs/project/glossary.md` を参照して用語と命名の正本を把握する
- `docs/project/architecture.md` があれば参照して普遍ルールを把握する
- `docs/project/requirements/index.md`、`docs/project/specs/index.md`、`docs/project/patterns/index.md`、`docs/project/adr/index.md`、`docs/project/integrations/index.md`、`docs/project/teams/index.md` を参照して索引と配置ルールを把握する
- `docs/project/validation.md`、`docs/project/tech-stack.md`、`.agents/skills/` のうち対象範囲に関係する資料を参照する
- `./references/best-practices.md` を参照して確認観点と結果整理の粒度を把握する

## 前提知識

- harness-validation は修正そのものではなく、不整合の検出と整理を主目的とする
- 正本同士の矛盾を見つけた場合は、どちらが正しいかを決め打ちせず、差分として記録する
- `project.kind` が `monorepo` の場合は `shared/` と `<subproject>/` の使い分け確認が必須になる
- スキル、資料、索引、task 記録は別責務だが、相互参照が成立して初めて整合していると言える

## やること

1. `request_user_input` または同等の確認で、`scope`、実施目的、確認対象外、完了条件を確認する
2. 確認対象の正本を収集し、資料種別ごとに存在有無を確認する
3. 配置ルールを確認する
   - `simple` は直下配置になっているか
   - `monorepo` は `shared/` と `<subproject>/` を適切に使い分けているか
4. 索引と実体の整合を確認する
   - `index.md` に記載された参照先が存在するか
   - 未索引の正本ファイルや実体のない参照がないか
5. 命名規則と ID 規則を確認する
   - requirement、spec、pattern、skill の命名がルールに従うか
   - glossary と不一致な用語や表記ゆれがないか
6. front matter とメタデータ整合を確認する
   - 必須項目の欠落がないか
   - `related_*`、owner、subproject、team、integration の参照先が実在するか
7. 相互参照整合を確認する
   - requirement、spec、ADR、validation、pattern、skill 間の参照が孤立していないか
   - 逆方向の追跡が必要な資料で欠落がないか
8. 責務分離、重複、矛盾を確認する
   - requirement に実装詳細、spec に要求背景、ADR に手順詳細が混入していないか
   - 同じ目標、契約、判断、ルールが重複定義されていないか
9. `project.yaml`、team、integration、subproject との整合を確認する
10. 結果を以下の形で整理する
   - 確認した範囲
   - 問題なし
   - 不整合
   - 判断保留
   - 修正が必要な正本
   - 推奨する次タスク種別

## ルール

- 事実、推測、提案を分けて記録する
- 不整合を見つけても、このスキル内で無断修正しない
- 配置ルール確認では `project.kind` を必ず起点にする
- 参照の欠落と、意図的に未整備であることを区別して記録する
- スコープ外の不整合を見つけた場合も、参考情報として分けて記録する
- 既存スキルが参照するパスやルールの古さも確認対象に含める

## 確認事項

- `scope` と完了条件を確認した
- 必須資料の存在確認を行った
- 配置ルール、索引、命名、front matter、相互参照、責務分離を確認した
- `project.yaml` とハーネス資料 /プロジェクト資料の整合を確認した
- 不整合を修正案と分けて整理した
- 推奨する次タスク種別まで整理した
- `AGENTS.md` が `.agents/` と `docs/project/` の境界を明示している
- `.agents/project.yaml` が存在し、最小情報を保持している
- `docs/project/index.md` と主要カテゴリが存在する
- skills がプロジェクト資料を `docs/project/` から参照している
