---
name: docs-update-team-guide
description: プロジェクトのチーム別ごとのルールや方針を追加・更新・正規化するときに使用する
argument-hint: "team=<team> role=<役割> scope=<担当範囲>"
---

## 目的

各チームの役割、担当範囲、ルール、固有知識を一貫した形で記録し、チーム境界の曖昧さを減らす。

## 前提資料

- `docs/project/index.md` と関連資料を参照して、対象ドメイン、利用言語、既存チーム、外部依存、影響範囲を把握する
- `docs/project/glossary.md` を参照してチーム名、責務名、用語を統一する
- `./references/best-practices.md` を参照して guide の粒度と書き方を把握する
- `./references/team-guide.example.md` を参照して基本フォーマットを把握する
- `docs/project/teams/index.md` と既存の `docs/project/teams/*` を参照して命名規則と責務境界を確認する
- 関連する requirement / spec / ADR / architecture / validation を参照して、そのチームに関係する責務を確認する

## 前提知識

- Team Guide はチーム固有の作法と観点の正本であり、共通不変条件は architecture に書く
- 1 ガイドは 1 チームを対象にする
- 役割、担当範囲、ルール、知識は分けて書く
- 新規チームを追加した場合は `harness-update-project-yaml` の更新要否も確認する

## やること

1. `request_user_input` で、対象チーム、期待する役割、担当範囲、固有ルール、固有知識の有無を確認する
2. 既存 guide と関連資料を確認し、対象チーム名と責務の表記を正規化する
3. フォーマットに従って `docs/project/teams/<team>-guide.md` を追加または更新する
4. 役割には、そのチームが最終責任を持つ成果や判断を書く
5. 担当範囲には、どこまでやるかとどこから他チームへ渡すかを書く
6. ルールには、そのチームが守る作法、レビュー観点、禁止事項を書く
7. 知識には、そのチームだけが優先的に把握すべき前提、外部依存、運用知識を書く
8. `docs/project/teams/index.md` に対象チームの索引を追加または更新する
9. 新規チームを追加した場合は `harness-update-project-yaml` を使って `project.teams` を更新する

## ルール

- チーム共通ルールを Team Guide に重複記載しすぎない
- チーム名は既存の team guide と関連資料の名称に合わせる
- 他チームとの境界は曖昧語ではなく担当範囲として明示する
- 一時的な作業メモではなく、継続的に守るべき内容を書く

## 確認事項

- `request_user_input` または同等の確認で対象チームと責務を確認した
- 既存の team guide と guide の記述が矛盾していない
- 新規チームの場合は `harness-update-project-yaml` の更新要否も確認した
- 役割 / どこまで担当するか / ルール / 知識 が埋まっている
- `docs/project/teams/index.md` と整合している
