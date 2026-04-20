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
          ".codex/config.toml",
          ".claude/subagents/discovery.md",
          ".opencode/plugins/owox.json",
          ".github/plugins/owox/plugin.json"
        ].includes(file.relativePath))
        .map((file) => [file.relativePath, file.content])
    );

    expect(sample).toEqual({
      ".owox/project.md": "# Project\n\n## Name\nsnapshot-project\n\n## Description\nsnapshot-project harness configuration\n\n## Locale\nen\n\n## Profile\nweb\n\n## Source Of Truth\n- owox.harness.yaml\n- docs/project/\n\n## Managed Outputs\n- .owox/\n- AGENTS.md\n- CLAUDE.md\n- .github/copilot-instructions.md\n- codex adapter files\n- claude-code adapter files\n- opencode adapter files\n- copilot-cli adapter files\n",
      ".claude/subagents/discovery.md": "# discovery subagent\n\nUse this subagent for scoped discovery and report back through owox handoff/report flows.\n",
      ".codex/config.toml": "[project]\nname = \"snapshot-project\"\n\n[owox]\nconfig = \"owox.harness.yaml\"\nskill = \".codex/skills/owox/SKILL.md\"\n",
      ".github/plugins/owox/plugin.json": "{\n  \"name\": \"owox-plugin\",\n  \"agents\": [\n    \".github/agents/owox.agent.md\"\n  ],\n  \"skills\": [\n    \".github/skills/owox/SKILL.md\"\n  ],\n  \"hooks\": [\n    \".github/hooks/pre-command.sh\"\n  ]\n}\n",
      ".opencode/plugins/owox.json": "{\n  \"name\": \"owox-plugin\",\n  \"hooks\": {\n    \"preTool\": \"owox validate owox.harness.yaml && (test ! -f .owox/tasks/task-current.json || owox task-check-prerequisites owox.harness.yaml .owox/tasks/task-current.json planning)\",\n    \"postEdit\": \"owox sync owox.harness.yaml\"\n  }\n}\n",
      "AGENTS.md": "## Read First\n\n1. `.owox/project.md`\n2. Target `.owox/tasks/task-*.md` and `.owox/tasks/task-current.json` when needed\n3. `docs/project/index.md` when needed\n\n## Working Rules\n\n- Prefer `owox.harness.yaml` and `docs/project/` as source of truth\n- Do not treat generated artifacts as hand-edited source\n- Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, `owox task-check-prerequisites`, and `owox validate` when starting task work\n- Run `owox verify` before task completion\n- Use `owox intent-save` and `owox decision-record` for intent and decision artifacts\n- Run `owox drift-audit` before declaring completion\n- Check `owox gate` for risky actions, design changes, external impact, and completion decisions\n- Use `owox sync` to regenerate managed artifacts\n"
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
