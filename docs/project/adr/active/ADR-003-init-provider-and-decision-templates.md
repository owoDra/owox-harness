# ADR-003: 初期化プロバイダー抽象と判断テンプレート出力を追加する

## 状態

active

## 文脈

相談型初期化は内蔵提案だけでも動くが、project 固有の調査・提案や人間確認前の編集しやすさには拡張点が必要である。

## 決定

- 提案プロバイダーを builtin / external の抽象で扱う
- 外部プロバイダーは command 実行で接続する
- 人間確認用に判断テンプレート出力を追加する

## 理由

- 特定 runtime や組織固有ルールを core/cli 本体に埋め込まずに拡張できる
- 人間確認前の確認作業を軽くできる
- 内蔵プロバイダーを代替手段として残せる

## 影響

- 設定スキーマにプロバイダー設定が増える
- コマンド面に判断テンプレート出力が追加される
- 検証にプロバイダー設定の確認が追加される

## 関連資料

- `../../requirements/REQ-init-provider-and-decision-templates.md`
- `../../specs/cli/SPEC-init-provider-and-decision-templates.md`
