# SPEC: adapter 共通契約

## 目的

この文書は、`owox-harness` v2 が各 AI コーディング CLI と連携するために adapter が満たすべき共通契約を定義します。

## 対象範囲

- Codex
- Claude Code
- OpenCode
- GitHub Copilot CLI

## 対象外

- 個別 CLI のすべての機能説明
- vendor 固有の認証手順の詳細
- plugin 配布物の実装詳細

## adapter の責務

- short rules file を生成または供給する
- `owox` を呼ぶ skill / custom agent / command 導線を提供する
- verify / guard / gate を発火する hook または同等機構を接続する
- optional MCP server 設定を扱えるようにする
- `.owox/` を直接 index しないための adapter ignore file を扱えるようにする
- CLI 固有差分を core へ漏らさない

## rules file 契約

rules file には、少なくとも次だけを書く方針とします。

- この project で `owox` を使うこと
- `owox task` / `owox verify` / `owox handoff` を使う場面
- human gate が必要な操作

重い手順本文や project 固有の一時メモは rules file に含めません。

## hook / plugin 契約

- deterministic enforcement に限定して使う
- prompt 受理時の task / gate 判定を扱える
- tool 実行前の guard を扱える
- edit / task 完了前の verify を扱える
- hook 非対応環境では degrade できる必要がある

## subagent 契約

- subagent 対応 CLI では parent / child 契約を保持する
- 非対応または弱い環境では単独 workflow へ degrade する
- degrade 後も acceptance criteria と verify 契約を保持する

## locale 契約

- visible files は project locale に従う
- internal keys、hidden prompts、adapter 内部 state は英語を基本とする
- AI-facing Markdown (`AGENTS.md`、`.opencode/` 配下の skills / agents / commands など) は英語を基本とする
- `.owox/` 配下の runtime artifact は `owox` CLI を通して読む前提を優先する
- locale 切替時も adapter ごとの内部契約は変えない

## adapter 差分の扱い

adapter は少なくとも次の差分を吸収する責務を持ちます。

- rules file 名と配置
- hook config 形式
- custom agent / subagent の定義形式
- MCP config 形式
- command / tool invocation の方法
- plugin と project-level customization の precedence

## 失敗時の扱い

- 特定 CLI の hook や subagent が弱い場合でも core workflow は保持する
- 特定 CLI 固有の失敗は adapter 境界で吸収する
- 強制力の弱い環境でも、最低限の task / verify 契約を維持する

## 検証観点

- generated files が各 CLI で有効な形式になっている
- skill / agent / command から `owox` への導線が壊れていない
- MCP や custom tool の接続が壊れていない
- degrade 時も workflow 契約が破綻しない

## 関連資料

- `../../integrations/ai-coding-clis.md`
- `../../architecture.md`
- `../../validation.md`
- `SPEC-workflow-core-contracts.md`
