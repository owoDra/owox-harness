import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { HarnessConfig } from "./config.js";
import { renderAdapterFiles, renderAgentsMd, collectRulesFiles } from "./generated-adapters.js";
import { createGeneratedFile, createJsonFile, type GeneratedFile, type SyncResult, type ValidationIssue } from "./generated-file.js";
import { renderMarkdown } from "./markdown.js";

interface DocumentBudget {
  maxTokens: number;
  splitThreshold: number;
  trimOptionalSections: boolean;
}

const ENGLISH_ONLY_AI_MARKDOWN_SINGLES = ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md"] as const;
const ENGLISH_ONLY_AI_MARKDOWN_DIRS = [".opencode", ".claude", ".codex", ".github/agents", ".github/skills", ".owox/handoffs"] as const;
const AI_MARKDOWN_PATTERN = /[ぁ-んァ-ヶ一-龯]/;

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

function containsJapaneseCharacters(content: string): boolean {
  return AI_MARKDOWN_PATTERN.test(content);
}

function renderProjectSummary(config: HarnessConfig): string {
  return renderMarkdown("# Project", [
    { heading: "## Name", paragraphs: [config.project.name] },
    { heading: "## Description", paragraphs: [config.project.description] },
    { heading: "## Locale", paragraphs: [config.project.locale] },
    { heading: "## Profile", paragraphs: [config.project.profile] },
    { heading: "## Source Of Truth", bullets: ["owox.harness.yaml", `${config.source.docsRoot}/`] },
    { heading: "## Managed Outputs", bullets: [`${config.generated.owoxDir}/`, ...collectRulesFiles(config), ...config.adapters.map((adapter) => `${adapter} adapter files`)] }
  ]);
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
    return renderMarkdown("# プロジェクト資料", [{ heading: "## 目的", paragraphs: ["このディレクトリは project の正本を保持します。requirements、specs、adr、patterns、validation をここで管理します。"] }]);
  }

  return renderMarkdown("# Project Docs", [{ heading: "## Purpose", paragraphs: ["This directory stores the project source of truth: requirements, specs, ADRs, patterns, and validation documents."] }]);
}

function renderGlossary(config: HarnessConfig): string {
  if (config.project.locale === "ja") {
    return renderMarkdown("# コア用語集", [{ heading: "## owox", paragraphs: ["AI-assisted workflow harness runtime and generators."] }]);
  }

  return renderMarkdown("# Core Glossary", [{ heading: "## owox", paragraphs: ["AI-assisted workflow harness runtime and generators."] }]);
}

function renderSimpleDoc(title: string, purpose: string): string {
  return renderMarkdown(title, [{ paragraphs: [purpose] }]);
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
  return content.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trimEnd().concat("\n");
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
    return [createGeneratedFile(relativePath, compactMarkdown(content))];
  }

  const partFiles: GeneratedFile[] = [];
  const linkLines: string[] = ["# Split Document", "", `This document was split to stay under the configured token budget of ${maxTokens}.`, ""];
  const extensionIndex = relativePath.lastIndexOf(".");
  const base = extensionIndex >= 0 ? relativePath.slice(0, extensionIndex) : relativePath;
  const ext = extensionIndex >= 0 ? relativePath.slice(extensionIndex) : ".md";

  chunks.forEach((chunk, index) => {
    const partPath = `${base}.part-${index + 1}${ext}`;
    partFiles.push(createGeneratedFile(partPath, compactMarkdown(chunk)));
    linkLines.push(`- [Part ${index + 1}](${partPath.split("/").at(-1)})`);
  });

  return [createGeneratedFile(relativePath, `${linkLines.join("\n")}\n`), ...partFiles];
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

function renderBaseFiles(config: HarnessConfig): GeneratedFile[] {
  return [
    createGeneratedFile(`${config.generated.owoxDir}/project.md`, renderProjectSummary(config)),
    createGeneratedFile(`${config.generated.taskDir}/task-template.json`, renderTaskTemplate(config)),
    createJsonFile(`${config.generated.owoxDir}/intents/intent-template.json`, { intentId: "intent-template", userGoal: "", successImage: "", nonGoals: [], mustKeep: [], tradeoffs: [], openQuestions: [], decisionPolicy: "ask_when_ambiguous", approvalPolicy: "human_gate_for_risky_changes", requiredDocs: [], confirmedDocs: [] }),
    createGeneratedFile(`${config.generated.owoxDir}/decisions/ledger.json`, "[]\n"),
    createGeneratedFile(`${config.source.docsRoot}/index.md`, renderDocsIndex(config), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/glossary/core.md`, renderGlossary(config), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/requirements/index.md`, renderSimpleDoc("# Requirements", "Track project goals and scope here."), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/specs/index.md`, renderSimpleDoc("# Specs", "Describe concrete behavior and contracts here."), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/adr/index.md`, renderSimpleDoc("# ADRs", "Record important architectural decisions here."), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/patterns/index.md`, renderSimpleDoc("# Patterns", "Track reusable implementation and operation patterns here."), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/architecture.md`, renderSimpleDoc("# Architecture", "Describe the system boundaries and invariants here."), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/tech-stack.md`, renderSimpleDoc("# Tech Stack", "Capture adopted technologies and version policies here."), "if_missing"),
    createGeneratedFile(`${config.source.docsRoot}/validation.md`, renderSimpleDoc("# Validation", "List the validation expectations and checks here."), "if_missing")
  ];
}

export function renderGeneratedFiles(config: HarnessConfig): GeneratedFile[] {
  const files = renderBaseFiles(config);
  if (config.adapters.includes("codex") || config.adapters.includes("opencode")) {
    files.push(createGeneratedFile("AGENTS.md", renderAgentsMd(config)));
  }
  files.push(...renderAdapterFiles(config));
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

async function collectEnglishOnlyAiMarkdownIssues(rootDir: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  for (const relativePath of ENGLISH_ONLY_AI_MARKDOWN_SINGLES) {
    const current = await readIfExists(resolve(rootDir, relativePath));
    if (current !== null && containsJapaneseCharacters(current)) {
      issues.push({ path: relativePath, code: "mismatch", message: `${relativePath} must be English-only AI markdown` });
    }
  }

  for (const relativeDir of ENGLISH_ONLY_AI_MARKDOWN_DIRS) {
    const markdownFiles = await collectMarkdownFiles(rootDir, relativeDir);
    for (const relativePath of markdownFiles) {
      const current = await readIfExists(resolve(rootDir, relativePath));
      if (current !== null && containsJapaneseCharacters(current)) {
        issues.push({ path: relativePath, code: "mismatch", message: `${relativePath} must be English-only AI markdown` });
      }
    }
  }

  return issues;
}

export async function validateGeneratedFiles(rootDir: string, config: HarnessConfig): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  for (const file of renderGeneratedFiles(config)) {
    const absolutePath = resolve(rootDir, file.relativePath);
    const current = await readIfExists(absolutePath);

    if (current === null) {
      issues.push({ path: file.relativePath, code: "missing", message: `${file.relativePath} is missing` });
      continue;
    }

    if (file.mode === "managed" && current !== file.content) {
      issues.push({ path: file.relativePath, code: "mismatch", message: `${file.relativePath} does not match generated output` });
    }

    if (isManagedDocumentPath(config, file.relativePath)) {
      const budget = getDocumentBudget(config, file.relativePath);
      const tokenCount = estimateTokenCount(current);
      if (tokenCount > budget.maxTokens) {
        issues.push({ path: file.relativePath, code: "token_limit", message: `${file.relativePath} exceeds token budget (${tokenCount} > ${budget.maxTokens})` });
      }
    }
  }

  issues.push(...(await collectEnglishOnlyAiMarkdownIssues(rootDir)));
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
        issues.push({ path: relativePath, code: "mismatch", message: `${relativePath} links to missing document: ${target}` });
      }
    }
  }

  return issues;
}

export { estimateTokenCount };
export type { GeneratedFile, SyncResult, ValidationIssue };
