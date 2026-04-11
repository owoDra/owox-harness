---
name: docs-update-integrations
description: 外部 API やサービスの資料を追加、更新、正規化するときに使用する
argument-hint: "integration=<name> kind=<api|service|platform|tool> owner=<team>"
---

## 目的

外部依存の役割、接続境界、制約、運用上の注意点を正本として整理する。

## 前提資料

- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/integrations/index.md`
- `.agents/skills/docs-update-integrations/references/integration.template.md`
- `.agents/skills/docs-update-integrations/references/best-practices.md`
- 関連 requirement / spec / ADR / architecture / validation / tech-stack

## やること

1. 必要なら `request_user_input` で integration 名、役割、担当チーム、制約を確認する
2. 既存 integration 資料と重複がないか調べる
3. `<integration>.md` を作成または更新する
4. 新規 integration の場合は `.agents/project.md` 更新要否を確認する
5. requirement / spec / validation / ADR / tech-stack 影響を確認する

## ルール

- 機密値そのものは書かない
- 役割と接続境界を先に書く
- 認証、制約、障害時の扱いを省略しない

## 確認事項

- 役割と担当チームが明確である
- 制約と障害時の扱いが記録されている
- `.agents/project.md` 更新要否を確認した