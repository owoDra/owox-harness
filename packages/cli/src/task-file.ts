import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { HUMAN_GATE_STATUSES, TASK_STATES, type TaskData } from "@owox-harness/core";

const evidenceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["test", "validation", "review", "generation", "manual"]),
  summary: z.string().min(1),
  createdAt: z.string().min(1)
});

const taskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1),
  objective: z.string(),
  scope: z.array(z.string()),
  outOfScope: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  currentState: z.enum(TASK_STATES),
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
  return taskSchema.parse(JSON.parse(raw));
}

export async function saveTaskFile(filePath: string, task: TaskData): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(task, null, 2)}\n`, "utf8");
}
