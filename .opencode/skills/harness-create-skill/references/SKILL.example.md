---
name: <skill-name>
description: <when to use it>
argument-hint: "goal=<why> mode=<autonomous|interactive>"
---

## Purpose

<State the outcome this skill should produce.>

## Read First

- .owox/project.md
- docs/project/index.md
- the source documents that define this workflow

## What To Do

1. Run `owox validate owox.harness.yaml` before changing managed harness material.
2. Keep task state current through the `owox` CLI.
3. Define the workflow, constraints, and required checks clearly.

## Rules

- Keep AI-facing Markdown in English.
- Route workflow control through the `owox` CLI.

## Checks

- The skill scope is explicit.
- The required `owox` commands are named.
