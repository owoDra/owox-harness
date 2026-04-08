# harness-init 固定アンケート

`harness-init` はこのテンプレートの順序と項目に従って質問する。項目は自由に省略しない。

## 回答状態

- `unasked`: まだ質問していない
- `confirmed`: 回答が確定した
- `none`: 該当なしと確認した
- `tbd`: 必要だが未確定で、保留理由を確認した

`unasked` が 1 件でも残っている間は次の Phase に進まない。

## ルール

- リポジトリから読み取れた内容は候補として提示してよいが、必ず採用可否を確認する
- `none` と `tbd` は分けて扱う
- 1 Phase ごとに回答要約を提示し、認識違いがないか確認する
- `question` が使えない場合も、同じ順番と粒度で通常メッセージ質問を行う

## Phase 1: project.yaml 必須項目

1. `project.name`
   - プロジェクト名は何か
2. `project.description`
   - 何を作るプロジェクトか
3. `project.lang`
   - 共有言語は何か
4. `project.kind`
   - `simple` か `monorepo` か
5. `project.subprojects`
   - `monorepo` の場合、各サブプロジェクトの名前と説明は何か
   - `simple` の場合は `none`
6. `project.teams`
   - どんなチームが存在し、何を担当するか
7. `project.integrations`
   - 外部依存は何があるか
   - 無ければ `none`

## Phase 2: glossary / tech stack

1. glossary 候補
   - リポジトリから提案すべき用語は何か
   - その他追加したい用語はあるか
2. tech stack 候補
   - リポジトリから提案すべき技術スタックは何か
   - その他確定している技術スタックはあるか

## Phase 3: integrations 詳細

integration ごとに以下を確認する。

1. integration 名
2. 何のために使うか
3. どのチームが責任を持つか
4. 認証・権限・レート制限などの制約
5. 障害時や停止時の扱い

integration が無い場合は、この Phase 全体を `none` と確認する。

## Phase 4: architecture / validation

1. architecture
   - 不変条件として何を置くか
   - 責務分離をどう定義するか
   - 設計理念として何を重視するか
   - ディレクトリ構造はどうしたいか
   - 変更が必要な spec / 実装コード / テスト用コード / validation は何か
   - 重要判断として ADR に残すべきものはあるか
2. validation
   - 共通候補としてどの確認項目を採用するか
   - 各候補を何で検証するか
   - それぞれいつ行うか
   - それぞれ求める結果は何か
   - 問題があった際にどうするか
   - 更新に伴って変更すべきテストコードは何か
   - 必要に応じて ADR や技術スタックも更新すべきか

## Phase 5: team guides

team ごとに以下を確認する。

1. どんな役割を担うのか
2. どこまでが担当範囲なのか
3. ルールや決め事はあるか
4. このチームだけが知るべき知識はあるか

## Phase 完了時の確認文

各 Phase の終了時に少なくとも以下を整理する。

- 確定した回答
- `none` の項目
- `tbd` の項目と保留理由
- 次の Phase に進めるか
