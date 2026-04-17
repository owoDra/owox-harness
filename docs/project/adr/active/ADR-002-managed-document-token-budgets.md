# ADR-002: managed documents に token budget を導入する

## 状態

active

## 文脈

v2 は low-context 運用を重視するが、rules files、task templates、docs skeleton、adapter markdown が肥大化すると、AI が毎回読む資料量が増える。

## 決定

ハーネスが管理する markdown documents には token budget を導入し、`owox.harness.yaml` で project ごとに設定可能にする。

generation 時は compact / split を行い、validate 時は over-limit を `token_limit` issue として検出する。

## 理由

- low-context 運用を維持しやすい
- project ごとの差分を source of truth に置ける
- 生成物肥大化を deterministic に抑制できる

## 代替案

### 1. 予算を設けず人間運用に任せる

却下。コンテキスト肥大化の再発を防げない。

### 2. すべての資料を固定長テンプレートにする

却下。project 差分を表現しにくい。

## 影響

- config schema に budget 設定が追加される
- generation と validate が token estimator を共有する
- docs / rules file の renderer は長文化に注意する必要がある

## 関連資料

- `../../requirements/REQ-managed-document-token-budgets.md`
- `../../specs/cli/SPEC-managed-document-token-budgets.md`
