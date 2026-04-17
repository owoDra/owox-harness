import type {
  CheckResult,
  GateInput,
  GateResult,
  GuardInput,
  GuardResult,
  VerifyInput,
  VerifyResult
} from "./types.js";

function missingChecks(requiredChecks: string[], checkResults: CheckResult[]): string[] {
  const executedChecks = new Set(checkResults.map((check) => check.check));
  return requiredChecks.filter((check) => !executedChecks.has(check));
}

export function evaluateVerify(input: VerifyInput): VerifyResult {
  const missing = missingChecks(input.task.requiredChecks, input.checkResults);

  if (input.task.requiredChecks.length === 0 || missing.length > 0) {
    return {
      status: "blocked",
      reasons:
        missing.length > 0
          ? missing.map((check) => `missing required check result: ${check}`)
          : ["task has no required checks"]
    };
  }

  const failedChecks = input.checkResults.filter((check) => !check.passed);
  const reasons = failedChecks.map((check) => check.details ?? `required check failed: ${check.check}`);

  if (!input.acceptanceSatisfied) {
    reasons.push("acceptance criteria not satisfied");
  }

  if (failedChecks.length > 0 || !input.acceptanceSatisfied) {
    return {
      status: "fail",
      reasons
    };
  }

  return {
    status: "pass",
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
  if (input.alreadyResolved) {
    return {
      status: "resolved",
      reason: "human gate already resolved"
    };
  }

  if (input.hasExternalImpact || input.hasDesignChange || input.isCompletionDecision) {
    return {
      status: "required",
      reason: `human gate required for change type: ${input.changeType}`
    };
  }

  return {
    status: "not_required",
    reason: "human gate not required"
  };
}
