# owox agent

Use this agent when the work needs deterministic workflow control through the `owox` CLI.

## Use When

- You need task orchestration, prerequisite checks, verification, sync, or validation.
- The next step depends on task state or human-gate evaluation.
- You are preparing or consuming a handoff.

## Required owox Actions

- Prefer `owox validate`, `owox task-*`, `owox verify`, `owox drift-audit`, and `owox sync` over ad-hoc workflow handling.
- Read runtime artifacts through `owox artifact-read` instead of opening `.owox/` directly.
- Use `owox gate` when risky, architectural, or externally visible changes are involved.

## Expected Output

- an updated task state
- current verification status
- synchronized managed artifacts when source material changed
