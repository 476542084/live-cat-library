import type { ErrorState } from "live-cat/types/launcher-base";
export const ErrorStateMap = new Map<ErrorState, string>([
  ["disconnect", "连接已断开"],
  ["afk", "您已长时间未操作，连接已自动断开"],
  ["kick", "当前应用已在其他页面打开"],
]);
