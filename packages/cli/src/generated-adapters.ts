import type { HarnessConfig } from "./config.js";
import { createGeneratedFile, createJsonFile, type GeneratedFile } from "./generated-file.js";
import { renderMarkdown } from "./markdown.js";
import { renderOpenCodeSkillFiles } from "./generated-opencode-skills.js";

interface RoleGuideSpec {
  title: string;
  summary: string;
  useWhen?: string[];
  requiredOwox?: string[];
  expectedOutput?: string[];
  constraints?: string[];
}

type AdapterName = HarnessConfig["adapters"][number];

const COMMON_OWOX_WORKFLOW_LINES = [
  "Run `owox validate owox.harness.yaml` before substantial work.",
  "Manage task state with `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, and `owox task-check-prerequisites`.",
  "Persist intent and decisions with `owox intent-save` and `owox decision-record` when they change.",
  "Run `owox verify` before completion and `owox drift-audit` before declaring completion.",
  "Run `owox sync owox.harness.yaml` after source changes that affect managed artifacts.",
  "Do not read `.owox/` files directly; use `owox artifact-read` or another dedicated `owox` command."
] as const;

const ADAPTER_IGNORE_FILES: Partial<Record<AdapterName, string>> = {
  opencode: ".opencodeignore",
  "claude-code": ".claudeignore",
  codex: ".codexignore",
  "copilot-cli": ".copilotignore"
};

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
      "Read runtime context through `owox artifact-read` instead of opening `.owox/` files directly.",
      "Use `owox task-check-prerequisites` if the task state or required docs are unclear.",
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
      "Read runtime context through `owox artifact-read` instead of opening `.owox/` files directly.",
      "Keep the current task state aligned through the `owox` CLI before and after edits.",
      "Use `owox verify` for required checks and `owox drift-audit` before handing work back."
    ],
    expectedOutput: ["completed edits inside the delegated scope", "verification evidence or failed checks", "open questions that block completion"],
    constraints: ["Do not reinterpret the goal beyond the handoff packet.", "Do not hide incomplete verification or residual risk."]
  }
};

const OPENCODE_AGENTS: Record<"owox" | "discovery", RoleGuideSpec> = {
  owox: {
    title: "owox agent",
    summary: "Use this agent when the work needs deterministic workflow control through the `owox` CLI.",
    useWhen: [
      "You need task orchestration, prerequisite checks, verification, sync, or validation.",
      "The next step depends on task state or human-gate evaluation.",
      "You are preparing or consuming a handoff."
    ],
    requiredOwox: [
      "Prefer `owox validate`, `owox task-*`, `owox verify`, `owox drift-audit`, and `owox sync` over ad-hoc workflow handling.",
      "Read runtime artifacts through `owox artifact-read` instead of opening `.owox/` directly.",
      "Use `owox gate` when risky, architectural, or externally visible changes are involved."
    ],
    expectedOutput: ["an updated task state", "current verification status", "synchronized managed artifacts when source material changed"]
  },
  discovery: {
    title: "discovery agent",
    summary: "Use this agent for structured discovery that ends in a concise fact set and explicit open questions.",
    useWhen: [
      "You need to inspect the current implementation before proposing changes.",
      "You need to identify affected files, contracts, or tests.",
      "You want to separate verified facts from assumptions before implementation."
    ],
    requiredOwox: [
      "Use the active task context instead of creating side channels for scope.",
      "Read runtime artifacts through `owox artifact-read` instead of opening `.owox/` directly.",
      "Return findings in a form the parent can record through `owox` handoff or task updates."
    ],
    expectedOutput: ["facts", "affected areas", "open questions", "recommended next actions"],
    constraints: ["Avoid direct implementation unless the user or parent task explicitly requests it."]
  }
};

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
    "Read runtime artifacts through `owox artifact-read` instead of opening `.owox/` directly.",
    "Keep task and intent artifacts updated before completion."
  ],
  expectedOutput: ["a consistent task record", "explicit verification status", "updated managed artifacts when required"]
};

function renderRoleGuide(spec: RoleGuideSpec): string {
  return renderMarkdown(`# ${spec.title}`, [
    { paragraphs: [spec.summary] },
    ...(spec.useWhen?.length ? [{ heading: "## Use When", bullets: spec.useWhen }] : []),
    ...(spec.requiredOwox?.length ? [{ heading: "## Required owox Actions", bullets: spec.requiredOwox }] : []),
    ...(spec.expectedOutput?.length ? [{ heading: "## Expected Output", bullets: spec.expectedOutput }] : []),
    ...(spec.constraints?.length ? [{ heading: "## Constraints", bullets: spec.constraints }] : [])
  ]);
}

function renderOwoxWorkflowSkill(title: string): string {
  return renderMarkdown(`# Skill: ${title}`, [{ bullets: [...COMMON_OWOX_WORKFLOW_LINES] }]);
}

export function collectRulesFiles(config: HarnessConfig): string[] {
  const rulesFiles: string[] = [];
  if (config.adapters.includes("codex") || config.adapters.includes("opencode")) {
    rulesFiles.push("AGENTS.md");
  }
  if (config.adapters.includes("claude-code")) {
    rulesFiles.push("CLAUDE.md");
  }
  if (config.adapters.includes("copilot-cli")) {
    rulesFiles.push(".github/copilot-instructions.md");
  }
  return rulesFiles;
}

export function renderAgentsMd(config: HarnessConfig): string {
  return renderMarkdown("## Read First", [
    {
      ordered: [
        "Run `owox artifact-read owox.harness.yaml project.md` for project runtime context.",
        "Run `owox artifact-read owox.harness.yaml tasks/task-current.json` when you need the active task runtime record.",
        `Read \`${config.source.docsRoot}/index.md\` when you need source-of-truth document navigation.`
      ]
    },
    {
      heading: "## Working Rules",
      bullets: [
        `Prefer \`owox.harness.yaml\` and \`${config.source.docsRoot}/\` as source of truth`,
        "Do not treat generated artifacts as hand-edited source",
        "Do not read files under `.owox/` directly; use `owox artifact-read` or another dedicated `owox` command.",
        "Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, `owox task-check-prerequisites`, and `owox validate` when starting task work",
        "Run `owox verify` before task completion",
        "Use `owox intent-save` and `owox decision-record` for intent and decision artifacts",
        "Run `owox drift-audit` before declaring completion",
        "Check `owox gate` for risky actions, design changes, external impact, and completion decisions",
        "Use `owox sync` to regenerate managed artifacts"
      ]
    }
  ]);
}

function renderAdapterIgnoreFile(adapter: AdapterName): GeneratedFile | null {
  const relativePath = ADAPTER_IGNORE_FILES[adapter];
  if (!relativePath) {
    return null;
  }

  return createGeneratedFile(relativePath, ["# Exclude owox runtime artifacts from direct agent indexing.", ".owox/", ""].join("\n"));
}

function renderCodexFiles(config: HarnessConfig): GeneratedFile[] {
  const files = [
    createGeneratedFile(".codex/config.toml", [`[project]`, `name = "${config.project.name}"`, "", `[owox]`, 'config = "owox.harness.yaml"', 'skill = ".codex/skills/owox/SKILL.md"', ""].join("\n")),
    createGeneratedFile(".codex/skills/owox/SKILL.md", renderOwoxWorkflowSkill("owox workflow")),
    createGeneratedFile(".codex/hooks/pre-tool.sh", ["#!/usr/bin/env bash", "set -eu", "owox validate owox.harness.yaml >/dev/null", `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json planning >/dev/null; fi`, ""].join("\n")),
    createGeneratedFile(".codex/hooks/post-edit.sh", ["#!/usr/bin/env bash", "set -eu", `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json done >/dev/null; fi`, `if [ -f "${config.generated.taskDir}/task-current.json" ] && [ -f "checks.json" ]; then owox verify owox.harness.yaml ${config.generated.taskDir}/task-current.json checks.json --acceptance >/dev/null; fi`, `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox drift-audit owox.harness.yaml ${config.generated.taskDir}/task-current.json >/dev/null; fi`, ""].join("\n"))
  ];
  const ignore = renderAdapterIgnoreFile("codex");
  return ignore ? [...files, ignore] : files;
}

function renderClaudeFiles(config: HarnessConfig): GeneratedFile[] {
  const files = [
    createGeneratedFile("CLAUDE.md", renderMarkdown("# CLAUDE", [{ paragraphs: ["Use `owox` for deterministic workflow actions and read `.owox/` runtime artifacts only through the `owox` CLI."] }, { bullets: [...COMMON_OWOX_WORKFLOW_LINES] }])),
    createJsonFile(".claude/settings.json", { owoxConfig: "owox.harness.yaml", taskDir: config.generated.taskDir }),
    createGeneratedFile(".claude/agents/owox.md", renderRoleGuide(OPENCODE_AGENTS.owox)),
    createGeneratedFile(".claude/subagents/discovery.md", renderRoleGuide(CLAUDE_SUBAGENTS.discovery)),
    createGeneratedFile(".claude/subagents/implementation.md", renderRoleGuide(CLAUDE_SUBAGENTS.implementation)),
    createGeneratedFile(".claude/hooks/pre-command.sh", ["#!/usr/bin/env bash", "set -eu", "owox validate owox.harness.yaml >/dev/null", `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json planning >/dev/null; fi`, ""].join("\n"))
  ];
  const ignore = renderAdapterIgnoreFile("claude-code");
  return ignore ? [...files, ignore] : files;
}

function renderOpenCodeFiles(config: HarnessConfig): GeneratedFile[] {
  const files = [
    createGeneratedFile(".opencode/agents/owox.md", renderRoleGuide(OPENCODE_AGENTS.owox)),
    createGeneratedFile(".opencode/commands/owox-task.md", renderMarkdown("# owox task command", [{ bullets: [...COMMON_OWOX_WORKFLOW_LINES] }, { heading: "## Scope", bullets: ["Use this command flow when task lifecycle changes, prerequisite checks, or completion checks are required.", "Keep the current task pointer updated so plugins can evaluate the active task automatically."] }])),
    createJsonFile(".opencode/plugins/owox.json", { name: "owox-plugin", hooks: { preTool: `owox validate owox.harness.yaml && (test ! -f ${config.generated.taskDir}/task-current.json || owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json planning)`, postEdit: "owox sync owox.harness.yaml" } }),
    createGeneratedFile(".opencode/agents/discovery.md", renderRoleGuide(OPENCODE_AGENTS.discovery)),
    ...renderOpenCodeSkillFiles()
  ];
  const ignore = renderAdapterIgnoreFile("opencode");
  return ignore ? [...files, ignore] : files;
}

function renderCopilotFiles(): GeneratedFile[] {
  const files = [
    createGeneratedFile(".github/copilot-instructions.md", renderMarkdown("# Copilot Instructions", [{ paragraphs: ["Prefer `owox` commands for task workflow, validation, sync, and handoff. Read `.owox/` runtime artifacts only through the `owox` CLI."] }])),
    createGeneratedFile(".github/agents/owox.agent.md", renderRoleGuide(COPILOT_AGENT)),
    createGeneratedFile(".github/skills/owox/SKILL.md", renderOwoxWorkflowSkill("owox workflow")),
    createGeneratedFile(".github/hooks/pre-command.sh", ["#!/usr/bin/env bash", "set -eu", "owox validate owox.harness.yaml >/dev/null", "if [ -f \".owox/tasks/task-current.json\" ]; then owox task-check-prerequisites owox.harness.yaml .owox/tasks/task-current.json planning >/dev/null; fi", ""].join("\n")),
    createJsonFile(".github/plugins/owox/plugin.json", { name: "owox-plugin", agents: [".github/agents/owox.agent.md"], skills: [".github/skills/owox/SKILL.md"], hooks: [".github/hooks/pre-command.sh"] })
  ];
  const ignore = renderAdapterIgnoreFile("copilot-cli");
  return ignore ? [...files, ignore] : files;
}

const ADAPTER_RENDERERS: Partial<Record<AdapterName, (config: HarnessConfig) => GeneratedFile[]>> = {
  codex: renderCodexFiles,
  "claude-code": renderClaudeFiles,
  opencode: renderOpenCodeFiles,
  "copilot-cli": renderCopilotFiles
};

export function renderAdapterFiles(config: HarnessConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  config.adapters.forEach((adapter) => {
    const renderAdapter = ADAPTER_RENDERERS[adapter];
    if (renderAdapter) {
      files.push(...renderAdapter(config));
    }
  });
  return files;
}
