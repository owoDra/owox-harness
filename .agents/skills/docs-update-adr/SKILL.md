---
name: docs-update-adr
description: 技術決定など行った際の記録を追加・更新・改訂するときに使用する
argument-hint: "decision=<判断内容> scope=<対象範囲> status=<proposed|accepted|rejected|deprecated|superseded>"
---

## 目的

重要な判断とその理由を、後から追跡できる形で一貫して記録する。

## 前提資料

- `.agents/project.yaml` を読み以下を把握する
  - `project.name`: ADR が属するプロジェクト名
  - `project.description`: 判断対象の文脈
  - `project.kind`: `simple` か `monorepo` か
  - `project.lang`: ADR 本文で使う言語
  - `project.teams`: 判断の責務主体となるチーム
  - `project.integrations`: 外部依存に関する判断かどうか
  - `project.subprojects`: モノレポ時にどのサブプロジェクト配下へ配置すべきか
- `.agents/glossary.md` を参照して用語、命名、判断対象の表記を統一する
- `./references/adr.template.md` を参照して ADR の基本フォーマットを把握する
- `./references/best-practices.md` を参照して ADR に残すべき判断と書き方を把握する
- `.agents/adr/index.md` を参照して既存の採番規則と索引形式を把握する
- 関連する requirement / spec / 既存 ADR を参照して判断の背景と影響範囲を確認する

## 前提知識

- ADR は「重要で持続的な判断」を残すための資料であり、単なる作業ログではない
- 1 ADR には 1 つの判断を記録する
- 既存判断の改訂は、上書きではなく新しい ADR と状態更新で表すほうが追跡しやすい

## やること

1. `request_user_input` で、判断内容、背景、候補案、決定状態、関連 requirement / spec を確認する
2. 既存の `.agents/adr/` と `.agents/adr/index.md` を調べ、同じ判断が既に記録されていないか確認する
3. ADR にする価値があるかを判断する
   - 設計・実装・運用に継続的な影響がある
   - 代替案やトレードオフがある
   - 将来「なぜそうしたか」を説明する必要がある
4. 既存 ADR の改訂である場合は、どの ADR を supersede / deprecate するか決める
5. `project.kind` を確認し、配置先を決める
   - `simple`: `.agents/adr/`
   - `monorepo`: `.agents/adr/<subproject>/`
   - `monorepo` の場合は `project.subprojects` から対象サブプロジェクトを選び、共通判断なら `.agents/adr/` 直下に置くかを確認する
6. 配置先ディレクトリ内で次の連番 ID を採番し、`ADR-<NNN>-<short-title>.md` 形式のファイル名を決める
   - `monorepo` ではサブプロジェクト配下の ADR 群を基準に採番する
   - index の表記でサブプロジェクトが識別できるようにする
7. テンプレートに沿って ADR を作成または更新する
   - front matter: `id`, `title`, `status`, `scope`, `tags`, 関連資料
   - **経緯**: 何が問題で、どの制約があるか
   - **判断基準**: 採用する方針と採用理由
   - **代替案**: 検討した主な代替案と不採用理由
   - **結論**: 得るもの、失うもの、必要な追従作業
8. `.agents/adr/index.md` に索引を追加または更新する
   - `monorepo` の場合は対象サブプロジェクトがわかる概要または参照パスにする
9. 既存 ADR を supersede する場合は、旧 ADR の status や参照関係も更新する

## ルール

- 1 ADR = 1 重要判断を守る
- 判断内容だけでなく、捨てた案と理由も残す
- 時系列の議事録ではなく、意思決定の要約にする
- status は事実に合わせて書く
- requirement / spec と接続できる情報は front matter に残す

## 確認事項

- `request_user_input` または同等の確認で判断の対象と背景を確認した
- 既存 ADR との重複や改訂関係を確認した
- `simple` / `monorepo` に応じた配置先を確認した
- 採番と index 更新が整合している
- 経緯 / 判断基準 / 代替案 / 結論 が埋まっている
- 読み手が「何を決め、なぜそうしたか」を単体で追える
