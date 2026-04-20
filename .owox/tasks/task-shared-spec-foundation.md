# Task

## 目的

`requirements`、`architecture`、`integrations` から参照できる共有仕様を追加し、`owox-harness` v2 の共通契約を資料として明文化する。

## 状態

completed

## 依頼内容

- 続けて資料整理を進める
- requirements と integrations を起点にハーネス全体の資料導線を強める

## 確定前提

- 進め方は `対話`
- `docs/project/requirements/REQ-harness-v2-foundation.md` を上位要求として扱う
- `docs/project/integrations/ai-coding-clis.md` を adapter 共通方針の上位資料として扱う
- 追加する仕様は `docs/project/specs/shared/` に置く

## 未確定事項

- なし

## 対象範囲

- `docs/project/specs/shared/`
- `docs/project/specs/index.md`
- `docs/project/specs/shared/index.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/architecture.md`
- `docs/project/integrations/ai-coding-clis.md`
- `docs/project/validation.md`

## 対象外

- 実装コード
- ADR の追加
- CLI 個票の大幅改訂

## 守るべき不変条件

- requirement と spec の責務を混同しない
- 複数 subproject にまたがる内容だけを `shared/` に置く
- visible documents は日本語で記述する

## 参照する正本

- `docs/project/index.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/integrations/ai-coding-clis.md`
- `docs/project/architecture.md`
- `docs/project/validation.md`
- `docs/project/specs/shared/index.md`

## 今回読まなくてよい資料

- proposal / adr archive

## 実施方針

- 共通 workflow 契約と adapter 契約を仕様として分離して書く
- 上位資料から共有仕様へ降りる参照導線を追加する
- validation と requirement の関連を明示する

## 実施手順

1. 要求と連携方針から仕様化すべき共通契約を抽出する
2. `specs/shared/` に共有仕様を追加する
3. 関連する requirements / architecture / integrations / validation から参照を追加する
4. ハーネス検証を実行する

## 検証項目

- `shared/` の新規仕様が index から参照できる
- requirement / integration / architecture から仕様へ辿れる
- 検証スクリプトが通る

## 完了条件

- 共有仕様が追加されている
- 関連資料の参照導線が更新されている
- 検証結果が task に記録されている

## 進捗記録

- 2026-04-17: 継続作業として、共有仕様の不足箇所を整理し、workflow 契約と adapter 契約を仕様化する方針を決めた。
- 2026-04-17: `docs/project/specs/shared/` に workflow 共通契約と adapter 共通契約を追加し、requirements / architecture / integrations / validation からの参照導線を更新した。
- 2026-04-17: 当時のハーネス検証スクリプトを実行し、整合性検証を完了した。

## 次に読むもの

- `docs/project/specs/shared/index.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/integrations/ai-coding-clis.md`
