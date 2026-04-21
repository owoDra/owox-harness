---
name: docs-update-tech-stack
description: Use when adding or revising adopted technologies or version policies.
argument-hint: "goal=<tech-stack change> path=<target file>"
---
## Purpose

Keep the canonical technology inventory and version policy current.

## Read First

- Use `owox read project` for project runtime context.
- Use `owox list` when you need to discover available runtime artifacts or managed docs.
- Use `owox read task` when an active task exists.
- Read the relevant requirement, spec, ADR, pattern, validation, or team guide through `owox read` or `owox search`.
- Read code and tests directly only when they are part of the current task scope.

## What To Do

1. Run `owox validate` before substantial work if the harness state may have changed.
2. Create a task with `owox task new` when needed, then persist normal task changes with `owox task save`.
3. Prefer flags or stdin for small inputs instead of creating temporary JSON files.
4. Use `owox task show` or `owox task current` when you need to inspect the active task state.
5. Read the relevant source documents and collect only the facts needed for this scope.
6. Do the skill-specific work, keeping scope, constraints, and evidence explicit in the task file.
7. When intent, decisions, evidence, or log entries change, persist them through `owox task save`.
8. Run `owox verify` before completion when you need a non-closing check, and use `owox task done` when the task is ready to close.
9. Run `owox sync` after changing managed source material that affects generated artifacts.

## Rules

- Keep AI-facing Markdown in English.
- Prefer source-of-truth documents over generated artifacts.
- Do not skip human gates for risky, architectural, or externally visible changes.
- Do not read files under `.owox/` or `docs/project/` directly; use `owox read`, `owox list`, `owox search`, or `owox write`.
- Record assumptions, open questions, and residual risk instead of hiding them.

## Checks

- The task state is current in `owox`.
- The relevant source documents were consulted.
- Required verification and evidence are recorded.
- Any follow-up actions or open questions are explicit.
