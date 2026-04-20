---
name: <skill-name>
description: <when to use it>
argument-hint: "goal=<why> mode=<autonomous|interactive>"
---

## Purpose

<State the outcome this skill should produce.>

## Read First

- use `owox artifact-read owox.harness.yaml project.md` for project runtime context
- `docs/project/index.md`
- the source documents that define this workflow

## What To Do

1. Run `owox validate owox.harness.yaml` before changing managed harness material.
2. Keep task state current through the `owox` CLI.
3. Define the workflow, constraints, and required checks clearly.

## Rules

- Keep AI-facing Markdown in English.
- Route workflow control through the `owox` CLI.
- Do not read `.owox/` files directly.

## Checks

- The skill scope is explicit.
- The required `owox` commands are named.
