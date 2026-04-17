import type { HarnessConfig } from "./config.js";

type Locale = HarnessConfig["project"]["locale"];

const messages = {
  en: {
    validatePassed: "Configuration is valid.",
    validateFailed: "Configuration is invalid.",
    taskCreated: "Task created.",
    taskUpdated: "Task updated.",
    taskTransitioned: "Task state updated.",
    taskEvidenceAdded: "Task evidence added.",
    verifyPass: "Verification passed.",
    verifyFail: "Verification failed.",
    verifyBlocked: "Verification is blocked.",
    guardAllow: "Operation allowed.",
    guardAsk: "Human confirmation required.",
    guardDeny: "Operation denied.",
    gateNotRequired: "Human gate not required.",
    gateRequired: "Human gate required.",
    gateResolved: "Human gate already resolved."
  },
  ja: {
    validatePassed: "設定は有効です。",
    validateFailed: "設定が不正です。",
    taskCreated: "task を作成しました。",
    taskUpdated: "task を更新しました。",
    taskTransitioned: "task の状態を更新しました。",
    taskEvidenceAdded: "task に evidence を追加しました。",
    verifyPass: "verify に成功しました。",
    verifyFail: "verify に失敗しました。",
    verifyBlocked: "verify は前提不足で保留です。",
    guardAllow: "操作を許可しました。",
    guardAsk: "人間確認が必要です。",
    guardDeny: "操作を拒否しました。",
    gateNotRequired: "human gate は不要です。",
    gateRequired: "human gate が必要です。",
    gateResolved: "human gate は解決済みです。"
  }
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
