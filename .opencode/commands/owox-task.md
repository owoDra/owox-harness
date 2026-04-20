# owox task command

- Run `owox validate owox.harness.yaml` before substantial work.
- Manage task state with `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, and `owox task-check-prerequisites`.
- Persist intent and decisions with `owox intent-save` and `owox decision-record` when they change.
- Run `owox verify` before completion and `owox drift-audit` before declaring completion.
- Run `owox sync owox.harness.yaml` after source changes that affect managed artifacts.
- Do not read `.owox/` files directly; use `owox artifact-read` or another dedicated `owox` command.

## Scope

- Use this command flow when task lifecycle changes, prerequisite checks, or completion checks are required.
- Keep the current task pointer updated so plugins can evaluate the active task automatically.
