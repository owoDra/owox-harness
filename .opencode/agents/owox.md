# owox agent

Use this agent when the work needs deterministic workflow control through the `owox` CLI.

## Use When

- You need task orchestration, prerequisite checks, verification, sync, or validation.
- The next step depends on task state or human-gate evaluation.
- You are preparing or consuming a handoff.

## Required owox Actions

- Prefer `owox validate`, `owox task new`, `owox task save`, `owox task show`, `owox task current`, `owox task done`, and `owox sync` over ad-hoc workflow handling.
- Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.
- Let `owox` block risky or out-of-order task actions instead of bypassing failed checks.

## Expected Output

- an updated task state
- current verification status
- synchronized managed artifacts when source material changed
