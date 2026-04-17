import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";
import type { HarnessConfig } from "./config.js";
import { createDefaultHarnessConfig, getConfigPath, loadHarnessConfig, saveHarnessConfig } from "./config.js";
import { syncGeneratedFiles, validateGeneratedFiles } from "./generation.js";
import { resolveSuggestionProvider } from "./suggestion-provider.js";

const initModeSchema = z.enum(["new_project", "existing_project"]);
const initStateSchema = z.enum([
  "draft",
  "scanning",
  "collecting_context",
  "suggesting",
  "awaiting_human_decision",
  "materializing",
  "validating",
  "done",
  "blocked"
]);
const referenceClassificationSchema = z.enum(["source_of_truth", "reference_only", "archive", "ignore"]);

const repoFactSchema = z.object({
  repoShape: z.enum(["single", "monorepo"]),
  detectedFiles: z.array(z.string()),
  packageManagers: z.array(z.string()),
  runtimes: z.array(z.string()),
  scripts: z.array(z.string()),
  docs: z.array(z.string()),
  existingCliConfigs: z.array(z.string()),
  hasLegacyHarnessArtifacts: z.boolean(),
  inferredLocale: z.enum(["ja", "en"]),
  inferredInitMode: initModeSchema
});

const referenceDocumentSchema = z.object({
  path: z.string(),
  kind: z.string(),
  classification: referenceClassificationSchema,
  summary: z.string(),
  selectedForMaterialization: z.boolean()
});

const suggestionSchema = z.object({
  topic: z.string(),
  recommended: z.string(),
  alternatives: z.array(z.string()),
  reasons: z.array(z.string()),
  risks: z.array(z.string()),
  openQuestions: z.array(z.string())
});

const decisionSetSchema = z.object({
  initMode: initModeSchema.optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  locale: z.enum(["ja", "en"]).optional(),
  profile: z.string().min(1).optional(),
  adapters: z.array(z.enum(["codex", "claude-code", "opencode", "copilot-cli"])).optional(),
  sourceOfTruthPolicy: z.enum(["reuse_existing_docs", "create_fresh_docs", "hybrid"] as const).optional(),
  managedArtifactsPolicy: z.enum(["safe_minimum", "full_generation"] as const).optional(),
  selectedReferences: z.array(z.string()).optional(),
  requiredChecks: z.array(z.string()).optional()
});

const initSessionSchema = z.object({
  sessionId: z.string(),
  currentState: initStateSchema,
  rootDir: z.string(),
  visibleLocale: z.enum(["ja", "en"]),
  initMode: initModeSchema.optional(),
  repoFacts: repoFactSchema.nullable(),
  referenceDocuments: z.array(referenceDocumentSchema),
  suggestions: z.array(suggestionSchema),
  pendingDecisions: z.array(z.string()),
  confirmedDecisions: decisionSetSchema,
  updatedAt: z.string()
});

export type InitMode = z.infer<typeof initModeSchema>;
export type InitState = z.infer<typeof initStateSchema>;
export type ReferenceDocument = z.infer<typeof referenceDocumentSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type DecisionSet = z.infer<typeof decisionSetSchema>;
export type RepoFacts = z.infer<typeof repoFactSchema>;
export type InitSession = z.infer<typeof initSessionSchema>;

export interface StartInitSessionInput {
  rootDir: string;
  visibleLocale?: "ja" | "en" | undefined;
  name?: string | undefined;
  description?: string | undefined;
}

export interface MaterializeResult {
  configPath: string;
  generatedIssues: string[];
}

export interface InitDecisionTemplate {
  pendingDecisions: string[];
  recommendedValues: DecisionSet;
  suggestions: Array<Pick<Suggestion, "topic" | "recommended" | "openQuestions">>;
  selectedReferences: string[];
}

export interface InitSessionValidationIssue {
  code: "missing_session" | "missing_repo_facts" | "missing_decision" | "incomplete_confirmation";
  message: string;
}

const REQUIRED_DECISION_KEYS = [
  "initMode",
  "name",
  "locale",
  "profile",
  "adapters",
  "sourceOfTruthPolicy",
  "managedArtifactsPolicy"
] as const;

export function getInitSessionPath(rootDir: string): string {
  return resolve(rootDir, ".owox/init-session.json");
}

function nowIso(): string {
  return new Date().toISOString();
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function listTopLevel(rootDir: string): Promise<string[]> {
  try {
    const entries = await readdir(rootDir, { withFileTypes: true });
    return entries.map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name)).sort();
  } catch {
    return [];
  }
}

function inferLocale(readme: string | null): "ja" | "en" {
  if (!readme) {
    return "en";
  }

  return /[ぁ-んァ-ヶ一-龯]/.test(readme) ? "ja" : "en";
}

function summarizeReference(path: string): string {
  if (path.startsWith("docs/project/")) {
    return "Existing project source document";
  }
  if (path === "README.md") {
    return "Repository overview";
  }
  if (path === "AGENTS.md") {
    return "Existing agent rules file";
  }
  return "Detected project document";
}

async function summarizeReferenceFromContent(rootDir: string, path: string): Promise<string> {
  const content = await readTextIfExists(resolve(rootDir, path));
  if (!content) {
    return summarizeReference(path);
  }

  const heading = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("#") || line.length > 0);

  if (!heading) {
    return summarizeReference(path);
  }

  return heading.replace(/^#+\s*/, "").slice(0, 120);
}

function classifyReference(path: string): ReferenceDocument["classification"] {
  if (path.startsWith("docs/project/")) {
    return "source_of_truth";
  }
  if (path === "README.md" || path === "docs/architecture.md" || path === "docs/README.md") {
    return "reference_only";
  }
  if (path.startsWith("docs/archive/") || path.includes("archive")) {
    return "archive";
  }
  if (path === "AGENTS.md" || path.startsWith(".agents/")) {
    return "reference_only";
  }
  return "ignore";
}

async function collectReferenceDocuments(rootDir: string): Promise<ReferenceDocument[]> {
  const discoveredDocs: string[] = [];
  const queue = ["docs", ".agents"];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const absolute = resolve(rootDir, current);
    if (!(await pathExists(absolute))) {
      continue;
    }
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries) {
      const relative = `${current}/${entry.name}`.replace(/^\.\//, "");
      if (entry.isDirectory()) {
        queue.push(relative);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        discoveredDocs.push(relative);
      }
    }
  }

  const candidates = ["README.md", "AGENTS.md", ...discoveredDocs].sort();

  const references: ReferenceDocument[] = [];

  for (const candidate of candidates) {
    if (await pathExists(resolve(rootDir, candidate))) {
      const classification = classifyReference(candidate);
      references.push({
        path: candidate,
        kind: candidate.endsWith(".md") ? "markdown" : "file",
        classification,
        summary: await summarizeReferenceFromContent(rootDir, candidate),
        selectedForMaterialization: classification === "source_of_truth"
      });
    }
  }

  return references;
}

async function loadExistingConfigIfAny(rootDir: string): Promise<HarnessConfig | undefined> {
  const configPath = getConfigPath(rootDir);
  if (!(await pathExists(configPath))) {
    return undefined;
  }
  try {
    return await loadHarnessConfig(configPath);
  } catch {
    return undefined;
  }
}

export async function scanRepoFacts(rootDir: string): Promise<RepoFacts> {
  const topLevel = await listTopLevel(rootDir);
  const readme = await readTextIfExists(resolve(rootDir, "README.md"));
  const packageJsonText = await readTextIfExists(resolve(rootDir, "package.json"));
  const packageJson = packageJsonText ? (JSON.parse(packageJsonText) as { scripts?: Record<string, string> }) : null;

  const packageManagers: string[] = [];
  if (await pathExists(resolve(rootDir, "pnpm-lock.yaml")) || await pathExists(resolve(rootDir, "pnpm-workspace.yaml"))) {
    packageManagers.push("pnpm");
  }
  if (await pathExists(resolve(rootDir, "package-lock.json"))) {
    packageManagers.push("npm");
  }
  if (await pathExists(resolve(rootDir, "yarn.lock"))) {
    packageManagers.push("yarn");
  }

  const runtimes: string[] = [];
  if (await pathExists(resolve(rootDir, "package.json"))) {
    runtimes.push("node");
  }
  if (await pathExists(resolve(rootDir, "pyproject.toml"))) {
    runtimes.push("python");
  }
  if (await pathExists(resolve(rootDir, "Cargo.toml"))) {
    runtimes.push("rust");
  }
  if (await pathExists(resolve(rootDir, "go.mod"))) {
    runtimes.push("go");
  }

  const docs = topLevel.filter((entry) => entry.startsWith("docs") || entry === "README.md");
  const hasLegacyHarnessArtifacts = (await pathExists(resolve(rootDir, ".agents/project.md"))) || (await pathExists(resolve(rootDir, "AGENTS.md")));
  const repoShape = (await pathExists(resolve(rootDir, "pnpm-workspace.yaml"))) || topLevel.includes("packages/") ? "monorepo" : "single";
  const inferredInitMode: InitMode = topLevel.length === 0 || topLevel.every((entry) => entry === ".git/" || entry === ".owox/")
    ? "new_project"
    : "existing_project";

  return {
    repoShape,
    detectedFiles: [
      ...(await Promise.all(
        [
          "package.json",
          "pnpm-workspace.yaml",
          "turbo.json",
          "tsconfig.json",
          "pyproject.toml",
          "Cargo.toml",
          "go.mod",
          "README.md",
          "docs/project/index.md",
          "AGENTS.md",
          ".agents/project.md",
          "CLAUDE.md",
          "opencode.json",
          ".github/copilot-instructions.md",
          ".codex/config.toml"
        ].map(async (candidate) => ((await pathExists(resolve(rootDir, candidate))) ? candidate : null))
      ))
    ].filter((value): value is string => value !== null),
    packageManagers,
    runtimes,
    scripts: packageJson?.scripts ? Object.keys(packageJson.scripts).sort() : [],
    docs,
    existingCliConfigs: [
      ...(await Promise.all(
        ["AGENTS.md", "CLAUDE.md", "opencode.json", ".github/copilot-instructions.md", ".codex/config.toml"].map(
          async (candidate) => ((await pathExists(resolve(rootDir, candidate))) ? candidate : null)
        )
      ))
    ].filter((value): value is string => value !== null),
    hasLegacyHarnessArtifacts,
    inferredLocale: inferLocale(readme),
    inferredInitMode
  };
}

function defaultPendingDecisions(): string[] {
  return [
    "initMode",
    "name",
    "locale",
    "profile",
    "adapters",
    "sourceOfTruthPolicy",
    "managedArtifactsPolicy"
  ];
}

export async function createInitSession(input: StartInitSessionInput): Promise<InitSession> {
  const session: InitSession = {
    sessionId: `init-${Date.now()}`,
    currentState: "draft",
    rootDir: input.rootDir,
    visibleLocale: input.visibleLocale ?? "en",
    repoFacts: null,
    referenceDocuments: [],
    suggestions: [],
    pendingDecisions: defaultPendingDecisions(),
    confirmedDecisions: {
      name: input.name,
      description: input.description
    },
    updatedAt: nowIso()
  };

  await saveInitSession(getInitSessionPath(input.rootDir), session);
  return session;
}

export async function loadInitSession(sessionPath: string): Promise<InitSession> {
  const raw = await readFile(sessionPath, "utf8");
  return initSessionSchema.parse(JSON.parse(raw));
}

export async function saveInitSession(sessionPath: string, session: InitSession): Promise<void> {
  await mkdir(dirname(sessionPath), { recursive: true });
  await writeFile(sessionPath, `${JSON.stringify(session, null, 2)}\n`, "utf8");
}

export async function runInitScan(sessionPath: string): Promise<InitSession> {
  const session = await loadInitSession(sessionPath);
  const repoFacts = await scanRepoFacts(session.rootDir);
  const referenceDocuments = await collectReferenceDocuments(session.rootDir);

  const nextSession: InitSession = {
    ...session,
    currentState: "collecting_context",
    initMode: repoFacts.inferredInitMode,
    repoFacts,
    referenceDocuments,
    updatedAt: nowIso()
  };

  await saveInitSession(sessionPath, nextSession);
  return nextSession;
}

export async function runInitSuggest(sessionPath: string): Promise<InitSession> {
  const session = await loadInitSession(sessionPath);

  if (!session.repoFacts) {
    throw new Error("scan must run before suggest");
  }

  const existingConfig = await loadExistingConfigIfAny(session.rootDir);
  const provider = resolveSuggestionProvider(existingConfig);
  const suggestions: Suggestion[] = await provider.generate({
    rootDir: session.rootDir,
    repoFacts: session.repoFacts,
    session,
    config: existingConfig
  });

  const inferredName = session.confirmedDecisions.name ?? suggestions.find((item) => item.topic === "name")?.recommended ?? session.rootDir.split("/").filter(Boolean).at(-1) ?? "project";
  const inferredLocale = session.confirmedDecisions.locale ?? (suggestions.find((item) => item.topic === "locale")?.recommended as "ja" | "en" | undefined) ?? session.repoFacts.inferredLocale;
  const inferredProfile = session.confirmedDecisions.profile ?? suggestions.find((item) => item.topic === "profile")?.recommended ?? "web";
  const inferredAdapters = session.confirmedDecisions.adapters ?? (suggestions.find((item) => item.topic === "adapters")?.recommended.split(",").map((value) => value.trim()).filter(Boolean) as HarnessConfig["adapters"]) ?? ["codex", "claude-code", "opencode", "copilot-cli"];
  const sourcePolicy = (session.confirmedDecisions.sourceOfTruthPolicy ?? suggestions.find((item) => item.topic === "source_of_truth_policy")?.recommended ?? "hybrid") as "reuse_existing_docs" | "create_fresh_docs" | "hybrid";

  const confirmedDecisions: DecisionSet = {
    ...session.confirmedDecisions,
    initMode: session.confirmedDecisions.initMode ?? session.repoFacts.inferredInitMode,
    name: inferredName,
    locale: inferredLocale,
    profile: inferredProfile,
    adapters: inferredAdapters,
    sourceOfTruthPolicy: session.confirmedDecisions.sourceOfTruthPolicy ?? sourcePolicy,
    managedArtifactsPolicy: session.confirmedDecisions.managedArtifactsPolicy ?? "safe_minimum",
    selectedReferences:
      session.confirmedDecisions.selectedReferences ??
      session.referenceDocuments.filter((document) => document.selectedForMaterialization).map((document) => document.path),
    requiredChecks: session.confirmedDecisions.requiredChecks ?? ["pnpm validate", "pnpm build"]
  };

  const nextSession: InitSession = {
    ...session,
    currentState: "awaiting_human_decision",
    suggestions,
    confirmedDecisions,
    pendingDecisions: defaultPendingDecisions().filter((key) => !confirmedDecisions[key as keyof DecisionSet]),
    updatedAt: nowIso()
  };

  await saveInitSession(sessionPath, nextSession);
  return nextSession;
}

export async function runInitConfirm(sessionPath: string, decisions: DecisionSet): Promise<InitSession> {
  const session = await loadInitSession(sessionPath);
  const confirmedDecisions: DecisionSet = {
    ...session.confirmedDecisions,
    ...decisions
  };

  const nextSession: InitSession = {
    ...session,
    currentState: "awaiting_human_decision",
    confirmedDecisions,
    pendingDecisions: defaultPendingDecisions().filter((key) => !confirmedDecisions[key as keyof DecisionSet]),
    updatedAt: nowIso()
  };

  await saveInitSession(sessionPath, nextSession);
  return nextSession;
}

function assertDecisionsComplete(decisions: DecisionSet): asserts decisions is Required<Pick<DecisionSet, typeof REQUIRED_DECISION_KEYS[number]>> & DecisionSet {
  for (const key of REQUIRED_DECISION_KEYS) {
    if (!decisions[key]) {
      throw new Error(`required decision is missing: ${key}`);
    }
  }
}

export async function validateInitSession(sessionPath: string): Promise<InitSessionValidationIssue[]> {
  if (!(await pathExists(sessionPath))) {
    return [];
  }

  const session = await loadInitSession(sessionPath);
  const issues: InitSessionValidationIssue[] = [];

  if (session.currentState !== "draft" && session.repoFacts === null) {
    issues.push({ code: "missing_repo_facts", message: "repo facts are required after scan begins" });
  }

  for (const key of REQUIRED_DECISION_KEYS) {
    if (session.currentState === "materializing" || session.currentState === "validating" || session.currentState === "done") {
      if (!session.confirmedDecisions[key]) {
        issues.push({ code: "missing_decision", message: `required decision is missing: ${key}` });
      }
    }
  }

  if (session.currentState === "awaiting_human_decision" && session.pendingDecisions.length === 0 && session.suggestions.length === 0) {
    issues.push({ code: "incomplete_confirmation", message: "awaiting_human_decision must retain suggestions or pending decisions" });
  }

  return issues;
}

export async function runInitMaterialize(sessionPath: string): Promise<MaterializeResult> {
  const session = await loadInitSession(sessionPath);
  assertDecisionsComplete(session.confirmedDecisions);
  const decisions = session.confirmedDecisions as Required<Pick<DecisionSet, typeof REQUIRED_DECISION_KEYS[number]>> & DecisionSet;

  const config = createDefaultHarnessConfig({
    rootDir: session.rootDir,
    name: decisions.name!,
    description: decisions.description,
    locale: decisions.locale!,
    profile: decisions.profile!,
    adapters: decisions.adapters!
  });

  config.init.mode = decisions.initMode!;
  config.init.sourceOfTruthPolicy = decisions.sourceOfTruthPolicy!;
  config.init.managedArtifactsPolicy = decisions.managedArtifactsPolicy!;
  config.taskDefaults.requiredChecks = decisions.requiredChecks ?? config.taskDefaults.requiredChecks;
  config.taskDefaults.references = decisions.selectedReferences ?? [];

  const configPath = getConfigPath(session.rootDir);
  await saveHarnessConfig(configPath, config);
  await syncGeneratedFiles(session.rootDir, config);
  const issues = await validateGeneratedFiles(session.rootDir, config);

  const nextSession: InitSession = {
    ...session,
    currentState: issues.length === 0 ? "done" : "blocked",
    updatedAt: nowIso()
  };

  await saveInitSession(sessionPath, nextSession);

  return {
    configPath,
    generatedIssues: issues.map((issue) => issue.message)
  };
}

export async function runInitResume(sessionPath: string): Promise<InitSession> {
  return loadInitSession(sessionPath);
}

export function buildDecisionTemplate(session: InitSession): InitDecisionTemplate {
  return {
    pendingDecisions: session.pendingDecisions,
    recommendedValues: session.confirmedDecisions,
    suggestions: session.suggestions.map((item) => ({
      topic: item.topic,
      recommended: item.recommended,
      openQuestions: item.openQuestions
    })),
    selectedReferences: session.referenceDocuments.filter((item) => item.selectedForMaterialization).map((item) => item.path)
  };
}

export function renderInitSummary(session: InitSession): { facts: string[]; decisions: string[] } {
  const facts = session.repoFacts
    ? [
        `repo_shape=${session.repoFacts.repoShape}`,
        `init_mode=${session.repoFacts.inferredInitMode}`,
        `locale=${session.repoFacts.inferredLocale}`,
        `runtimes=${session.repoFacts.runtimes.join(",") || "none"}`,
        `package_managers=${session.repoFacts.packageManagers.join(",") || "none"}`
      ]
    : [];

  const decisions = Object.entries(session.confirmedDecisions)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(",") : String(value)}`);

  return { facts, decisions };
}
