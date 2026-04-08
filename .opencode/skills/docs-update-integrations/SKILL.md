---
name: docs-update-integrations
description: プロジェクトで利用する外部API・サービス資料を追加・更新・正規化するときに使用する
argument-hint: "integration=<name> kind=<api|service|platform|tool> owner=<team>"
---

## 目的

プロジェクトが依存する外部 API・サービス・プラットフォームの役割、接続境界、制約、運用上の注意点を正本として整理する。

## 前提資料

- `docs/project/index.md` と関連資料を参照して、外部依存が使われる文脈、利用言語、担当チーム、既存 integration、影響範囲を把握する
- `docs/project/glossary.md` を参照して integration 名、接続用語、責務名を統一する
- `docs/project/integrations/index.md` を参照して索引形式を把握する
- `./references/integration.example.md` を参照して基本フォーマットを把握する
- `./references/best-practices.md` を参照して integration 資料の粒度と記載方針を把握する
- 関連する requirement / spec / ADR / architecture / validation / tech-stack / 実装コードを参照して接続境界と制約を確認する

## 前提知識

- integration 資料は、外部依存の役割と接続境界の正本である
- 認証方式、失敗時の扱い、レート制限、責務チームなどの運用に効く情報を優先して残す
- 機密値そのものは書かず、どこで管理するかだけを書く
- 新規 integration を追加した場合は `harness-update-project-yaml` の更新要否も確認する

## やること

1. `question` で、対象 integration 名、役割、接続目的、担当チーム、影響サブプロジェクト、認証の有無、運用上の制約を確認する
2. 既存の `docs/project/integrations/` と `docs/project/integrations/index.md` を確認し、同じ integration の個票や類似資料がないか調べる
3. integration として独立管理すべき粒度か判断する
   - 外部 API・サービスとして継続利用するか
   - 認証、制限、障害時対応など固有の運用知識があるか
   - requirement / spec / validation にまたがって参照されるか
4. `kebab-case` のファイル名を決めて `docs/project/integrations/<integration>.md` を追加または更新する
5. フォーマットに従って `<integration>.md` を作成または更新
6. `docs/project/integrations/index.md` に索引を追加または更新する
7. 新規 integration を追加した場合は `harness-update-project-yaml` を使って `project.integrations` を更新する
8. integration の追加・変更に伴って requirement / spec / validation の更新が必要なら対応するスキルで更新する
9. 重要な設計判断や制約変更を含む場合は `docs-update-adr` を使って ADR を作成または更新する
10. 採用サービスや SDK の記録が必要なら `docs-update-tech-stack` も更新する

## ルール

- 機密値、トークン、秘密鍵そのものを書かない
- 外部依存の役割と接続境界を先に書き、実装断片の羅列にしない
- レート制限、SLA、認証、障害時の扱いなど運用に効く事項を省略しない
- 一時的な検証接続は常設 integration 資料にしない

## 確認事項

- `question` または同等の確認で integration の役割と責務チームを確認した
- 既存 integration 資料との重複を確認した
- 新規 integration の場合は `harness-update-project-yaml` の更新要否も確認した
- `docs/project/integrations/index.md` と整合している
- requirement / spec / validation / ADR / tech-stack への追従要否を確認した
