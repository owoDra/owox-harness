# Reference Order

Read sources in this order unless the task says otherwise.

1. `owox artifact-read owox.harness.yaml project.md`
2. `owox artifact-read owox.harness.yaml tasks/task-current.json` when an active task exists
3. `docs/project/index.md`
4. the most relevant requirement, spec, ADR, pattern, validation, or team guide
5. code and tests directly affected by the task

Do not read files under `.owox/` directly. Use the `owox` CLI as the access path for runtime artifacts.
