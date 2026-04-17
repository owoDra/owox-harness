# GitHub Copilot CLI

## 役割

GitHub Copilot CLI は `owox-harness` が custom instructions、agents、skills、hooks、plugins、MCP を通じて利用する主要外部連携の 1 つです。

## 接続境界

- custom instructions と project-level generated files を生成する
- custom agents と skills から `owox` workflow を呼び出す
- hooks、plugins、MCP server 設定で policy-compliant execution を補強する

## 認証 / 権限

- Copilot CLI と接続先 MCP の認証方式に従う
- `owox-harness` は機密値を保持せず、外部設定へ委譲する

## 制約

- project-level customizations が plugin より優先される前提を考慮する
- hooks は current working directory 起点の前提を満たす必要がある
- plugin 配布と project generation の責務を混同しない

## 障害時の扱い

- plugin や hooks が使えない場合でも、project-level files と skills で degrade できるようにする
- precedence の衝突は adapter で吸収し、core workflow の契約は維持する

## 関連資料

- `ai-coding-clis.md`
- `../architecture.md`
- `../validation.md`
