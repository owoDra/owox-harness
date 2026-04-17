# ADR-004: intent-governed agent control と `.owox/` 集約を採用する

## 状態

active

## 文脈

v2 は `owox` の利用を必須とし、workflow-driven / human-governed / subagent-native を目指している。一方で、`task` だけではユーザー意図や途中判断の保持が弱く、AI が `owox` を通さずに進めたり、前提資料や判断が不足したまま作業したりする余地が残る。

また、人間向け正本である `docs/project/`、各 CLI 向け生成ディレクトリ、AI 専用の hidden artifact の境界が曖昧だと、責務分離と token 効率が崩れやすい。

## 決定

`owox-harness` v2 は次を採用する。

1. `intent` を `task` の上位契約として持つ
2. `decision ledger` と `context packet` を標準化する
3. AI は task、verify、gate、handoff、完了判定を `owox` 経由で行う
4. prerequisite enforcement により、資料不足、判断不足、evidence 不足時は先へ進めない
5. AI 専用 artifact は `.owox/` に集約し、`docs/project/` は人間向け正本、各 CLI 向け rules file と生成ディレクトリは各 CLI が読む設定や skill / agent 定義だけを持つ

## 理由

- ユーザー意図と task 実行契約を分離して誤解を減らせる
- 低コンテキストでも parent / child 間の handoff を維持しやすい
- AI が `owox` を使わずに勝手な手順で進む経路を減らせる
- `.owox/` に hidden artifact を集約することで、人間向け正本を汚さず責務境界を保てる
- prerequisite enforcement により、曖昧な前提での進行を deterministic に抑止できる

## 代替案

### 1. `task` 契約だけを拡張する

却下。ユーザー意図と途中判断が task に埋もれやすく、subagent の低コンテキスト handoff に不利。

### 2. rules file を厚くして制御する

却下。instructions 依存が強く、token 消費も大きく、CLI 差分が adapter を越えて漏れやすい。

### 3. CLI 固有の生成ディレクトリに AI 専用 artifact も置く

却下。Codex 向け定義と runtime artifact が混ざり、他 CLI との共通境界も弱くなる。

## 影響

- requirements に intent-governed control と storage boundary が追加される
- shared spec に intent、decision ledger、context packet、prerequisite enforcement、storage boundary が追加される
- workflow、command surface、generation pipeline、validation が `.owox/` を前提に更新される
- generated artifacts の分類で CLI 固有の生成ディレクトリは最小定義に、`.owox/` は AI 専用 runtime artifact に整理される

## 関連資料

- `../../requirements/REQ-intent-governed-agent-control.md`
- `../../requirements/REQ-harness-v2-foundation.md`
- `../../specs/shared/SPEC-intent-governed-agent-control.md`
- `../../specs/shared/SPEC-workflow-core-contracts.md`
- `../../architecture.md`
