---
name: harness-create-skill
description: Use when creating a new English AI-facing skill that routes work through the owox CLI.
argument-hint: "name=<skill-name> goal=<why it exists>"
---

## Purpose

Create a new skill definition and supporting references that match the harness conventions.

## Read First

- `.owox/project.md`
- `docs/project/index.md`
- `owox.harness.yaml`
- the relevant `.owox/tasks/task-*.md` file and `.owox/tasks/task-current.json` when present
- the matching requirement, spec, ADR, pattern, validation, or team guide for this scope

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
- Record assumptions, open questions, and residual risk instead of hiding them.

## Checks

- The task state is current in `owox`.
- The relevant source documents were consulted.
- Required verification and evidence are recorded.
- Any follow-up actions or open questions are explicit.
