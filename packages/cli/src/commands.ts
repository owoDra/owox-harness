import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize, resolve } from "node:path";
import {
  appendActivity,
  appendEvidence,
  createTask,
  evaluateDriftAudit,
  evaluateGate,
  evaluateGuard,
  evaluatePrerequisites,
  evaluateVerify,
  resolveHumanGate,
  transitionTask,
  updateTask,
  type CheckResult,
  type CreateChildToParentInput,
  type CreateParentToChildInput,
  type CreateTaskInput,
  type DecisionRecord,
  type EvidenceRecord,
  type GateInput,
  type GuardInput,
  type IntentData,
  type TaskPatch,
  type TaskState,
  type TransitionContext
} from "@owox-harness/core";
import type { HarnessConfig, InitConfigInput } from "./config.js";
import {
  createDefaultHarnessConfig,
  findConfigPath,
  getConfigPath,
  getRootDirFromConfigPath,
  loadHarnessConfig,
  saveHarnessConfig
} from "./config.js";
import { syncGeneratedFiles, validateGeneratedFiles, validateProjectDocs } from "./generation.js";
import {
  buildChildToParentMarkdown,
  buildChildToParentPacket,
  buildParentToChildMarkdown,
  buildParentToChildPacket,
  writeHandoff
} from "./handoff.js";
import {
  buildDecisionTemplate,
  createInitSession,
  getInitSessionPath,
  renderInitSummary,
  runInitConfirm,
  runInitMaterialize,
  runInitResume,
  runInitScan,
  runInitSuggest,
  validateInitSession,
  type DecisionSet,
  type StartInitSessionInput
} from "./init-workflow.js";
import { getMessages } from "./messages.js";
import {
  appendDecisionRecord,
  listOwoxArtifacts,
  loadDecisionLedger,
  loadIntent,
  readOwoxArtifact,
  saveDriftAudit,
  saveIntent,
  validateRuntimeArtifacts
} from "./runtime-artifacts.js";
import { loadTaskFile, saveTaskFile } from "./task-file.js";

export interface CommandResult<T> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface TaskSaveInput {
  patch?: TaskPatch;
  evidence?: EvidenceInput | EvidenceInput[];
  log?: string | string[];
  gateResolution?: string;
  nextState?: TaskState;
  intent?: IntentData;
  decisions?: DecisionInput[];
  setCurrent?: boolean;
}

export interface EvidenceInput {
  id?: string;
  kind?: EvidenceRecord["kind"];
  summary: string;
  createdAt?: string;
}

export interface DecisionInput {
  decisionId?: string;
  relatedIntentId?: string;
  question: string;
  options: string[];
  chosenOption: string;
  rationale: string;
  decidedBy?: string;
  timestamp?: string;
  revisitCondition?: string;
}

type ReadScope = "runtime" | "docs" | "all";

interface ResolvedTarget {
  kind: "runtime" | "docs";
  displayPath: string;
  absolutePath: string;
  runtimePath?: string;
}

async function resolveConfigPath(configPath?: string): Promise<string> {
  return configPath ?? findConfigPath();
}

async function loadConfigAndMessages(configPath?: string) {
  const resolvedConfigPath = await resolveConfigPath(configPath);
  const config = await loadHarnessConfig(resolvedConfigPath);
  return { config, messages: getMessages(config.project.locale), configPath: resolvedConfigPath };
}

async function resolveTaskPath(configPath: string, config: HarnessConfig, taskPath?: string, fallbackTaskId?: string): Promise<string> {
  if (taskPath) {
    return taskPath;
  }
  if (fallbackTaskId) {
    return join(getRootDirFromConfigPath(configPath), config.generated.taskDir, `${fallbackTaskId}.json`);
  }
  return join(getRootDirFromConfigPath(configPath), config.generated.taskDir, "task-current.json");
}

function toEvidenceRecord(input: EvidenceInput, index = 0): EvidenceRecord {
  const summarySlug = input.summary.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "evidence";
  return {
    id: input.id ?? `ev-${Date.now()}-${index}-${summarySlug}`,
    kind: input.kind ?? "manual",
    summary: input.summary,
    createdAt: input.createdAt ?? new Date().toISOString()
  };
}

function toDecisionRecord(input: DecisionInput, task: { intentId: string }, index = 0): DecisionRecord {
  return {
    decisionId: input.decisionId ?? `decision-${Date.now()}-${index + 1}`,
    relatedIntentId: input.relatedIntentId ?? task.intentId,
    question: input.question,
    options: input.options,
    chosenOption: input.chosenOption,
    rationale: input.rationale,
    decidedBy: input.decidedBy ?? "agent",
    timestamp: input.timestamp ?? new Date().toISOString(),
    revisitCondition: input.revisitCondition
  };
}

function ensureInsideRoot(rootDir: string, candidatePath: string, label: string): string {
  const absoluteRoot = resolve(rootDir);
  const absoluteCandidate = resolve(candidatePath);
  if (absoluteCandidate !== absoluteRoot && !absoluteCandidate.startsWith(`${absoluteRoot}/`)) {
    throw new Error(`${label} must stay inside the repository root`);
  }
  return absoluteCandidate;
}

function resolveDocsPath(rootDir: string, config: HarnessConfig, target: string): ResolvedTarget {
  const normalizedTarget = normalize(target).replace(/^\/+/, "");
  const relativePath = normalizedTarget.startsWith(`${config.source.docsRoot}/`)
    ? normalizedTarget
    : normalizedTarget.startsWith("docs/")
      ? `${config.source.docsRoot}/${normalizedTarget.slice("docs/".length)}`
      : `${config.source.docsRoot}/${normalizedTarget}`;
  return {
    kind: "docs",
    displayPath: relativePath,
    absolutePath: ensureInsideRoot(rootDir, resolve(rootDir, relativePath), "docs target")
  };
}

function resolveReadableTarget(rootDir: string, config: HarnessConfig, target: string): ResolvedTarget {
  const normalizedTarget = normalize(target).replace(/^\/+/, "");
  if (["project", "project.md"].includes(normalizedTarget)) {
    return {
      kind: "runtime",
      displayPath: ".owox/project.md",
      absolutePath: ensureInsideRoot(rootDir, resolve(rootDir, config.generated.owoxDir, "project.md"), "runtime target"),
      runtimePath: "project.md"
    };
  }
  if (["task", "task-current", "tasks/task-current.json"].includes(normalizedTarget)) {
    return {
      kind: "runtime",
      displayPath: `${config.generated.taskDir}/task-current.json`,
      absolutePath: ensureInsideRoot(rootDir, resolve(rootDir, config.generated.taskDir, "task-current.json"), "runtime target"),
      runtimePath: "tasks/task-current.json"
    };
  }
  if (["docs", "index", "docs/index", "docs/index.md"].includes(normalizedTarget)) {
    return resolveDocsPath(rootDir, config, "index.md");
  }
  if (normalizedTarget.startsWith("tasks/") || normalizedTarget.startsWith("intents/") || normalizedTarget.startsWith("decisions/") || normalizedTarget.startsWith("handoffs/") || normalizedTarget === "project.md") {
    return {
      kind: "runtime",
      displayPath: `${config.generated.owoxDir}/${normalizedTarget}`,
      absolutePath: ensureInsideRoot(rootDir, resolve(rootDir, config.generated.owoxDir, normalizedTarget), "runtime target"),
      runtimePath: normalizedTarget
    };
  }
  if (normalizedTarget.startsWith(`${config.generated.owoxDir}/`)) {
    const runtimePath = normalizedTarget.slice(config.generated.owoxDir.length + 1);
    return {
      kind: "runtime",
      displayPath: normalizedTarget,
      absolutePath: ensureInsideRoot(rootDir, resolve(rootDir, normalizedTarget), "runtime target"),
      runtimePath
    };
  }
  return resolveDocsPath(rootDir, config, normalizedTarget);
}

async function collectDocsFiles(rootDir: string, config: HarnessConfig): Promise<string[]> {
  const docsRoot = resolve(rootDir, config.source.docsRoot);

  async function walk(currentDir: string, relativeDir: string): Promise<string[]> {
    const entries = await readdir(currentDir, { withFileTypes: true });
    const results: string[] = [];
    for (const entry of entries) {
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const absolutePath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        results.push(...(await walk(absolutePath, relativePath)));
      } else if (entry.isFile()) {
        results.push(`${config.source.docsRoot}/${relativePath}`);
      }
    }
    return results;
  }

  try {
    return (await walk(docsRoot, "")).sort();
  } catch {
    return [];
  }
}

export async function runHarnessInit(input: InitConfigInput): Promise<CommandResult<{ configPath: string }>> {
  const configPath = getConfigPath(input.rootDir);
  const config = createDefaultHarnessConfig(input);

  await mkdir(input.rootDir, { recursive: true });
  await saveHarnessConfig(configPath, config);
  await syncGeneratedFiles(input.rootDir, config);
  const issues = await validateGeneratedFiles(input.rootDir, config);

  if (issues.length > 0) {
    return {
      ok: false,
      message: config.project.locale === "ja" ? "harness-init 後の validate に失敗しました。" : "Post-init validation failed.",
      data: { configPath }
    };
  }

  return {
    ok: true,
    message: config.project.locale === "ja" ? "harness-init が完了しました。" : "harness-init completed.",
    data: { configPath }
  };
}

export async function runHarnessInitStart(input: StartInitSessionInput) {
  const session = await createInitSession(input);
  return {
    ok: true,
    message: input.visibleLocale === "ja" ? "init session を作成しました。" : "Init session created.",
    data: { sessionPath: getInitSessionPath(input.rootDir), session }
  } satisfies CommandResult<{ sessionPath: string; session: Awaited<ReturnType<typeof createInitSession>> }>;
}

export async function runHarnessInitScan(sessionPath: string) {
  const session = await runInitScan(sessionPath);
  const summary = renderInitSummary(session);
  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "repo scan を完了しました。" : "Repository scan completed.",
    data: { session, summary }
  } satisfies CommandResult<{ session: typeof session; summary: typeof summary }>;
}

export async function runHarnessInitSuggest(sessionPath: string) {
  const session = await runInitSuggest(sessionPath);
  const summary = renderInitSummary(session);
  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "suggestion を更新しました。" : "Suggestions updated.",
    data: { session, summary }
  } satisfies CommandResult<{ session: typeof session; summary: typeof summary }>;
}

export async function runHarnessInitConfirm(sessionPath: string, decisions: DecisionSet) {
  const session = await runInitConfirm(sessionPath, decisions);
  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "決定事項を反映しました。" : "Decisions confirmed.",
    data: session
  } satisfies CommandResult<typeof session>;
}

export async function runHarnessInitMaterialize(sessionPath: string) {
  const session = await runInitResume(sessionPath);
  const result = await runInitMaterialize(sessionPath);
  return {
    ok: result.generatedIssues.length === 0,
    message:
      session.visibleLocale === "ja"
        ? result.generatedIssues.length === 0
          ? "init session から source と generated artifacts を出力しました。"
          : "materialize 後の validate に失敗しました。"
        : result.generatedIssues.length === 0
          ? "Materialized source and generated artifacts from init session."
          : "Validation failed after materialize.",
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runHarnessInitResume(sessionPath: string) {
  const session = await runInitResume(sessionPath);
  const summary = renderInitSummary(session);
  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "init session を再開しました。" : "Init session resumed.",
    data: { session, summary }
  } satisfies CommandResult<{ session: typeof session; summary: typeof summary }>;
}

export async function runHarnessInitTemplate(sessionPath: string, outputPath: string) {
  const session = await runInitResume(sessionPath);
  const template = buildDecisionTemplate(session);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "decision template を出力しました。" : "Decision template written.",
    data: { outputPath, template }
  } satisfies CommandResult<{ outputPath: string; template: typeof template }>;
}

export async function runSync(configPath?: string) {
  const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const result = await syncGeneratedFiles(rootDir, config);
  return {
    ok: true,
    message: config.project.locale === "ja" ? "generated artifacts を同期しました。" : "Generated artifacts synced.",
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runArtifactRead(artifactPath: string, configPath?: string): Promise<CommandResult<{ artifactPath: string; content: string }>> {
  try {
    const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const content = await readOwoxArtifact(rootDir, config, artifactPath);
    return { ok: true, message: "Artifact read.", data: { artifactPath, content } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "artifact read failed" };
  }
}

export async function runArtifactList(configPath?: string): Promise<CommandResult<{ artifacts: string[] }>> {
  try {
    const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const artifacts = await listOwoxArtifacts(rootDir, config);
    return { ok: true, message: "Artifacts listed.", data: { artifacts } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "artifact list failed" };
  }
}

export async function runRead(target: string, configPath?: string): Promise<CommandResult<{ target: string; content: string }>> {
  try {
    const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const resolvedTarget = resolveReadableTarget(rootDir, config, target);
    const content = resolvedTarget.kind === "runtime" && resolvedTarget.runtimePath ? await readOwoxArtifact(rootDir, config, resolvedTarget.runtimePath) : await readFile(resolvedTarget.absolutePath, "utf8");
    return { ok: true, message: "Content read.", data: { target: resolvedTarget.displayPath, content } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "read failed" };
  }
}

export async function runList(scope: ReadScope = "all", configPath?: string): Promise<CommandResult<{ scope: ReadScope; entries: string[] }>> {
  try {
    const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const entries: string[] = [];
    if (scope === "all" || scope === "runtime") {
      entries.push(...(await listOwoxArtifacts(rootDir, config)).map((entry) => `${config.generated.owoxDir}/${entry}`));
    }
    if (scope === "all" || scope === "docs") {
      entries.push(...(await collectDocsFiles(rootDir, config)));
    }
    return { ok: true, message: "Entries listed.", data: { scope, entries: entries.sort() } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "list failed" };
  }
}

export async function runSearch(query: string, scope: ReadScope = "all", configPath?: string): Promise<CommandResult<{ scope: ReadScope; query: string; matches: Array<{ path: string; line: number; content: string }> }>> {
  try {
    const listResult = await runList(scope, configPath);
    if (!listResult.ok || !listResult.data) {
      return { ok: false, message: listResult.message };
    }

    const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const matches: Array<{ path: string; line: number; content: string }> = [];
    const normalizedQuery = query.toLowerCase();

    for (const entry of listResult.data.entries) {
      const target = resolveReadableTarget(rootDir, config, entry);
      const content = target.kind === "runtime" && target.runtimePath ? await readOwoxArtifact(rootDir, config, target.runtimePath) : await readFile(target.absolutePath, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(normalizedQuery)) {
          matches.push({ path: target.displayPath, line: index + 1, content: line });
        }
      });
      if (matches.length >= 100) {
        break;
      }
    }

    return { ok: true, message: "Search completed.", data: { scope, query, matches } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "search failed" };
  }
}

export async function runWrite(target: string, inputPath: string, configPath?: string): Promise<CommandResult<{ target: string }>> {
  try {
    const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const resolvedTarget = resolveReadableTarget(rootDir, config, target);
    const content = await readFile(inputPath, "utf8");
    await mkdir(dirname(resolvedTarget.absolutePath), { recursive: true });
    await writeFile(resolvedTarget.absolutePath, content, "utf8");
    if (resolvedTarget.kind === "docs") {
      await syncGeneratedFiles(rootDir, config);
    }
    return { ok: true, message: "Content written.", data: { target: resolvedTarget.displayPath } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "write failed" };
  }
}

export async function runValidate(configPath?: string): Promise<CommandResult<{ config: HarnessConfig; issues: string[] }>> {
  try {
    const resolvedConfigPath = await resolveConfigPath(configPath);
    const config = await loadHarnessConfig(resolvedConfigPath);
    const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
    const issues = await validateGeneratedFiles(rootDir, config);
    const projectDocIssues = await validateProjectDocs(rootDir, config);
    const initIssues = await validateInitSession(getInitSessionPath(rootDir));
    const runtimeIssues = await validateRuntimeArtifacts(rootDir, config);
    const allIssues = [...issues.map((issue) => issue.message), ...projectDocIssues.map((issue) => issue.message), ...initIssues.map((issue) => issue.message), ...runtimeIssues];

    if (allIssues.length > 0) {
      return { ok: false, message: getMessages(config.project.locale).validateFailed, data: { config, issues: allIssues } };
    }

    return { ok: true, message: getMessages(config.project.locale).validatePassed, data: { config, issues: [] } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "unknown validation error" };
  }
}

export async function runTaskCreate(input: CreateTaskInput, taskPath?: string, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath, input.taskId);
  const requiredDocs = input.requiredDocs ?? input.references ?? [];
  const confirmedDocs = input.confirmedDocs ?? requiredDocs;
  const task = createTask({
    ...input,
    requiredDocs,
    confirmedDocs,
    requiredChecks: input.requiredChecks ?? config.taskDefaults.requiredChecks,
    references: input.references ?? config.taskDefaults.references
  });

  await mkdir(dirname(resolvedTaskPath), { recursive: true });
  await saveTaskFile(resolvedTaskPath, task);
  await saveIntent(rootDir, config, {
    intentId: task.intentId,
    userGoal: task.intentSummary || task.objective,
    successImage: task.acceptanceCriteria.join("; "),
    nonGoals: task.outOfScope,
    mustKeep: [],
    tradeoffs: [],
    openQuestions: [],
    decisionPolicy: "ask_when_ambiguous",
    approvalPolicy: task.humanGate === "required" ? "human_gate_required" : "auto_with_guard",
    requiredDocs,
    confirmedDocs
  });

  return { ok: true, message: messages.taskCreated, data: task } satisfies CommandResult<typeof task>;
}

export async function runTaskUpdate(patch: TaskPatch, taskPath?: string, configPath?: string) {
  const { messages, config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const nextTask = updateTask(task, patch);
  await saveTaskFile(resolvedTaskPath, nextTask);
  return { ok: true, message: messages.taskUpdated, data: nextTask } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskSetCurrent(taskPath: string, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const task = await loadTaskFile(taskPath);
  const currentPath = join(rootDir, config.generated.taskDir, "task-current.json");
  await mkdir(dirname(currentPath), { recursive: true });
  await saveTaskFile(currentPath, task);
  return { ok: true, message: messages.taskUpdated, data: { currentPath, task } } satisfies CommandResult<{ currentPath: string; task: typeof task }>;
}

export async function runTaskTransition(nextState: TaskState, taskPath?: string, context: TransitionContext = {}, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const prerequisite = evaluatePrerequisites({ task, nextState, intent: await loadIntent(rootDir, config, task.intentId), decisions: await loadDecisionLedger(rootDir, config) });

  if (prerequisite.decision === "deny") {
    return { ok: false, message: messages.prerequisiteBlocked, data: prerequisite } satisfies CommandResult<typeof prerequisite>;
  }
  if (prerequisite.decision === "ask") {
    return { ok: false, message: messages.gateRequired, data: prerequisite } satisfies CommandResult<typeof prerequisite>;
  }

  const nextTask = transitionTask(task, nextState, context);
  await saveTaskFile(resolvedTaskPath, nextTask);
  return { ok: true, message: messages.taskTransitioned, data: nextTask } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskEvidence(evidence: EvidenceRecord | EvidenceRecord[], taskPath?: string, configPath?: string) {
  const { messages, config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const nextTask = appendEvidence(task, evidence);
  await saveTaskFile(resolvedTaskPath, nextTask);
  return { ok: true, message: messages.taskEvidenceAdded, data: nextTask } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskLog(entry: string, taskPath?: string, configPath?: string) {
  const { messages, config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const nextTask = appendActivity(task, entry);
  await saveTaskFile(resolvedTaskPath, nextTask);
  return { ok: true, message: messages.taskUpdated, data: nextTask } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskResolveGate(summary: string, taskPath?: string, configPath?: string) {
  const { messages, config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const nextTask = resolveHumanGate(task, summary);
  await saveTaskFile(resolvedTaskPath, nextTask);
  return { ok: true, message: messages.gateResolved, data: nextTask } satisfies CommandResult<typeof nextTask>;
}

export async function runIntentSave(intent: IntentData, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const path = await saveIntent(rootDir, config, intent);
  return { ok: true, message: messages.intentSaved, data: { path, intent } } satisfies CommandResult<{ path: string; intent: IntentData }>;
}

export async function runDecisionRecord(decision: DecisionRecord, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const path = await appendDecisionRecord(rootDir, config, decision);
  return { ok: true, message: messages.decisionRecorded, data: { path, decision } } satisfies CommandResult<{ path: string; decision: DecisionRecord }>;
}

export async function runTaskCheckPrerequisites(nextState: TaskState, taskPath?: string, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const result = evaluatePrerequisites({ task, nextState, intent: await loadIntent(rootDir, config, task.intentId), decisions: await loadDecisionLedger(rootDir, config) });
  return {
    ok: result.decision === "allow",
    message: result.decision === "allow" ? messages.prerequisiteAllow : result.decision === "ask" ? messages.gateRequired : messages.prerequisiteBlocked,
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runDriftAudit(taskPath?: string, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const result = evaluateDriftAudit({ task, intent: await loadIntent(rootDir, config, task.intentId), decisions: await loadDecisionLedger(rootDir, config) });
  const path = await saveDriftAudit(rootDir, config, task.taskId, result);
  return { ok: result.status === "pass", message: result.status === "pass" ? messages.driftPass : messages.driftFail, data: { path, ...result } } satisfies CommandResult<{ path: string; status: string; findings: typeof result.findings }>;
}

export async function runVerify(checkResults: CheckResult[], acceptanceSatisfied = false, intentSatisfied = acceptanceSatisfied, taskPath?: string, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const result = evaluateVerify({ task, checkResults, acceptanceSatisfied, intentSatisfied });
  const message = result.status === "pass" ? messages.verifyPass : result.status === "fail" ? messages.verifyFail : messages.verifyBlocked;
  return { ok: result.status === "pass", message, data: { ...result, locale: config.project.locale } } satisfies CommandResult<{ status: string; executionStatus: string; intentStatus: string; reasons: string[]; locale: HarnessConfig["project"]["locale"] }>;
}

export async function runGuard(input: GuardInput, configPath?: string) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const result = evaluateGuard({ ...input, protectedPaths: input.protectedPaths ?? config.policies.protectedPaths, deniedActions: input.deniedActions ?? config.policies.deniedActions, askActions: input.askActions ?? config.policies.askActions });
  const message = result.decision === "allow" ? messages.guardAllow : result.decision === "ask" ? messages.guardAsk : messages.guardDeny;
  return { ok: result.decision === "allow", message, data: result } satisfies CommandResult<typeof result>;
}

export async function runGate(input: GateInput, configPath?: string) {
  const { messages } = await loadConfigAndMessages(configPath);
  const result = evaluateGate(input);
  const message = result.status === "not_required" ? messages.gateNotRequired : result.status === "required" ? messages.gateRequired : messages.gateResolved;
  return { ok: result.status !== "required", message, data: result } satisfies CommandResult<typeof result>;
}

export async function runHandoffParentToChild(outputPath: string, input: CreateParentToChildInput = {}, taskPath?: string, configPath?: string) {
  const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const packet = buildParentToChildPacket(task, input);
  const content = buildParentToChildMarkdown(config, task, input);
  const packetPath = join(rootDir, config.generated.owoxDir, "handoffs", `${task.taskId}-parent-to-child.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeHandoff(outputPath, content);
  await mkdir(dirname(packetPath), { recursive: true });
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  return { ok: true, message: config.project.locale === "ja" ? "handoff を出力しました。" : "Handoff written.", data: { outputPath, packetPath } } satisfies CommandResult<{ outputPath: string; packetPath: string }>;
}

export async function runHandoffChildToParent(outputPath: string, input: CreateChildToParentInput, taskPath?: string, configPath?: string) {
  const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  const packet = buildChildToParentPacket(task, input);
  const content = buildChildToParentMarkdown(config, task, input);
  const packetPath = join(rootDir, config.generated.owoxDir, "handoffs", `${task.taskId}-child-to-parent.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeHandoff(outputPath, content);
  await mkdir(dirname(packetPath), { recursive: true });
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  return { ok: true, message: config.project.locale === "ja" ? "report を出力しました。" : "Report written.", data: { outputPath, packetPath } } satisfies CommandResult<{ outputPath: string; packetPath: string }>;
}

export async function runTaskNew(input: CreateTaskInput, taskPath?: string, configPath?: string) {
  const result = await runTaskCreate(input, taskPath, configPath);
  if (!result.ok) {
    return result;
  }

  const resolvedConfigPath = await resolveConfigPath(configPath);
  const { config } = await loadConfigAndMessages(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath, input.taskId);
  await runTaskSetCurrent(resolvedTaskPath, resolvedConfigPath);
  return result;
}

export async function runTaskSave(input: TaskSaveInput, taskPath?: string, configPath?: string) {
  const { config, messages, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  let task = await loadTaskFile(resolvedTaskPath);

  if (input.patch) {
    task = updateTask(task, input.patch);
  }
  if (input.evidence) {
    const evidence = Array.isArray(input.evidence) ? input.evidence : [input.evidence];
    task = appendEvidence(task, evidence.map((item, index) => toEvidenceRecord(item, index)));
  }
  const logEntries = input.log ? (Array.isArray(input.log) ? input.log : [input.log]) : [];
  for (const entry of logEntries) {
    task = appendActivity(task, entry);
  }
  if (input.gateResolution) {
    task = resolveHumanGate(task, input.gateResolution);
  }
  if (input.intent) {
    await saveIntent(getRootDirFromConfigPath(resolvedConfigPath), config, input.intent);
  }
  if (input.decisions?.length) {
    for (const [index, decision] of input.decisions.entries()) {
      await appendDecisionRecord(getRootDirFromConfigPath(resolvedConfigPath), config, toDecisionRecord(decision, task, index));
    }
  }
  if (input.nextState) {
    const prerequisite = evaluatePrerequisites({
      task,
      nextState: input.nextState,
      intent: await loadIntent(getRootDirFromConfigPath(resolvedConfigPath), config, task.intentId),
      decisions: await loadDecisionLedger(getRootDirFromConfigPath(resolvedConfigPath), config)
    });
    if (prerequisite.decision !== "allow") {
      return {
        ok: false,
        message: prerequisite.decision === "ask" ? messages.gateRequired : messages.prerequisiteBlocked,
        data: prerequisite
      } satisfies CommandResult<typeof prerequisite>;
    }
    task = transitionTask(task, input.nextState, {});
  }

  await saveTaskFile(resolvedTaskPath, task);
  if (input.setCurrent !== false) {
    await runTaskSetCurrent(resolvedTaskPath, resolvedConfigPath);
  }

  return { ok: true, message: messages.taskUpdated, data: task } satisfies CommandResult<typeof task>;
}

export async function runTaskDone(checkResults: CheckResult[], taskPath?: string, configPath?: string) {
  const resolvedConfigPath = await resolveConfigPath(configPath);
  const verifyResult = await runVerify(checkResults, true, true, taskPath, resolvedConfigPath);
  if (!verifyResult.ok) {
    return verifyResult;
  }

  const { config } = await loadConfigAndMessages(resolvedConfigPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const driftResult = await runDriftAudit(resolvedTaskPath, resolvedConfigPath);
  if (!driftResult.ok) {
    return driftResult;
  }

  const verifyingResult = await runTaskTransition("verifying", resolvedTaskPath, {}, resolvedConfigPath);
  if (!verifyingResult.ok) {
    return verifyingResult;
  }

  const transitionResult = await runTaskTransition(
    "done",
    resolvedTaskPath,
    { verifyStatus: "pass", acceptanceSatisfied: true, intentSatisfied: true },
    resolvedConfigPath
  );
  if (!transitionResult.ok) {
    return transitionResult;
  }

  await runTaskSetCurrent(resolvedTaskPath, resolvedConfigPath);
  return transitionResult;
}

export async function runTaskShow(taskPath?: string, configPath?: string) {
  const { config, configPath: resolvedConfigPath } = await loadConfigAndMessages(configPath);
  const resolvedTaskPath = await resolveTaskPath(resolvedConfigPath, config, taskPath);
  const task = await loadTaskFile(resolvedTaskPath);
  return { ok: true, message: "Task loaded.", data: { taskPath: resolvedTaskPath, task } } satisfies CommandResult<{ taskPath: string; task: typeof task }>;
}

export async function runTaskCurrent(taskPath?: string, configPath?: string) {
  if (taskPath) {
    return runTaskSetCurrent(taskPath, configPath);
  }
  return runTaskShow(undefined, configPath);
}
