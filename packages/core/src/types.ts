export const TASK_STATES = [
  "intake",
  "intent_clarifying",
  "intent_confirmed",
  "planning",
  "executing",
  "awaiting_human_gate",
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
export type PrerequisiteDecision = "allow" | "ask" | "deny";
export type GateType =
  | "goal_gate"
  | "scope_gate"
  | "architecture_gate"
  | "risk_gate"
  | "external_behavior_gate"
  | "completion_gate";

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
  intentId?: string | undefined;
  intentSummary?: string | undefined;
  title?: string | undefined;
  objective?: string | undefined;
  scope?: string[] | undefined;
  outOfScope?: string[] | undefined;
  acceptanceCriteria?: string[] | undefined;
  requiredDocs?: string[] | undefined;
  confirmedDocs?: string[] | undefined;
  requiredDecisions?: string[] | undefined;
  resolvedDecisions?: string[] | undefined;
  requiredChecks?: string[] | undefined;
  references?: string[] | undefined;
  activityLog?: string[] | undefined;
  blockReason?: string | undefined;
}

export interface TaskData {
  intentId: string;
  intentSummary: string;
  taskId: string;
  title: string;
  objective: string;
  scope: string[];
  outOfScope: string[];
  acceptanceCriteria: string[];
  requiredDocs: string[];
  confirmedDocs: string[];
  currentState: TaskState;
  requiredDecisions: string[];
  resolvedDecisions: string[];
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
  intentSatisfied?: boolean | undefined;
  prerequisiteDecision?: PrerequisiteDecision | undefined;
}

export interface TransitionResult {
  ok: boolean;
  errors: string[];
}

export interface VerifyInput {
  task: TaskData;
  checkResults: CheckResult[];
  acceptanceSatisfied: boolean;
  intentSatisfied?: boolean | undefined;
}

export interface VerifyResult {
  status: VerifyStatus;
  executionStatus: VerifyStatus;
  intentStatus: Exclude<VerifyStatus, "blocked">;
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
  gateType?: GateType | undefined;
  hasExternalImpact?: boolean | undefined;
  hasDesignChange?: boolean | undefined;
  isCompletionDecision?: boolean | undefined;
  alreadyResolved?: boolean | undefined;
}

export interface GateResult {
  status: GateStatus;
  gateType: GateType;
  reason: string;
}

export interface IntentData {
  intentId: string;
  userGoal: string;
  successImage: string;
  nonGoals: string[];
  mustKeep: string[];
  tradeoffs: string[];
  openQuestions: string[];
  decisionPolicy: string;
  approvalPolicy: string;
  requiredDocs: string[];
  confirmedDocs: string[];
}

export interface DecisionRecord {
  decisionId: string;
  relatedIntentId: string;
  question: string;
  options: string[];
  chosenOption: string;
  rationale: string;
  decidedBy: string;
  timestamp: string;
  revisitCondition?: string | undefined;
}

export interface PrerequisiteInput {
  task: TaskData;
  nextState: TaskState;
  intent?: IntentData | undefined;
  decisions?: DecisionRecord[] | undefined;
}

export interface PrerequisiteResult {
  decision: PrerequisiteDecision;
  reasons: string[];
  missingDocs: string[];
  unresolvedDecisions: string[];
}

export interface DriftFinding {
  code: "intent_missing" | "intent_mismatch" | "decision_missing" | "decision_unresolved" | "evidence_missing" | "handoff_mismatch";
  message: string;
}

export interface DriftAuditInput {
  task: TaskData;
  intent?: IntentData | undefined;
  decisions?: DecisionRecord[] | undefined;
  parentHandoff?: ParentToChildHandoff | undefined;
  childReport?: ChildToParentReport | undefined;
}

export interface DriftAuditResult {
  status: "pass" | "fail";
  findings: DriftFinding[];
}

export interface HandoffReference {
  path: string;
  purpose: string;
}

export interface ParentToChildHandoff {
  kind: "parent_to_child";
  taskId: string;
  title: string;
  intentSummary: string;
  objective: string;
  scope: string[];
  outOfScope: string[];
  completionCriteria: string[];
  relatedDecisions: string[];
  references: HandoffReference[];
  constraints: string[];
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
  intentId?: string | undefined;
  intentSummary?: string | undefined;
  taskId: string;
  title: string;
  objective?: string | undefined;
  scope?: string[] | undefined;
  outOfScope?: string[] | undefined;
  acceptanceCriteria?: string[] | undefined;
  requiredDocs?: string[] | undefined;
  confirmedDocs?: string[] | undefined;
  requiredDecisions?: string[] | undefined;
  resolvedDecisions?: string[] | undefined;
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
