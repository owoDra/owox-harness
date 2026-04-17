# Pattern: evidence 駆動の検証

## 目的

この文書は、task 完了判定と検証結果を evidence で結び、実装と docs 更新のどちらでも再利用できる検証パターンを定義します。

## 使う場面

- task 完了判定を行うとき
- verify の結果を task へ紐づけるとき
- 生成物や docs の変更を検証するとき

## パターン

1. 先に acceptance criteria と required checks を task に書く
2. 実装後に unit / integration / snapshot / manual check を実行する
3. 実行結果を evidence として task または検証記録へ紐づける
4. evidence が足りない場合は `done` としない
5. 残リスクや未実施検証は evidence とは別に明記する

## evidence の例

- テスト実行結果
- 検証スクリプトの結果
- 生成差分の確認結果
- レビュー指摘の解消確認

## 避けること

- 「たぶん動く」を evidence の代わりに使うこと
- 完了条件と無関係なコマンド結果を並べること
- 失敗した verify を未記録のまま終えること

## 期待効果

- 完了判定のぶれを減らせる
- 自走時でも task の停止条件が明確になる
- human gate が必要な場面を切り分けやすい

## 関連資料

- `../specs/shared/SPEC-workflow-core-contracts.md`
- `../validation.md`
