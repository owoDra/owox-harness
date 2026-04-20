## Read First

1. `.owox/project.md`
2. Target `.owox/tasks/task-*.md` and `.owox/tasks/task-current.json` when needed
3. `docs/project/index.md` when needed

## Working Rules

- Prefer `owox.harness.yaml` and `docs/project/` as source of truth
- Do not treat generated artifacts as hand-edited source
- Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, `owox task-check-prerequisites`, and `owox validate` when starting task work
- Run `owox verify` before task completion
- Use `owox intent-save` and `owox decision-record` for intent and decision artifacts
- Run `owox drift-audit` before declaring completion
- Check `owox gate` for risky actions, design changes, external impact, and completion decisions
- Use `owox sync` to regenerate managed artifacts
