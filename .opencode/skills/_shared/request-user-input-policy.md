# Request User Input Policy

Ask the user when any of these conditions apply.

- The intent is ambiguous and would change the implementation path.
- A design, scope, or external behavior change may be required.
- A risky operation needs a human gate.
- Required documents or decisions are still unresolved.

When the path is clear, continue autonomously and keep the task state current through the `owox` CLI.
