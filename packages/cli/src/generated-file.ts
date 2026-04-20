export interface GeneratedFile {
  relativePath: string;
  content: string;
  mode: "managed" | "if_missing";
}

export interface SyncResult {
  written: string[];
  unchanged: string[];
  createdIfMissing: string[];
}

export interface ValidationIssue {
  path: string;
  code: "missing" | "mismatch" | "token_limit";
  message: string;
}

export function createGeneratedFile(relativePath: string, content: string, mode: GeneratedFile["mode"] = "managed"): GeneratedFile {
  return { relativePath, content, mode };
}

export function createJsonFile(relativePath: string, value: unknown, mode: GeneratedFile["mode"] = "managed"): GeneratedFile {
  return createGeneratedFile(relativePath, `${JSON.stringify(value, null, 2)}\n`, mode);
}
