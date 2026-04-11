---
name: docs-update-spec
description: 要件に対する詳細仕様を追加、更新、改訂するときに使用する
argument-hint: "category=<flow|state|permission|interaction|api|data> title=<title> requirement=<REQ-ID>"
---

## 目的

requirement を具体的な振る舞い、状態、入出力、エラー、横断ルールとして spec に落とし込む。

## 前提資料

- `docs/project/README.md`
- `docs/project/glossary/core.md`
- `docs/project/specs/README.md`
- `docs/project/specs/shared/README.md`
- `.agents/skills/docs-update-spec/references/spec.template.md`
- `.agents/skills/docs-update-spec/references/best-practices.md`
- 関連 requirement / ADR / validation / pattern / architecture

## やること

1. 必要なら `request_user_input` で対象 requirement、主要な入出力、状態、エラー、横断ルールを確認する
2. 共有仕様か subproject 固有仕様かを判断する
3. 既存 spec と重複、矛盾がないか調べる
4. `shared/` または `<subproject>/` に `SPEC-<category>-<short-title>.md` を作成または更新する
5. spec 変更に伴う code / test / validation / ADR 影響を確認する

## ルール

- spec は requirement に接続できる状態で書く
- 挙動は外部観測点から見える振る舞いとして書く
- 状態遷移、不変条件、エラー条件を省略しない
- 共通化できる内容は pattern 化を検討する

## 確認事項

- 関連 requirement が明確である
- 配置先が shared か subproject か妥当である
- code / test / validation 影響を確認した