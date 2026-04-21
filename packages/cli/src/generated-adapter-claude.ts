import type { HarnessConfig } from "./config.js";
import { createGeneratedFile, createJsonFile, type GeneratedFile } from "./generated-file.js";
import { renderMarkdown } from "./markdown.js";
import { renderRoleGuide, type RoleGuideSpec, COMMON_OWOX_WORKFLOW_LINES } from "./generated-adapter-common.js";

const CLAUDE_SUBAGENTS: Record<"discovery" | "implementation", RoleGuideSpec> = {
  discovery: {
    title: "discovery subagent",
    summary: "Use this subagent for bounded discovery work that should return facts, affected areas, and open questions without changing source material.",
    useWhen: [
      "You need current-state analysis before implementation.",
      "You need impact mapping across docs, code, tests, or adapters.",
      "You want a compressed handoff back to the parent instead of raw exploration notes."
    ],
    requiredOwox: [
      "Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.",
      "Use `owox task show` or `owox task current` if the active task state or required docs are unclear.",
      "Report conclusions through the parent handoff/report flow rather than silently editing scope."
    ],
    expectedOutput: ["verified facts", "affected files or documents", "open questions and risks", "a clear recommendation for the next step"],
    constraints: ["Do not widen scope without a parent decision.", "Do not make implementation changes unless the parent explicitly delegated them."]
  },
  implementation: {
    title: "implementation subagent",
    summary: "Use this subagent for bounded implementation after the parent has already prepared scope, constraints, and completion criteria.",
    useWhen: [
      "The parent already prepared a handoff packet and task contract.",
      "The work is localized enough to complete without new design decisions.",
      "You need to return concrete edits plus verification status."
    ],
    requiredOwox: [
      "Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.",
      "Keep the current task state aligned through the `owox` CLI before and after edits.",
      "Use `owox verify` for non-closing checks and `owox task done` when the delegated task is ready to close."
    ],
    expectedOutput: ["completed edits inside the delegated scope", "verification evidence or failed checks", "open questions that block completion"],
    constraints: ["Do not reinterpret the goal beyond the handoff packet.", "Do not hide incomplete verification or residual risk."]
  }
};

const CLAUDE_OWOX_AGENT: RoleGuideSpec = {
  title: "owox agent",
  summary: "Use this agent when the work needs deterministic workflow control through the `owox` CLI.",
  useWhen: [
    "You need task orchestration, prerequisite checks, verification, sync, or validation.",
    "The next step depends on task state or human-gate evaluation.",
    "You are preparing or consuming a handoff."
  ],
  requiredOwox: [
    "Prefer `owox validate`, `owox task new`, `owox task save`, `owox task show`, `owox task current`, `owox task done`, and `owox sync` over ad-hoc workflow handling.",
    "Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.",
    "Let `owox` block risky or out-of-order task actions instead of bypassing failed checks."
  ],
  expectedOutput: ["an updated task state", "current verification status", "synchronized managed artifacts when source material changed"]
};

export function renderClaudeFiles(config: HarnessConfig): GeneratedFile[] {
  return [
    createGeneratedFile("CLAUDE.md", renderMarkdown("# CLAUDE", [{ paragraphs: ["Use `owox` for deterministic workflow actions and read `.owox/` runtime artifacts only through the `owox` CLI."] }, { bullets: [...COMMON_OWOX_WORKFLOW_LINES] }])),
    createJsonFile(".claude/settings.json", { owoxConfig: "owox.harness.yaml", taskDir: config.generated.taskDir }),
    createGeneratedFile(".claude/agents/owox.md", renderRoleGuide(CLAUDE_OWOX_AGENT)),
    createGeneratedFile(".claude/subagents/discovery.md", renderRoleGuide(CLAUDE_SUBAGENTS.discovery)),
    createGeneratedFile(".claude/subagents/implementation.md", renderRoleGuide(CLAUDE_SUBAGENTS.implementation)),
    createGeneratedFile(".claude/hooks/pre-command.sh", ["#!/usr/bin/env bash", "set -eu", "owox validate >/dev/null", ""].join("\n"))
  ];
}
