import type {
  CheckResult,
  DriftAuditInput,
  DriftAuditResult,
  GateInput,
  GateResult,
  GuardInput,
  GuardResult,
  PrerequisiteInput,
  PrerequisiteResult,
  VerifyInput,
  VerifyResult
} from "./types.js";

function missingChecks(requiredChecks: string[], checkResults: CheckResult[]): string[] {
  const executedChecks = new Set(checkResults.map((check) => check.check));
  return requiredChecks.filter((check) => !executedChecks.has(check));
}

export function evaluateVerify(input: VerifyInput): VerifyResult {
  const missing = missingChecks(input.task.requiredChecks, input.checkResults);
  const intentSatisfied = input.intentSatisfied ?? input.acceptanceSatisfied;
  const intentReasons = intentSatisfied ? [] : ["intent criteria not satisfied"];

  if (input.task.requiredChecks.length === 0 || missing.length > 0) {
    return {
      status: "blocked",
      executionStatus: "blocked",
      intentStatus: intentReasons.length > 0 ? "fail" : "pass",
      reasons:
        missing.length > 0
          ? [...missing.map((check) => `missing required check result: ${check}`), ...intentReasons]
          : ["task has no required checks", ...intentReasons]
    };
  }

  const failedChecks = input.checkResults.filter((check) => !check.passed);
  const reasons = failedChecks.map((check) => check.details ?? `required check failed: ${check.check}`);

  if (!input.acceptanceSatisfied) {
    reasons.push("acceptance criteria not satisfied");
  }

  if (failedChecks.length > 0 || !input.acceptanceSatisfied || intentReasons.length > 0) {
    return {
      status: "fail",
      executionStatus: "fail",
      intentStatus: intentReasons.length > 0 ? "fail" : "pass",
      reasons: [...reasons, ...intentReasons]
    };
  }

  return {
    status: "pass",
    executionStatus: "pass",
    intentStatus: "pass",
    reasons: []
  };
}

export function evaluateGuard(input: GuardInput): GuardResult {
  const targetPath = input.targetPath;

  if (input.deniedActions?.includes(input.action)) {
    return {
      decision: "deny",
      reason: `action denied by policy: ${input.action}`
    };
  }

  if (targetPath && input.protectedPaths?.some((path) => targetPath.startsWith(path))) {
    return {
      decision: "ask",
      reason: `target path requires human confirmation: ${targetPath}`
    };
  }

  if (input.askActions?.includes(input.action)) {
    return {
      decision: "ask",
      reason: `action requires human confirmation: ${input.action}`
    };
  }

  return {
    decision: "allow",
    reason: "action allowed"
  };
}

export function evaluateGate(input: GateInput): GateResult {
  const gateType =
    input.gateType ??
    (input.isCompletionDecision
      ? "completion_gate"
      : input.hasExternalImpact
        ? "external_behavior_gate"
        : input.hasDesignChange
          ? "architecture_gate"
          : "risk_gate");

  if (input.alreadyResolved) {
    return {
      status: "resolved",
      gateType,
      reason: "human gate already resolved"
    };
  }

  if (input.hasExternalImpact || input.hasDesignChange || input.isCompletionDecision) {
    return {
      status: "required",
      gateType,
      reason: `human gate required for change type: ${input.changeType}`
    };
  }

  return {
    status: "not_required",
    gateType,
    reason: "human gate not required"
  };
}

export function evaluatePrerequisites(input: PrerequisiteInput): PrerequisiteResult {
  const reasons: string[] = [];
  const intent = input.intent;
  const decisions = input.decisions ?? [];
  const missingDocs = input.task.requiredDocs.filter((doc) => !input.task.confirmedDocs.includes(doc));
  const unresolvedDecisions = input.task.requiredDecisions.filter(
    (decisionId) => !input.task.resolvedDecisions.includes(decisionId)
  );

  if (["intent_confirmed", "planning", "executing", "verifying", "done"].includes(input.nextState)) {
    if (!intent) {
      reasons.push(`missing intent artifact: ${input.task.intentId}`);
    } else {
      if (!intent.userGoal.trim()) {
        reasons.push("intent userGoal is required");
      }
      if (!intent.successImage.trim()) {
        reasons.push("intent successImage is required");
      }
      if (!intent.decisionPolicy.trim()) {
        reasons.push("intent decisionPolicy is required");
      }
      if (!intent.approvalPolicy.trim()) {
        reasons.push("intent approvalPolicy is required");
      }
    }
  }

  if (missingDocs.length > 0 && ["intent_confirmed", "planning", "executing", "verifying", "done"].includes(input.nextState)) {
    reasons.push(`missing confirmed docs: ${missingDocs.join(", ")}`);
  }

  if (input.nextState === "executing" || input.nextState === "verifying" || input.nextState === "done") {
    if (input.task.requiredChecks.length === 0) {
      reasons.push("required checks are missing");
    }
    if (unresolvedDecisions.length > 0) {
      reasons.push(`unresolved required decisions: ${unresolvedDecisions.join(", ")}`);
    }
    const recordedIds = new Set(decisions.map((decision) => decision.decisionId));
    const missingDecisionRecords = input.task.resolvedDecisions.filter((decisionId) => !recordedIds.has(decisionId));
    if (missingDecisionRecords.length > 0) {
      reasons.push(`missing decision records: ${missingDecisionRecords.join(", ")}`);
    }
    if (input.task.humanGate === "required") {
      return {
        decision: "ask",
        reasons: [...reasons, "human gate is still required"],
        missingDocs,
        unresolvedDecisions
      };
    }
  }

  if (input.nextState === "done" && input.task.attachedEvidence.length === 0) {
    reasons.push("required evidence is missing");
  }

  return {
    decision: reasons.length > 0 ? "deny" : "allow",
    reasons,
    missingDocs,
    unresolvedDecisions
  };
}

export function evaluateDriftAudit(input: DriftAuditInput): DriftAuditResult {
  const findings: DriftAuditResult["findings"] = [];
  const intent = input.intent;

  if (!intent) {
    findings.push({ code: "intent_missing", message: `intent artifact is missing for ${input.task.intentId}` });
  } else {
    if (input.task.intentSummary.trim() && !intent.userGoal.includes(input.task.intentSummary.trim())) {
      findings.push({ code: "intent_mismatch", message: "task intentSummary does not align with intent userGoal" });
    }
    const missingIntentDocs = intent.requiredDocs.filter((doc) => !intent.confirmedDocs.includes(doc));
    if (missingIntentDocs.length > 0) {
      findings.push({ code: "intent_mismatch", message: `intent still has unconfirmed docs: ${missingIntentDocs.join(", ")}` });
    }
  }

  const decisions = input.decisions ?? [];
  const decisionIds = new Set(decisions.map((decision) => decision.decisionId));
  for (const decisionId of input.task.requiredDecisions) {
    if (!decisionIds.has(decisionId)) {
      findings.push({ code: "decision_missing", message: `decision record is missing: ${decisionId}` });
    }
  }
  for (const decisionId of input.task.requiredDecisions) {
    if (!input.task.resolvedDecisions.includes(decisionId)) {
      findings.push({ code: "decision_unresolved", message: `required decision is unresolved: ${decisionId}` });
    }
  }

  if (input.task.currentState === "done" && input.task.attachedEvidence.length === 0) {
    findings.push({ code: "evidence_missing", message: "completed task has no attached evidence" });
  }

  if (input.parentHandoff) {
    if (input.parentHandoff.intentSummary !== input.task.intentSummary) {
      findings.push({ code: "handoff_mismatch", message: "parent handoff intent summary does not match task" });
    }
    if (input.parentHandoff.taskId !== input.task.taskId) {
      findings.push({ code: "handoff_mismatch", message: "parent handoff taskId does not match task" });
    }
  }

  if (input.childReport && input.childReport.taskId !== input.task.taskId) {
    findings.push({ code: "handoff_mismatch", message: "child report taskId does not match task" });
  }

  return {
    status: findings.length > 0 ? "fail" : "pass",
    findings
  };
}
