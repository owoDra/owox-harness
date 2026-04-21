import type { HarnessConfig } from "./config.js";
import { createGeneratedFile, type GeneratedFile } from "./generated-file.js";
import { renderOwoxWorkflowSkill } from "./generated-adapter-common.js";

export function renderCodexFiles(config: HarnessConfig): GeneratedFile[] {
  return [
    createGeneratedFile(".codex/config.toml", [`[project]`, `name = "${config.project.name}"`, "", `[owox]`, 'config = "owox.harness.yaml"', 'skill = ".codex/skills/owox/SKILL.md"', ""].join("\n")),
    createGeneratedFile(".codex/skills/owox/SKILL.md", renderOwoxWorkflowSkill("owox workflow")),
    createGeneratedFile(".codex/hooks/pre-tool.sh", ["#!/usr/bin/env bash", "set -eu", "owox validate >/dev/null", ""].join("\n")),
    createGeneratedFile(".codex/hooks/post-edit.sh", ["#!/usr/bin/env bash", "set -eu", "owox sync >/dev/null", ""].join("\n"))
  ];
}
