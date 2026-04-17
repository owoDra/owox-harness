# SPEC: init provider and migration helpers

## 目的

この文書は、consultative init における suggestion provider 抽象と v1 migration helper の契約を定義します。

## 対象範囲

- builtin / external provider
- decision template export
- `migrate-v1` command

## external provider 契約

external provider は command 実行で呼び出される。

### input

- JSON object
- `rootDir`
- `repoFacts`
- `referenceDocuments`
- `confirmedDecisions`

### output

- suggestion array
- 各 suggestion は `topic`, `recommended`, `alternatives`, `reasons`, `risks`, `openQuestions` を持つ

### failure

- command error
- invalid JSON
- invalid suggestion schema

失敗時は builtin provider に fallback してよい。

## decision template

decision template は少なくとも次を含む。

- pending decisions
- current recommended values
- suggestions summary
- selected reference paths

JSON 形式で出力する。

## `migrate-v1`

`migrate-v1` は次を順に実行する。

1. init session 作成
2. scan
3. suggest
4. v1 向け default decisions の確定
5. materialize
6. validate

## validation

- external provider config は schema に通る
- migration 後の config と generated artifacts は validate に通る
- v1 mode の materialize は `init.mode=existing_project_with_v1` を保持する

## 関連資料

- `SPEC-command-surface.md`
- `SPEC-harness-init-consultative-workflow.md`
- `../../requirements/REQ-init-provider-and-migration-helpers.md`
