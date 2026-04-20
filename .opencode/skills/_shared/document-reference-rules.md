# Document Reference Rules

- Update the relevant `index.md` when you add or rename a project document.
- Use relative links that resolve from the current document.
- Reference source-of-truth documents, not generated runtime artifacts.
- Keep titles stable and descriptive so `owox validate` can detect broken references quickly.
- Treat `.owox/` as runtime state; inspect it only through `owox artifact-read` or other dedicated `owox` commands.
