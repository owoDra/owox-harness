# 正本更新の横断確認

- requirement を変えたら spec / validation / ADR への影響を確認する
- spec を変えたら code / test / pattern / validation への影響を確認する
- architecture を変えたら spec / code / test / validation / tech-stack を確認する
- integration を追加または変更したら `.agents/project.md` と `docs/project/integrations/` を確認する
- team を追加または変更したら `.agents/project.md` と `docs/project/teams/` を確認する
- 個票を追加、改名、移動、保管したら同カテゴリの `index.md` の参照リスト更新要否を確認する
- proposal を採用したら requirement / spec / ADR への昇格を確認する
- research で重要判断が固まったら proposal または ADR への昇格を確認する