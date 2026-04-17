# ADR-003: init provider 抽象と migration helper を追加する

## 状態

active

## 文脈

consultative init は builtin suggestion だけでも動くが、project 固有の調査・提案や v1 からの移行支援には拡張点が必要である。

## 決定

- suggestion provider を builtin / external の抽象で扱う
- external provider は command 実行で接続する
- v1 project には `migrate-v1` helper を追加する

## 理由

- 特定 runtime や組織固有ルールを core/cli 本体に埋め込まずに拡張できる
- migration を標準導線として扱える
- builtin provider を fallback として残せる

## 影響

- config schema に provider 設定が増える
- command surface に template export / migrate-v1 が追加される
- validation に provider config の確認が追加される

## 関連資料

- `../../requirements/REQ-init-provider-and-migration-helpers.md`
- `../../specs/cli/SPEC-init-provider-and-migration-helpers.md`
