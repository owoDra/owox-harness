#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { cac } from "cac";
import type {
  CheckResult,
  CreateChildToParentInput,
  CreateParentToChildInput,
  CreateTaskInput,
  EvidenceRecord,
  GateInput,
  GuardInput,
  TaskPatch,
  TaskState,
  TransitionContext
} from "@owox-harness/core";
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
  runTaskLog,
  runTaskResolveGate,
  runTaskTransition,
  runTaskUpdate,
  runValidate,
  runVerify
} from "./commands.js";
import { getInitSessionPath, type DecisionSet } from "./init-workflow.js";

const cli = cac("owox");

interface InitCommandOptions {
  name?: string;
  description?: string;
  locale?: "ja" | "en";
  profile?: string;
  adapters?: string;
}

interface TransitionCommandOptions {
  context?: string;
}

interface ParentHandoffOptions {
  input?: string;
}

function printResult(result: { ok: boolean; message: string; data?: unknown }) {
  const stream = result.ok ? console.log : console.error;
  stream(result.message);

  if (result.data !== undefined) {
    console.log(JSON.stringify(result.data, null, 2));
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

cli
  .command("harness-init <rootDir>", "create owox.harness.yaml and generated artifacts")
  .option("--name <name>", "project name")
  .option("--description <description>", "project description")
  .option("--locale <locale>", "visible locale")
  .option("--profile <profile>", "project profile")
  .option("--adapters <adapters>", "comma-separated adapters")
  .action(async (rootDir: string, options: InitCommandOptions) => {
    if (!options.name) {
      throw new Error("--name is required");
    }

    printResult(
      await runHarnessInit({
        rootDir,
        name: options.name,
        description: options.description,
        locale: options.locale,
        profile: options.profile,
        adapters: options.adapters
          ? options.adapters
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean) as Array<"codex" | "claude-code" | "opencode" | "copilot-cli">
          : undefined
      })
    );
  });

cli.command("harness-init-start <rootDir>", "create consultative init session")
  .option("--locale <locale>", "visible locale")
  .option("--name <name>", "project name")
  .option("--description <description>", "project description")
  .action(async (rootDir: string, options: InitCommandOptions) => {
    printResult(
      await runHarnessInitStart({
        rootDir,
        visibleLocale: options.locale,
        name: options.name,
        description: options.description
      })
    );
  });

cli.command("harness-init-scan <rootDir>", "scan repository into init session").action(async (rootDir: string) => {
  printResult(await runHarnessInitScan(getInitSessionPath(rootDir)));
});

cli.command("harness-init-suggest <rootDir>", "generate consultative suggestions").action(async (rootDir: string) => {
  printResult(await runHarnessInitSuggest(getInitSessionPath(rootDir)));
});

cli.command("harness-init-confirm <rootDir> <decisionsPath>", "apply confirmed init decisions from JSON").action(
  async (rootDir: string, decisionsPath: string) => {
    printResult(await runHarnessInitConfirm(getInitSessionPath(rootDir), await readJsonFile<DecisionSet>(decisionsPath)));
  }
);

cli.command("harness-init-materialize <rootDir>", "materialize source and generated files from init session").action(
  async (rootDir: string) => {
    printResult(await runHarnessInitMaterialize(getInitSessionPath(rootDir)));
  }
);

cli.command("harness-init-resume <rootDir>", "show current init session state").action(async (rootDir: string) => {
  printResult(await runHarnessInitResume(getInitSessionPath(rootDir)));
});

cli.command("harness-init-template <rootDir> <outputPath>", "write a decision template for human confirmation").action(
  async (rootDir: string, outputPath: string) => {
    printResult(await runHarnessInitTemplate(getInitSessionPath(rootDir), outputPath));
  }
);

cli.command("migrate-v1 <rootDir>", "migrate a v1-style project into v2 source/config outputs").action(async (rootDir: string) => {
  printResult(await runMigrateV1(rootDir));
});

cli.command("sync <configPath>", "sync managed artifacts from source of truth").action(async (configPath: string) => {
  printResult(await runSync(configPath));
});

cli.command("validate <configPath>", "validate source and managed artifacts").action(async (configPath: string) => {
  printResult(await runValidate(configPath));
});

cli.command("task-create <configPath> <taskPath> <inputPath>", "create task file from JSON input").action(
  async (configPath: string, taskPath: string, inputPath: string) => {
    printResult(await runTaskCreate(configPath, taskPath, await readJsonFile<CreateTaskInput>(inputPath)));
  }
);

cli.command("task-update <configPath> <taskPath> <patchPath>", "update task file from JSON patch").action(
  async (configPath: string, taskPath: string, patchPath: string) => {
    printResult(await runTaskUpdate(configPath, taskPath, await readJsonFile<TaskPatch>(patchPath)));
  }
);

cli.command("task-transition <configPath> <taskPath> <nextState>", "transition task state")
  .option("--context <contextPath>", "optional JSON transition context")
  .action(async (configPath: string, taskPath: string, nextState: string, options: TransitionCommandOptions) => {
    const context = options.context ? await readJsonFile<TransitionContext>(options.context) : {};
    printResult(await runTaskTransition(configPath, taskPath, nextState as TaskState, context));
  });

cli.command("task-evidence <configPath> <taskPath> <evidencePath>", "append task evidence from JSON").action(
  async (configPath: string, taskPath: string, evidencePath: string) => {
    printResult(await runTaskEvidence(configPath, taskPath, await readJsonFile<EvidenceRecord | EvidenceRecord[]>(evidencePath)));
  }
);

cli.command("task-log <configPath> <taskPath> <entry>", "append task activity log entry").action(
  async (configPath: string, taskPath: string, entry: string) => {
    printResult(await runTaskLog(configPath, taskPath, entry));
  }
);

cli.command("task-resolve-gate <configPath> <taskPath> <summary>", "mark human gate resolved").action(
  async (configPath: string, taskPath: string, summary: string) => {
    printResult(await runTaskResolveGate(configPath, taskPath, summary));
  }
);

cli.command("verify <configPath> <taskPath> <checksPath>", "run verify against a task")
  .option("--acceptance", "mark acceptance criteria as satisfied")
  .action(async (configPath: string, taskPath: string, checksPath: string, options: { acceptance?: boolean }) => {
    const checks = await readJsonFile<CheckResult[]>(checksPath);
    printResult(await runVerify(configPath, taskPath, checks, Boolean(options.acceptance)));
  });

cli.command("guard <configPath> <inputPath>", "evaluate guard policy").action(async (configPath: string, inputPath: string) => {
  printResult(await runGuard(configPath, await readJsonFile<GuardInput>(inputPath)));
});

cli.command("gate <configPath> <inputPath>", "evaluate human gate").action(async (configPath: string, inputPath: string) => {
  printResult(await runGate(configPath, await readJsonFile<GateInput>(inputPath)));
});

cli.command("handoff-parent-to-child <configPath> <taskPath> <outputPath>", "write parent-to-child handoff")
  .option("--input <inputPath>", "optional JSON handoff metadata")
  .action(async (configPath: string, taskPath: string, outputPath: string, options: ParentHandoffOptions) => {
    const input = options.input ? await readJsonFile<CreateParentToChildInput>(options.input) : {};
    printResult(await runHandoffParentToChild(configPath, taskPath, outputPath, input));
  });

cli.command("handoff-child-to-parent <configPath> <taskPath> <outputPath> <inputPath>", "write child-to-parent report").action(
  async (configPath: string, taskPath: string, outputPath: string, inputPath: string) => {
    printResult(await runHandoffChildToParent(configPath, taskPath, outputPath, await readJsonFile<CreateChildToParentInput>(inputPath)));
  }
);

cli.help();
cli.parse();

export * from "./commands.js";
export * from "./config.js";
export * from "./generation.js";
export * from "./init-workflow.js";
export * from "./suggestion-provider.js";
