import { describe, expect, test } from "vitest";
import {
  appendEvidence,
  createChildToParentReport,
  createParentToChildHandoff,
  createTask,
  evaluateGate,
  evaluateGuard,
  evaluateVerify,
  resolveHumanGate,
  canTransitionTask,
  transitionTask,
  updateTask
} from "../src/index.js";

describe("task state machine", () => {
  test("allows draft to ready when required fields are present", () => {
    const task = createTask({
      taskId: "task-1",
      title: "Start v2",
      objective: "Create the initial implementation",
      scope: ["packages/core"],
      outOfScope: ["adapters"],
      acceptanceCriteria: ["core compiles"],
      references: ["docs/project/specs/core/SPEC-task-state-machine.md"]
    });

    expect(canTransitionTask(task, "ready")).toEqual({ ok: true, errors: [] });
  });

  test("rejects ready to in_progress without required checks", () => {
    const task = createTask({
      taskId: "task-2",
      title: "Start implementation",
      objective: "Work on the task",
      scope: ["packages/core"],
      outOfScope: ["adapters"],
      acceptanceCriteria: ["tests exist"],
      references: ["docs/project/specs/core/SPEC-task-state-machine.md"],
      currentState: "ready"
    });

    expect(canTransitionTask(task, "in_progress")).toEqual({
      ok: false,
      errors: ["requiredChecks are required before in_progress"]
    });
  });

  test("requires passing verify context before done", () => {
    const task = createTask({
      taskId: "task-3",
      title: "Finish implementation",
      objective: "Complete the task",
      scope: ["packages/core"],
      outOfScope: ["adapters"],
      acceptanceCriteria: ["tests pass"],
      requiredChecks: ["pnpm test"],
      references: ["docs/project/specs/core/SPEC-task-state-machine.md"],
      currentState: "verifying",
      attachedEvidence: [
        {
          id: "ev-1",
          kind: "test",
          summary: "pnpm test passed",
          createdAt: "2026-04-17T00:00:00.000Z"
        }
      ]
    });

    expect(() => transitionTask(task, "done")).toThrowError(/verifyStatus must be pass/);
    expect(
      transitionTask(task, "done", {
        verifyStatus: "pass",
        acceptanceSatisfied: true
      }).currentState
    ).toBe("done");
  });
});

describe("task updates and handoff", () => {
  test("updates task and resolves human gate", () => {
    const task = createTask({
      taskId: "task-4",
      title: "Review design",
      objective: "Confirm changes",
      scope: ["docs/project"],
      outOfScope: ["runtime"],
      acceptanceCriteria: ["design agreed"],
      references: ["docs/project/architecture.md"],
      humanGate: "required"
    });

    const nextTask = resolveHumanGate(updateTask(task, { blockReason: "waiting" }), "approved by user");
    expect(nextTask.humanGate).toBe("resolved");
    expect(nextTask.gateResolution).toBe("approved by user");
  });

  test("creates parent-to-child and child-to-parent handoff structures", () => {
    const task = appendEvidence(
      createTask({
        taskId: "task-5",
        title: "Implement sync",
        objective: "Generate managed files",
        scope: ["packages/cli"],
        outOfScope: ["packages/core"],
        acceptanceCriteria: ["sync works"],
        references: ["docs/project/specs/cli/SPEC-generation-pipeline.md"]
      }),
      {
        id: "ev-2",
        kind: "test",
        summary: "integration test passed",
        createdAt: "2026-04-17T00:00:00.000Z"
      }
    );

    const handoff = createParentToChildHandoff(task, { constraints: ["No adapter-specific logic in core"] });
    const report = createChildToParentReport(task, { facts: ["Implemented sync"], proposals: ["Add snapshots"] });

    expect(handoff.references[0]?.path).toBe("docs/project/specs/cli/SPEC-generation-pipeline.md");
    expect(report.evidence).toHaveLength(1);
  });
});

describe("policy evaluation", () => {
  test("returns blocked when required check results are missing", () => {
    const task = createTask({
      taskId: "task-6",
      title: "Verify task",
      objective: "Run verification",
      scope: ["packages/core"],
      outOfScope: ["adapters"],
      acceptanceCriteria: ["verification is deterministic"],
      requiredChecks: ["pnpm test"],
      references: ["docs/project/specs/core/SPEC-policy-evaluation.md"]
    });

    expect(evaluateVerify({ task, checkResults: [], acceptanceSatisfied: true })).toEqual({
      status: "blocked",
      reasons: ["missing required check result: pnpm test"]
    });
  });

  test("returns guard ask for protected paths", () => {
    expect(
      evaluateGuard({
        action: "edit",
        targetPath: "docs/project/architecture.md",
        protectedPaths: ["docs/project/"]
      })
    ).toEqual({
      decision: "ask",
      reason: "target path requires human confirmation: docs/project/architecture.md"
    });
  });

  test("returns gate required for design changes", () => {
    expect(
      evaluateGate({
        changeType: "design",
        hasDesignChange: true
      })
    ).toEqual({
      status: "required",
      reason: "human gate required for change type: design"
    });
  });
});
