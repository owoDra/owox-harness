---
name: docs-update-patterns
description: プロジェクトで共通する実装や設計・UI/UXのパターンを追加・更新・改訂するときに使用する
argument-hint: "category=<impl|data|ui|ux|api|test|ops|architecture> title=<title> team=<owner-team>"
---

## 目的

複数の spec や実装で再利用すべきコード実装、データ構造・設計、UI/UX 設計の共通パターンを pattern として整理し、プロジェクト全体の一貫性を保つ。

## 前提資料

- `docs/project/index.md` と関連資料を参照して、対象ドメイン、利用言語、責任チーム、外部依存、影響範囲を把握する
- `docs/project/glossary.md` を参照して用語、命名、カテゴリ名を統一する
- `docs/project/patterns/index.md` を参照して既存 pattern を把握する
- `./references/pattern.template.md` を参照して基本フォーマットを把握する
- `./references/best-practices.md` を参照して pattern の粒度と書き方を把握する
- 関連する requirement / spec / ADR / architecture / validation / 実装コード / テストコードを参照して背景と制約を確認する

## 前提知識

- pattern は requirement、spec、ADR を置き換えるものではなく、それらを横断して一貫性を与える正本である
- 1 pattern = 1 file を守る
- 繰り返し使う価値があるものだけを pattern として残す
- pattern の見出しは日本語で統一する
- pattern のファイル名はカテゴリ別プレフィックス付きで命名する
  - `impl-`, `data-`, `ui-`, `ux-`, `api-`, `test-`, `ops-`

## やること

1. `request_user_input` で、pattern の目的、適用範囲、適用したい文脈、避けたい重複、責任チーム、非目標を確認する
2. 既存の `docs/project/patterns/` と `docs/project/patterns/index.md` を確認し、重複 pattern や近い共通化方針を調べる
3. 関連する `docs/project/requirements/`、`docs/project/specs/`、`docs/project/adr/`、`docs/project/validation.md`、実装コード、テストコードを確認し、既存 pattern と矛盾する方針がないかを調べる
4. pattern として独立させるべき粒度か判断する
   - 複数の spec や実装で再利用する見込みがあるか
   - 特定機能固有ではなく、横断的な判断基準として残す価値があるか
   - requirement や spec に閉じた内容ではないか
   - コード実装、データ構造・設計、UI/UX 設計のどのカテゴリに属するかを明確にできるか
5. 重複・矛盾確認の結果を整理する
   - 同じ問題を既存 pattern で既に扱っていないか
   - 既存 requirement、spec、ADR と衝突していないか
   - 重複または矛盾がある場合は、新規追加ではなく統合、分割、改訂のどれが妥当か判断する
6. 次の ID を決め、`PAT-<CATEGORY>-<NNN>` 形式で採番する
7. カテゴリに対応するプレフィックスを決め、`<prefix><slug>.md` 形式でファイル名を決める
8. フォーマットに従って pattern を追加または更新する
9. `docs/project/patterns/index.md` に索引を追加または更新する
10. pattern 追加・変更に伴って spec、implementation、review、validation、ADR の追従更新要否を確認する

## ルール

- pattern には再利用したいコード実装、データ構造・設計、UI/UX 設計方針、適用条件、例外条件、関連正本を書く
- 単発の作業メモや特定機能だけのローカル都合を pattern にしない
- pattern だけで requirement や spec の詳細を代替しない
- 既存 pattern、spec、ADR と重複・矛盾する内容を新規 pattern として増やさない
- ファイル名はカテゴリ別プレフィックス規則に従う
- 見出しはテンプレートに従い日本語で記述する

## 確認事項

- `request_user_input` または同等の確認で目的、適用範囲、非目標を確認した
- 既存 pattern との重複を確認した
- 既存 requirement、spec、ADR、validation、実装との矛盾有無を確認した
- カテゴリとファイル名プレフィックスが規則に従っている
- front matter と本文構成がテンプレートに従っている
- `docs/project/patterns/index.md` と整合している
- 関連する spec / implementation / review / validation / ADR への追従要否を確認した
