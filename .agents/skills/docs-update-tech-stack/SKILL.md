---
name: docs-update-tech-stack
description: 採用技術とバージョン方針を追加、更新、正規化するときに使用する
argument-hint: "category=<技術名> stack=<採用スタック> version=<バージョン> adr=<ADR参照>"
---

## 目的

技術スタックの採用状況を役割単位で見返しやすく整理し、各採用判断を ADR と結び付ける。

## 前提資料

- `docs/project/README.md`
- `docs/project/glossary/core.md`
- `docs/project/tech-stack.md`
- `.agents/skills/docs-update-tech-stack/references/best-practices.md`
- 関連 ADR / architecture / requirement / spec / validation

## やること

1. 必要なら `request_user_input` で更新対象、採用スタック、バージョン、対象範囲を確認する
2. 既存表と重複や表記揺れがないか調べる
3. `docs/project/tech-stack.md` を更新する
4. 採用判断に対応する ADR の有無を確認する

## ルール

- 技術名は役割を書く
- 採用スタックは具体的な製品名やライブラリ名を書く
- バージョン粒度を表内でそろえる
- ADR 参照なしの採用判断を残さない

## 確認事項

- 更新対象と対象範囲が明確である
- ADR 参照の有無を確認した
- 表の粒度がそろっている