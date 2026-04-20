import type { CreateTaskInput, TaskData, TaskState, TransitionContext, TransitionResult } from "./types.js";

function unresolvedDecisions(task: TaskData): string[] {
  const resolved = new Set(task.resolvedDecisions);
  return task.requiredDecisions.filter((decision) => !resolved.has(decision));
}

const ALLOWED_TRANSITIONS: Record<TaskState, TaskState[]> = {
  intake: ["intent_clarifying", "blocked", "cancelled"],
  intent_clarifying: ["intent_confirmed", "blocked", "cancelled"],
  intent_confirmed: ["planning", "awaiting_human_gate", "blocked", "cancelled"],
  planning: ["executing", "awaiting_human_gate", "blocked", "cancelled"],
  executing: ["verifying", "awaiting_human_gate", "blocked", "cancelled"],
  awaiting_human_gate: ["intent_confirmed", "planning", "executing", "verifying", "blocked", "cancelled"],
  blocked: ["intent_clarifying", "planning", "executing", "awaiting_human_gate", "cancelled"],
  verifying: ["executing", "awaiting_human_gate", "blocked", "done", "cancelled"],
  done: [],
  cancelled: []
};

export function createTask(input: CreateTaskInput): TaskData {
  return {
    intentId: input.intentId ?? input.taskId,
    intentSummary: input.intentSummary ?? input.objective ?? "",
    taskId: input.taskId,
    title: input.title,
    objective: input.objective ?? "",
    scope: input.scope ?? [],
    outOfScope: input.outOfScope ?? [],
    acceptanceCriteria: input.acceptanceCriteria ?? [],
    requiredDocs: input.requiredDocs ?? [],
    confirmedDocs: input.confirmedDocs ?? [],
    currentState: input.currentState ?? "intake",
    requiredDecisions: input.requiredDecisions ?? [],
    resolvedDecisions: input.resolvedDecisions ?? [],
    requiredChecks: input.requiredChecks ?? [],
    humanGate: input.humanGate ?? "none",
    attachedEvidence: input.attachedEvidence ?? [],
    references: input.references ?? [],
    activityLog: input.activityLog ?? [],
    blockReason: input.blockReason,
    gateResolution: input.gateResolution
  };
}

export function canTransitionTask(
  task: TaskData,
  nextState: TaskState,
  context: TransitionContext = {}
): TransitionResult {
  const errors: string[] = [];
  const allowed = ALLOWED_TRANSITIONS[task.currentState];

  if (!allowed.includes(nextState)) {
    return {
      ok: false,
      errors: [`Invalid transition: ${task.currentState} -> ${nextState}`]
    };
  }

  if (task.currentState === "intake" && nextState === "intent_clarifying") {
    if (!task.objective.trim()) {
      errors.push("objective is required before intent_clarifying");
    }
    if (task.scope.length === 0) {
      errors.push("scope is required before intent_clarifying");
    }
    if (task.outOfScope.length === 0) {
      errors.push("outOfScope is required before intent_clarifying");
    }
    if (task.acceptanceCriteria.length === 0) {
      errors.push("acceptanceCriteria is required before intent_clarifying");
    }
    if (task.references.length === 0) {
      errors.push("references are required before intent_clarifying");
    }
  }

  if (task.currentState === "intent_clarifying" && nextState === "intent_confirmed") {
    if (!task.intentId.trim()) {
      errors.push("intentId is required before intent_confirmed");
    }
    if (!task.intentSummary.trim()) {
      errors.push("intentSummary is required before intent_confirmed");
    }
    const missingDocs = task.requiredDocs.filter((doc) => !task.confirmedDocs.includes(doc));
    if (missingDocs.length > 0) {
      errors.push(`required docs must be confirmed before intent_confirmed: ${missingDocs.join(", ")}`);
    }
  }

  if (task.currentState === "intent_confirmed" && nextState === "planning") {
    if (!task.intentId.trim()) {
      errors.push("intentId is required before planning");
    }
  }

  if (task.currentState === "planning" && nextState === "executing") {
    if (!task.intentId.trim()) {
      errors.push("intentId is required before executing");
    }
    if (!task.intentSummary.trim()) {
      errors.push("intentSummary is required before executing");
    }
    if (task.humanGate === "required") {
      errors.push("human gate must be resolved before executing");
    }
    const pendingDecisions = unresolvedDecisions(task);
    if (pendingDecisions.length > 0) {
      errors.push(`required decisions must be resolved before executing: ${pendingDecisions.join(", ")}`);
    }
    if (task.requiredChecks.length === 0) {
      errors.push("requiredChecks are required before executing");
    }
    const missingDocs = task.requiredDocs.filter((doc) => !task.confirmedDocs.includes(doc));
    if (missingDocs.length > 0) {
      errors.push(`required docs must be confirmed before executing: ${missingDocs.join(", ")}`);
    }
  }

  if (["planning", "executing", "verifying", "awaiting_human_gate"].includes(task.currentState) && nextState === "blocked" && !task.blockReason?.trim()) {
    errors.push("blockReason is required before blocked");
  }

  if (task.currentState === "executing" && nextState === "verifying") {
    if (task.activityLog.length === 0) {
      errors.push("activityLog is required before verifying");
    }
    if (task.requiredChecks.length === 0) {
      errors.push("requiredChecks are required before verifying");
    }
  }

  if (task.currentState === "verifying" && nextState === "done") {
    if (context.verifyStatus !== "pass") {
      errors.push("verifyStatus must be pass before done");
    }
    if (!context.acceptanceSatisfied) {
      errors.push("acceptance criteria must be satisfied before done");
    }
    if (context.intentSatisfied === false) {
      errors.push("intent verification must be satisfied before done");
    }
    if (task.humanGate === "required") {
      errors.push("human gate must be resolved before done");
    }
    if (task.humanGate === "resolved" && !task.gateResolution?.trim()) {
      errors.push("gateResolution is required when human gate is resolved");
    }
    if (task.attachedEvidence.length === 0) {
      errors.push("at least one evidence record is required before done");
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function transitionTask(task: TaskData, nextState: TaskState, context: TransitionContext = {}): TaskData {
  const result = canTransitionTask(task, nextState, context);

  if (!result.ok) {
    throw new Error(result.errors.join("; "));
  }

  return {
    ...task,
    currentState: nextState,
    humanGate: nextState === "awaiting_human_gate" ? "required" : task.humanGate,
    blockReason: nextState === "blocked" ? task.blockReason : undefined
  };
}
