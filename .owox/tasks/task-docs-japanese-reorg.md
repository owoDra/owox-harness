# Task

## 目的

`owox-harness` の visible documents を日本語基準へ統一し、既存の requirement / integration / architecture / validation を起点にハーネス全体の資料導線を整理する。

## 状態

completed

## 依頼内容

- このプロジェクトではすべて日本語を使う
- 既存の requirements や integrations などを読み込んだうえで、ハーネス全体の資料を整理する

## 確定前提

- visible language は日本語へ変更する
- hidden context や内部キーは英語を基本とする前提は維持する
- 進め方は `対話` で進める
- 既存の `requirements/REQ-harness-v2-foundation.md` と `integrations/ai-coding-clis.md` を基準資料として扱う

## 未確定事項

- なし

## 対象範囲

- `.owox/project.md`
- `README.md`
- `docs/project/index.md`
- `docs/project/architecture.md`
- `docs/project/validation.md`
- `docs/project/requirements/`
- `docs/project/specs/`
- `docs/project/integrations/`
- `docs/project/glossary/`
- `docs/project/research/`
- `docs/project/proposals/`
- `docs/project/adr/`
- `docs/project/patterns/`
- `docs/project/teams/`

## 対象外

- 実装コードの追加や変更
- 正本ではない運用メモの作成
- archive 配下の個票追加

## 守るべき不変条件

- `docs/project/` には正本だけを書く
- 要求、仕様、判断、検証、外部連携の責務境界を崩さない
- visible documents は日本語、内部表現は英語基準という原則を崩さない

## 参照する正本

- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/integrations/ai-coding-clis.md`
- `docs/project/architecture.md`
- `docs/project/validation.md`
- `docs/project/tech-stack.md`

## 今回読まなくてよい資料

- proposal / adr の archive 個票

## 実施方針

- まず日本語化の対象と資料導線の不整合を洗い出す
- requirement / integration / architecture / validation を起点に入口文書を再編する
- 既存の責務分離を維持したまま、各 index と入口説明を整理する

## 実施手順

1. 基準資料を読み、資料構造の問題点と日本語化対象を整理する
2. `.owox/project.md` と `README.md` を日本語基準へ更新する
3. `docs/project/` の index 群と主要個票を日本語化し、参照導線を整理する
4. 追加・更新した入口が整合しているか検証する

## 検証項目

- visible documents の主要見出しと説明が日本語になっている
- `docs/project/index.md` から主要正本へ迷わず辿れる
- requirements / integrations / architecture / validation の相互参照が崩れていない
- ハーネス検証スクリプトが通る

## 完了条件

- `.owox/project.md` の visible language が日本語に更新されている
- 主要入口文書と主要個票の visible prose が日本語にそろっている
- ハーネス全体の資料導線が整理されている
- 検証結果を task に記録している

## 進捗記録

- 2026-04-17: 依頼を受け、`requirements`、`integrations`、`architecture`、`validation`、各 index の現状確認を開始した。
- 2026-04-17: `.owox/project.md`、`README.md`、`docs/project/` の主要入口と基準個票を日本語基準へ更新し、`requirements` と `integrations` を起点にした参照順を整理した。
- 2026-04-17: 当時のハーネス検証スクリプトを実行し、整合性検証を完了した。

## 次に読むもの

- `docs/project/index.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/integrations/ai-coding-clis.md`
