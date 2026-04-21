import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { z } from "zod";
import { evaluatePrerequisites, type DecisionRecord, type DriftAuditResult, type IntentData } from "@owox-harness/core";
import type { HarnessConfig } from "./config.js";
import { loadTaskFile } from "./task-file.js";

const intentSchema = z.object({
  intentId: z.string().min(1),
  userGoal: z.string(),
  successImage: z.string(),
  nonGoals: z.array(z.string()).default([]),
  mustKeep: z.array(z.string()).default([]),
  tradeoffs: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
  decisionPolicy: z.string(),
  approvalPolicy: z.string(),
  requiredDocs: z.array(z.string()).default([]),
  confirmedDocs: z.array(z.string()).default([])
});

const decisionSchema = z.object({
  decisionId: z.string().min(1),
  relatedIntentId: z.string().min(1),
  question: z.string(),
  options: z.array(z.string()),
  chosenOption: z.string(),
  rationale: z.string(),
  decidedBy: z.string(),
  timestamp: z.string(),
  revisitCondition: z.string().optional()
});

const driftAuditSchema = z.object({
  status: z.enum(["pass", "fail"]),
  findings: z.array(
    z.object({
      code: z.enum(["intent_missing", "intent_mismatch", "decision_missing", "decision_unresolved", "evidence_missing", "handoff_mismatch"]),
      message: z.string()
    })
  )
});

async function readJsonIfExists<T>(filePath: string, schema: z.ZodSchema<T>): Promise<T | undefined> {
  try {
    const raw = await readFile(filePath, "utf8");
    return schema.parse(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function getOwoxRoot(rootDir: string, config: HarnessConfig): string {
  return join(rootDir, config.generated.owoxDir);
}

export function getIntentPath(rootDir: string, config: HarnessConfig, intentId: string): string {
  return join(getOwoxRoot(rootDir, config), "intents", `${intentId}.json`);
}

export function getDecisionLedgerPath(rootDir: string, config: HarnessConfig): string {
  return join(getOwoxRoot(rootDir, config), "decisions", "ledger.json");
}

export function getDriftAuditPath(rootDir: string, config: HarnessConfig, taskId: string): string {
  return join(getOwoxRoot(rootDir, config), "drift-audits", `${taskId}.json`);
}

export function resolveOwoxArtifactPath(rootDir: string, config: HarnessConfig, artifactPath: string): string {
  const normalizedArtifactPath = normalize(artifactPath).replace(/^\/+/, "");
  if (normalizedArtifactPath.startsWith("..") || normalizedArtifactPath.includes("../")) {
    throw new Error("artifactPath must stay inside .owox");
  }
  return join(getOwoxRoot(rootDir, config), normalizedArtifactPath);
}

export async function readOwoxArtifact(rootDir: string, config: HarnessConfig, artifactPath: string): Promise<string> {
  return readFile(resolveOwoxArtifactPath(rootDir, config, artifactPath), "utf8");
}

export async function listOwoxArtifacts(rootDir: string, config: HarnessConfig): Promise<string[]> {
  const baseDir = getOwoxRoot(rootDir, config);

  async function walk(currentDir: string, relativeDir: string): Promise<string[]> {
    const entries = await readdir(currentDir, { withFileTypes: true });
    const results: string[] = [];

    for (const entry of entries) {
      const relativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
      const absolutePath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        results.push(...(await walk(absolutePath, relativePath)));
      } else if (entry.isFile()) {
        results.push(relativePath);
      }
    }

    return results;
  }

  try {
    return (await walk(baseDir, "")).sort();
  } catch {
    return [];
  }
}

export async function loadIntent(rootDir: string, config: HarnessConfig, intentId: string): Promise<IntentData | undefined> {
  const result = await readJsonIfExists(getIntentPath(rootDir, config, intentId), intentSchema);
  return result as IntentData | undefined;
}

export async function saveIntent(rootDir: string, config: HarnessConfig, intent: IntentData): Promise<string> {
  const filePath = getIntentPath(rootDir, config, intent.intentId);
  await writeJson(filePath, intentSchema.parse(intent));
  return filePath;
}

export async function loadDecisionLedger(rootDir: string, config: HarnessConfig): Promise<DecisionRecord[]> {
  return (await readJsonIfExists(getDecisionLedgerPath(rootDir, config), z.array(decisionSchema))) ?? [];
}

export async function appendDecisionRecord(rootDir: string, config: HarnessConfig, decision: DecisionRecord): Promise<string> {
  const ledgerPath = getDecisionLedgerPath(rootDir, config);
  const current = await loadDecisionLedger(rootDir, config);
  const next = [...current.filter((item) => item.decisionId !== decision.decisionId), decisionSchema.parse(decision)];
  await writeJson(ledgerPath, next);
  return ledgerPath;
}

export async function saveDriftAudit(rootDir: string, config: HarnessConfig, taskId: string, audit: DriftAuditResult): Promise<string> {
  const filePath = getDriftAuditPath(rootDir, config, taskId);
  await writeJson(filePath, driftAuditSchema.parse(audit));
  return filePath;
}

export async function validateRuntimeArtifacts(rootDir: string, config: HarnessConfig): Promise<string[]> {
  const issues: string[] = [];
  const taskDir = join(rootDir, config.generated.taskDir);

  try {
    const entries = await readdir(taskDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json") || entry.name === "task-template.json") {
        continue;
      }

      const taskPath = join(taskDir, entry.name);
      const task = await loadTaskFile(taskPath);
      const intent = await loadIntent(rootDir, config, task.intentId);
      const decisions = await loadDecisionLedger(rootDir, config);
      const prerequisite = evaluatePrerequisites({ task, nextState: task.currentState, intent, decisions });

      if (!intent) {
        issues.push(`${config.generated.owoxDir}/intents/${task.intentId}.json is missing for ${entry.name}`);
      }
      if (prerequisite.decision === "deny") {
        issues.push(`${entry.name} has unmet prerequisites: ${prerequisite.reasons.join(", ")}`);
      }
    }
  } catch {
    issues.push(`${config.generated.taskDir} is missing`);
  }

  return issues;
}
