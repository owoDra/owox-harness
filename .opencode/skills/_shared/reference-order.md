# Reference Order

Read sources in this order unless the task says otherwise.

1. `owox read project`
2. `owox list` when you need to discover available runtime artifacts or managed docs
3. `owox read task` when an active task exists
4. `owox read docs/index.md`
5. the most relevant requirement, spec, ADR, pattern, validation, or team guide through `owox read` or `owox search`
6. code and tests directly affected by the task

Do not read files under `.owox/` or `docs/project/` directly. Use the `owox` CLI as the access path for managed artifacts.
