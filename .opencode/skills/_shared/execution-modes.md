# Execution Modes

## Autonomous

Use this mode when the request is clear, the allowed scope is explicit, and you can complete the work end-to-end without repeated user confirmation. Record checkpoints in the task file and keep using the `owox` CLI for task state, verification, and sync.

## Interactive

Use this mode when requirements, scope, or risk boundaries are unclear. Ask focused questions, record the answers in the task file, and do not move to later task states until `owox task-check-prerequisites` allows it.
