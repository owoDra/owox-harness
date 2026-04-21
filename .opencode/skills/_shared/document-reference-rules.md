# Document Reference Rules

- Update the relevant `index.md` when you add or rename a project document.
- Use relative links that resolve from the current document.
- Reference source-of-truth documents, not generated runtime artifacts.
- Keep titles stable and descriptive so `owox validate` can detect broken references quickly.
- Treat `.owox/` and `docs/project/` as owox-managed content; inspect or update them only through `owox read`, `owox list`, `owox search`, or `owox write`.
