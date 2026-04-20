import type {
  ChildToParentReport,
  CreateChildToParentInput,
  CreateParentToChildInput,
  ParentToChildHandoff,
  TaskData
} from "./types.js";

export function createParentToChildHandoff(
  task: TaskData,
  input: CreateParentToChildInput = {}
): ParentToChildHandoff {
  return {
    kind: "parent_to_child",
    taskId: task.taskId,
    title: task.title,
    intentSummary: task.intentSummary,
    objective: task.objective,
    scope: task.scope,
    outOfScope: task.outOfScope,
    completionCriteria: task.acceptanceCriteria,
    relatedDecisions: task.resolvedDecisions,
    references:
      input.references ?? task.references.map((path) => ({ path, purpose: "Task reference" })),
    constraints: input.constraints ?? [],
    hiddenLanguage: "en"
  };
}

export function createChildToParentReport(task: TaskData, input: CreateChildToParentInput): ChildToParentReport {
  return {
    kind: "child_to_parent",
    taskId: task.taskId,
    title: task.title,
    facts: input.facts,
    openQuestions: input.openQuestions ?? [],
    proposals: input.proposals ?? [],
    evidence: input.evidence ?? task.attachedEvidence
  };
}
