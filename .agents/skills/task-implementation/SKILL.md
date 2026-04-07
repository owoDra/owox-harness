---
name: task-implementation
description: 実装が主目的のタスクを開始し、進め方と判断ゲートを定めてコードと関連資料を更新するときに使用する
argument-hint: "goal=<何を実装するか> mode=<agent-led|collab-led>"
---

## 目的

要求、仕様、設計判断に沿って実装を進め、必要な検証と関連資料更新まで含めて完了させる。

## 前提資料

- `../task-prepare/references/task.example.md` を参照して `tasks/task-*.md` の基本フォーマットを把握する
- `.agents/glossary.md` を参照して用語と命名を統一する
- `.agents/architecture.md` があれば参照して普遍ルールを確認する
- `.agents/project.yaml` があれば読みプロジェクト、チーム、サブプロジェクト、外部依存を把握する
- `.agents/requirements/`, `.agents/specs/`, `.agents/adr/`, `.agents/validation.md`, `.agents/tech-stack.md` のうち関連する正本を参照する
- `.agents/templates/trace-tags.md` を参照して、コードやテストに付与するトレースタグの種類を把握する
- 該当チームの `.agents/teams/<team>-guide.md` があれば参照する
- `./references/best-practices.md` を参照して implementation の進め方を把握する
- `./references/comment-best-practices.md` を参照して言語やフレームワークに依存しないコメントの原則を把握する

## 前提知識

- implementation はコード変更だけでなく、必要な検証と正本更新を含む
- 正本が不足している場合は、決め打ち実装せず、必要に応じて requirement、spec、ADR の更新に戻す
- 変更は最小限かつ一貫した単位で行う

## やること

1. ユーザー依頼と `task-prepare` の確認結果をもとに、`request_user_input` ツールで `goal`、`execution_mode`、変更可能範囲、禁止事項、完了条件を確認する
2. `tasks/task-*.md` を作成し、少なくとも以下を記載する
   - 何を達成するか
   - どこを変えてよいか
   - 守るべき不変条件
   - 更新すべき正本
   - 実行すべき検証
   - 完了条件
   - 進捗
3. `execution_mode` を明示して進め方を決める
   - `agent-led`: 実装計画と停止条件を共有したうえで、Agents 主導で実装、検証、整合確認まで進める
   - `collab-led`: 実装方針、主要変更点、検証方針、資料更新方針を節目ごとに確認しながら進める
4. ユーザーの判断が必要な項目は `request_user_input` ツールを使って確認する
   - 実装方針の選択
   - 変更対象の優先順位
   - 互換性への影響許容
   - 資料更新の必要性
5. 実装開始前に以下を明文化する
   - 実装対象
   - 変更しない範囲
   - 守るべき不変条件
   - 依存する正本
   - 検証方法
   - 停止条件
6. 正本、既存コード、テストを確認し、実装計画を立てる
7. 実装する
   - 変更したコードには、対応するハーネス資料と関連コードへの参照をトレースタグとして残す
   - トレースタグは `./references/trace-tags.md` の形式に従い、その言語で標準的に使われる適切なドキュメンテーションコメントに記載する
   - 少なくとも requirement、spec、ADR、関連テストまたは検証経路、必要なら不変条件と変更理由を追跡できるようにする
   - トレースタグは関数、クラス、モジュール、主要な設定、重要な分岐など、後から変更理由を追いやすい単位に付ける
8. 関連するテスト、検証、整合確認を実行する
9. 変更に応じて正本更新要否を確認する
   - requirement の変更が必要なら `docs-update-requirement`
   - spec の変更が必要なら `docs-update-spec`
   - 設計判断の変更が必要なら `docs-update-adr`
   - 検証方針の変更が必要なら `docs-update-validation`
   - 技術スタックの変更が必要なら `docs-update-tech-stack`
10. 判断ゲートで停止して確認する
   - `agent-led`: 重要な前提変更、権限外変更、高リスク変更、仕様変更が必要になった場合のみ `request_user_input` ツールで確認する
   - `collab-led`: 実装方針確定後、主要変更前、検証結果整理後に `request_user_input` ツールで確認する
11. 完了後に `tasks/task-*.md` の進捗を更新する

## ルール

- 正本と矛盾する実装を確定させない
- 変更理由が説明できない変更を混ぜない
- テストや検証を後回しにしない
- 影響がある資料更新を放置しない
- 重要なコード変更には、言語に対応した適切なドキュメンテーションコメントでトレースタグを残す
- トレースタグはハーネス資料だけでなく、必要に応じて関連コードや関連テストへの参照も残す
- コメントは処理をなぞる説明ではなく、意図、不変条件、境界条件、根拠の記録に使う
- 高リスク変更、破壊的変更、機密に関わる変更は確認を挟む
- ユーザー判断が必要な確認は必ず `request_user_input` ツールを使う

## 確認事項

- `goal` と `execution_mode` の確認に `request_user_input` ツールを使っている
- 実装対象、対象外、不変条件、停止条件が明文化されている
- 必要なテストまたは検証を実行している
- 正本更新の要否を確認している
- 重要な変更箇所にトレースタグ付きのドキュメンテーションコメントを残している
- `tasks/task-*.md` の進捗が更新されている
