import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import {
  runArtifactList,
  runArtifactRead,
  runList,
  runRead,
  runSearch,
  runDecisionRecord,
  runDriftAudit,
  runGate,
  runGuard,
  runHandoffChildToParent,
  runHandoffParentToChild,
  runHarnessInit,
  runHarnessInitConfirm,
  runHarnessInitMaterialize,
  runHarnessInitResume,
  runHarnessInitScan,
  runHarnessInitStart,
  runHarnessInitSuggest,
  runHarnessInitTemplate,
  runSync,
  runTaskDone,
  runTaskCurrent,
  runTaskNew,
  runTaskSave,
  runTaskShow,
  runTaskCreate,
  runTaskCheckPrerequisites,
  runTaskEvidence,
  runTaskUpdate,
  runTaskSetCurrent,
  runTaskTransition,
  runIntentSave,
  runValidate,
  runVerify,
  runWrite
} from "../src/commands.js";
import { createDefaultHarnessConfig, getConfigPath, saveHarnessConfig } from "../src/config.js";
import { estimateTokenCount, renderGeneratedFiles } from "../src/generation.js";
import { getInitSessionPath } from "../src/init-workflow.js";

async function createProjectRoot() {
  return mkdtemp(join(tmpdir(), "owox-cli-test-"));
}

async function seedFixture(rootDir: string, fixtureName: string) {
  const fixturePath = new URL(`./fixtures/${fixtureName}`, import.meta.url);
  const raw = await readFile(fixturePath, "utf8");
  const files = JSON.parse(raw) as Record<string, string>;

  await Promise.all(
    Object.entries(files).map(async ([relativePath, content]) => {
      const absolutePath = join(rootDir, relativePath);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, content, "utf8");
    })
  );
}

async function readJsonFixture<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function setupHarness() {
  const rootDir = await createProjectRoot();
  await runHarnessInit({
    rootDir,
    name: "sample",
    description: "sample harness",
    locale: "ja",
    profile: "web",
    adapters: ["codex", "claude-code", "opencode", "copilot-cli"]
  });
  return { rootDir, configPath: getConfigPath(rootDir) };
}

async function createTaskFixture(configPath: string, rootDir: string) {
  const taskPath = join(rootDir, ".owox/tasks/task-1.json");
  await runTaskCreate({
    taskId: "task-1",
    title: "Implement v2",
    objective: "Create the first v2 packages",
    scope: ["packages/core", "packages/cli"],
    outOfScope: ["packages/adapters"],
    acceptanceCriteria: ["validate works"],
    references: ["docs/project/specs/cli/SPEC-command-surface.md"],
    currentState: "planning"
  }, taskPath, configPath);
  return taskPath;
}

describe("cli commands", () => {
  test("harness-init creates config and managed artifacts for all adapters", async () => {
    const { rootDir, configPath } = await setupHarness();

    await expect(readFile(configPath, "utf8")).resolves.toContain("name: sample");
    await expect(readFile(configPath, "utf8")).resolves.not.toContain("hiddenLanguage");
    await expect(readFile(join(rootDir, ".owox/project.md"), "utf8")).resolves.toContain("Managed Outputs");
    await expect(readFile(join(rootDir, "AGENTS.md"), "utf8")).resolves.toContain("owox sync");
    await expect(readFile(join(rootDir, "AGENTS.md"), "utf8")).resolves.toContain("owox read project");
    await expect(readFile(join(rootDir, ".codex/config.toml"), "utf8")).resolves.toContain("owox.harness.yaml");
    await expect(readFile(join(rootDir, ".codex/hooks/pre-tool.sh"), "utf8")).resolves.toContain("owox validate");
    await expect(readFile(join(rootDir, "CLAUDE.md"), "utf8")).resolves.toContain("owox validate");
    await expect(readFile(join(rootDir, ".claude/subagents/discovery.md"), "utf8")).resolves.toContain("## Required owox Actions");
    await expect(readFile(join(rootDir, ".opencode/plugins/owox.json"), "utf8")).resolves.toContain("preTool");
    await expect(readFile(join(rootDir, ".opencode/skills/task-implementation/SKILL.md"), "utf8")).resolves.toContain("owox read project");
    await expect(readFile(join(rootDir, ".opencodeignore"), "utf8")).resolves.toContain(".owox/");
    await expect(readFile(join(rootDir, ".opencodeignore"), "utf8")).resolves.toContain("docs/project/");
    await expect(readFile(join(rootDir, ".github/copilot-instructions.md"), "utf8")).resolves.toContain("owox");
    await expect(readFile(join(rootDir, ".copilotignore"), "utf8")).resolves.toContain(".owox/");
    await expect(readFile(join(rootDir, ".github/plugins/owox/plugin.json"), "utf8")).resolves.toContain("owox-plugin");
  });

  test("validate detects managed file drift and sync repairs it", async () => {
    const { rootDir, configPath } = await setupHarness();
    const agentsPath = join(rootDir, "AGENTS.md");
    await writeFile(agentsPath, "tampered\n", "utf8");

    await expect(runValidate(configPath)).resolves.toMatchObject({
      ok: false,
      data: {
        issues: [expect.stringContaining("AGENTS.md")]
      }
    });

    await expect(runSync(configPath)).resolves.toMatchObject({ ok: true });
    await expect(runValidate(configPath)).resolves.toMatchObject({ ok: true });
  });

  test("sync keeps only files for configured adapters", async () => {
    const rootDir = await createProjectRoot();
    await runHarnessInit({
      rootDir,
      name: "adapter-scope",
      description: "adapter scoped harness",
      locale: "en",
      profile: "web",
      adapters: ["opencode"]
    });

    await expect(readFile(join(rootDir, ".opencode/agents/owox.md"), "utf8")).resolves.toContain("owox agent");
    await expect(readFile(join(rootDir, ".opencodeignore"), "utf8")).resolves.toContain(".owox/");
    await expect(readFile(join(rootDir, "CLAUDE.md"), "utf8")).rejects.toThrow();
    await expect(readFile(join(rootDir, ".github/plugins/owox/plugin.json"), "utf8")).rejects.toThrow();
    await expect(readFile(join(rootDir, ".codex/config.toml"), "utf8")).rejects.toThrow();
  });

  test("sync prunes stale files from inactive adapters", async () => {
    const { rootDir, configPath } = await setupHarness();
    const config = createDefaultHarnessConfig({ rootDir, name: "sample", locale: "en", adapters: ["opencode"] });
    await saveHarnessConfig(configPath, config);

    await expect(runValidate(configPath)).resolves.toMatchObject({
      ok: false,
      data: {
        issues: expect.arrayContaining([expect.stringContaining("inactive adapter")])
      }
    });

    await expect(runSync(configPath)).resolves.toMatchObject({ ok: true });
    await expect(readFile(join(rootDir, ".claude/subagents/discovery.md"), "utf8")).rejects.toThrow();
    await expect(readFile(join(rootDir, ".github/plugins/owox/plugin.json"), "utf8")).rejects.toThrow();
    await expect(readFile(join(rootDir, ".opencode/agents/owox.md"), "utf8")).resolves.toContain("owox agent");
  });

  test("task workflow supports create, evidence, verify, and transition", async () => {
    const { rootDir, configPath } = await setupHarness();
    const taskPath = await createTaskFixture(configPath, rootDir);

    await expect(runTaskEvidence({
      id: "ev-1",
      kind: "test",
      summary: "pnpm validate passed",
      createdAt: "2026-04-17T00:00:00.000Z"
    }, taskPath, configPath)).resolves.toMatchObject({ ok: true });

    await expect(runTaskSetCurrent(taskPath, configPath)).resolves.toMatchObject({
      ok: true,
      data: { currentPath: expect.stringContaining(".owox/tasks/task-current.json") }
    });

    await expect(
      runTaskTransition("executing", taskPath, {}, configPath)
    ).resolves.toMatchObject({ ok: true, data: { currentState: "executing" } });

    await expect(
      runVerify([{ check: "pnpm validate", passed: true }, { check: "pnpm build", passed: true }], true, true, taskPath, configPath)
    ).resolves.toMatchObject({ ok: true, data: { status: "pass" } });
  });

  test("minimal task commands support new, save, show, current, and done", async () => {
    const { rootDir, configPath } = await setupHarness();
    const inputPath = join(rootDir, "task-input.json");
    const savePath = join(rootDir, "task-save.json");
    const checksPath = join(rootDir, "checks.json");
    await writeFile(inputPath, JSON.stringify({ taskId: "task-2", title: "Docs task", objective: "Update docs", scope: ["docs/project"], outOfScope: [], acceptanceCriteria: ["docs updated"], references: [], currentState: "planning" }, null, 2), "utf8");
    await writeFile(savePath, JSON.stringify({ log: "started", evidence: { id: "ev-task-2", kind: "test", summary: "initial evidence", createdAt: "2026-04-20T00:00:00.000Z" } }, null, 2), "utf8");
    await writeFile(join(rootDir, "task-save-2.json"), JSON.stringify({ nextState: "executing" }, null, 2), "utf8");
    await writeFile(checksPath, JSON.stringify([{ check: "pnpm validate", passed: true }, { check: "pnpm build", passed: true }], null, 2), "utf8");

    await expect(runTaskNew(await readJsonFixture(inputPath), undefined, configPath)).resolves.toMatchObject({ ok: true });
    await expect(runTaskSave(await readJsonFixture(savePath), join(rootDir, ".owox/tasks/task-2.json"), configPath)).resolves.toMatchObject({ ok: true, data: { currentState: "planning" } });
    await expect(runTaskSave(await readJsonFixture(join(rootDir, "task-save-2.json")), join(rootDir, ".owox/tasks/task-2.json"), configPath)).resolves.toMatchObject({ ok: true, data: { currentState: "executing" } });
    await expect(runTaskShow(undefined, configPath)).resolves.toMatchObject({ ok: true, data: { task: { taskId: "task-2" } } });
    await expect(runTaskCurrent(undefined, configPath)).resolves.toMatchObject({ ok: true, data: { task: { taskId: "task-2" } } });
    await expect(runTaskDone(await readJsonFixture(checksPath), join(rootDir, ".owox/tasks/task-2.json"), configPath)).resolves.toMatchObject({ ok: true, data: { currentState: "done" } });
  });

  test("guard and gate return localized messages", async () => {
    const { configPath } = await setupHarness();

    await expect(
      runGuard({
        action: "edit",
        targetPath: "docs/project/index.md"
      }, configPath)
    ).resolves.toMatchObject({
      ok: false,
      message: "人間確認が必要です。",
      data: { decision: "ask" }
    });

    await expect(
      runGate({
        changeType: "design",
        hasDesignChange: true
      }, configPath)
    ).resolves.toMatchObject({
      ok: false,
      message: "人間確認が必要です。",
      data: { status: "required" }
    });
  });

  test("handoff commands write markdown outputs", async () => {
    const { rootDir, configPath } = await setupHarness();
    const taskPath = await createTaskFixture(configPath, rootDir);
    const parentPath = join(rootDir, "handoff.md");
    const childPath = join(rootDir, "report.md");

    await runTaskEvidence({
      id: "ev-1",
      kind: "test",
      summary: "integration ok",
      createdAt: "2026-04-17T00:00:00.000Z"
    }, taskPath, configPath);

    await expect(
      runHandoffParentToChild(parentPath, {
        constraints: ["Keep adapter logic outside core"]
      }, taskPath, configPath)
    ).resolves.toMatchObject({ ok: true, data: { packetPath: expect.stringContaining(".owox/handoffs/task-1-parent-to-child.json") } });

    await expect(
      runHandoffChildToParent(childPath, {
        facts: ["Implemented sync"],
        proposals: ["Add more fixtures"]
      }, taskPath, configPath)
    ).resolves.toMatchObject({ ok: true, data: { packetPath: expect.stringContaining(".owox/handoffs/task-1-child-to-parent.json") } });

    await expect(readFile(join(rootDir, ".owox/handoffs/task-1-parent-to-child.json"), "utf8")).resolves.toContain("intentSummary");
    await expect(readFile(parentPath, "utf8")).resolves.toContain("## Objective");
    await expect(readFile(childPath, "utf8")).resolves.toContain("## Facts");
  });

  test("intent, decision, prerequisite, and drift commands work together", async () => {
    const { rootDir, configPath } = await setupHarness();
    const taskPath = await createTaskFixture(configPath, rootDir);

    await expect(
      runIntentSave({
        intentId: "task-1",
        userGoal: "Create the first v2 packages without changing external behavior",
        successImage: "validate works",
        nonGoals: ["packages/adapters"],
        mustKeep: ["existing external behavior"],
        tradeoffs: ["prefer minimal changes"],
        openQuestions: [],
        decisionPolicy: "ask_when_ambiguous",
        approvalPolicy: "auto_with_guard",
        requiredDocs: ["docs/project/specs/cli/SPEC-command-surface.md"],
        confirmedDocs: ["docs/project/specs/cli/SPEC-command-surface.md"]
      }, configPath)
    ).resolves.toMatchObject({ ok: true });

    await expect(
      runDecisionRecord({
        decisionId: "decision-1",
        relatedIntentId: "task-1",
        question: "Which workflow path should we keep?",
        options: ["minimal"],
        chosenOption: "minimal",
        rationale: "Keep scope contained",
        decidedBy: "user",
        timestamp: "2026-04-19T00:00:00.000Z"
      }, configPath)
    ).resolves.toMatchObject({ ok: true });

    await expect(
      runTaskUpdate({
        requiredDecisions: ["decision-1"],
        resolvedDecisions: ["decision-1"]
      }, taskPath, configPath)
    ).resolves.toMatchObject({ ok: true });

    await expect(runTaskCheckPrerequisites("executing", taskPath, configPath)).resolves.toMatchObject({
      ok: true,
      data: { decision: "allow" }
    });

    await expect(runDriftAudit(taskPath, configPath)).resolves.toMatchObject({
      ok: true,
      data: { status: "pass", path: expect.stringContaining(".owox/drift-audits/task-1.json") }
    });
  });

  test("consultative init workflow scans, suggests, confirms, and materializes", async () => {
    const rootDir = await createProjectRoot();
    const readmePath = join(rootDir, "README.md");
    await writeFile(readmePath, "# サンプル\n\n既存プロジェクトです。\n", "utf8");

    await expect(
      runHarnessInitStart({
        rootDir,
        visibleLocale: "ja"
      })
    ).resolves.toMatchObject({ ok: true });

    const sessionPath = getInitSessionPath(rootDir);

    await expect(runHarnessInitScan(sessionPath)).resolves.toMatchObject({
      ok: true,
      data: {
        session: {
          repoFacts: {
            inferredInitMode: "existing_project",
            inferredLocale: "ja"
          }
        }
      }
    });

    await expect(runHarnessInitSuggest(sessionPath)).resolves.toMatchObject({
      ok: true,
      data: {
        session: {
          suggestions: expect.arrayContaining([expect.objectContaining({ topic: "profile" })])
        }
      }
    });

    await expect(
      runHarnessInitConfirm(sessionPath, {
        name: "sample-app",
        initMode: "existing_project",
        locale: "ja",
        profile: "web",
        adapters: ["opencode", "codex"],
        sourceOfTruthPolicy: "hybrid",
        managedArtifactsPolicy: "safe_minimum"
      })
    ).resolves.toMatchObject({ ok: true });

    await expect(runHarnessInitResume(sessionPath)).resolves.toMatchObject({
      ok: true,
      data: {
        session: {
          confirmedDecisions: {
            name: "sample-app",
            adapters: ["opencode", "codex"]
          }
        }
      }
    });

    await expect(runHarnessInitMaterialize(sessionPath)).resolves.toMatchObject({ ok: true });

    const configPath = getConfigPath(rootDir);
    await expect(readFile(configPath, "utf8")).resolves.toContain("mode: existing_project");
    await expect(readFile(configPath, "utf8")).resolves.toContain("sourceOfTruthPolicy: hybrid");
    await expect(runValidate(configPath)).resolves.toMatchObject({ ok: true });
  });

  test("managed markdown documents respect configured token budgets", async () => {
    const config = createDefaultHarnessConfig({
      rootDir: "/tmp/project",
      name: "budget-test",
      locale: "en"
    });
    config.contentBudgets.documents.defaultMaxTokens = 20;
    config.contentBudgets.documents.splitThreshold = 20;

    const files = renderGeneratedFiles(config);
    const agentsIndex = files.find((file) => file.relativePath === "AGENTS.md");
    const splitParts = files.filter((file) => file.relativePath.startsWith("AGENTS.part-"));

    expect(agentsIndex?.content).toContain("Split Document");
    expect(splitParts.length).toBeGreaterThan(0);
    expect(splitParts.every((file) => estimateTokenCount(file.content) <= config.contentBudgets.documents.defaultMaxTokens)).toBe(true);
  });

  test("consultative init detects monorepo fixture facts", async () => {
    const rootDir = await createProjectRoot();
    await seedFixture(rootDir, "monorepo-project.json");

    await runHarnessInitStart({ rootDir, visibleLocale: "en" });
    const sessionPath = getInitSessionPath(rootDir);

    await expect(runHarnessInitScan(sessionPath)).resolves.toMatchObject({
      ok: true,
      data: {
        session: {
          repoFacts: {
            repoShape: "monorepo",
            packageManagers: ["pnpm"],
            runtimes: ["node"]
          }
        }
      }
    });
  });

  test("consultative materialize preserves existing source docs fixture and validates generated adapters", async () => {
    const rootDir = await createProjectRoot();
    await seedFixture(rootDir, "existing-project.json");

    await runHarnessInitStart({ rootDir, visibleLocale: "en" });
    const sessionPath = getInitSessionPath(rootDir);
    await runHarnessInitScan(sessionPath);
    await runHarnessInitSuggest(sessionPath);
    await runHarnessInitConfirm(sessionPath, {
      name: "sample-existing",
      initMode: "existing_project",
      locale: "en",
      profile: "web",
      adapters: ["claude-code", "copilot-cli"],
      sourceOfTruthPolicy: "reuse_existing_docs",
      managedArtifactsPolicy: "safe_minimum"
    });

    await expect(runHarnessInitMaterialize(sessionPath)).resolves.toMatchObject({ ok: true });
    const configPath = getConfigPath(rootDir);

    await expect(readFile(join(rootDir, "docs/project/index.md"), "utf8")).resolves.toContain("Existing source docs.");
    await expect(readFile(join(rootDir, ".claude/hooks/pre-command.sh"), "utf8")).resolves.toContain("owox validate");
    await expect(readFile(join(rootDir, ".github/plugins/owox/plugin.json"), "utf8")).resolves.toContain("owox-plugin");
    await expect(runValidate(configPath)).resolves.toMatchObject({ ok: true });
  });

  test("external suggestion provider can override builtin recommendations", async () => {
    const rootDir = await createProjectRoot();
    const config = createDefaultHarnessConfig({ rootDir, name: "provider-test", locale: "en" });
    config.init.suggestionProvider = "external";
    config.init.externalSuggestionProvider = {
      command: process.execPath,
      args: [new URL("./fixtures/external-provider.mjs", import.meta.url).pathname],
      cwd: rootDir,
      timeoutMs: 30000
    };
    await saveHarnessConfig(getConfigPath(rootDir), config);

    await runHarnessInitStart({ rootDir, visibleLocale: "en" });
    const sessionPath = getInitSessionPath(rootDir);
    await runHarnessInitScan(sessionPath);

    await expect(runHarnessInitSuggest(sessionPath)).resolves.toMatchObject({
      ok: true,
      data: {
        session: {
          suggestions: expect.arrayContaining([expect.objectContaining({ topic: "name", recommended: expect.stringContaining("-external") })])
        }
      }
    });
  });

  test("decision template export writes pending decisions and suggestions", async () => {
    const rootDir = await createProjectRoot();
    await runHarnessInitStart({ rootDir, visibleLocale: "en" });
    const sessionPath = getInitSessionPath(rootDir);
    await runHarnessInitScan(sessionPath);
    await runHarnessInitSuggest(sessionPath);
    const outputPath = join(rootDir, "decisions.json");

    await expect(runHarnessInitTemplate(sessionPath, outputPath)).resolves.toMatchObject({ ok: true });
    await expect(readFile(outputPath, "utf8")).resolves.toContain("pendingDecisions");
  });

  test("validate reports broken project doc links", async () => {
    const { rootDir, configPath } = await setupHarness();
    await writeFile(join(rootDir, "docs/project/index.md"), "# Project Docs\n\n[Missing](./missing.md)\n", "utf8");

    await expect(runValidate(configPath)).resolves.toMatchObject({
      ok: false,
      data: {
        issues: expect.arrayContaining([expect.stringContaining("links to missing document")])
      }
    });
  });

  test("validate rejects non-English AI markdown", async () => {
    const { rootDir, configPath } = await setupHarness();
    const skillPath = join(rootDir, ".opencode/skills/demo/SKILL.md");
    await mkdir(dirname(skillPath), { recursive: true });
    await writeFile(skillPath, "# Skill\n\n日本語の説明です。\n", "utf8");

    await expect(runValidate(configPath)).resolves.toMatchObject({
      ok: false,
      data: {
        issues: expect.arrayContaining([expect.stringContaining("must be English-only AI markdown")])
      }
    });
  });

  test("artifact-read returns owox runtime artifact content", async () => {
    const { configPath } = await setupHarness();

    await expect(runArtifactRead("project.md", configPath)).resolves.toMatchObject({
      ok: true,
      data: {
        artifactPath: "project.md",
        content: expect.stringContaining("# Project")
      }
    });
  });

  test("read, list, search, and write operate on docs through owox", async () => {
    const { rootDir, configPath } = await setupHarness();
    const writeInputPath = join(rootDir, "doc-input.md");
    await writeFile(writeInputPath, "# Updated Doc\n\nSearchToken\n", "utf8");

    await expect(runRead("docs/index.md", configPath)).resolves.toMatchObject({ ok: true, data: { target: "docs/project/index.md" } });
    await expect(runList("docs", configPath)).resolves.toMatchObject({ ok: true, data: { entries: expect.arrayContaining(["docs/project/index.md"]) } });
    await expect(runWrite("docs/notes/test.md", writeInputPath, configPath)).resolves.toMatchObject({ ok: true, data: { target: "docs/project/notes/test.md" } });
    await expect(runSearch("SearchToken", "docs", configPath)).resolves.toMatchObject({ ok: true, data: { matches: expect.arrayContaining([expect.objectContaining({ path: "docs/project/notes/test.md" })]) } });
  });

  test("artifact-list returns available owox artifacts", async () => {
    const { configPath } = await setupHarness();

    await expect(runArtifactList(configPath)).resolves.toMatchObject({
      ok: true,
      data: {
        artifacts: expect.arrayContaining(["project.md", "decisions/ledger.json", "tasks/task-template.json"])
      }
    });
  });
});
