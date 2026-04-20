import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
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

async function loadConfigAndMessages(configPath: string) {
  const config = await loadHarnessConfig(configPath);
  return { config, messages: getMessages(config.project.locale) };
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
    data: {
      sessionPath: getInitSessionPath(input.rootDir),
      session
    }
  } satisfies CommandResult<{ sessionPath: string; session: Awaited<ReturnType<typeof createInitSession>> }>;
}

export async function runHarnessInitScan(sessionPath: string) {
  const session = await runInitScan(sessionPath);
  const summary = renderInitSummary(session);

  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "repo scan を完了しました。" : "Repository scan completed.",
    data: {
      session,
      summary
    }
  } satisfies CommandResult<{ session: typeof session; summary: typeof summary }>;
}

export async function runHarnessInitSuggest(sessionPath: string) {
  const session = await runInitSuggest(sessionPath);
  const summary = renderInitSummary(session);

  return {
    ok: true,
    message: session.visibleLocale === "ja" ? "suggestion を更新しました。" : "Suggestions updated.",
    data: {
      session,
      summary
    }
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
    data: {
      session,
      summary
    }
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

export async function runSync(configPath: string) {
  const { config } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const result = await syncGeneratedFiles(rootDir, config);

  return {
    ok: true,
    message: config.project.locale === "ja" ? "generated artifacts を同期しました。" : "Generated artifacts synced.",
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runArtifactRead(configPath: string, artifactPath: string): Promise<CommandResult<{ artifactPath: string; content: string }>> {
  try {
    const { config } = await loadConfigAndMessages(configPath);
    const rootDir = getRootDirFromConfigPath(configPath);
    const content = await readOwoxArtifact(rootDir, config, artifactPath);
    return {
      ok: true,
      message: "Artifact read.",
      data: { artifactPath, content }
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "artifact read failed"
    };
  }
}

export async function runValidate(configPath: string): Promise<CommandResult<{ config: HarnessConfig; issues: string[] }>> {
  try {
    const config = await loadHarnessConfig(configPath);
    const rootDir = getRootDirFromConfigPath(configPath);
    const issues = await validateGeneratedFiles(rootDir, config);
    const projectDocIssues = await validateProjectDocs(rootDir, config);
    const initIssues = await validateInitSession(getInitSessionPath(rootDir));
    const runtimeIssues = await validateRuntimeArtifacts(rootDir, config);
    const allIssues = [
      ...issues.map((issue) => issue.message),
      ...projectDocIssues.map((issue) => issue.message),
      ...initIssues.map((issue) => issue.message),
      ...runtimeIssues
    ];

    if (allIssues.length > 0) {
      return {
        ok: false,
        message: getMessages(config.project.locale).validateFailed,
        data: {
          config,
          issues: allIssues
        }
      };
    }

    return {
      ok: true,
      message: getMessages(config.project.locale).validatePassed,
      data: { config, issues: [] }
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "unknown validation error"
    };
  }
}

export async function runTaskCreate(configPath: string, taskPath: string, input: CreateTaskInput) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const requiredDocs = input.requiredDocs ?? input.references ?? [];
  const confirmedDocs = input.confirmedDocs ?? requiredDocs;
  const task = createTask({
    ...input,
    requiredDocs,
    confirmedDocs,
    requiredChecks: input.requiredChecks ?? config.taskDefaults.requiredChecks,
    references: input.references ?? config.taskDefaults.references
  });

  await mkdir(dirname(taskPath), { recursive: true });
  await saveTaskFile(taskPath, task);
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

  return {
    ok: true,
    message: messages.taskCreated,
    data: task
  } satisfies CommandResult<typeof task>;
}

export async function runTaskUpdate(configPath: string, taskPath: string, patch: TaskPatch) {
  const { messages } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const nextTask = updateTask(task, patch);
  await saveTaskFile(taskPath, nextTask);

  return {
    ok: true,
    message: messages.taskUpdated,
    data: nextTask
  } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskSetCurrent(configPath: string, taskPath: string) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const task = await loadTaskFile(taskPath);
  const currentPath = join(rootDir, config.generated.taskDir, "task-current.json");
  await mkdir(dirname(currentPath), { recursive: true });
  await saveTaskFile(currentPath, task);

  return {
    ok: true,
    message: messages.taskUpdated,
    data: { currentPath, task }
  } satisfies CommandResult<{ currentPath: string; task: typeof task }>;
}

export async function runTaskTransition(
  configPath: string,
  taskPath: string,
  nextState: TaskState,
  context: TransitionContext = {}
) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const task = await loadTaskFile(taskPath);
  const prerequisite = evaluatePrerequisites({
    task,
    nextState,
    intent: await loadIntent(rootDir, config, task.intentId),
    decisions: await loadDecisionLedger(rootDir, config)
  });

  if (prerequisite.decision === "deny") {
    return {
      ok: false,
      message: messages.prerequisiteBlocked,
      data: prerequisite
    } satisfies CommandResult<typeof prerequisite>;
  }

  if (prerequisite.decision === "ask") {
    return {
      ok: false,
      message: messages.gateRequired,
      data: prerequisite
    } satisfies CommandResult<typeof prerequisite>;
  }

  const nextTask = transitionTask(task, nextState, context);

  await saveTaskFile(taskPath, nextTask);

  return {
    ok: true,
    message: messages.taskTransitioned,
    data: nextTask
  } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskEvidence(configPath: string, taskPath: string, evidence: EvidenceRecord | EvidenceRecord[]) {
  const { messages } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const nextTask = appendEvidence(task, evidence);
  await saveTaskFile(taskPath, nextTask);

  return {
    ok: true,
    message: messages.taskEvidenceAdded,
    data: nextTask
  } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskLog(configPath: string, taskPath: string, entry: string) {
  const { messages } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const nextTask = appendActivity(task, entry);
  await saveTaskFile(taskPath, nextTask);

  return {
    ok: true,
    message: messages.taskUpdated,
    data: nextTask
  } satisfies CommandResult<typeof nextTask>;
}

export async function runTaskResolveGate(configPath: string, taskPath: string, summary: string) {
  const { messages } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const nextTask = resolveHumanGate(task, summary);
  await saveTaskFile(taskPath, nextTask);

  return {
    ok: true,
    message: messages.gateResolved,
    data: nextTask
  } satisfies CommandResult<typeof nextTask>;
}

export async function runIntentSave(configPath: string, intent: IntentData) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const path = await saveIntent(rootDir, config, intent);

  return {
    ok: true,
    message: messages.intentSaved,
    data: { path, intent }
  } satisfies CommandResult<{ path: string; intent: IntentData }>;
}

export async function runDecisionRecord(configPath: string, decision: DecisionRecord) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const path = await appendDecisionRecord(rootDir, config, decision);

  return {
    ok: true,
    message: messages.decisionRecorded,
    data: { path, decision }
  } satisfies CommandResult<{ path: string; decision: DecisionRecord }>;
}

export async function runTaskCheckPrerequisites(configPath: string, taskPath: string, nextState: TaskState) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const task = await loadTaskFile(taskPath);
  const result = evaluatePrerequisites({
    task,
    nextState,
    intent: await loadIntent(rootDir, config, task.intentId),
    decisions: await loadDecisionLedger(rootDir, config)
  });

  return {
    ok: result.decision === "allow",
    message: result.decision === "allow" ? messages.prerequisiteAllow : result.decision === "ask" ? messages.gateRequired : messages.prerequisiteBlocked,
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runDriftAudit(configPath: string, taskPath: string) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const rootDir = getRootDirFromConfigPath(configPath);
  const task = await loadTaskFile(taskPath);
  const result = evaluateDriftAudit({
    task,
    intent: await loadIntent(rootDir, config, task.intentId),
    decisions: await loadDecisionLedger(rootDir, config)
  });
  const path = await saveDriftAudit(rootDir, config, task.taskId, result);

  return {
    ok: result.status === "pass",
    message: result.status === "pass" ? messages.driftPass : messages.driftFail,
    data: { path, ...result }
  } satisfies CommandResult<{ path: string; status: string; findings: typeof result.findings }>;
}

export async function runVerify(
  configPath: string,
  taskPath: string,
  checkResults: CheckResult[],
  acceptanceSatisfied: boolean,
  intentSatisfied = acceptanceSatisfied
) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const result = evaluateVerify({ task, checkResults, acceptanceSatisfied, intentSatisfied });

  const message =
    result.status === "pass"
      ? messages.verifyPass
      : result.status === "fail"
        ? messages.verifyFail
        : messages.verifyBlocked;

  return {
    ok: result.status === "pass",
    message,
    data: {
      ...result,
      locale: config.project.locale
    }
  } satisfies CommandResult<{
    status: string;
    executionStatus: string;
    intentStatus: string;
    reasons: string[];
    locale: HarnessConfig["project"]["locale"];
  }>;
}

export async function runGuard(configPath: string, input: GuardInput) {
  const { config, messages } = await loadConfigAndMessages(configPath);
  const result = evaluateGuard({
    ...input,
    protectedPaths: input.protectedPaths ?? config.policies.protectedPaths,
    deniedActions: input.deniedActions ?? config.policies.deniedActions,
    askActions: input.askActions ?? config.policies.askActions
  });

  const message =
    result.decision === "allow"
      ? messages.guardAllow
      : result.decision === "ask"
        ? messages.guardAsk
        : messages.guardDeny;

  return {
    ok: result.decision === "allow",
    message,
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runGate(configPath: string, input: GateInput) {
  const { messages } = await loadConfigAndMessages(configPath);
  const result = evaluateGate(input);

  const message =
    result.status === "not_required"
      ? messages.gateNotRequired
      : result.status === "required"
        ? messages.gateRequired
        : messages.gateResolved;

  return {
    ok: result.status !== "required",
    message,
    data: result
  } satisfies CommandResult<typeof result>;
}

export async function runHandoffParentToChild(
  configPath: string,
  taskPath: string,
  outputPath: string,
  input: CreateParentToChildInput = {}
) {
  const { config } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const packet = buildParentToChildPacket(task, input);
  const content = buildParentToChildMarkdown(config, task, input);
  const packetPath = join(getRootDirFromConfigPath(configPath), config.generated.owoxDir, "handoffs", `${task.taskId}-parent-to-child.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeHandoff(outputPath, content);
  await mkdir(dirname(packetPath), { recursive: true });
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");

  return {
    ok: true,
    message: config.project.locale === "ja" ? "handoff を出力しました。" : "Handoff written.",
    data: { outputPath, packetPath }
  } satisfies CommandResult<{ outputPath: string; packetPath: string }>;
}

export async function runHandoffChildToParent(
  configPath: string,
  taskPath: string,
  outputPath: string,
  input: CreateChildToParentInput
) {
  const { config } = await loadConfigAndMessages(configPath);
  const task = await loadTaskFile(taskPath);
  const packet = buildChildToParentPacket(task, input);
  const content = buildChildToParentMarkdown(config, task, input);
  const packetPath = join(getRootDirFromConfigPath(configPath), config.generated.owoxDir, "handoffs", `${task.taskId}-child-to-parent.json`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeHandoff(outputPath, content);
  await mkdir(dirname(packetPath), { recursive: true });
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");

  return {
    ok: true,
    message: config.project.locale === "ja" ? "report を出力しました。" : "Report written.",
    data: { outputPath, packetPath }
  } satisfies CommandResult<{ outputPath: string; packetPath: string }>;
}
