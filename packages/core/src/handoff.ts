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
  const references = input.references ?? task.references.map((path) => ({ path, purpose: "Task reference" }));

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
    references,
    constraints: input.constraints ?? []
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
