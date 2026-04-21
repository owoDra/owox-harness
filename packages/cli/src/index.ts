#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { cac } from "cac";
import type { CheckResult, CreateTaskInput, TaskState } from "@owox-harness/core";
import {
  runHarnessInit,
  runList,
  runRead,
  runSearch,
  runSync,
  runTaskCurrent,
  runTaskDone,
  runTaskNew,
  runTaskSave,
  runTaskShow,
  runValidate,
  runVerify,
  runWrite,
  type DecisionInput,
  type EvidenceInput,
  type TaskSaveInput
} from "./commands.js";

const cli = cac("owox");

interface InitCommandOptions {
  name?: string;
  description?: string;
  locale?: "ja" | "en";
  profile?: string;
  adapters?: string;
}

interface TaskNewOptions {
  id?: string;
  title?: string;
  objective?: string;
  scope?: string;
  outOfScope?: string;
  accept?: string;
  ref?: string;
  state?: TaskState;
}

interface TaskSaveOptions {
  log?: string;
  state?: TaskState;
  evidence?: string;
  evidenceKind?: EvidenceInput["kind"];
  evidenceId?: string;
  gateResolution?: string;
  setCurrent?: boolean;
  decisionQuestion?: string;
  decisionOptions?: string;
  decisionChoice?: string;
  decisionRationale?: string;
}

interface TaskDoneOptions {
  check?: string | string[];
  failCheck?: string | string[];
}

interface WriteOptions {
  text?: string;
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

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readJsonInput<T>(inputPath?: string): Promise<T> {
  const raw = !inputPath || inputPath === "-" ? await readStdin() : await readFile(inputPath, "utf8");
  return JSON.parse(raw) as T;
}

function splitList(value?: string): string[] {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function toArray<T>(value?: T | T[]): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function mergeTaskNewInput(input: Partial<CreateTaskInput>, options: TaskNewOptions): CreateTaskInput {
  const taskId = options.id ?? input.taskId;
  const title = options.title ?? input.title;
  const objective = options.objective ?? input.objective;
  if (!taskId || !title || !objective) {
    throw new Error("task new requires id, title, and objective via flags or JSON/stdin");
  }
  return {
    taskId,
    title,
    objective,
    scope: splitList(options.scope).length ? splitList(options.scope) : input.scope ?? [],
    outOfScope: splitList(options.outOfScope).length ? splitList(options.outOfScope) : input.outOfScope ?? [],
    acceptanceCriteria: splitList(options.accept).length ? splitList(options.accept) : input.acceptanceCriteria ?? [],
    references: splitList(options.ref).length ? splitList(options.ref) : input.references ?? [],
    currentState: options.state ?? input.currentState,
    intentId: input.intentId,
    intentSummary: input.intentSummary,
    requiredDocs: input.requiredDocs,
    confirmedDocs: input.confirmedDocs,
    requiredChecks: input.requiredChecks,
    humanGate: input.humanGate
  };
}

function mergeTaskSaveInput(input: TaskSaveInput, options: TaskSaveOptions): TaskSaveInput {
  const merged: TaskSaveInput = { ...input };
  if (options.log) {
    merged.log = merged.log ? [...toArray(merged.log), options.log] : options.log;
  }
  if (options.state) {
    merged.nextState = options.state;
  }
  if (options.gateResolution) {
    merged.gateResolution = options.gateResolution;
  }
  if (options.setCurrent !== undefined) {
    merged.setCurrent = options.setCurrent;
  }
  if (options.evidence) {
    const evidence: EvidenceInput = { summary: options.evidence };
    if (options.evidenceId) {
      evidence.id = options.evidenceId;
    }
    if (options.evidenceKind) {
      evidence.kind = options.evidenceKind;
    }
    merged.evidence = merged.evidence ? [...toArray(merged.evidence), evidence] : evidence;
  }
  if (options.decisionQuestion && options.decisionOptions && options.decisionChoice && options.decisionRationale) {
    const decision: DecisionInput = {
      question: options.decisionQuestion,
      options: splitList(options.decisionOptions),
      chosenOption: options.decisionChoice,
      rationale: options.decisionRationale
    };
    merged.decisions = merged.decisions ? [...merged.decisions, decision] : [decision];
  }
  return merged;
}

async function resolveTaskNewInput(inputPath: string | undefined, options: TaskNewOptions): Promise<CreateTaskInput> {
  const hasInline = Boolean(options.id || options.title || options.objective || options.scope || options.outOfScope || options.accept || options.ref || options.state);
  const base = inputPath ? await readJsonInput<Partial<CreateTaskInput>>(inputPath) : {};
  if (!inputPath && !hasInline) {
    throw new Error("task new requires flags or JSON via stdin/file");
  }
  return mergeTaskNewInput(base, options);
}

async function resolveTaskSaveInput(inputPath: string | undefined, options: TaskSaveOptions): Promise<TaskSaveInput> {
  const hasInline = Boolean(options.log || options.state || options.evidence || options.gateResolution || options.decisionQuestion);
  const base = inputPath ? await readJsonInput<TaskSaveInput>(inputPath) : {};
  if (!inputPath && !hasInline) {
    throw new Error("task save requires flags or JSON via stdin/file");
  }
  return mergeTaskSaveInput(base, options);
}

async function resolveChecksInput(checksPath: string | undefined, options: TaskDoneOptions): Promise<CheckResult[]> {
  const checksFromFlags = [
    ...toArray(options.check).map((check) => ({ check, passed: true })),
    ...toArray(options.failCheck).map((check) => ({ check, passed: false }))
  ];
  const checksFromInput = checksPath ? await readJsonInput<CheckResult[]>(checksPath) : [];
  if (!checksPath && checksFromFlags.length === 0) {
    throw new Error("checks are required via flags or JSON via stdin/file");
  }
  return [...checksFromInput, ...checksFromFlags];
}

async function resolveTextInput(inputPath: string | undefined, text?: string): Promise<string> {
  if (text !== undefined) {
    return text;
  }
  if (!inputPath || inputPath === "-") {
    return readStdin();
  }
  return readFile(inputPath, "utf8");
}

cli
  .command("init <rootDir>", "create owox.harness.yaml and generated artifacts")
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
        adapters: options.adapters ? options.adapters.split(",").map((value) => value.trim()).filter(Boolean) as Array<"codex" | "claude-code" | "opencode" | "copilot-cli"> : undefined
      })
    );
  });

cli.command("sync", "sync managed artifacts from source of truth").action(async () => {
  printResult(await runSync());
});

cli.command("validate", "validate source and managed artifacts").action(async () => {
  printResult(await runValidate());
});

cli.command("read <target>", "read runtime or docs content through owox").action(async (target: string) => {
  printResult(await runRead(target));
});

cli.command("list [scope]", "list available runtime or docs entries").action(async (scope?: "runtime" | "docs" | "all") => {
  printResult(await runList(scope ?? "all"));
});

cli.command("search <query> [scope]", "search runtime or docs entries").action(async (query: string, scope?: "runtime" | "docs" | "all") => {
  printResult(await runSearch(query, scope ?? "all"));
});

cli.command("write <target> [inputPath]", "write runtime or docs content through owox")
  .option("--text <text>", "write inline text without a file")
  .action(async (target: string, inputPath: string | undefined, options: WriteOptions) => {
    const content = await resolveTextInput(inputPath, options.text);
    if (!content) {
      throw new Error("write requires --text, stdin, or an input file");
    }
    printResult(await runWrite(target, content));
  });

cli.command("task new [inputPath] [taskPath]", "create a task and set it current")
  .option("--id <id>", "task id")
  .option("--title <title>", "task title")
  .option("--objective <objective>", "task objective")
  .option("--scope <scope>", "comma-separated scope paths")
  .option("--out-of-scope <outOfScope>", "comma-separated out-of-scope paths")
  .option("--accept <accept>", "comma-separated acceptance criteria")
  .option("--ref <ref>", "comma-separated references")
  .option("--state <state>", "initial task state")
  .action(async (inputPath: string | undefined, taskPath: string | undefined, options: TaskNewOptions) => {
    printResult(await runTaskNew(await resolveTaskNewInput(inputPath, options), taskPath));
  });

cli.command("task save [inputPath] [taskPath]", "save task updates and set current")
  .option("--log <log>", "append a log entry")
  .option("--state <state>", "transition to a new state")
  .option("--evidence <summary>", "append evidence with this summary")
  .option("--evidence-kind <kind>", "evidence kind")
  .option("--evidence-id <id>", "explicit evidence id")
  .option("--gate-resolution <summary>", "resolve the gate with this summary")
  .option("--decision-question <question>", "append a decision question")
  .option("--decision-options <options>", "comma-separated decision options")
  .option("--decision-choice <choice>", "chosen decision option")
  .option("--decision-rationale <rationale>", "decision rationale")
  .option("--set-current <setCurrent>", "set current task after save")
  .action(async (inputPath: string | undefined, taskPath: string | undefined, options: TaskSaveOptions & { setCurrent?: string }) => {
    const normalizedOptions: TaskSaveOptions = { ...options };
    if (options.setCurrent !== undefined) {
      normalizedOptions.setCurrent = options.setCurrent !== "false";
    }
    printResult(await runTaskSave(await resolveTaskSaveInput(inputPath, normalizedOptions), taskPath));
  });

cli.command("task done [checksPath] [taskPath]", "verify, audit, and close a task")
  .option("--check <check>", "mark a check as passed", { type: [] })
  .option("--fail-check <check>", "mark a check as failed", { type: [] })
  .action(async (checksPath: string | undefined, taskPath: string | undefined, options: TaskDoneOptions) => {
    printResult(await runTaskDone(await resolveChecksInput(checksPath, options), taskPath));
  });

cli.command("task show [taskPath]", "show a task or current task").action(async (taskPath?: string) => {
  printResult(await runTaskShow(taskPath));
});

cli.command("task current [taskPath]", "show or set the current task").action(async (taskPath?: string) => {
  printResult(await runTaskCurrent(taskPath));
});

cli.command("verify [checksPath] [taskPath]", "verify a task without closing it")
  .option("--check <check>", "mark a check as passed", { type: [] })
  .option("--fail-check <check>", "mark a check as failed", { type: [] })
  .action(async (checksPath: string | undefined, taskPath: string | undefined, options: TaskDoneOptions) => {
    printResult(await runVerify(await resolveChecksInput(checksPath, options), false, false, taskPath));
  });

cli.help();
cli.parse();

export * from "./commands.js";
export * from "./config.js";
export * from "./generation.js";
export * from "./init-workflow.js";
export * from "./suggestion-provider.js";
