# Project

## Name
owox-harness

## Description
人間の意図を保ったまま、複数の AI コーディング CLI を再現性のある 1 つの開発フローへ束ねるメタハーネス。

## Language
日本語

## Kind
monorepo

## Subprojects
- `core`: workflow ルール、状態遷移、検証条件、subagent 契約、設定解釈など、環境に依存しないハーネスの中核ロジック。
- `cli`: 人間や AI エージェントが使う入口として、コマンド処理、file IO、生成、CLI ごとの連携成果物出力を担う層。

## Teams
- `none`: 現時点では固定のチーム境界を定義しない。

## Integrations
- `opencode`: OpenCode 連携。rules、skills、agents、plugins、commands、custom tools、MCP を扱う。
- `claude-code`: Claude Code 連携。rules、skills、subagents、hooks、MCP を扱う。
- `codex`: Codex 連携。rules、skills、hooks、MCP を扱う。
- `copilot-cli`: GitHub Copilot CLI 連携。custom instructions、agents、skills、hooks、plugins、MCP を扱う。
