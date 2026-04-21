import { createGeneratedFile, createJsonFile, type GeneratedFile } from "./generated-file.js";
import { renderMarkdown } from "./markdown.js";
import { renderOpenCodeSkillFiles } from "./generated-opencode-skills.js";
import { renderRoleGuide, type RoleGuideSpec, COMMON_OWOX_WORKFLOW_LINES } from "./generated-adapter-common.js";

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
      "Prefer `owox validate`, `owox task new`, `owox task save`, `owox task show`, `owox task current`, `owox task done`, and `owox sync` over ad-hoc workflow handling.",
      "Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.",
      "Let `owox` block risky or out-of-order task actions instead of bypassing failed checks."
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
      "Read managed runtime and docs content through `owox read`, `owox list`, and `owox search` instead of opening files directly.",
      "Return findings in a form the parent can record through `owox` handoff or task updates."
    ],
    expectedOutput: ["facts", "affected areas", "open questions", "recommended next actions"],
    constraints: ["Avoid direct implementation unless the user or parent task explicitly requests it."]
  }
};

export function renderOpenCodeFiles(): GeneratedFile[] {
  return [
    createGeneratedFile(".opencode/agents/owox.md", renderRoleGuide(OPENCODE_AGENTS.owox)),
    createGeneratedFile(".opencode/commands/owox-task.md", renderMarkdown("# owox task command", [{ bullets: [...COMMON_OWOX_WORKFLOW_LINES] }, { heading: "## Scope", bullets: ["Use `owox task new` for task creation, `owox task save` for normal progress updates, and `owox task done` for task completion.", "Prefer flags or stdin for short task updates instead of creating temporary JSON files.", "Keep the current task pointer updated so plugins and wrappers can use the active task automatically."] }])),
    createJsonFile(".opencode/plugins/owox.json", { name: "owox-plugin", hooks: { preTool: "owox validate", postEdit: "owox sync" } }),
    createGeneratedFile(".opencode/agents/discovery.md", renderRoleGuide(OPENCODE_AGENTS.discovery)),
    ...renderOpenCodeSkillFiles()
  ];
}
