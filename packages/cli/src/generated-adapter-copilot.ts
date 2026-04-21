import { createGeneratedFile, createJsonFile, type GeneratedFile } from "./generated-file.js";
import { renderMarkdown } from "./markdown.js";
import { renderRoleGuide, type RoleGuideSpec, COMMON_OWOX_WORKFLOW_LINES } from "./generated-adapter-common.js";

const COPILOT_AGENT: RoleGuideSpec = {
  title: "owox custom agent",
  summary: "Use this agent when deterministic workflow control is needed instead of relying on free-form session memory.",
  useWhen: [
    "Task state must be created, advanced, or validated.",
    "A human gate, drift audit, or verification step is part of the workflow.",
    "Managed artifacts need regeneration after source changes."
  ],
  requiredOwox: [
    "Use the `owox` CLI as the workflow system of record.",
    "Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.",
    "Keep task and intent artifacts updated before completion."
  ],
  expectedOutput: ["a consistent task record", "explicit verification status", "updated managed artifacts when required"]
};

export function renderCopilotFiles(): GeneratedFile[] {
  return [
    createGeneratedFile(".github/copilot-instructions.md", renderMarkdown("# Copilot Instructions", [{ paragraphs: ["Prefer `owox` commands for task workflow, validation, sync, and handoff. Read `.owox/` runtime artifacts only through the `owox` CLI."] }])),
    createGeneratedFile(".github/agents/owox.agent.md", renderRoleGuide(COPILOT_AGENT)),
    createGeneratedFile(".github/skills/owox/SKILL.md", renderMarkdown("# Skill: owox workflow", [{ bullets: [...COMMON_OWOX_WORKFLOW_LINES] }])),
    createGeneratedFile(".github/hooks/pre-command.sh", ["#!/usr/bin/env bash", "set -eu", "owox validate >/dev/null", ""].join("\n")),
    createJsonFile(".github/plugins/owox/plugin.json", { name: "owox-plugin", agents: [".github/agents/owox.agent.md"], skills: [".github/skills/owox/SKILL.md"], hooks: [".github/hooks/pre-command.sh"] })
  ];
}
