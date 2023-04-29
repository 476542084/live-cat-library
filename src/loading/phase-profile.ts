export type Phase =
  | "initial"
  | "signaling-connected"
  | "node-ready"
  | "end-candidate"
  | "peer-connection-connected"
  | "data-channel-open"
  | "loaded-metadata";

export const PhasePercentMap = new Map<Phase, [number, string]>([
  ["initial", [0, "可视化服务启动中..."]],
  ["signaling-connected", [25, "可视化服务连接中..."]],
  ["node-ready", [45, "可视化服务连接中..."]],
  ["end-candidate", [65, "可视化服务连接中..."]],
  ["peer-connection-connected", [85, "可视化服务连接中..."]],
  ["data-channel-open", [95, "连接成功，资源加载中..."]],
  ["loaded-metadata", [99, "连接成功，资源加载中..."]],
]);
