---
name: docs-update-tech-stack
description: Use when adding or revising adopted technologies or version policies.
argument-hint: "goal=<tech-stack change> path=<target file>"
---
## Purpose

Keep the canonical technology inventory and version policy current.

## Read First

- Use `owox artifact-read owox.harness.yaml project.md` for project runtime context.
- Use `owox artifact-read owox.harness.yaml tasks/task-current.json` when an active task exists.
- Read `docs/project/index.md` and the relevant requirement, spec, ADR, pattern, validation, or team guide for this scope.
- Read code and tests directly only when they are part of the current task scope.

## What To Do

1. Run `owox validate owox.harness.yaml` before substantial work if the harness state may have changed.
2. Create or update the task record with `owox task-create`, `owox task-update`, `owox task-set-current`, and `owox task-transition`.
3. Run `owox task-check-prerequisites` before moving into planning, execution, or done.
4. Read the relevant source documents and collect only the facts needed for this scope.
5. Do the skill-specific work, keeping scope, constraints, and evidence explicit in the task file.
6. When intent or decisions change, persist them with `owox intent-save` and `owox decision-record`.
7. Run `owox verify` before completion and `owox drift-audit` before closing or handing work back.
8. Run `owox sync owox.harness.yaml` after changing managed source material that affects generated artifacts.

## Rules

- Keep AI-facing Markdown in English.
- Prefer source-of-truth documents over generated artifacts.
- Do not skip human gates for risky, architectural, or externally visible changes.
- Do not read files under `.owox/` directly; use `owox artifact-read` or another dedicated `owox` command.
- Record assumptions, open questions, and residual risk instead of hiding them.

## Checks

- The task state is current in `owox`.
- The relevant source documents were consulted.
- Required verification and evidence are recorded.
- Any follow-up actions or open questions are explicit.
