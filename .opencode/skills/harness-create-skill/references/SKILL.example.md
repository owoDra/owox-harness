---
name: <skill-name>
description: <when to use it>
argument-hint: "goal=<why> mode=<autonomous|interactive>"
---

## Purpose

<State the outcome this skill should produce.>

## Read First

- use `owox read project` for project runtime context
- use `owox read docs/index.md` for source-of-truth navigation
- the source documents that define this workflow via `owox read` or `owox search`

## What To Do

1. Run `owox validate` before changing managed harness material.
2. Keep task state current through the `owox` CLI.
3. Define the workflow, constraints, and required checks clearly.

## Rules

- Keep AI-facing Markdown in English.
- Route workflow control through the `owox` CLI.
- Do not read managed files directly.

## Checks

- The skill scope is explicit.
- The required `owox` commands are named.
