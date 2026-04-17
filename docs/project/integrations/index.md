# 外部連携

## 役割

このディレクトリは、外部 API やサービスとの接続境界と制約を管理する正本です。

## 置いてよいもの

- 外部依存の役割
- 接続境界
- 認証や制約
- 障害時の扱い

## 置いてはいけないもの

- 機密値そのもの
- 一回限りの接続メモ
- ハーネス運用ルール

## 命名規則

- `<integration>.md`

## 参照ルール

- integration を追加または変更したら `.owox/`、CLI 固有の生成ディレクトリ、validation への影響を確認する

## 参照

- `ai-coding-clis.md`: 4 つの主要 CLI にまたがる共通連携方針
- `opencode.md`: OpenCode integration の個票
- `claude-code.md`: Claude Code integration の個票
- `codex.md`: Codex integration の個票
- `copilot-cli.md`: GitHub Copilot CLI integration の個票
