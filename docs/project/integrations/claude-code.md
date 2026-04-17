# Claude Code

## 役割

Claude Code は `owox-harness` が rules、skills、subagents、hooks、MCP を通じて利用する主要外部連携の 1 つです。

## 接続境界

- `CLAUDE.md` を最小 rules file として生成する
- skills と custom subagents から `owox` workflow を呼び出す
- hooks と MCP server 設定で deterministic enforcement を補強する

## 認証 / 権限

- Claude Code と接続先 MCP の認証方式に従う
- `owox-harness` は認証情報を docs に保持しない

## 制約

- `CLAUDE.md` は advisory context であり、強制実行の本体にしない
- 長い instructions を避け、tool-first を維持する
- subagent 契約は parent / child 境界を崩さない形で定義する

## 障害時の扱い

- subagent や hooks が期待どおりに使えない場合は単独 workflow へ degrade する
- Claude Code 固有の失敗は adapter で閉じ込め、core workflow は保持する

## 関連資料

- `ai-coding-clis.md`
- `../architecture.md`
- `../validation.md`
