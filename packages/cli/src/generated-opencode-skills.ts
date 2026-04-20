import { createGeneratedFile, type GeneratedFile } from "./generated-file.js";
import { renderMarkdown } from "./markdown.js";

interface SkillDefinition {
  name: string;
  description: string;
  argumentHint: string;
  objective: string;
}

const SHARED_FILES: Record<string, string> = {
  ".opencode/skills/_shared/task-template.md": `# Task\n\n## Objective\n\n## Status\n\n## Request\n\n## Confirmed Assumptions\n\n## Open Questions\n\n## Scope\n\n## Out Of Scope\n\n## Must-Keep Invariants\n\n## Source Documents To Read\n\n## Documents You Can Skip This Time\n\n## Execution Plan\n\n## Steps\n\n## Validation Checks\n\n## Completion Criteria\n\n## Progress Log\n\n## Read Next\n`,
  ".opencode/skills/_shared/execution-modes.md": `# Execution Modes\n\n## Autonomous\n\nUse this mode when the request is clear, the allowed scope is explicit, and you can complete the work end-to-end without repeated user confirmation. Record checkpoints in the task file and keep using the \`owox\` CLI for task state, verification, and sync.\n\n## Interactive\n\nUse this mode when requirements, scope, or risk boundaries are unclear. Ask focused questions, record the answers in the task file, and do not move to later task states until \`owox task-check-prerequisites\` allows it.\n`,
  ".opencode/skills/_shared/task-statuses.md": `# Task Statuses\n\n- \`intake\`: request captured, intent still incomplete\n- \`intent_clarifying\`: gathering missing intent and constraints\n- \`intent_confirmed\`: intent is explicit enough to plan\n- \`planning\`: task contract and checks are being prepared\n- \`executing\`: implementation or document work is in progress\n- \`verifying\`: evidence and required checks are being evaluated\n- \`awaiting_human_gate\`: blocked on a required human decision\n- \`done\`: verified and closed\n- \`blocked\`: cannot continue without missing input, evidence, or permission\n`,
  ".opencode/skills/_shared/reference-order.md": `# Reference Order\n\nRead sources in this order unless the task says otherwise.\n\n1. \`owox artifact-read owox.harness.yaml project.md\`\n2. \`owox artifact-read owox.harness.yaml tasks/task-current.json\` when an active task exists\n3. \`docs/project/index.md\`\n4. the most relevant requirement, spec, ADR, pattern, validation, or team guide\n5. code and tests directly affected by the task\n\nDo not read files under \`.owox/\` directly. Use the \`owox\` CLI as the access path for runtime artifacts.\n`,
  ".opencode/skills/_shared/request-user-input-policy.md": `# Request User Input Policy\n\nAsk the user when any of these conditions apply.\n\n- The intent is ambiguous and would change the implementation path.\n- A design, scope, or external behavior change may be required.\n- A risky operation needs a human gate.\n- Required documents or decisions are still unresolved.\n\nWhen the path is clear, continue autonomously and keep the task state current through the \`owox\` CLI.\n`,
  ".opencode/skills/_shared/document-reference-rules.md": `# Document Reference Rules\n\n- Update the relevant \`index.md\` when you add or rename a project document.\n- Use relative links that resolve from the current document.\n- Reference source-of-truth documents, not generated runtime artifacts.\n- Keep titles stable and descriptive so \`owox validate\` can detect broken references quickly.\n- Treat \`.owox/\` as runtime state; inspect it only through \`owox artifact-read\` or other dedicated \`owox\` commands.\n`,
  ".opencode/skills/_shared/document-update-checklist.md": `# Document Update Checklist\n\n- Confirm the target document type and canonical location.\n- Check the related requirement, spec, ADR, validation, or team guide before editing.\n- Update the matching \`index.md\` file.\n- Keep wording consistent with the rest of \`docs/project/\`.\n- Run \`owox validate owox.harness.yaml\` after material document changes.\n`,
  ".opencode/skills/_shared/trace-tags.md": `# Trace Tags\n\nUse short inline references when work must point back to source-of-truth material.\n\nExamples:\n\n- \`REQ: REQ-harness-v2-foundation\`\n- \`SPEC: SPEC-generation-pipeline\`\n- \`ADR: ADR-004-intent-governed-agent-control\`\n- \`VAL: validation.md#V-9\`\n\nTrace tags should explain why a change exists, not restate the code.\n`
};

const BEST_PRACTICES = `# Best Practices\n\n- Start from the canonical source document, not a generated derivative.\n- Keep edits small, explicit, and traceable to the request.\n- Update the matching index file when you add, rename, or archive a document.\n- Run \`owox validate owox.harness.yaml\` after material doc or harness changes.\n- Record unresolved questions instead of guessing.\n`;

const TEMPLATE_FILES: Record<string, string> = {
  ".opencode/skills/harness-create-skill/references/SKILL.example.md": `---\nname: <skill-name>\ndescription: <when to use it>\nargument-hint: "goal=<why> mode=<autonomous|interactive>"\n---\n\n## Purpose\n\n<State the outcome this skill should produce.>\n\n## Read First\n\n- use \`owox artifact-read owox.harness.yaml project.md\` for project runtime context\n- \`docs/project/index.md\`\n- the source documents that define this workflow\n\n## What To Do\n\n1. Run \`owox validate owox.harness.yaml\` before changing managed harness material.\n2. Keep task state current through the \`owox\` CLI.\n3. Define the workflow, constraints, and required checks clearly.\n\n## Rules\n\n- Keep AI-facing Markdown in English.\n- Route workflow control through the \`owox\` CLI.\n- Do not read \`.owox/\` files directly.\n\n## Checks\n\n- The skill scope is explicit.\n- The required \`owox\` commands are named.\n`,
  ".opencode/skills/harness-init/references/project.template.md": `# Project\n\n## Name\n\n## Description\n\n## Locale\n\n## Profile\n\n## Source Of Truth\n\n- owox.harness.yaml\n- docs/project/\n\n## Managed Outputs\n\n- .owox/\n- AGENTS.md\n- adapter files\n`,
  ".opencode/skills/harness-init/references/init-questionnaire.md": `# Init Questionnaire\n\n1. What is the project name?\n2. Is this a new project or an existing project?\n3. Which visible locale should project documents use?\n4. Which adapters are required?\n5. Which existing documents should remain canonical source-of-truth?\n6. Which managed artifacts should the harness materialize?\n`,
  ".opencode/skills/harness-update-project/references/project.template.md": `# Project\n\n## Name\n\n## Description\n\n## Locale\n\n## Profile\n\n## Source Of Truth\n\n- owox.harness.yaml\n- docs/project/\n\n## Managed Outputs\n\n- .owox/\n- adapter files\n`,
  ".opencode/skills/docs-update-adr/references/adr.template.md": `# ADR: <title>\n\n## Status\n\nproposed\n\n## Context\n\n## Decision\n\n## Consequences\n`,
  ".opencode/skills/docs-update-architecture/references/architecture.template.md": `# Architecture\n\n## Purpose\n\n## Summary\n\n## Invariants\n\n## Boundaries\n\n## Related Documents\n`,
  ".opencode/skills/docs-update-integrations/references/integration.template.md": `# <Integration Name>\n\n## Role\n\n## Connection Boundary\n\n## Authentication / Permissions\n\n## Constraints\n\n## Failure Handling\n`,
  ".opencode/skills/docs-update-patterns/references/pattern.template.md": `# Pattern: <name>\n\n## Purpose\n\n## When To Use\n\n## Structure\n\n## Tradeoffs\n`,
  ".opencode/skills/docs-update-proposal/references/proposal.template.md": `# Proposal: <title>\n\n## Problem\n\n## Proposed Change\n\n## Alternatives\n\n## Risks\n\n## Rollout\n`,
  ".opencode/skills/docs-update-requirement/references/requirement.template.md": `# REQ: <title>\n\n## Purpose\n\n## Background\n\n## Goals\n\n## Functional Requirements\n\n## Validation\n`,
  ".opencode/skills/docs-update-research/references/research.template.md": `# Research: <topic>\n\n## Question\n\n## Facts\n\n## Constraints\n\n## Findings\n\n## Recommendation\n`,
  ".opencode/skills/docs-update-spec/references/spec.template.md": `# SPEC: <title>\n\n## Purpose\n\n## Scope\n\n## Out Of Scope\n\n## Contract\n\n## Validation\n`,
  ".opencode/skills/docs-update-team-guide/references/team-guide.template.md": `# Team Guide: <team>\n\n## Mission\n\n## Responsibilities\n\n## Interfaces\n\n## Rules\n\n## References\n`,
  ".opencode/skills/docs-update-validation/references/validation.template.md": `# Validation\n\n## Purpose\n\n## Core Checks\n\n## Adapter Checks\n\n## Evidence Expectations\n`,
  ".opencode/skills/docs-update-validation/references/shared-check-candidates.md": `# Shared Check Candidates\n\n- source-of-truth integrity\n- generated artifact sync\n- link integrity\n- required evidence present\n- adapter-specific file validity\n`
};

const BEST_PRACTICE_PATHS = [
  ".opencode/skills/harness-validation/references/best-practices.md",
  ".opencode/skills/docs-update-integrations/references/best-practices.md",
  ".opencode/skills/docs-update-team-guide/references/best-practices.md",
  ".opencode/skills/docs-update-research/references/best-practices.md",
  ".opencode/skills/task-close/references/best-practices.md",
  ".opencode/skills/docs-update-adr/references/best-practices.md",
  ".opencode/skills/docs-update-patterns/references/best-practices.md",
  ".opencode/skills/task-discovery/references/best-practices.md",
  ".opencode/skills/docs-update-glossary/references/best-practices.md",
  ".opencode/skills/harness-update-project/references/best-practices.md",
  ".opencode/skills/docs-update-spec/references/best-practices.md",
  ".opencode/skills/task-fix/references/best-practices.md",
  ".opencode/skills/task-review/references/best-practices.md",
  ".opencode/skills/task-validation/references/best-practices.md",
  ".opencode/skills/docs-update-validation/references/best-practices.md",
  ".opencode/skills/docs-update-proposal/references/best-practices.md",
  ".opencode/skills/docs-update-tech-stack/references/best-practices.md",
  ".opencode/skills/docs-update-architecture/references/best-practices.md",
  ".opencode/skills/docs-update-requirement/references/best-practices.md",
  ".opencode/skills/task-implementation/references/best-practices.md"
] as const;

const SKILLS: SkillDefinition[] = [
  { name: "task-prepare", description: "Use when you need to capture a new request, define scope, and choose the next owox-driven task flow.", argumentHint: '"goal=<what to prepare> mode=<autonomous|interactive>"', objective: "Turn an incoming request into a concrete task contract and select the right next skill." },
  { name: "task-discovery", description: "Use when discovery, current-state analysis, or impact mapping is the primary goal.", argumentHint: '"goal=<what to learn> mode=<autonomous|interactive>"', objective: "Collect facts, constraints, affected areas, and open questions before implementation or review begins." },
  { name: "task-implementation", description: "Use when implementation is the primary goal and you need to carry work through validation and related source updates.", argumentHint: '"goal=<what to implement> mode=<autonomous|interactive>"', objective: "Implement the requested change while keeping task state, evidence, and source-of-truth updates aligned." },
  { name: "task-fix", description: "Use when bug fixing, failure recovery, or review follow-up is the primary goal.", argumentHint: '"goal=<what to fix> mode=<autonomous|interactive>"', objective: "Diagnose the failure, apply the smallest correct fix, and confirm the regression is covered." },
  { name: "task-review", description: "Use when code, docs, or design review is the primary goal.", argumentHint: '"goal=<what to review> mode=<autonomous|interactive>"', objective: "Review the target artifacts, separate findings from assumptions, and report the highest-risk issues first." },
  { name: "task-validation", description: "Use when verification, acceptance checks, or quality confirmation is the primary goal.", argumentHint: '"goal=<what to validate> mode=<autonomous|interactive>"', objective: "Run the required checks, record evidence, and summarize pass/fail status with residual risk." },
  { name: "task-close", description: "Use when closing a task and organizing outcomes, remaining work, and next actions.", argumentHint: '"goal=<what to close> mode=<autonomous|interactive>"', objective: "Finalize the task record so another agent or human can resume or audit the work cleanly." },
  { name: "harness-init", description: "Use when initializing a project harness or resuming consultative harness setup.", argumentHint: '"scope=<new|existing> mode=<autonomous|interactive>"', objective: "Guide harness initialization decisions and materialize the initial owox-managed artifacts safely." },
  { name: "harness-update-project", description: "Use when updating the canonical .owox project summary to reflect current project facts.", argumentHint: '"goal=<what changed> mode=<autonomous|interactive>"', objective: "Refresh the project summary while preserving the boundary between source docs and generated runtime context." },
  { name: "harness-validation", description: "Use when validating harness layout, naming, references, and responsibility boundaries.", argumentHint: '"scope=<all|skills|tasks|docs> mode=<autonomous|interactive>"', objective: "Check harness integrity and report mismatches before they drift into runtime failures." },
  { name: "harness-create-skill", description: "Use when creating a new English AI-facing skill that routes work through the owox CLI.", argumentHint: '"name=<skill-name> goal=<why it exists>"', objective: "Create a new skill definition and supporting references that match the harness conventions." },
  { name: "docs-update-adr", description: "Use when adding or revising an architecture decision record.", argumentHint: '"goal=<decision to record> path=<target file>"', objective: "Capture the decision, context, tradeoffs, and consequences in the canonical ADR location." },
  { name: "docs-update-architecture", description: "Use when updating project-wide architecture boundaries, invariants, or design policy.", argumentHint: '"goal=<what to update> path=<target file>"', objective: "Keep the architecture source of truth aligned with current system boundaries and invariants." },
  { name: "docs-update-glossary", description: "Use when adding, merging, or normalizing glossary terms.", argumentHint: '"goal=<term change> path=<target file>"', objective: "Keep project terminology consistent and easy to reference from other source documents." },
  { name: "docs-update-integrations", description: "Use when adding or revising external integration documentation.", argumentHint: '"goal=<integration change> path=<target file>"', objective: "Document external API or tool boundaries, assumptions, and constraints in the canonical integration docs." },
  { name: "docs-update-patterns", description: "Use when adding or revising reusable implementation or operation patterns.", argumentHint: '"goal=<pattern change> path=<target file>"', objective: "Capture repeatable patterns so future implementation work stays consistent." },
  { name: "docs-update-proposal", description: "Use when adding or revising a proposal, migration plan, or change plan.", argumentHint: '"goal=<proposal change> path=<target file>"', objective: "Describe a candidate direction clearly enough for review, iteration, and later archival." },
  { name: "docs-update-requirement", description: "Use when adding or revising product or project requirements.", argumentHint: '"goal=<requirement change> path=<target file>"', objective: "Keep the requirement source of truth aligned with current goals and non-negotiable constraints." },
  { name: "docs-update-research", description: "Use when adding or revising technical research or feasibility notes.", argumentHint: '"goal=<research topic> path=<target file>"', objective: "Record investigated facts, constraints, and conclusions that inform later decisions." },
  { name: "docs-update-spec", description: "Use when adding or revising a detailed specification tied to a requirement.", argumentHint: '"goal=<spec change> path=<target file>"', objective: "Describe concrete behavior, contracts, and boundaries in a stable specification format." },
  { name: "docs-update-tech-stack", description: "Use when adding or revising adopted technologies or version policies.", argumentHint: '"goal=<tech-stack change> path=<target file>"', objective: "Keep the canonical technology inventory and version policy current." },
  { name: "docs-update-team-guide", description: "Use when adding or revising team-specific responsibilities, rules, or local knowledge.", argumentHint: '"goal=<team guide change> path=<target file>"', objective: "Document team boundaries and operating rules in the canonical team guide location." },
  { name: "docs-update-validation", description: "Use when adding or revising validation expectations, checks, or evidence rules.", argumentHint: '"goal=<validation change> path=<target file>"', objective: "Keep quality gates and validation expectations aligned with the current workflow." }
];

function renderSkill(definition: SkillDefinition): string {
  const frontmatter = [
    "---",
    `name: ${definition.name}`,
    `description: ${definition.description}`,
    `argument-hint: ${definition.argumentHint}`,
    "---",
    ""
  ].join("\n");

  const body = renderMarkdown("## Purpose", [
    { paragraphs: [definition.objective] },
    {
      heading: "## Read First",
      bullets: [
        "Use `owox artifact-read owox.harness.yaml project.md` for project runtime context.",
        "Use `owox artifact-read owox.harness.yaml tasks/task-current.json` when an active task exists.",
        "Read `docs/project/index.md` and the relevant requirement, spec, ADR, pattern, validation, or team guide for this scope.",
        "Read code and tests directly only when they are part of the current task scope."
      ]
    },
    {
      heading: "## What To Do",
      ordered: [
        "Run `owox validate owox.harness.yaml` before substantial work if the harness state may have changed.",
        "Create or update the task record with `owox task-create`, `owox task-update`, `owox task-set-current`, and `owox task-transition`.",
        "Run `owox task-check-prerequisites` before moving into planning, execution, or done.",
        "Read the relevant source documents and collect only the facts needed for this scope.",
        "Do the skill-specific work, keeping scope, constraints, and evidence explicit in the task file.",
        "When intent or decisions change, persist them with `owox intent-save` and `owox decision-record`.",
        "Run `owox verify` before completion and `owox drift-audit` before closing or handing work back.",
        "Run `owox sync owox.harness.yaml` after changing managed source material that affects generated artifacts."
      ]
    },
    {
      heading: "## Rules",
      bullets: [
        "Keep AI-facing Markdown in English.",
        "Prefer source-of-truth documents over generated artifacts.",
        "Do not skip human gates for risky, architectural, or externally visible changes.",
        "Do not read files under `.owox/` directly; use `owox artifact-read` or another dedicated `owox` command.",
        "Record assumptions, open questions, and residual risk instead of hiding them."
      ]
    },
    {
      heading: "## Checks",
      bullets: [
        "The task state is current in `owox`.",
        "The relevant source documents were consulted.",
        "Required verification and evidence are recorded.",
        "Any follow-up actions or open questions are explicit."
      ]
    }
  ]);

  return `${frontmatter}${body}`;
}

export function renderOpenCodeSkillFiles(): GeneratedFile[] {
  const files: GeneratedFile[] = [
    createGeneratedFile(".opencode/.gitignore", ["node_modules", "package.json", "package-lock.json", "bun.lock", ".gitignore", ""].join("\n")),
    createGeneratedFile(".opencode/package.json", `${JSON.stringify({ dependencies: { "@opencode-ai/plugin": "1.4.0" } }, null, 2)}\n`)
  ];

  Object.entries(SHARED_FILES).forEach(([relativePath, content]) => {
    files.push(createGeneratedFile(relativePath, content));
  });

  SKILLS.forEach((definition) => {
    files.push(createGeneratedFile(`.opencode/skills/${definition.name}/SKILL.md`, renderSkill(definition)));
  });

  Object.entries(TEMPLATE_FILES).forEach(([relativePath, content]) => {
    files.push(createGeneratedFile(relativePath, content));
  });

  BEST_PRACTICE_PATHS.forEach((relativePath) => {
    files.push(createGeneratedFile(relativePath, BEST_PRACTICES));
  });

  return files;
}
