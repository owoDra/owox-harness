# owox task command

- Run `owox validate` before substantial work.
- Read managed project context with `owox read`, `owox list`, and `owox search` instead of direct file reads.
- Manage task state with `owox task new`, `owox task save`, `owox task current`, `owox task show`, and `owox task done`.
- Prefer flags or stdin for small inputs; use JSON only when the payload is genuinely large or structured.
- Use `owox task save` to persist task changes, evidence, log entries, gate resolutions, intent updates, and decision records in one step.
- Run `owox verify` when you need a non-closing check; use `owox task done` to verify, audit, and close a task.
- Use `owox write --text ...` or stdin when you need to update managed docs without creating temporary files.
- Run `owox sync` after source changes that affect managed artifacts.
- Do not read `.owox/` or `docs/project/` directly; use `owox read`, `owox list`, `owox search`, or `owox write`.

## Scope

- Use `owox task new` for task creation, `owox task save` for normal progress updates, and `owox task done` for task completion.
- Prefer flags or stdin for short task updates instead of creating temporary JSON files.
- Keep the current task pointer updated so plugins and wrappers can use the active task automatically.
