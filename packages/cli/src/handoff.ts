import { writeFile } from "node:fs/promises";
import {
  createChildToParentReport,
  createParentToChildHandoff,
  type ChildToParentReport,
  type CreateChildToParentInput,
  type CreateParentToChildInput,
  type ParentToChildHandoff,
  type TaskData
} from "@owox-harness/core";
import type { HarnessConfig } from "./config.js";

export function buildParentToChildPacket(task: TaskData, input: CreateParentToChildInput = {}): ParentToChildHandoff {
  return createParentToChildHandoff(task, input);
}

export function buildChildToParentPacket(task: TaskData, input: CreateChildToParentInput): ChildToParentReport {
  return createChildToParentReport(task, input);
}

function renderParentToChildMarkdown(_config: HarnessConfig, handoff: ParentToChildHandoff): string {
  return [
    `# Handoff: ${handoff.title}`,
    "",
    "## Intent Summary",
    handoff.intentSummary,
    "",
    "## Objective",
    handoff.objective,
    "",
    "## Scope",
    ...handoff.scope.map((value) => `- ${value}`),
    "",
    "## Out Of Scope",
    ...handoff.outOfScope.map((value) => `- ${value}`),
    "",
    "## Completion Criteria",
    ...handoff.completionCriteria.map((value) => `- ${value}`),
    "",
    "## Related Decisions",
    ...handoff.relatedDecisions.map((value) => `- ${value}`),
    "",
    "## References",
    ...handoff.references.map((reference) => `- ${reference.path}: ${reference.purpose}`),
    "",
    "## Constraints",
    ...handoff.constraints.map((value) => `- ${value}`),
    ""
  ].join("\n");
}

function renderChildToParentMarkdown(_config: HarnessConfig, report: ChildToParentReport): string {
  return [
    `# Report: ${report.title}`,
    "",
    "## Facts",
    ...report.facts.map((value) => `- ${value}`),
    "",
    "## Open Questions",
    ...report.openQuestions.map((value) => `- ${value}`),
    "",
    "## Proposals",
    ...report.proposals.map((value) => `- ${value}`),
    "",
    "## Evidence",
    ...report.evidence.map((item) => `- ${item.kind}: ${item.summary}`),
    ""
  ].join("\n");
}

export function buildParentToChildMarkdown(
  config: HarnessConfig,
  task: TaskData,
  input: CreateParentToChildInput = {}
): string {
  return renderParentToChildMarkdown(config, buildParentToChildPacket(task, input));
}

export function buildChildToParentMarkdown(
  config: HarnessConfig,
  task: TaskData,
  input: CreateChildToParentInput
): string {
  return renderChildToParentMarkdown(config, buildChildToParentPacket(task, input));
}

export async function writeHandoff(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, "utf8");
}
