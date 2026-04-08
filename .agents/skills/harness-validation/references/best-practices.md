# Harness Validation のベストプラクティス

## まず確認すること

- 何を正本として扱うか
- `scope` が全体か部分か
- `project.kind` が `simple` か `monorepo` か
- 未整備を許容する領域があるか

## 確認観点

- 必須資料が存在するか
- 配置ルールが守られているか
- index と実体が一致するか
- ID、命名、用語がルールどおりか
- front matter の必須項目が埋まっているか
- 相互参照が実在し孤立していないか
- requirement、spec、ADR、pattern、validation、skill の責務が混ざっていないか
- 同じ内容の重複定義や正本間の矛盾がないか
- `project.yaml` の team、integration、subproject と実資料が一致するか

## 結果整理の作法

- `問題なし`、`不整合`、`判断保留` を分ける
- 不整合には、対象ファイル、規則、観測事実、影響範囲を書く
- 修正案を書く場合も、観測事実とは分ける
- すぐ直すべきものと、後続でよいものを分ける
