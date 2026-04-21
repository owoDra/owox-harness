import type { HarnessConfig } from "./config.js";
import { renderMarkdown } from "./markdown.js";

export interface RoleGuideSpec {
  title: string;
  summary: string;
  useWhen?: string[];
  requiredOwox?: string[];
  expectedOutput?: string[];
  constraints?: string[];
}

export type AdapterName = HarnessConfig["adapters"][number];

export const COMMON_OWOX_WORKFLOW_LINES = [
  "Run `owox validate` before substantial work.",
  "Read managed project context with `owox read`, `owox list`, and `owox search` instead of direct file reads.",
  "Manage task state with `owox task new`, `owox task save`, `owox task current`, `owox task show`, and `owox task done`.",
  "Prefer flags or stdin for small inputs; use JSON only when the payload is genuinely large or structured.",
  "Use `owox task save` to persist task changes, evidence, log entries, gate resolutions, intent updates, and decision records in one step.",
  "Run `owox verify` when you need a non-closing check; use `owox task done` to verify, audit, and close a task.",
  "Use `owox write --text ...` or stdin when you need to update managed docs without creating temporary files.",
  "Run `owox sync` after source changes that affect managed artifacts.",
  "Do not read `.owox/` or `docs/project/` directly; use `owox read`, `owox list`, `owox search`, or `owox write`."
] as const;

export const ADAPTER_IGNORE_FILES: Partial<Record<AdapterName, string>> = {
  opencode: ".opencodeignore",
  "claude-code": ".claudeignore",
  codex: ".codexignore",
  "copilot-cli": ".copilotignore"
};

export function renderRoleGuide(spec: RoleGuideSpec): string {
  return renderMarkdown(`# ${spec.title}`, [
    { paragraphs: [spec.summary] },
    ...(spec.useWhen?.length ? [{ heading: "## Use When", bullets: spec.useWhen }] : []),
    ...(spec.requiredOwox?.length ? [{ heading: "## Required owox Actions", bullets: spec.requiredOwox }] : []),
    ...(spec.expectedOutput?.length ? [{ heading: "## Expected Output", bullets: spec.expectedOutput }] : []),
    ...(spec.constraints?.length ? [{ heading: "## Constraints", bullets: spec.constraints }] : [])
  ]);
}

export function renderOwoxWorkflowSkill(title: string): string {
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
        "Run `owox read project` for project runtime context.",
        "Run `owox list` when you need to discover available runtime artifacts or managed docs.",
        "Run `owox read task` when you need the active task runtime record.",
        "Run `owox read docs/index.md` when you need source-of-truth document navigation."
      ]
    },
    {
      heading: "## Working Rules",
      bullets: [
        `Prefer \`owox.harness.yaml\` and \`${config.source.docsRoot}/\` as source of truth`,
        "Do not treat generated artifacts as hand-edited source",
        "Do not read `.owox/` or `docs/project/` directly; use `owox read`, `owox list`, `owox search`, or `owox write`.",
        "Use `owox task new`, `owox task save`, `owox task current`, and `owox task done` for task work",
        "Run `owox verify` when you need a non-closing verification step",
        "Let `owox` block risky or out-of-order task actions instead of bypassing failed checks",
        "Use `owox sync` to regenerate managed artifacts"
      ]
    }
  ]);
}
