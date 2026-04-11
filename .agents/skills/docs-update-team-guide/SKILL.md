---
name: docs-update-team-guide
description: チーム別の役割、担当範囲、ルール、固有知識を追加、更新、正規化するときに使用する
argument-hint: "team=<team> role=<役割> scope=<担当範囲>"
---

## 目的

各チームの役割、担当範囲、ルール、固有知識を一貫した形で記録し、チーム境界の曖昧さを減らす。

## 前提資料

- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/teams/index.md`
- `.agents/skills/docs-update-team-guide/references/team-guide.template.md`
- `.agents/skills/docs-update-team-guide/references/best-practices.md`
- 関連 requirement / spec / ADR / architecture / validation

## やること

1. 必要なら `request_user_input` で対象 team、役割、担当範囲、固有ルール、固有知識を確認する
2. 既存 guide と関連資料を確認し、名称と責務境界をそろえる
3. `<team>-guide.md` を作成または更新する
4. 新規 team の場合は `.agents/project.md` 更新要否を確認する

## ルール

- 全チーム共通の不変条件は team guide に書かない
- 一時的な作業メモではなく、継続的に守る内容を書く
- 他チームとの境界は曖昧語でぼかさない

## 確認事項

- 役割、担当範囲、ルール、固有知識が分かれている
- `.agents/project.md` 更新要否を確認した
- architecture との境界が崩れていない