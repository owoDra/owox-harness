# OpenCode

## 役割

OpenCode は `owox-harness` が rules、skills、agents、commands、plugins、custom tools、MCP を通じて利用する主要外部連携の 1 つです。

## 接続境界

- `AGENTS.md` を rules file として生成する
- `.opencode/` 配下の skills、agents、commands、plugins を生成する
- custom tools と MCP server 設定から `owox` を呼び出す

## 認証 / 権限

- OpenCode 自体の認証方式に従う
- `owox-harness` は機密値を保持せず、必要な認証情報は OpenCode または外部設定に委譲する

## 制約

- command / agent / plugin の挙動差分は adapter に閉じ込める
- `.opencode` と custom config directory の precedence を考慮する
- 長い運用手順は rules file へ書かず、tool-first を維持する

## 障害時の扱い

- plugin や custom tool が利用できない場合でも、rules file と skill 導線で degrade できるようにする
- OpenCode 固有機能の失敗は adapter 境界で吸収し、core workflow を壊さない

## 関連資料

- `ai-coding-clis.md`
- `../architecture.md`
- `../validation.md`
