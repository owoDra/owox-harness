import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "vitest";
import {
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
  runMigrateV1,
  runSync,
  runTaskCreate,
  runTaskEvidence,
  runTaskTransition,
  runValidate,
  runVerify
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
  const taskPath = join(rootDir, ".agents/tasks/task-1.json");
  await runTaskCreate(configPath, taskPath, {
    taskId: "task-1",
    title: "Implement v2",
    objective: "Create the first v2 packages",
    scope: ["packages/core", "packages/cli"],
    outOfScope: ["packages/adapters"],
    acceptanceCriteria: ["validate works"],
    references: ["docs/project/specs/cli/SPEC-command-surface.md"],
    currentState: "ready"
  });
  return taskPath;
}

describe("cli commands", () => {
  test("harness-init creates config and managed artifacts for all adapters", async () => {
    const { rootDir, configPath } = await setupHarness();

    await expect(readFile(configPath, "utf8")).resolves.toContain("name: sample");
    await expect(readFile(join(rootDir, "AGENTS.md"), "utf8")).resolves.toContain("owox sync");
    await expect(readFile(join(rootDir, ".codex/config.toml"), "utf8")).resolves.toContain("owox.harness.yaml");
    await expect(readFile(join(rootDir, ".codex/hooks/pre-tool.sh"), "utf8")).resolves.toContain("owox validate");
    await expect(readFile(join(rootDir, "CLAUDE.md"), "utf8")).resolves.toContain("owox validate");
    await expect(readFile(join(rootDir, ".claude/subagents/discovery.md"), "utf8")).resolves.toContain("subagent");
    await expect(readFile(join(rootDir, "opencode.json"), "utf8")).resolves.toContain("owox.harness.yaml");
    await expect(readFile(join(rootDir, ".opencode/plugins/owox.json"), "utf8")).resolves.toContain("preTool");
    await expect(readFile(join(rootDir, ".github/copilot-instructions.md"), "utf8")).resolves.toContain("owox");
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

  test("task workflow supports create, evidence, verify, and transition", async () => {
    const { rootDir, configPath } = await setupHarness();
    const taskPath = await createTaskFixture(configPath, rootDir);

    await expect(runTaskEvidence(configPath, taskPath, {
      id: "ev-1",
      kind: "test",
      summary: "pnpm validate passed",
      createdAt: "2026-04-17T00:00:00.000Z"
    })).resolves.toMatchObject({ ok: true });

    await expect(
      runTaskTransition(configPath, taskPath, "in_progress")
    ).resolves.toMatchObject({ ok: true, data: { currentState: "in_progress" } });

    await expect(
      runVerify(configPath, taskPath, [{ check: "pnpm validate", passed: true }, { check: "pnpm build", passed: true }], true)
    ).resolves.toMatchObject({ ok: true, data: { status: "pass" } });
  });

  test("guard and gate return localized messages", async () => {
    const { configPath } = await setupHarness();

    await expect(
      runGuard(configPath, {
        action: "edit",
        targetPath: "docs/project/index.md"
      })
    ).resolves.toMatchObject({
      ok: false,
      message: "人間確認が必要です。",
      data: { decision: "ask" }
    });

    await expect(
      runGate(configPath, {
        changeType: "design",
        hasDesignChange: true
      })
    ).resolves.toMatchObject({
      ok: false,
      message: "human gate が必要です。",
      data: { status: "required" }
    });
  });

  test("handoff commands write markdown outputs", async () => {
    const { rootDir, configPath } = await setupHarness();
    const taskPath = await createTaskFixture(configPath, rootDir);
    const parentPath = join(rootDir, "handoff.md");
    const childPath = join(rootDir, "report.md");

    await runTaskEvidence(configPath, taskPath, {
      id: "ev-1",
      kind: "test",
      summary: "integration ok",
      createdAt: "2026-04-17T00:00:00.000Z"
    });

    await expect(
      runHandoffParentToChild(configPath, taskPath, parentPath, {
        constraints: ["Keep adapter logic outside core"]
      })
    ).resolves.toMatchObject({ ok: true });

    await expect(
      runHandoffChildToParent(configPath, taskPath, childPath, {
        facts: ["Implemented sync"],
        proposals: ["Add more fixtures"]
      })
    ).resolves.toMatchObject({ ok: true });

    await expect(readFile(parentPath, "utf8")).resolves.toContain("## 目的");
    await expect(readFile(childPath, "utf8")).resolves.toContain("## 実施した事実");
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

  test("consultative init detects v1 migration fixture", async () => {
    const rootDir = await createProjectRoot();
    await seedFixture(rootDir, "v1-project.json");

    await runHarnessInitStart({ rootDir, visibleLocale: "en" });
    const sessionPath = getInitSessionPath(rootDir);

    await expect(runHarnessInitScan(sessionPath)).resolves.toMatchObject({
      ok: true,
      data: {
        session: {
          repoFacts: {
            inferredInitMode: "existing_project_with_v1",
            hasV1Artifacts: true
          }
        }
      }
    });

    await runHarnessInitSuggest(sessionPath);
    await expect(
      runHarnessInitConfirm(sessionPath, {
        name: "legacy-project",
        initMode: "existing_project_with_v1",
        locale: "en",
        profile: "web",
        adapters: ["codex", "claude-code"],
        sourceOfTruthPolicy: "reuse_existing_docs",
        managedArtifactsPolicy: "safe_minimum"
      })
    ).resolves.toMatchObject({ ok: true });

    await expect(runHarnessInitMaterialize(sessionPath)).resolves.toMatchObject({ ok: true });
    const configPath = getConfigPath(rootDir);
    await expect(readFile(configPath, "utf8")).resolves.toContain("mode: existing_project_with_v1");
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

  test("migrate-v1 command materializes v2 config from legacy fixture", async () => {
    const rootDir = await createProjectRoot();
    await seedFixture(rootDir, "v1-project.json");

    await expect(runMigrateV1(rootDir)).resolves.toMatchObject({ ok: true });
    const configPath = getConfigPath(rootDir);
    await expect(readFile(configPath, "utf8")).resolves.toContain("mode: existing_project_with_v1");
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
});
