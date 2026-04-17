# Codex

## 役割

Codex は `owox-harness` が rules、skills、hooks、MCP を通じて利用する主要外部連携の 1 つです。

## 接続境界

- `AGENTS.md` と project-scoped config を生成する
- skills から `owox` workflow を呼び出す
- hooks と MCP server 設定で verify / guard / gate を補強する

## 認証 / 権限

- Codex と接続先 MCP の認証方式に従う
- `owox-harness` は secrets を保持せず、外部設定へ委譲する

## 制約

- hooks は experimental 前提で扱い、必須依存にしない
- hooks が使えない環境でも skill + command で degrade できる必要がある
- CLI 固有差分は adapter に閉じ込める

## 障害時の扱い

- hooks や MCP が使えない場合でも、rules と skills だけで最低限の workflow を継続できるようにする
- Codex 固有の制約で失敗しても、core workflow の契約は保持する

## 関連資料

- `ai-coding-clis.md`
- `../architecture.md`
- `../validation.md`
