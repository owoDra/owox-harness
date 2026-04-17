# Pattern: adapter 境界の保ち方

## 目的

この文書は、CLI 固有差分を adapter に閉じ込め、core と cli の責務分離を保つ実装パターンを定義します。

## 使う場面

- 新しい CLI adapter を追加するとき
- 既存 adapter の機能差分を吸収するとき
- hooks や subagents の差異を扱うとき

## パターン

1. 共通契約は先に shared spec と core spec で定義する
2. CLI 固有の命名、配置、設定形式は adapter 層で変換する
3. core には CLI 名や vendor 固有条件を直接持ち込まない
4. degrade 戦略を adapter 単位で持つ
5. validation では adapter 固有項目と共通項目を分けて確認する

## 避けること

- core の判定ロジックへ CLI 固有の if 分岐を散らすこと
- rules file の都合で workflow 契約自体を変えること
- hooks 非対応環境を未考慮のまま必須化すること

## 期待効果

- adapter ごとの差異を局所化できる
- profile や locale を追加しても core が膨らみにくい
- CLI ごとの失敗を adapter 境界で吸収しやすい

## 関連資料

- `../specs/shared/SPEC-integration-adapter-contracts.md`
- `../architecture.md`
- `../validation.md`
