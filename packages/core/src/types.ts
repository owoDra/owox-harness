export const TASK_STATES = [
  "draft",
  "ready",
  "in_progress",
  "blocked",
  "verifying",
  "done",
  "cancelled"
] as const;

export type TaskState = (typeof TASK_STATES)[number];

export const HUMAN_GATE_STATUSES = ["none", "required", "resolved"] as const;

export type HumanGateStatus = (typeof HUMAN_GATE_STATUSES)[number];

export type VerifyStatus = "pass" | "fail" | "blocked";
export type GuardDecision = "allow" | "ask" | "deny";
export type GateStatus = "not_required" | "required" | "resolved";

export interface EvidenceRecord {
  id: string;
  kind: "test" | "validation" | "review" | "generation" | "manual";
  summary: string;
  createdAt: string;
}

export interface CheckResult {
  check: string;
  passed: boolean;
  details?: string | undefined;
}

export interface TaskPatch {
  title?: string | undefined;
  objective?: string | undefined;
  scope?: string[] | undefined;
  outOfScope?: string[] | undefined;
  acceptanceCriteria?: string[] | undefined;
  requiredChecks?: string[] | undefined;
  references?: string[] | undefined;
  activityLog?: string[] | undefined;
  blockReason?: string | undefined;
}

export interface TaskData {
  taskId: string;
  title: string;
  objective: string;
  scope: string[];
  outOfScope: string[];
  acceptanceCriteria: string[];
  currentState: TaskState;
  requiredChecks: string[];
  humanGate: HumanGateStatus;
  attachedEvidence: EvidenceRecord[];
  references: string[];
  activityLog: string[];
  blockReason?: string | undefined;
  gateResolution?: string | undefined;
}

export interface TransitionContext {
  verifyStatus?: VerifyStatus | undefined;
  acceptanceSatisfied?: boolean | undefined;
}

export interface TransitionResult {
  ok: boolean;
  errors: string[];
}

export interface VerifyInput {
  task: TaskData;
  checkResults: CheckResult[];
  acceptanceSatisfied: boolean;
}

export interface VerifyResult {
  status: VerifyStatus;
  reasons: string[];
}

export interface GuardInput {
  action: string;
  targetPath?: string | undefined;
  protectedPaths?: string[] | undefined;
  deniedActions?: string[] | undefined;
  askActions?: string[] | undefined;
}

export interface GuardResult {
  decision: GuardDecision;
  reason: string;
}

export interface GateInput {
  changeType: string;
  hasExternalImpact?: boolean | undefined;
  hasDesignChange?: boolean | undefined;
  isCompletionDecision?: boolean | undefined;
  alreadyResolved?: boolean | undefined;
}

export interface GateResult {
  status: GateStatus;
  reason: string;
}

export interface HandoffReference {
  path: string;
  purpose: string;
}

export interface ParentToChildHandoff {
  kind: "parent_to_child";
  taskId: string;
  title: string;
  objective: string;
  scope: string[];
  outOfScope: string[];
  completionCriteria: string[];
  references: HandoffReference[];
  constraints: string[];
  hiddenLanguage: "en";
}

export interface ChildToParentReport {
  kind: "child_to_parent";
  taskId: string;
  title: string;
  facts: string[];
  openQuestions: string[];
  proposals: string[];
  evidence: EvidenceRecord[];
}

export interface CreateTaskInput {
  taskId: string;
  title: string;
  objective?: string | undefined;
  scope?: string[] | undefined;
  outOfScope?: string[] | undefined;
  acceptanceCriteria?: string[] | undefined;
  requiredChecks?: string[] | undefined;
  references?: string[] | undefined;
  currentState?: TaskState | undefined;
  humanGate?: HumanGateStatus | undefined;
  attachedEvidence?: EvidenceRecord[] | undefined;
  activityLog?: string[] | undefined;
  blockReason?: string | undefined;
  gateResolution?: string | undefined;
}

export interface CreateParentToChildInput {
  references?: HandoffReference[] | undefined;
  constraints?: string[] | undefined;
}

export interface CreateChildToParentInput {
  facts: string[];
  openQuestions?: string[] | undefined;
  proposals?: string[] | undefined;
  evidence?: EvidenceRecord[] | undefined;
}
