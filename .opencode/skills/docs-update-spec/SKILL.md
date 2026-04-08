---
name: docs-update-spec
description: 要件に対して詳細仕様を追加・更新・改訂するときに使用する
argument-hint: "category=<flow|state|permission|interaction|api|data> title=<title> requirement=<REQ-ID>"
---

## 目的

requirement を具体的な振る舞い、状態、エラー、入出力、互換性として spec に落とし込み、既存資料との整合を保った一貫した実装・検証基準を作る。

## 前提資料

- `docs/project/index.md` と関連資料を参照して、対象機能やフローの文脈、利用言語、責務チーム、外部依存、影響範囲を把握する
- `docs/project/glossary.md` を参照して用語、状態名、操作名、エラー名を統一する
- `docs/project/specs/index.md` を参照して索引形式を把握する
- `docs/project/patterns/index.md` があれば参照して、再利用すべき既存 pattern の有無を確認する
- `./references/spec.template.md` を参照して基本フォーマットを把握する
- `./references/best-practices.md` を参照して spec の粒度と書き方を把握する
- 関連する requirement / ADR / architecture / validation / 実装コード / テストコードを参照して現状との整合を確認する
- `docs/project/requirements/index.md` を参照して関連 requirement の位置づけと重複有無を確認する
- `docs/project/specs/index.md` のルールを参照して、現在の構成に応じた spec の配置先を確認する

## 前提知識

- spec は requirement を具体化する正本である
- 1 spec では振る舞いのまとまりを扱い、複数 requirement と接続できる
- spec を変えると実装とテストの期待も変わり得る
- spec の見出しは日本語で統一する

## やること

1. `question` で、対象 requirement、扱うカテゴリ、求める振る舞い、入出力、状態、エラー、横断ルール、互換性条件の有無を確認する
2. 現在の構成に応じて spec の配置先を決める
   - 単一構成: `docs/project/specs/` 直下に配置する
   - 複数サブプロジェクト構成かつプロジェクト共通: `docs/project/specs/shared/` に配置する
   - 複数サブプロジェクト構成かつ特定 subproject 向け: `docs/project/specs/<subproject>/` に配置する
3. 既存の `docs/project/specs/` と `docs/project/specs/index.md` を確認し、重複 spec や近い振る舞い定義を調べる
4. 関連する `docs/project/requirements/`、`docs/project/adr/`、`docs/project/validation.md`、実装コード、テストコードを確認し、既存 spec と矛盾する振る舞いや前提変更がないかを調べる
5. 重複・矛盾確認の結果を整理する
   - 同じ入出力契約、状態遷移、エラー条件を別 spec で既に扱っていないか
   - 既存 pattern で共通化済みの方針を局所 spec に再定義していないか
   - 既存 requirement の目標、対象範囲、制約 / 品質特性と衝突していないか
   - 既存 ADR、validation、実装、テストと矛盾する規約や期待動作がないか
   - 重複または矛盾がある場合は、新規追加ではなく統合、分割、改訂のどれが妥当か判断する
6. spec として独立させるべき粒度か判断する
   - 振る舞いのまとまりがあるか
   - 入出力、状態、エラー、横断ルールを独立して定義する価値があるか
   - requirement との対応が追えるか
   - 既存 spec に追記した方が自然ではないか
7. 次の ID を決め、`SPEC-<CATEGORY>-<NNN>` 形式で採番する
8. フォーマットに従って spec を追加または更新する
   - 配置先は手順 2 で決めたディレクトリを使う
   - 必要なディレクトリがなければ作成する
9. `docs/project/specs/index.md` に索引を追加または更新する
10. spec 変更後に、関連する実装コードとテストコードを見直し、必要な修正を行う
11. spec の中で再利用価値がある設計・振る舞い・契約が見つかった場合は、`docs-update-patterns` を使って pattern 化要否を確認し、必要なら追加または更新する
12. spec 変更が validation や architecture、ADR に波及する場合は対応するスキルを使って更新する
13. 重複・矛盾確認の結果に応じて、関連 requirement / pattern / spec / ADR / validation / 実装 / テストの追従更新要否を確認する

## ルール

- spec は requirement に接続できる状態で書く
- **挙動** は利用者や外部観測点から見える振る舞いを書く
- **入力** と **出力** は型、必須性、制約、既定値、観測条件が分かるように書く
- **状態遷移 / 不変条件** と **エラー / 例外** は省略せず、存在しないならその旨を明示する
- **横断ルール** には認可、監査、性能、冪等性、ページング、非同期処理、互換性など共通条件を書く
- spec の配置先は現在の構成に従う
  - 単一構成は `docs/project/specs/` 直下
  - 複数サブプロジェクト構成の共通 spec は `docs/project/specs/shared/`
  - 複数サブプロジェクト構成の subproject 固有 spec は `docs/project/specs/<subproject>/`
- 複数の spec や実装で再利用する前提があるなら、局所記述だけで済ませず pattern 化を検討する
- 既存 spec、requirement、ADR、validation と重複・矛盾する内容を新規 spec として増やさない
- spec 変更を実装・テストの見直しなしで終わらせない
- 詳細なテスト手順は validation に委譲し、spec には検証観点を残す
- 見出しはテンプレートに従い日本語で記述する

## 確認事項

- `question` または同等の確認で対象 requirement、カテゴリ、主要な入出力と振る舞いを確認した
- 既存 spec との重複を確認した
- 既存 requirement、pattern、ADR、validation、実装、テストとの矛盾有無を確認した
- 共通化できる pattern 候補の有無を確認した
- 構成と影響範囲に応じた配置先を選んだ
- front matter と本文構成がテンプレートに従っている
- `docs/project/specs/index.md` と整合している
- 実装 / テスト / validation / architecture / ADR への追従要否を確認した
