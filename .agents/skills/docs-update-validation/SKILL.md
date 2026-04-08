---
name: docs-update-validation
description: プロジェクトの品質担保のための検証事項を追加・更新・改訂するときに使用する
argument-hint: "check=<確認項目> trigger=<変更理由>"
---

## 目的

品質保証と検証の期待を明文化し、変更時に必要なテストコード更新と関連資料更新を漏れなく実行する。

## 前提資料

- `docs/project/index.md` と関連資料を参照して、検証対象の文脈、利用言語、責務チーム、外部依存、影響範囲を把握する
- `docs/project/glossary.md` を参照して品質項目、検証用語、命名を統一する
- `docs/project/validation.md` を参照して既存の確認項目と粒度を把握する
- `./references/best-practices.md` を参照して validation 更新時の追従ルールを把握する
- `./references/shared-check-candidates.md` を参照してプロダクト種別にかかわらず共有して検証すべき候補項目を把握する
- `./references/validation.example.md` を参照して基本フォーマットを把握する
- 関連する architecture / spec / 実装コード / テストコード / ADR / tech-stack を参照して現状との整合を確認する

## 前提知識

- validation は何をいつどう検証するかの正本である
- validation を変えると、対応するテストコードも変えなければ整合しない
- 検証観点の変更は architecture、ADR、技術スタックに波及することがある

## やること

1. `./references/shared-check-candidates.md` をもとに、共通で検証候補にすべき項目を抽出する
2. `request_user_input` で、変更理由、影響範囲、候補項目ごとに「採用するか」「何で検証するか」を確認する
3. 候補項目ごとに validation に書くべき内容か判断する
   - いつ行うか
   - 何で検証するか
   - 求める結果
   - 問題があった際にどうするか
4. フォーマットに従って `docs/project/validation.md` を追加または更新する
5. validation 変更後に、関連するテストコードをすべて変更する
6. validation 変更後に、対応する spec と実装コードへの影響を見直す
7. 検証方針の根拠変更がある場合は `docs-update-adr` を使って ADR を作成または更新する
8. 検証基盤や採用ツールに変更が及ぶ場合は `docs-update-tech-stack` も更新する

## ルール

- validation を変更する場合はテストコードをすべて変更する
- 共通候補を確認せずに自由に項目を増やしすぎない
- 文書上の検証項目と実際のテスト手段を乖離させない
- architecture と矛盾する検証方針を書かない
- 変更理由が重要判断なら ADR に残す

## 確認事項

- `request_user_input` または同等の確認で変更理由、対象範囲、候補項目ごとの検証手段を確認した
- `docs/project/validation.md` の確認項目が更新されている
- 関連するテストコードをすべて変更した
- spec / 実装コード / ADR / tech-stack の更新要否も確認した
