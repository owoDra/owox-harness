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
    taskCreated: "タスクを作成しました。",
    taskUpdated: "タスクを更新しました。",
    taskTransitioned: "タスクの状態を更新しました。",
    taskEvidenceAdded: "タスクに証跡を追加しました。",
    verifyPass: "検証に成功しました。",
    verifyFail: "検証に失敗しました。",
    verifyBlocked: "検証は前提不足で保留です。",
    guardAllow: "操作を許可しました。",
    guardAsk: "人間確認が必要です。",
    guardDeny: "操作を拒否しました。",
    gateNotRequired: "人間確認は不要です。",
    gateRequired: "人間確認が必要です。",
    gateResolved: "人間確認は解決済みです。"
  }
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
