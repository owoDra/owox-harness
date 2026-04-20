import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { HarnessConfig } from "./config.js";

export interface GeneratedFile {
  relativePath: string;
  content: string;
  mode: "managed" | "if_missing";
}

export interface SyncResult {
  written: string[];
  unchanged: string[];
  createdIfMissing: string[];
}

export interface ValidationIssue {
  path: string;
  code: "missing" | "mismatch" | "token_limit";
  message: string;
}

const englishOnlyAiMarkdownSingles = ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md"] as const;
const englishOnlyAiMarkdownDirs = [".opencode", ".claude", ".codex", ".github/agents", ".github/skills", ".owox/handoffs"] as const;

function containsJapaneseCharacters(content: string): boolean {
  return /[ぁ-んァ-ヶ一-龯]/.test(content);
}

async function collectMarkdownFiles(rootDir: string, relativeDir: string): Promise<string[]> {
  const absoluteDir = resolve(rootDir, relativeDir);
  try {
    const entries = await readdir(absoluteDir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const relativePath = `${relativeDir}/${entry.name}`;
      if (entry.isDirectory()) {
        files.push(...(await collectMarkdownFiles(rootDir, relativePath)));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(relativePath);
      }
    }
    return files;
  } catch {
    return [];
  }
}

interface DocumentBudget {
  maxTokens: number;
  splitThreshold: number;
  trimOptionalSections: boolean;
}

function renderAgentsMd(config: HarnessConfig): string {
  return [
    "## Read First",
    "",
    `1. \`${config.generated.owoxDir}/project.md\``,
    `2. Target \`${config.generated.taskDir}/task-*.md\` and \`${config.generated.taskDir}/task-current.json\` when needed`,
    `3. \`${config.source.docsRoot}/index.md\` when needed`,
    "",
    "## Working Rules",
    "",
    `- Prefer \`owox.harness.yaml\` and \`${config.source.docsRoot}/\` as source of truth`,
    "- Do not treat generated artifacts as hand-edited source",
    "- Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, `owox task-check-prerequisites`, and `owox validate` when starting task work",
    "- Run `owox verify` before task completion",
    "- Use `owox intent-save` and `owox decision-record` for intent and decision artifacts",
    "- Run `owox drift-audit` before declaring completion",
    "- Check `owox gate` for risky actions, design changes, external impact, and completion decisions",
    "- Use `owox sync` to regenerate managed artifacts",
    ""
  ].join("\n");
}

function collectRulesFiles(config: HarnessConfig): string[] {
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

function renderAgentsProject(config: HarnessConfig): string {
  return [
    "# Project",
    "",
    "## Name",
    config.project.name,
    "",
    "## Description",
    config.project.description,
    "",
    "## Locale",
    config.project.locale,
    "",
    "## Profile",
    config.project.profile,
    "",
    "## Source Of Truth",
    "- owox.harness.yaml",
    `- ${config.source.docsRoot}/`,
    "",
    "## Managed Outputs",
    `- ${config.generated.owoxDir}/`,
    ...collectRulesFiles(config).map((path) => `- ${path}`),
    ...config.adapters.map((adapter) => `- ${adapter} adapter files`),
    ""
  ].join("\n");
}

function renderTaskTemplate(config: HarnessConfig): string {
  return `${JSON.stringify(
    {
      intentId: "task-template",
      intentSummary: "Describe the user goal and must-keep constraints.",
      taskId: "task-template",
      title: "",
      objective: "",
      scope: [],
      outOfScope: [],
      acceptanceCriteria: [],
      requiredDocs: [],
      confirmedDocs: [],
      currentState: "intake",
      requiredDecisions: [],
      resolvedDecisions: [],
      requiredChecks: config.taskDefaults.requiredChecks,
      humanGate: "none",
      attachedEvidence: [],
      references: config.taskDefaults.references,
      activityLog: []
    },
    null,
    2
  )}\n`;
}

function renderDocsIndex(config: HarnessConfig): string {
  if (config.project.locale === "ja") {
    return [
      "# プロジェクト資料",
      "",
      "## 目的",
      "",
      "このディレクトリは project の正本を保持します。requirements、specs、adr、patterns、validation をここで管理します。",
      ""
    ].join("\n");
  }

  return [
    "# Project Docs",
    "",
    "## Purpose",
    "",
    "This directory stores the project source of truth: requirements, specs, ADRs, patterns, and validation documents.",
    ""
  ].join("\n");
}

function renderGlossary(config: HarnessConfig): string {
  if (config.project.locale === "ja") {
    return ["# コア用語集", "", "## owox", "AI-assisted workflow harness runtime and generators.", ""].join("\n");
  }

  return ["# Core Glossary", "", "## owox", "AI-assisted workflow harness runtime and generators.", ""].join("\n");
}

function renderSimpleDoc(title: string, purpose: string): string {
  return [title, "", purpose, ""].join("\n");
}

function renderCodexFiles(config: HarnessConfig): GeneratedFile[] {
  return [
    {
      relativePath: ".codex/config.toml",
      mode: "managed",
      content: [
        "[project]",
        `name = "${config.project.name}"`,
        "",
        "[owox]",
        "config = \"owox.harness.yaml\"",
        "skill = \".codex/skills/owox/SKILL.md\"",
        ""
      ].join("\n")
    },
    {
      relativePath: ".codex/skills/owox/SKILL.md",
      mode: "managed",
      content: [
        "# Skill: owox workflow",
        "",
        "- Run `owox validate owox.harness.yaml` before substantial work.",
        "- Use `owox task-create`, `owox task-update`, `owox task-set-current`, `owox task-transition`, and `owox task-check-prerequisites` to manage task state.",
        "- Use `owox intent-save` and `owox decision-record` to keep hidden artifacts current.",
        "- Run `owox verify` before completion.",
        "- Run `owox drift-audit` before completion.",
        "- Use `owox sync` after source changes.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".codex/hooks/pre-tool.sh",
      mode: "managed",
      content: [
        "#!/usr/bin/env bash",
        "set -eu",
        "owox validate owox.harness.yaml >/dev/null",
        `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json planning >/dev/null; fi`,
        ""
      ].join("\n")
    },
    {
      relativePath: ".codex/hooks/post-edit.sh",
      mode: "managed",
      content: [
        "#!/usr/bin/env bash",
        "set -eu",
        `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json done >/dev/null; fi`,
        `if [ -f "${config.generated.taskDir}/task-current.json" ] && [ -f "checks.json" ]; then owox verify owox.harness.yaml ${config.generated.taskDir}/task-current.json checks.json --acceptance >/dev/null; fi`,
        `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox drift-audit owox.harness.yaml ${config.generated.taskDir}/task-current.json >/dev/null; fi`,
        ""
      ].join("\n")
    }
  ];
}

function renderClaudeFiles(config: HarnessConfig): GeneratedFile[] {
  return [
    {
      relativePath: "CLAUDE.md",
      mode: "managed",
      content: [
        "# CLAUDE",
        "",
        "Use `owox` for deterministic workflow actions.",
        "",
        "- `owox validate owox.harness.yaml`",
        "- `owox task-create` / `owox task-update` / `owox task-set-current` / `owox task-transition`",
        "- `owox task-check-prerequisites`",
        "- `owox intent-save` / `owox decision-record`",
        "- `owox verify`",
        "- `owox drift-audit`",
        "- `owox sync`",
        ""
      ].join("\n")
    },
    {
      relativePath: ".claude/settings.json",
      mode: "managed",
      content: `${JSON.stringify({ owoxConfig: "owox.harness.yaml", taskDir: config.generated.taskDir }, null, 2)}\n`
    },
    {
      relativePath: ".claude/agents/owox.md",
      mode: "managed",
      content: [
        "# owox agent",
        "",
        "This agent routes deterministic workflow operations through the `owox` CLI.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".claude/subagents/discovery.md",
      mode: "managed",
      content: [
        "# discovery subagent",
        "",
        "Use this subagent for scoped discovery and report back through owox handoff/report flows.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".claude/subagents/implementation.md",
      mode: "managed",
      content: [
        "# implementation subagent",
        "",
        "Use this subagent for bounded implementation tasks after a parent handoff is prepared.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".claude/hooks/pre-command.sh",
      mode: "managed",
      content: [
        "#!/usr/bin/env bash",
        "set -eu",
        "owox validate owox.harness.yaml >/dev/null",
        `if [ -f "${config.generated.taskDir}/task-current.json" ]; then owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json planning >/dev/null; fi`,
        ""
      ].join("\n")
    }
  ];
}

function renderOpenCodeFiles(config: HarnessConfig): GeneratedFile[] {
  return [
    {
      relativePath: ".opencode/agents/owox.md",
      mode: "managed",
      content: [
        "# owox agent",
        "",
        "Use this agent for task orchestration, prerequisite checks, verification, handoff, sync, and validation.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".opencode/commands/owox-task.md",
      mode: "managed",
      content: [
        "Run `owox task-create`, `owox task-update`, `owox task-set-current`, and `owox task-transition` for task lifecycle changes.",
        "Run `owox task-check-prerequisites` before moving to planning, executing, or done.",
        "Run `owox intent-save` and `owox decision-record` when intent or decisions change.",
        "Run `owox verify` before declaring completion.",
        "Run `owox drift-audit` before declaring completion.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".opencode/plugins/owox.json",
      mode: "managed",
      content: `${JSON.stringify(
        {
          name: "owox-plugin",
          hooks: {
            preTool: `owox validate owox.harness.yaml && (test ! -f ${config.generated.taskDir}/task-current.json || owox task-check-prerequisites owox.harness.yaml ${config.generated.taskDir}/task-current.json planning)`,
            postEdit: "owox sync owox.harness.yaml"
          }
        },
        null,
        2
      )}\n`
    },
    {
      relativePath: ".opencode/agents/discovery.md",
      mode: "managed",
      content: [
        "# discovery agent",
        "",
        "Use for structured discovery, then return facts and open questions.",
        ""
      ].join("\n")
    }
  ];
}

function renderCopilotFiles(): GeneratedFile[] {
  return [
    {
      relativePath: ".github/copilot-instructions.md",
      mode: "managed",
      content: [
        "# Copilot Instructions",
        "",
        "Prefer `owox` commands for task workflow, validation, sync, and handoff.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".github/agents/owox.agent.md",
      mode: "managed",
      content: [
        "# owox custom agent",
        "",
        "Use this agent when deterministic workflow control is needed.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".github/skills/owox/SKILL.md",
      mode: "managed",
      content: [
        "# Skill: owox workflow",
        "",
        "- Validate before work.",
        "- Manage tasks through `owox task-create`, `owox task-update`, `owox task-set-current`, and `owox task-transition`.",
        "- Check prerequisites through `owox task-check-prerequisites`.",
        "- Persist intent and decisions through `owox intent-save` and `owox decision-record`.",
        "- Audit drift through `owox drift-audit`.",
        "- Regenerate managed files through `owox sync`.",
        ""
      ].join("\n")
    },
    {
      relativePath: ".github/hooks/pre-command.sh",
      mode: "managed",
      content: [
        "#!/usr/bin/env bash",
        "set -eu",
        "owox validate owox.harness.yaml >/dev/null",
        "if [ -f \".owox/tasks/task-current.json\" ]; then owox task-check-prerequisites owox.harness.yaml .owox/tasks/task-current.json planning >/dev/null; fi",
        ""
      ].join("\n")
    },
    {
      relativePath: ".github/plugins/owox/plugin.json",
      mode: "managed",
      content: `${JSON.stringify(
        {
          name: "owox-plugin",
          agents: [".github/agents/owox.agent.md"],
          skills: [".github/skills/owox/SKILL.md"],
          hooks: [".github/hooks/pre-command.sh"]
        },
        null,
        2
      )}\n`
    }
  ];
}

function estimateTokenCount(content: string): number {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return 0;
  }

  const wordLike = normalized.split(/\s+/).filter(Boolean).length;
  const cjkLike = (normalized.match(/[ぁ-んァ-ヶ一-龯]/g) ?? []).length;
  return Math.max(wordLike, Math.ceil((normalized.length - cjkLike) / 4) + cjkLike);
}

function isManagedDocumentPath(config: HarnessConfig, relativePath: string): boolean {
  if (!relativePath.endsWith(".md")) {
    return false;
  }

  return config.contentBudgets.documents.managedPaths.some((pattern) =>
    pattern.endsWith("/") ? relativePath.startsWith(pattern) : relativePath === pattern
  );
}

function getDocumentBudget(config: HarnessConfig, relativePath: string): DocumentBudget {
  const override = config.contentBudgets.documents.overrides.find((item) => {
    if (item.path && item.path === relativePath) {
      return true;
    }
    if (item.pathPrefix && relativePath.startsWith(item.pathPrefix)) {
      return true;
    }
    return false;
  });

  return {
    maxTokens: override?.maxTokens ?? config.contentBudgets.documents.defaultMaxTokens,
    splitThreshold: config.contentBudgets.documents.splitThreshold,
    trimOptionalSections: config.contentBudgets.documents.trimOptionalSections
  };
}

function compactMarkdown(content: string): string {
  return content
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trimEnd()
    .concat("\n");
}

function splitMarkdownIntoChunks(content: string): string[] {
  const lines = content.split("\n");
  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") && current.length > 0) {
      chunks.push(current.join("\n").trim());
      current = [line];
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) {
    chunks.push(current.join("\n").trim());
  }

  return chunks.filter(Boolean);
}

function splitChunkByBudget(content: string, maxTokens: number): string[] {
  const lines = content.split("\n");
  const parts: string[] = [];
  let current: string[] = [];

  const pushLineWithBudget = (line: string) => {
    if (estimateTokenCount(line) <= maxTokens) {
      current.push(line);
      return;
    }

    const segments = line.split(/\s+/).filter(Boolean);
    let segmentBuffer: string[] = [];
    for (const segment of segments) {
      const candidate = [...segmentBuffer, segment].join(" ");
      if (segmentBuffer.length > 0 && estimateTokenCount(candidate) > maxTokens) {
        parts.push(segmentBuffer.join(" ").trim());
        segmentBuffer = [segment];
        continue;
      }
      segmentBuffer.push(segment);
    }
    if (segmentBuffer.length > 0) {
      parts.push(segmentBuffer.join(" ").trim());
    }
  };

  for (const line of lines) {
    const candidate = [...current, line].join("\n").trim();
    if (current.length > 0 && estimateTokenCount(candidate) > maxTokens) {
      parts.push(current.join("\n").trim());
      current = [];
      pushLineWithBudget(line);
      continue;
    }
    if (estimateTokenCount(line) > maxTokens) {
      if (current.length > 0) {
        parts.push(current.join("\n").trim());
        current = [];
      }
      pushLineWithBudget(line);
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) {
    parts.push(current.join("\n").trim());
  }

  return parts.filter(Boolean);
}

function splitDocument(relativePath: string, content: string, maxTokens: number): GeneratedFile[] {
  const chunks = splitMarkdownIntoChunks(content).flatMap((chunk) => splitChunkByBudget(chunk, maxTokens));
  if (chunks.length <= 1) {
    return [
      {
        relativePath,
        mode: "managed",
        content: compactMarkdown(content)
      }
    ];
  }

  const partFiles: GeneratedFile[] = [];
  const linkLines: string[] = ["# Split Document", "", `This document was split to stay under the configured token budget of ${maxTokens}.`, ""];
  const extensionIndex = relativePath.lastIndexOf(".");
  const base = extensionIndex >= 0 ? relativePath.slice(0, extensionIndex) : relativePath;
  const ext = extensionIndex >= 0 ? relativePath.slice(extensionIndex) : ".md";

  chunks.forEach((chunk, index) => {
    const partPath = `${base}.part-${index + 1}${ext}`;
    const partContent = compactMarkdown(chunk);
    partFiles.push({
      relativePath: partPath,
      mode: "managed",
      content: partContent
    });
    linkLines.push(`- [Part ${index + 1}](${partPath.split("/").at(-1)})`);
  });

  return [
    {
      relativePath,
      mode: "managed",
      content: `${linkLines.join("\n")}\n`
    },
    ...partFiles
  ];
}

function enforceDocumentBudget(config: HarnessConfig, files: GeneratedFile[]): GeneratedFile[] {
  const result: GeneratedFile[] = [];

  for (const file of files) {
    if (!isManagedDocumentPath(config, file.relativePath)) {
      result.push(file);
      continue;
    }

    const budget = getDocumentBudget(config, file.relativePath);
    const compacted = budget.trimOptionalSections ? compactMarkdown(file.content) : file.content;
    const tokenCount = estimateTokenCount(compacted);

    if (tokenCount <= budget.maxTokens) {
      result.push({ ...file, content: compacted });
      continue;
    }

    if (tokenCount > budget.splitThreshold) {
      result.push(...splitDocument(file.relativePath, compacted, budget.maxTokens));
      continue;
    }

    result.push({ ...file, content: compacted });
  }

  return result;
}

export function renderGeneratedFiles(config: HarnessConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { relativePath: `${config.generated.owoxDir}/project.md`, mode: "managed", content: renderAgentsProject(config) },
    { relativePath: `${config.generated.taskDir}/task-template.json`, mode: "managed", content: renderTaskTemplate(config) },
    { relativePath: `${config.generated.owoxDir}/intents/intent-template.json`, mode: "managed", content: `${JSON.stringify({ intentId: "intent-template", userGoal: "", successImage: "", nonGoals: [], mustKeep: [], tradeoffs: [], openQuestions: [], decisionPolicy: "ask_when_ambiguous", approvalPolicy: "human_gate_for_risky_changes", requiredDocs: [], confirmedDocs: [] }, null, 2)}\n` },
    { relativePath: `${config.generated.owoxDir}/decisions/ledger.json`, mode: "managed", content: "[]\n" },
    { relativePath: `${config.source.docsRoot}/index.md`, mode: "if_missing", content: renderDocsIndex(config) },
    { relativePath: `${config.source.docsRoot}/glossary/core.md`, mode: "if_missing", content: renderGlossary(config) },
    { relativePath: `${config.source.docsRoot}/requirements/index.md`, mode: "if_missing", content: renderSimpleDoc("# Requirements", "Track project goals and scope here.") },
    { relativePath: `${config.source.docsRoot}/specs/index.md`, mode: "if_missing", content: renderSimpleDoc("# Specs", "Describe concrete behavior and contracts here.") },
    { relativePath: `${config.source.docsRoot}/adr/index.md`, mode: "if_missing", content: renderSimpleDoc("# ADRs", "Record important architectural decisions here.") },
    { relativePath: `${config.source.docsRoot}/patterns/index.md`, mode: "if_missing", content: renderSimpleDoc("# Patterns", "Track reusable implementation and operation patterns here.") },
    { relativePath: `${config.source.docsRoot}/architecture.md`, mode: "if_missing", content: renderSimpleDoc("# Architecture", "Describe the system boundaries and invariants here.") },
    { relativePath: `${config.source.docsRoot}/tech-stack.md`, mode: "if_missing", content: renderSimpleDoc("# Tech Stack", "Capture adopted technologies and version policies here.") },
    { relativePath: `${config.source.docsRoot}/validation.md`, mode: "if_missing", content: renderSimpleDoc("# Validation", "List the validation expectations and checks here.") }
  ];

  if (config.adapters.includes("codex") || config.adapters.includes("opencode")) {
    files.push({ relativePath: "AGENTS.md", mode: "managed", content: renderAgentsMd(config) });
  }

  if (config.adapters.includes("codex")) {
    files.push(...renderCodexFiles(config));
  }

  if (config.adapters.includes("claude-code")) {
    files.push(...renderClaudeFiles(config));
  }

  if (config.adapters.includes("opencode")) {
    files.push(...renderOpenCodeFiles(config));
  }

  if (config.adapters.includes("copilot-cli")) {
    files.push(...renderCopilotFiles());
  }

  return enforceDocumentBudget(config, files);
}

async function readIfExists(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function syncGeneratedFiles(rootDir: string, config: HarnessConfig): Promise<SyncResult> {
  const written: string[] = [];
  const unchanged: string[] = [];
  const createdIfMissing: string[] = [];

  for (const file of renderGeneratedFiles(config)) {
    const absolutePath = resolve(rootDir, file.relativePath);
    const current = await readIfExists(absolutePath);

    if (file.mode === "if_missing" && current !== null) {
      unchanged.push(file.relativePath);
      continue;
    }

    if (current === file.content) {
      unchanged.push(file.relativePath);
      continue;
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");

    if (file.mode === "if_missing" && current === null) {
      createdIfMissing.push(file.relativePath);
    } else {
      written.push(file.relativePath);
    }
  }

  return { written, unchanged, createdIfMissing };
}

export async function validateGeneratedFiles(rootDir: string, config: HarnessConfig): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  for (const file of renderGeneratedFiles(config)) {
    const absolutePath = resolve(rootDir, file.relativePath);
    const current = await readIfExists(absolutePath);

    if (current === null) {
      issues.push({
        path: file.relativePath,
        code: "missing",
        message: `${file.relativePath} is missing`
      });
      continue;
    }

    if (file.mode === "managed" && current !== file.content) {
      issues.push({
        path: file.relativePath,
        code: "mismatch",
        message: `${file.relativePath} does not match generated output`
      });
    }

    if (isManagedDocumentPath(config, file.relativePath)) {
      const budget = getDocumentBudget(config, file.relativePath);
      const tokenCount = estimateTokenCount(current);
      if (tokenCount > budget.maxTokens) {
        issues.push({
          path: file.relativePath,
          code: "token_limit",
          message: `${file.relativePath} exceeds token budget (${tokenCount} > ${budget.maxTokens})`
        });
      }
    }
  }

  for (const relativePath of englishOnlyAiMarkdownSingles) {
    const current = await readIfExists(resolve(rootDir, relativePath));
    if (current !== null && containsJapaneseCharacters(current)) {
      issues.push({
        path: relativePath,
        code: "mismatch",
        message: `${relativePath} must be English-only AI markdown`
      });
    }
  }

  for (const relativeDir of englishOnlyAiMarkdownDirs) {
    const markdownFiles = await collectMarkdownFiles(rootDir, relativeDir);
    for (const relativePath of markdownFiles) {
      const current = await readIfExists(resolve(rootDir, relativePath));
      if (current !== null && containsJapaneseCharacters(current)) {
        issues.push({
          path: relativePath,
          code: "mismatch",
          message: `${relativePath} must be English-only AI markdown`
        });
      }
    }
  }

  return issues;
}

export async function validateProjectDocs(rootDir: string, config: HarnessConfig): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const requiredPaths = [
    `${config.source.docsRoot}/index.md`,
    `${config.source.docsRoot}/requirements/index.md`,
    `${config.source.docsRoot}/specs/index.md`,
    `${config.source.docsRoot}/adr/index.md`,
    `${config.source.docsRoot}/patterns/index.md`,
    `${config.source.docsRoot}/validation.md`
  ];

  for (const relativePath of requiredPaths) {
    const current = await readIfExists(resolve(rootDir, relativePath));
    if (current === null) {
      issues.push({ path: relativePath, code: "missing", message: `${relativePath} is missing` });
    }
  }

  const markdownFiles = await collectMarkdownFiles(rootDir, config.source.docsRoot);
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const relativePath of markdownFiles) {
    const content = await readIfExists(resolve(rootDir, relativePath));
    if (!content) {
      continue;
    }
    const matches = [...content.matchAll(linkPattern)];
    for (const match of matches) {
      const target = match[1];
      if (!target || target.startsWith("http://") || target.startsWith("https://") || target.startsWith("#")) {
        continue;
      }
      const absoluteTarget = resolve(rootDir, dirname(relativePath), target);
      const linked = await readIfExists(absoluteTarget);
      if (linked === null) {
        issues.push({
          path: relativePath,
          code: "mismatch",
          message: `${relativePath} links to missing document: ${target}`
        });
      }
    }
  }

  return issues;
}

export { estimateTokenCount };
