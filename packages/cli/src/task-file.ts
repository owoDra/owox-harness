import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { HUMAN_GATE_STATUSES, TASK_STATES, createTask, type CreateTaskInput, type TaskData } from "@owox-harness/core";

const legacyStateMap = {
  draft: "intake",
  ready: "planning",
  in_progress: "executing"
} as const;

const evidenceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["test", "validation", "review", "generation", "manual"]),
  summary: z.string().min(1),
  createdAt: z.string().min(1)
});

const taskSchema = z.object({
  intentId: z.string().min(1).optional(),
  intentSummary: z.string().optional(),
  taskId: z.string().min(1),
  title: z.string().min(1),
  objective: z.string(),
  scope: z.array(z.string()),
  outOfScope: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  requiredDocs: z.array(z.string()).default([]),
  confirmedDocs: z.array(z.string()).default([]),
  currentState: z.preprocess(
    (value) => {
      if (typeof value === "string" && value in legacyStateMap) {
        return legacyStateMap[value as keyof typeof legacyStateMap];
      }
      return value;
    },
    z.enum(TASK_STATES)
  ),
  requiredDecisions: z.array(z.string()).default([]),
  resolvedDecisions: z.array(z.string()).default([]),
  requiredChecks: z.array(z.string()),
  humanGate: z.enum(HUMAN_GATE_STATUSES),
  attachedEvidence: z.array(evidenceSchema),
  references: z.array(z.string()),
  activityLog: z.array(z.string()),
  blockReason: z.string().optional(),
  gateResolution: z.string().optional()
});

export async function loadTaskFile(filePath: string): Promise<TaskData> {
  const raw = await readFile(filePath, "utf8");
  const parsed = taskSchema.parse(JSON.parse(raw));
  return createTask(parsed as CreateTaskInput);
}

export async function saveTaskFile(filePath: string, task: TaskData): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(task, null, 2)}\n`, "utf8");
}
