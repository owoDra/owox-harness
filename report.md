# main 比較レビュー

## 対象

- 比較基準: `main` ブランチ
- 比較対象: 現在のワークツリーにあるハーネス関連変更
- 主な確認範囲: `.agents/`, `docs/project/`, `AGENTS.md`, `README.md`, `validate_harness.sh`

## 結論

全体としては `main` より明確に良くなっています。

特に良くなったのは、ハーネスの責務分離、初期化前テンプレートとしての一貫性、機械検証の追加、skill の網羅性です。一方で、まだ埋め切れていないのは「索引の自動追従」と「機械検証で拾える範囲の拡張」です。

## 主要な改善点

### 1. `.agents/project.yaml` から `.agents/project.md` への移行は改善

- `main` では YAML ベースで、AI が読む最小定義と人間が読む説明が分離しにくかった
- 現在は [project.md](.agents/project.md) で固定見出しになり、エージェントが読む順序と更新対象が明確になった
- Markdown に統一されたことで、skill 群や task と同じ編集モデルで扱える

### 2. `_shared` 導入は改善

- `main` では task 系や docs-update 系の skill に共通説明が分散していた
- 現在は [task-template.md](.agents/skills/_shared/task-template.md)、[reference-order.md](.agents/skills/_shared/reference-order.md)、[request-user-input-policy.md](.agents/skills/_shared/request-user-input-policy.md) などに共通事項が寄っている
- その結果、各 skill では固有判断に集中しやすくなっている

### 3. `validate_harness.sh` の追加は大きな改善

- `main` にはハーネス全体を機械的に確認するスクリプトがなかった
- 現在は [validate_harness.sh](.agents/scripts/validate_harness.sh) により、必須レイアウト、legacy 参照、project.md 見出し順、task 見出し、ID 重複、status 値、active/archive 配置、リンク破損まで検査できる
- テンプレート再編のような大きい変更に対して回帰確認がしやすくなった

### 4. `docs/project/` のテンプレート化は改善

- `main` では `docs/project/` に旧構造前提の説明や単一ファイル glossary が残っていた
- 現在は `glossary/`, `research/`, `proposals/`, `specs/shared/` などに分割され、テンプレートとしての拡張余地が増えている
- `index.md` ごとに役割、置いてよいもの、命名規則、参照リストがあり、初期化後の成長先が読みやすい

### 5. skill の網羅性は改善

- `main` に存在しなかった [docs-update-research/SKILL.md](.agents/skills/docs-update-research/SKILL.md) と [docs-update-proposal/SKILL.md](.agents/skills/docs-update-proposal/SKILL.md) が追加された
- `task-implementation` ではドキュメント参照を trace tag で残す方針が明確化された
- 各 best-practices も、共通化を維持しつつ skill 固有の停止条件や落としやすい観点が増補されている

## 見つかった不足と残課題

### 中: index の参照リストは手動管理で、自動追従しない

- 現在の `index.md` は `パス: 概要` 形式で読みやすい
- ただし、個票追加時に index 更新を忘れるとすぐにずれる
- `validate_harness.sh` は「`## 参照` があるか」や「リンク破損」は拾えるが、「index の一覧が実ファイルと一致しているか」はまだ機械検証していない

必要なら次にやること:

- `validate_harness.sh` に「カテゴリ内の `.md` 実体と index 記載の差分検査」を追加する

### 中: `docs/project/` の active/archive に個票が増えたときの index 更新規則がまだ弱い

- いまは `adr/index.md` と `proposals/index.md` に配置先説明はある
- ただし、active と archive の両方に個票が増えた場合の一覧更新ルールは人手運用依存になっている

必要なら次にやること:

- `docs-update-adr` と `docs-update-proposal` の SKILL に「index の一覧更新」を明示的に足す
- `validate_harness.sh` に active/archive 下の個票が index へ列挙されているかの検査を追加する

### 低: `_shared/trace-tags.md` の参照はあるが、各言語の具体例はない

- 方針としては十分だが、実際のコードコメントへ落とすときの迷いはまだ残る
- ただし、これはテンプレートとしては必須ではなく、プロジェクトごとの言語事情に寄せる余地を残しているとも言える

必要なら次にやること:

- 言語非依存の最小例だけ `_shared/trace-tags.md` に追加する

### 低: review 観点の記録先が `report.md` と task に分かれ得る

- 今回は依頼に合わせて [report.md](report.md) を作成した
- 継続運用では `.agents/tasks/task-*.md` にも同じ結論を残さないと、次ターンの文脈キャッシュとしては弱い

必要なら次にやること:

- レビュー依頼で `report.md` を出した場合も、対応 task に要約を残す運用を追加する

## main より悪くなった点はあるか

大きく悪くなった点は見当たりません。

ただし、次の点はトレードオフです。

- `main` よりファイル数は増えている
- glossary や proposal/research の分割により、初見の人が把握すべき入口は増えた

一方で、その増加は役割分離と保守性のためのもので、現状の構成ではメリットの方が大きいです。

## 総評

`main` と比べると、現在のハーネスは次の意味で一段良い状態です。

- テンプレートとしての整合性が高い
- AI が読む入口と人間が読む正本の境界が明確
- 変更時の検証手段がある
- skill の網羅性が上がっている
- 調査と提案を正式なカテゴリとして扱える

不足は「一覧の自動整合チェック」と「index 運用の機械検証」で、どちらも後続で補強しやすい部類です。

現時点の判断としては、main より良くなっていると判断して問題ありません。