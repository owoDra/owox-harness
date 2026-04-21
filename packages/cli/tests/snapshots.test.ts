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
      ".opencode/skills/task-implementation/SKILL.md": expect.stringContaining("owox task done"),
      ".opencodeignore": "# Exclude owox-managed sources from direct agent indexing.\n.owox/\ndocs/project/\n",
      ".claude/subagents/discovery.md": expect.stringContaining("owox read"),
      ".codex/config.toml": "[project]\nname = \"snapshot-project\"\n\n[owox]\nconfig = \"owox.harness.yaml\"\nskill = \".codex/skills/owox/SKILL.md\"\n",
      ".github/plugins/owox/plugin.json": "{\n  \"name\": \"owox-plugin\",\n  \"agents\": [\n    \".github/agents/owox.agent.md\"\n  ],\n  \"skills\": [\n    \".github/skills/owox/SKILL.md\"\n  ],\n  \"hooks\": [\n    \".github/hooks/pre-command.sh\"\n  ]\n}\n",
      ".opencode/plugins/owox.json": "{\n  \"name\": \"owox-plugin\",\n  \"hooks\": {\n    \"preTool\": \"owox validate\",\n    \"postEdit\": \"owox sync\"\n  }\n}\n",
      "AGENTS.md": "## Read First\n\n1. Run `owox read project` for project runtime context.\n2. Run `owox list` when you need to discover available runtime artifacts or managed docs.\n3. Run `owox read task` when you need the active task runtime record.\n4. Run `owox read docs/index.md` when you need source-of-truth document navigation.\n\n## Working Rules\n\n- Prefer `owox.harness.yaml` and `docs/project/` as source of truth\n- Do not treat generated artifacts as hand-edited source\n- Do not read `.owox/` or `docs/project/` directly; use `owox read`, `owox list`, `owox search`, or `owox write`.\n- Use `owox task new`, `owox task save`, `owox task current`, and `owox task done` for task work\n- Run `owox verify` when you need a non-closing verification step\n- Let `owox` block risky or out-of-order task actions instead of bypassing failed checks\n- Use `owox sync` to regenerate managed artifacts\n"
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
