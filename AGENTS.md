## Read First

1. Run `owox read project` for project runtime context.
2. Run `owox list` when you need to discover available runtime artifacts or managed docs.
3. Run `owox read task` when you need the active task runtime record.
4. Run `owox read docs/index.md` when you need source-of-truth document navigation.

## Working Rules

- Prefer `owox.harness.yaml` and `docs/project/` as source of truth
- Do not treat generated artifacts as hand-edited source
- Do not read `.owox/` or `docs/project/` directly; use `owox read`, `owox list`, `owox search`, or `owox write`.
- Use `owox task new`, `owox task save`, `owox task current`, and `owox task done` for task work
- Run `owox verify` when you need a non-closing verification step
- Let `owox` block risky or out-of-order task actions instead of bypassing failed checks
- Use `owox sync` to regenerate managed artifacts
