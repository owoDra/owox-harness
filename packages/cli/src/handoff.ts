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

function renderParentToChildMarkdown(config: HarnessConfig, handoff: ParentToChildHandoff): string {
  if (config.project.locale === "ja") {
    return [
      `# Handoff: ${handoff.title}`,
      "",
      "## 目的",
      handoff.objective,
      "",
      "## 対象範囲",
      ...handoff.scope.map((value) => `- ${value}`),
      "",
      "## 対象外",
      ...handoff.outOfScope.map((value) => `- ${value}`),
      "",
      "## 完了条件",
      ...handoff.completionCriteria.map((value) => `- ${value}`),
      "",
      "## 参照資料",
      ...handoff.references.map((reference) => `- ${reference.path}: ${reference.purpose}`),
      "",
      "## 制約",
      ...handoff.constraints.map((value) => `- ${value}`),
      ""
    ].join("\n");
  }

  return [
    `# Handoff: ${handoff.title}`,
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
    "## References",
    ...handoff.references.map((reference) => `- ${reference.path}: ${reference.purpose}`),
    "",
    "## Constraints",
    ...handoff.constraints.map((value) => `- ${value}`),
    ""
  ].join("\n");
}

function renderChildToParentMarkdown(config: HarnessConfig, report: ChildToParentReport): string {
  if (config.project.locale === "ja") {
    return [
      `# Report: ${report.title}`,
      "",
      "## 実施した事実",
      ...report.facts.map((value) => `- ${value}`),
      "",
      "## 未確定事項",
      ...report.openQuestions.map((value) => `- ${value}`),
      "",
      "## 提案",
      ...report.proposals.map((value) => `- ${value}`),
      "",
      "## Evidence",
      ...report.evidence.map((item) => `- ${item.kind}: ${item.summary}`),
      ""
    ].join("\n");
  }

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
  return renderParentToChildMarkdown(config, createParentToChildHandoff(task, input));
}

export function buildChildToParentMarkdown(
  config: HarnessConfig,
  task: TaskData,
  input: CreateChildToParentInput
): string {
  return renderChildToParentMarkdown(config, createChildToParentReport(task, input));
}

export async function writeHandoff(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, "utf8");
}
