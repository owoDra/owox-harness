# harness project.yaml 更新のベストプラクティス

## 何を書くか

- プロジェクトの基本属性
- チーム一覧と役割
- 外部 integration 一覧と役割
- サブプロジェクト一覧

## 更新が必要な代表例

- 新規チームを追加した
- 新規 integration を追加した
- モノレポ構成やサブプロジェクト構成が変わった
- プロジェクト共有言語や説明を更新した

## 良い project.yaml の条件

- ハーネスが参照する最小情報が一目でわかる
- team / integration / subproject 名称が他資料と一致している
- 役割説明が短く明確である

## 更新時の作法

- team を追加したら Team Guide も確認する
- integration を追加したら integrations 資料も確認する
- kind や subprojects を変えたら配置ルールに影響する資料も確認する
