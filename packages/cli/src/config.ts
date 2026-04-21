import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parse, stringify } from "yaml";
import { z } from "zod";

export const adapterSchema = z.enum(["codex", "claude-code", "opencode", "copilot-cli"]);

const DEFAULT_MANAGED_DOCUMENT_PATHS = [
  "AGENTS.md",
  ".owox/",
  "docs/project/",
  ".codex/",
  ".claude/",
  ".opencode/",
  ".github/",
  "CLAUDE.md"
] as const;

const DEFAULT_PROTECTED_PATHS = ["docs/project/", ".owox/", ".github/", ".claude/", ".codex/", ".opencode/"] as const;
const DEFAULT_DENIED_ACTIONS = ["git reset --hard", "git checkout --", "rm -rf /"] as const;
const DEFAULT_ASK_ACTIONS = ["push", "release", "deploy"] as const;
const DEFAULT_REQUIRED_CHECKS = ["pnpm validate", "pnpm build"] as const;

const documentBudgetOverrideSchema = z.object({
  path: z.string().min(1).optional(),
  pathPrefix: z.string().min(1).optional(),
  maxTokens: z.number().int().positive()
});

const externalSuggestionProviderSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string()).default([]),
  cwd: z.string().min(1).optional(),
  timeoutMs: z.number().int().positive().default(30000)
});

const generatedPathsSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object") {
      return value;
    }

    const input = value as Record<string, unknown>;
    if (input.owoxDir) {
      return input;
    }

    if (typeof input.agentsDir === "string") {
      return {
        ...input,
        owoxDir: input.agentsDir
      };
    }

    return input;
  },
  z
    .object({
      owoxDir: z.string().min(1).default(".owox"),
      taskDir: z.string().min(1).default(".owox/tasks")
    })
    .default({ owoxDir: ".owox", taskDir: ".owox/tasks" })
);

export const harnessConfigSchema = z.object({
  project: z.object({
    name: z.string().min(1),
    description: z.string().min(1).default("AI-assisted development harness"),
    locale: z.enum(["ja", "en"]).default("en"),
    profile: z.string().min(1).default("web")
  }),
  source: z
    .object({
      docsRoot: z.string().min(1).default("docs/project")
    })
    .default({ docsRoot: "docs/project" }),
  init: z
    .object({
      mode: z.enum(["new_project", "existing_project"]).default("new_project"),
      sourceOfTruthPolicy: z.enum(["reuse_existing_docs", "create_fresh_docs", "hybrid"]).default("hybrid"),
      managedArtifactsPolicy: z.enum(["safe_minimum", "full_generation"]).default("safe_minimum"),
      suggestionProvider: z.enum(["builtin", "external"]).default("builtin"),
      externalSuggestionProvider: externalSuggestionProviderSchema.optional()
    })
    .default({
      mode: "new_project",
      sourceOfTruthPolicy: "hybrid",
      managedArtifactsPolicy: "safe_minimum",
      suggestionProvider: "builtin"
    }),
  contentBudgets: z
    .object({
      documents: z
        .object({
          defaultMaxTokens: z.number().int().positive().default(800),
          splitThreshold: z.number().int().positive().default(1200),
          trimOptionalSections: z.boolean().default(true),
          managedPaths: z.array(z.string().min(1)).default([...DEFAULT_MANAGED_DOCUMENT_PATHS]),
          overrides: z.array(documentBudgetOverrideSchema).default([])
        })
        .default({
          defaultMaxTokens: 800,
          splitThreshold: 1200,
          trimOptionalSections: true,
          managedPaths: [...DEFAULT_MANAGED_DOCUMENT_PATHS],
          overrides: []
        })
    })
    .default({
      documents: {
        defaultMaxTokens: 800,
        splitThreshold: 1200,
        trimOptionalSections: true,
        managedPaths: [...DEFAULT_MANAGED_DOCUMENT_PATHS],
        overrides: []
      }
    }),
  generated: generatedPathsSchema,
  adapters: z.array(adapterSchema).default(["codex", "claude-code", "opencode", "copilot-cli"]),
  policies: z
    .object({
      protectedPaths: z.array(z.string().min(1)).default([...DEFAULT_PROTECTED_PATHS]),
      deniedActions: z.array(z.string().min(1)).default([...DEFAULT_DENIED_ACTIONS]),
      askActions: z.array(z.string().min(1)).default([...DEFAULT_ASK_ACTIONS])
    })
    .default({
      protectedPaths: [...DEFAULT_PROTECTED_PATHS],
      deniedActions: [...DEFAULT_DENIED_ACTIONS],
      askActions: [...DEFAULT_ASK_ACTIONS]
    }),
  taskDefaults: z
    .object({
      requiredChecks: z.array(z.string().min(1)).default([...DEFAULT_REQUIRED_CHECKS]),
      references: z.array(z.string().min(1)).default([])
    })
    .default({ requiredChecks: [...DEFAULT_REQUIRED_CHECKS], references: [] })
});

export type HarnessConfig = z.infer<typeof harnessConfigSchema>;

export interface InitConfigInput {
  rootDir: string;
  name: string;
  description?: string | undefined;
  locale?: "ja" | "en" | undefined;
  profile?: string | undefined;
  adapters?: HarnessConfig["adapters"] | undefined;
}

export function getConfigPath(rootDir: string): string {
  return resolve(rootDir, "owox.harness.yaml");
}

export async function findConfigPath(startDir = process.cwd()): Promise<string> {
  let currentDir = resolve(startDir);

  while (true) {
    const candidate = getConfigPath(currentDir);
    try {
      await access(candidate);
      return candidate;
    } catch {
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        throw new Error("owox.harness.yaml not found from current directory upward");
      }
      currentDir = parentDir;
    }
  }
}

export async function loadHarnessConfig(filePath: string): Promise<HarnessConfig> {
  const raw = await readFile(filePath, "utf8");
  const parsed = parse(raw);
  return harnessConfigSchema.parse(parsed);
}

export async function saveHarnessConfig(filePath: string, config: HarnessConfig): Promise<void> {
  await writeFile(filePath, stringify(config, { sortMapEntries: true }), "utf8");
}

export function createDefaultHarnessConfig(input: InitConfigInput): HarnessConfig {
  return harnessConfigSchema.parse({
    project: {
      name: input.name,
      description: input.description ?? `${input.name} harness configuration`,
      locale: input.locale ?? "en",
      profile: input.profile ?? "web"
    },
    adapters: input.adapters
  });
}

export function getRootDirFromConfigPath(configPath: string): string {
  return dirname(configPath);
}
