import type { EvidenceRecord, TaskData, TaskPatch } from "./types.js";

export function updateTask(task: TaskData, patch: TaskPatch): TaskData {
  return {
    ...task,
    ...patch,
    intentId: patch.intentId ?? task.intentId,
    intentSummary: patch.intentSummary ?? task.intentSummary,
    title: patch.title ?? task.title,
    objective: patch.objective ?? task.objective,
    scope: patch.scope ?? task.scope,
    outOfScope: patch.outOfScope ?? task.outOfScope,
    acceptanceCriteria: patch.acceptanceCriteria ?? task.acceptanceCriteria,
    requiredDocs: patch.requiredDocs ?? task.requiredDocs,
    confirmedDocs: patch.confirmedDocs ?? task.confirmedDocs,
    requiredDecisions: patch.requiredDecisions ?? task.requiredDecisions,
    resolvedDecisions: patch.resolvedDecisions ?? task.resolvedDecisions,
    requiredChecks: patch.requiredChecks ?? task.requiredChecks,
    references: patch.references ?? task.references,
    activityLog: patch.activityLog ?? task.activityLog,
    blockReason: patch.blockReason ?? task.blockReason
  };
}

export function appendEvidence(task: TaskData, evidence: EvidenceRecord | EvidenceRecord[]): TaskData {
  const nextEvidence = Array.isArray(evidence) ? evidence : [evidence];

  return {
    ...task,
    attachedEvidence: [...task.attachedEvidence, ...nextEvidence]
  };
}

export function appendActivity(task: TaskData, entry: string): TaskData {
  return {
    ...task,
    activityLog: [...task.activityLog, entry]
  };
}

export function requireHumanGate(task: TaskData): TaskData {
  return {
    ...task,
    humanGate: "required"
  };
}

export function resolveHumanGate(task: TaskData, summary: string): TaskData {
  return {
    ...task,
    humanGate: "resolved",
    gateResolution: summary
  };
}
