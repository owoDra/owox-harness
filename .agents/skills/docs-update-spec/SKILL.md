---
name: docs-update-spec
description: ハーネス用の spec を追加・更新・改訂するときに使用する
argument-hint: "category=<flow|state|permission|interaction> title=<title> requirement=<REQ-ID>"
---

## 目的

requirement を具体的な振る舞い、状態、エラー、入出力として spec に落とし込み、一貫した実装・検証基準を作る。

## 前提資料

- `.agents/project.yaml` を読み以下を把握する
  - `project.name`: spec が属するプロジェクト名
  - `project.description`: 対象機能やフローの文脈
  - `project.kind`: `simple` か `monorepo` か
  - `project.lang`: spec 本文で使う言語
  - `project.teams`: spec の責務チーム
  - `project.integrations`: 外部依存を含む spec かどうか
  - `project.subprojects`: モノレポ時の影響範囲
- `.agents/glossary.md` を参照して用語、状態名、操作名、エラー名を統一する
- `.agents/specs/index.md` を参照して索引形式を把握する
- `./references/spec.template.md` を参照して基本フォーマットを把握する
- `./references/best-practices.md` を参照して spec の粒度と書き方を把握する
- 関連する requirement / ADR / architecture / validation / 実装コード / テストコードを参照して現状との整合を確認する

## 前提知識

- spec は requirement を具体化する正本である
- 1 spec では振る舞いのまとまりを扱い、複数 requirement と接続できる
- spec を変えると実装とテストの期待も変わり得る

## やること

1. `request_user_input` で、対象 requirement、扱うカテゴリ、求める振る舞い、状態、エラー、規約の有無を確認する
2. 既存の `.agents/specs/` と `.agents/specs/index.md` を確認し、重複 spec や近い振る舞い定義を調べる
3. spec として独立させるべき粒度か判断する
   - 振る舞いのまとまりがあるか
   - 状態やエラーを独立して定義する価値があるか
   - requirement との対応が追えるか
4. 次の ID を決め、`SPEC-<CATEGORY>-<NNN>` 形式で採番する
5. フォーマットに従って spec を追加または更新する
6. `.agents/specs/index.md` に索引を追加または更新する
7. spec 変更後に、関連する実装コードとテストコードを見直し、必要な修正を行う
8. spec 変更が validation や architecture、ADR に波及する場合は対応するスキルを使って更新する

## ルール

- spec は requirement に接続できる状態で書く
- **挙動** は利用者や外部観測点から見える振る舞いを書く
- **状態管理** と **エラー** は省略せず、存在しないならその旨を明示する
- spec 変更を実装・テストの見直しなしで終わらせない

## 確認事項

- `request_user_input` または同等の確認で対象 requirement とカテゴリを確認した
- 既存 spec との重複を確認した
- front matter と本文構成がテンプレートに従っている
- `.agents/specs/index.md` と整合している
- 実装 / テスト / validation / architecture / ADR への追従要否を確認した
