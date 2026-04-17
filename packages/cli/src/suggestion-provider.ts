import { spawn } from "node:child_process";
import type { HarnessConfig } from "./config.js";
import type { InitSession, RepoFacts, Suggestion } from "./init-workflow.js";

export interface SuggestionContext {
  rootDir: string;
  repoFacts: RepoFacts;
  session: InitSession;
  config?: HarnessConfig | undefined;
}

export interface SuggestionProvider {
  name: "builtin" | "external";
  generate(context: SuggestionContext): Promise<Suggestion[]>;
}

function inferProfile(facts: RepoFacts): string {
  if (facts.runtimes.includes("node")) {
    return "web";
  }
  return facts.runtimes[0] ?? "web";
}

function inferAdapters(facts: RepoFacts): Array<"codex" | "claude-code" | "opencode" | "copilot-cli"> {
  if (facts.existingCliConfigs.length > 0) {
    const detected: Array<"codex" | "claude-code" | "opencode" | "copilot-cli"> = [];
    if (facts.existingCliConfigs.includes(".codex/config.toml")) {
      detected.push("codex");
    }
    if (facts.existingCliConfigs.includes("CLAUDE.md")) {
      detected.push("claude-code");
    }
    if (facts.existingCliConfigs.includes("opencode.json")) {
      detected.push("opencode");
    }
    if (facts.existingCliConfigs.includes(".github/copilot-instructions.md")) {
      detected.push("copilot-cli");
    }
    if (detected.length > 0) {
      return detected;
    }
  }

  return ["codex", "claude-code", "opencode", "copilot-cli"];
}

export const builtinSuggestionProvider: SuggestionProvider = {
  name: "builtin",
  async generate(context) {
    const inferredName = context.session.confirmedDecisions.name ?? context.rootDir.split("/").filter(Boolean).at(-1) ?? "project";
    const inferredLocale = context.session.confirmedDecisions.locale ?? context.repoFacts.inferredLocale;
    const inferredProfile = context.session.confirmedDecisions.profile ?? inferProfile(context.repoFacts);
    const inferredAdapters = context.session.confirmedDecisions.adapters ?? inferAdapters(context.repoFacts);
    const sourcePolicy =
      context.session.referenceDocuments.some((document) => document.classification === "source_of_truth") ? "hybrid" : "create_fresh_docs";

    return [
      {
        topic: "init_mode",
        recommended: context.repoFacts.inferredInitMode,
        alternatives: ["new_project", "existing_project"].filter(
          (value) => value !== context.repoFacts.inferredInitMode
        ),
        reasons: ["Derived from detected repository files and existing project artifacts."],
        risks: ["Misclassification is possible when the repository is only partially initialized."],
        openQuestions: ["Should existing legacy harness files be ignored or removed manually?"]
      },
      {
        topic: "name",
        recommended: inferredName,
        alternatives: [],
        reasons: ["Repository directory name or confirmed decision provides the most stable default."],
        risks: ["Renaming later affects generated metadata and packaging."],
        openQuestions: ["Should the package name and project display name differ?"]
      },
      {
        topic: "profile",
        recommended: inferredProfile,
        alternatives: ["web", "python", "rust", "go", "infra"].filter((value) => value !== inferredProfile),
        reasons: ["Detected runtime and repository shape indicate this profile is the closest fit."],
        risks: ["A mismatched profile may generate irrelevant checks or docs templates."],
        openQuestions: ["Is the initial release scope primarily web development?"]
      },
      {
        topic: "locale",
        recommended: inferredLocale,
        alternatives: [inferredLocale === "ja" ? "en" : "ja"],
        reasons: ["README language and existing visible docs indicate this locale."],
        risks: ["Choosing a different locale will rewrite visible generated documents."],
        openQuestions: ["Should human-facing docs stay in the detected language?"]
      },
      {
        topic: "adapters",
        recommended: inferredAdapters.join(", "),
        alternatives: ["codex", "claude-code", "opencode", "copilot-cli"].filter((value) => !inferredAdapters.includes(value as never)),
        reasons: ["Existing CLI config files and v2 goals indicate these adapters."],
        risks: ["Generating unused adapters increases maintenance cost."],
        openQuestions: ["Which AI coding CLIs must be supported on day one?"]
      },
      {
        topic: "source_of_truth_policy",
        recommended: sourcePolicy,
        alternatives: ["reuse_existing_docs", "create_fresh_docs", "hybrid"].filter((value) => value !== sourcePolicy),
        reasons: ["Existing docs presence determines whether reuse or fresh generation is safer."],
        risks: ["Reusing low-quality docs can leak stale assumptions into the harness."],
        openQuestions: ["Which detected docs should remain canonical?"]
      }
    ];
  }
};

async function generateExternalSuggestions(context: SuggestionContext): Promise<Suggestion[]> {
  const providerConfig = context.config?.init.externalSuggestionProvider;

  if (!providerConfig) {
    return [
      {
        topic: "provider_notice",
        recommended: "external provider requested but not configured; builtin fallback is required",
        alternatives: ["builtin"],
        reasons: ["External provider support requires a configured command."],
        risks: ["Suggestions may be less tailored until an external provider is configured."],
        openQuestions: ["Set init.externalSuggestionProvider.command to enable external suggestions."]
      },
      ...(await builtinSuggestionProvider.generate(context))
    ];
  }

  try {
    const payload = JSON.stringify({
      rootDir: context.rootDir,
      repoFacts: context.repoFacts,
      referenceDocuments: context.session.referenceDocuments,
      confirmedDecisions: context.session.confirmedDecisions
    });
    const stdout = await new Promise<string>((resolve, reject) => {
      const child = spawn(providerConfig.command, providerConfig.args, {
        cwd: providerConfig.cwd ?? context.rootDir,
        stdio: ["pipe", "pipe", "pipe"]
      });
      const chunks: Buffer[] = [];
      const errors: Buffer[] = [];
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("external provider timed out"));
      }, providerConfig.timeoutMs);

      child.stdout.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      child.stderr.on("data", (chunk) => errors.push(Buffer.from(chunk)));
      child.on("error", reject);
      child.on("close", (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(Buffer.concat(errors).toString("utf8") || `external provider exited with code ${code}`));
          return;
        }
        resolve(Buffer.concat(chunks).toString("utf8"));
      });
      child.stdin.write(payload);
      child.stdin.end();
    });

    const parsed = JSON.parse(stdout) as Suggestion[];
    if (!Array.isArray(parsed)) {
      throw new Error("external provider must return a suggestion array");
    }
    return parsed;
  } catch {
    return [
      {
        topic: "provider_notice",
        recommended: "external provider execution failed; builtin fallback was used",
        alternatives: ["builtin"],
        reasons: ["The configured external suggestion provider failed or returned invalid output."],
        risks: ["Provider-specific organization guidance may be missing from suggestions."],
        openQuestions: ["Should the external provider command or output format be corrected?"]
      },
      ...(await builtinSuggestionProvider.generate(context))
    ];
  }
}

export function resolveSuggestionProvider(config: HarnessConfig | undefined): SuggestionProvider {
  const providerName = config?.init.suggestionProvider;
  if (!providerName || providerName === "builtin") {
    return builtinSuggestionProvider;
  }

  return {
    name: "external",
    async generate(context) {
      return generateExternalSuggestions({
        ...context,
        config
      });
    }
  };
}
