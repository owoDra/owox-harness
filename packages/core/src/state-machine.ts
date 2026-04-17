import type { CreateTaskInput, TaskData, TaskState, TransitionContext, TransitionResult } from "./types.js";

const ALLOWED_TRANSITIONS: Record<TaskState, TaskState[]> = {
  draft: ["ready", "cancelled"],
  ready: ["in_progress", "cancelled"],
  in_progress: ["blocked", "verifying", "cancelled"],
  blocked: ["in_progress"],
  verifying: ["in_progress", "done"],
  done: [],
  cancelled: []
};

export function createTask(input: CreateTaskInput): TaskData {
  return {
    taskId: input.taskId,
    title: input.title,
    objective: input.objective ?? "",
    scope: input.scope ?? [],
    outOfScope: input.outOfScope ?? [],
    acceptanceCriteria: input.acceptanceCriteria ?? [],
    currentState: input.currentState ?? "draft",
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

  if (task.currentState === "draft" && nextState === "ready") {
    if (!task.objective.trim()) {
      errors.push("objective is required before ready");
    }
    if (task.scope.length === 0) {
      errors.push("scope is required before ready");
    }
    if (task.outOfScope.length === 0) {
      errors.push("outOfScope is required before ready");
    }
    if (task.acceptanceCriteria.length === 0) {
      errors.push("acceptanceCriteria is required before ready");
    }
    if (task.references.length === 0) {
      errors.push("references are required before ready");
    }
  }

  if (task.currentState === "ready" && nextState === "in_progress") {
    if (task.humanGate === "required") {
      errors.push("human gate must be resolved before in_progress");
    }
    if (task.requiredChecks.length === 0) {
      errors.push("requiredChecks are required before in_progress");
    }
  }

  if (task.currentState === "in_progress" && nextState === "blocked" && !task.blockReason?.trim()) {
    errors.push("blockReason is required before blocked");
  }

  if (task.currentState === "in_progress" && nextState === "verifying") {
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
    blockReason: nextState === "blocked" ? task.blockReason : undefined
  };
}
