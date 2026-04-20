## Read First

1. Run `owox artifact-read owox.harness.yaml project.md` for project runtime context.
2. Run `owox artifact-read owox.harness.yaml tasks/task-current.json` when you need the active task runtime record.
3. Read `docs/project/index.md` when you need source-of-truth document navigation.

## Working Rules

- Prefer `owox.harness.yaml` and `docs/project/` as source of truth
- Do not treat generated artifacts as hand-edited source
- Do not read files under `.owox/` directly; use `owox artifact-read` or another dedicated `owox` command.
- Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, `owox task-check-prerequisites`, and `owox validate` when starting task work
- Run `owox verify` before task completion
- Use `owox intent-save` and `owox decision-record` for intent and decision artifacts
- Run `owox drift-audit` before declaring completion
- Check `owox gate` for risky actions, design changes, external impact, and completion decisions
- Use `owox sync` to regenerate managed artifacts
