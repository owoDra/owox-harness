# コア用語集

## 目的

この文書は、`owox-harness` v2 で共通に使う中心用語を定義します。

## 用語

### owox

AI エージェントが開発時に使う共通ツール基盤です。CLI の代替ではなく、CLI から利用される開発ツール群を指します。

### v1

既存の `AGENTS.md`、skills、`docs/project` を中心とした文書ハーネスです。

### v2

v1 の機能要件を網羅しつつ、generator-driven / workflow-driven / subagent-native に強化した新しい `owox-harness` です。

### source of truth

ハーネスの正本です。v2 では、主に `owox.harness.yaml`、schema、templates、profiles、adapter definitions を指します。

### generated project harness

source of truth から生成される project 向けの配布物です。`.agents/`、`AGENTS.md`、docs skeleton、adapter files などを含みます。

### visible language

人間が読む資料や、AI の見える返答に使う言語です。project ごとに設定します。

### hidden context

内部キー、内部 state、token 効率重視の非表示表現です。英語を基本とします。

### workflow-driven

自由記述 instructions に頼りすぎず、状態遷移と決定的ツールを中心に task を進める設計方針です。

### generator-driven

ハーネスの主要成果物を手書き正本として持たず、source から機械生成する設計方針です。

### task state machine

task の状態と遷移条件を定義するモデルです。AI の能力差に依存しにくい進行管理の中心になります。

### gate

人間確認が必要な状態または判定です。設計変更、危険操作、外部仕様変更、完了判断などで使います。

### guard

禁止操作や危険操作を deterministic に評価する仕組みです。

### verify

acceptance criteria や必須検証項目を満たしているかを評価する仕組みです。

### handoff

親エージェントから子エージェント、または AI から人間へ、構造化して文脈を受け渡す行為です。

### parent agent

全体 task の責任を持つ主体です。subagent への委譲、集約、最終判断補助を担います。

### subagent

限定された目的、範囲、出力契約で task の一部を担当する補助エージェントです。

### profile

開発領域ごとの差分を表す拡張単位です。verify コマンド、risk rules、docs skeleton などを切り替えます。

### adapter

各 CLI の設定形式や拡張点の差分を吸収する層です。core ではなく integration boundary に置きます。

### deterministic enforcement

AI の判断に任せず、必ず行われる強制処理です。hooks、tool policy、state machine により実現します。

### locale renderer

internal model を project locale の visible documents や visible outputs に変換する描画層です。

## 関連資料

- `../architecture.md`
- `../requirements/REQ-harness-v2-foundation.md`
- `../integrations/ai-coding-clis.md`
