# REQ: init provider and migration helpers

## 目的

この文書は、consultative `harness-init` における external suggestion provider と v1 migration helper の要求を定義します。

## 背景

現在の builtin suggestion だけでは、project 固有の技術調査や組織固有の推奨ルールを十分に反映できません。また、v1 資産を持つ project では scan だけでなく migration helper による安全な初期化が必要です。

## 目標

- suggestion provider を差し替え可能にする
- external provider を command 経由で実装できる
- v1 資産を持つ project を migration helper で v2 source へ移せる
- 人間確認前提を崩さずに自動化を増やす

## P0: 絶対に外せない要求

### P0-1. external suggestion provider

external suggestion provider は少なくとも次を満たす必要があります。

- command 実行で suggestion を返せる
- input / output は機械可読である
- builtin provider に fallback できる

### P0-2. decision template export

consultative init は人間が編集しやすい decision template を出力できる必要があります。

### P0-3. v1 migration helper

v1 相当資産を持つ project に対して、scan、suggest、confirm、materialize をまとめた migration helper を提供できる必要があります。

## 機能要求

### FR-1. provider config

`owox.harness.yaml` は suggestion provider の選択と external provider の command 設定を保持できる必要があります。

### FR-2. provider execution

external provider は repo facts、reference documents、confirmed decisions を入力として suggestion を返す必要があります。

### FR-3. migration command

v1 migration helper は少なくとも次を実行できる必要があります。

- init session 作成
- repo scan
- suggestion 生成
- default decision template の生成
- materialize

### FR-4. validation

validate は provider 設定の妥当性と migration 後の source / generated 整合性を確認できる必要があります。

## 関連資料

- `REQ-harness-init-consultative-setup.md`
- `../specs/cli/SPEC-harness-init-consultative-workflow.md`
- `../specs/cli/SPEC-command-surface.md`
- `../validation.md`
