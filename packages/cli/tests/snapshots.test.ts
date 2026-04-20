import { describe, expect, test } from "vitest";
import { createDefaultHarnessConfig } from "../src/config.js";
import { renderGeneratedFiles } from "../src/generation.js";
import { builtinSuggestionProvider } from "../src/suggestion-provider.js";

describe("generated artifact snapshots", () => {
  test("renders representative adapter files", () => {
    const config = createDefaultHarnessConfig({
      rootDir: "/tmp/sample",
      name: "snapshot-project",
      locale: "en",
      adapters: ["codex", "claude-code", "opencode", "copilot-cli"]
    });

    const files = renderGeneratedFiles(config);
    const sample = Object.fromEntries(
      files
        .filter((file) => [
          "AGENTS.md",
          ".owox/project.md",
          ".opencode/skills/task-implementation/SKILL.md",
          ".opencodeignore",
          ".codex/config.toml",
          ".claude/subagents/discovery.md",
          ".opencode/plugins/owox.json",
          ".github/plugins/owox/plugin.json"
        ].includes(file.relativePath))
        .map((file) => [file.relativePath, file.content])
    );

    expect(sample).toEqual({
      ".owox/project.md": "# Project\n\n## Name\n\nsnapshot-project\n\n## Description\n\nsnapshot-project harness configuration\n\n## Locale\n\nen\n\n## Profile\n\nweb\n\n## Source Of Truth\n\n- owox.harness.yaml\n- docs/project/\n\n## Managed Outputs\n\n- .owox/\n- AGENTS.md\n- CLAUDE.md\n- .github/copilot-instructions.md\n- codex adapter files\n- claude-code adapter files\n- opencode adapter files\n- copilot-cli adapter files\n",
      ".opencode/skills/task-implementation/SKILL.md": "---\nname: task-implementation\ndescription: Use when implementation is the primary goal and you need to carry work through validation and related source updates.\nargument-hint: \"goal=<what to implement> mode=<autonomous|interactive>\"\n---\n## Purpose\n\nImplement the requested change while keeping task state, evidence, and source-of-truth updates aligned.\n\n## Read First\n\n- Use `owox artifact-read owox.harness.yaml project.md` for project runtime context.\n- Use `owox artifact-read owox.harness.yaml tasks/task-current.json` when an active task exists.\n- Read `docs/project/index.md` and the relevant requirement, spec, ADR, pattern, validation, or team guide for this scope.\n- Read code and tests directly only when they are part of the current task scope.\n\n## What To Do\n\n1. Run `owox validate owox.harness.yaml` before substantial work if the harness state may have changed.\n2. Create or update the task record with `owox task-create`, `owox task-update`, `owox task-set-current`, and `owox task-transition`.\n3. Run `owox task-check-prerequisites` before moving into planning, execution, or done.\n4. Read the relevant source documents and collect only the facts needed for this scope.\n5. Do the skill-specific work, keeping scope, constraints, and evidence explicit in the task file.\n6. When intent or decisions change, persist them with `owox intent-save` and `owox decision-record`.\n7. Run `owox verify` before completion and `owox drift-audit` before closing or handing work back.\n8. Run `owox sync owox.harness.yaml` after changing managed source material that affects generated artifacts.\n\n## Rules\n\n- Keep AI-facing Markdown in English.\n- Prefer source-of-truth documents over generated artifacts.\n- Do not skip human gates for risky, architectural, or externally visible changes.\n- Do not read files under `.owox/` directly; use `owox artifact-read` or another dedicated `owox` command.\n- Record assumptions, open questions, and residual risk instead of hiding them.\n\n## Checks\n\n- The task state is current in `owox`.\n- The relevant source documents were consulted.\n- Required verification and evidence are recorded.\n- Any follow-up actions or open questions are explicit.\n",
      ".opencodeignore": "# Exclude owox runtime artifacts from direct agent indexing.\n.owox/\n",
      ".claude/subagents/discovery.md": "# discovery subagent\n\nUse this subagent for bounded discovery work that should return facts, affected areas, and open questions without changing source material.\n\n## Use When\n\n- You need current-state analysis before implementation.\n- You need impact mapping across docs, code, tests, or adapters.\n- You want a compressed handoff back to the parent instead of raw exploration notes.\n\n## Required owox Actions\n\n- Read runtime context through `owox artifact-read` instead of opening `.owox/` files directly.\n- Use `owox task-check-prerequisites` if the task state or required docs are unclear.\n- Report conclusions through the parent handoff/report flow rather than silently editing scope.\n\n## Expected Output\n\n- verified facts\n- affected files or documents\n- open questions and risks\n- a clear recommendation for the next step\n\n## Constraints\n\n- Do not widen scope without a parent decision.\n- Do not make implementation changes unless the parent explicitly delegated them.\n",
      ".codex/config.toml": "[project]\nname = \"snapshot-project\"\n\n[owox]\nconfig = \"owox.harness.yaml\"\nskill = \".codex/skills/owox/SKILL.md\"\n",
      ".github/plugins/owox/plugin.json": "{\n  \"name\": \"owox-plugin\",\n  \"agents\": [\n    \".github/agents/owox.agent.md\"\n  ],\n  \"skills\": [\n    \".github/skills/owox/SKILL.md\"\n  ],\n  \"hooks\": [\n    \".github/hooks/pre-command.sh\"\n  ]\n}\n",
      ".opencode/plugins/owox.json": "{\n  \"name\": \"owox-plugin\",\n  \"hooks\": {\n    \"preTool\": \"owox validate owox.harness.yaml && (test ! -f .owox/tasks/task-current.json || owox task-check-prerequisites owox.harness.yaml .owox/tasks/task-current.json planning)\",\n    \"postEdit\": \"owox sync owox.harness.yaml\"\n  }\n}\n",
      "AGENTS.md": "## Read First\n\n1. Run `owox artifact-read owox.harness.yaml project.md` for project runtime context.\n2. Run `owox artifact-read owox.harness.yaml tasks/task-current.json` when you need the active task runtime record.\n3. Read `docs/project/index.md` when you need source-of-truth document navigation.\n\n## Working Rules\n\n- Prefer `owox.harness.yaml` and `docs/project/` as source of truth\n- Do not treat generated artifacts as hand-edited source\n- Do not read files under `.owox/` directly; use `owox artifact-read` or another dedicated `owox` command.\n- Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, `owox task-check-prerequisites`, and `owox validate` when starting task work\n- Run `owox verify` before task completion\n- Use `owox intent-save` and `owox decision-record` for intent and decision artifacts\n- Run `owox drift-audit` before declaring completion\n- Check `owox gate` for risky actions, design changes, external impact, and completion decisions\n- Use `owox sync` to regenerate managed artifacts\n"
    });
  });
});

describe("suggestion snapshots", () => {
  test("builtin provider returns stable topics", async () => {
    const suggestions = await builtinSuggestionProvider.generate({
      rootDir: "/tmp/existing-app",
      repoFacts: {
        repoShape: "monorepo",
        detectedFiles: ["README.md", "pnpm-workspace.yaml", "CLAUDE.md"],
        packageManagers: ["pnpm"],
        runtimes: ["node"],
        scripts: ["build", "test"],
        docs: ["README.md"],
        existingCliConfigs: ["CLAUDE.md"],
        inferredLocale: "en",
        inferredInitMode: "existing_project"
      },
      session: {
        sessionId: "init-1",
        currentState: "collecting_context",
        rootDir: "/tmp/existing-app",
        visibleLocale: "en",
        repoFacts: null,
        referenceDocuments: [],
        suggestions: [],
        pendingDecisions: [],
        confirmedDecisions: {},
        updatedAt: "2026-04-17T00:00:00.000Z"
      }
    });

    expect(suggestions.map((item) => ({ topic: item.topic, recommended: item.recommended }))).toEqual([
      { topic: "init_mode", recommended: "existing_project" },
      { topic: "name", recommended: "existing-app" },
      { topic: "profile", recommended: "web" },
      { topic: "locale", recommended: "en" },
      { topic: "adapters", recommended: "claude-code" },
      { topic: "source_of_truth_policy", recommended: "create_fresh_docs" }
    ]);
  });
});
