import type { HarnessConfig } from "./config.js";
import { createGeneratedFile, type GeneratedFile } from "./generated-file.js";
import { ADAPTER_IGNORE_FILES, type AdapterName } from "./generated-adapter-common.js";
import { renderCodexFiles } from "./generated-adapter-codex.js";
import { renderClaudeFiles } from "./generated-adapter-claude.js";
import { renderOpenCodeFiles } from "./generated-adapter-opencode.js";
import { renderCopilotFiles } from "./generated-adapter-copilot.js";

function renderAdapterIgnoreFile(adapter: AdapterName): GeneratedFile | null {
  const relativePath = ADAPTER_IGNORE_FILES[adapter];
  if (!relativePath) {
    return null;
  }

  return createGeneratedFile(relativePath, ["# Exclude owox-managed sources from direct agent indexing.", ".owox/", "docs/project/", ""].join("\n"));
}

const ADAPTER_RENDERERS: Partial<Record<AdapterName, (config: HarnessConfig) => GeneratedFile[]>> = {
  codex: renderCodexFiles,
  "claude-code": renderClaudeFiles,
  opencode: renderOpenCodeFiles,
  "copilot-cli": renderCopilotFiles
};

export function renderAdapterFiles(config: HarnessConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  config.adapters.forEach((adapter) => {
    const renderAdapter = ADAPTER_RENDERERS[adapter];
    if (renderAdapter) {
      files.push(...renderAdapter(config));
    }
    const ignoreFile = renderAdapterIgnoreFile(adapter);
    if (ignoreFile) {
      files.push(ignoreFile);
    }
  });
  return files;
}
