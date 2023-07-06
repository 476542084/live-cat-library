import type { StartType } from "live-cat/types/launcher-base";
export enum RateLevel {
  SD,
  HD,
  FHD,
  UHD4K,
}

export enum LandscapeType {
  CONTAIN = 1,
  FILL,
  COVER,
}

export interface PrivateStartInfo {
  id: number; // runningId
  defaultBitrate: RateLevel;
  appId: string; // 启动的appId.
  appName: string; // 启动的app应用名.
  token: string; // token.
  createTime: number; // 开始时间.
  needLandscape: boolean; //是否初始化横屏
  keyboardMappingConfig: undefined | VirtualGlobalType; //键鼠映射配置
  pcFloatingToolbar: boolean; //是否显示pc端悬浮工具栏
  pcFloatingButton: boolean; //是否显示pc端悬浮按钮
  mfloatingToolbar: boolean; //是否显示移动端悬浮工具栏
  mFloatingToolbar: boolean; //是否显示移动端悬浮工具栏 /后端命名遗留问题
  userList: boolean; //是否显示用户列表
  openMultiTouch: boolean; //多点触控
  supportTransfer: boolean; //投屏转移控制权
}

export interface CommonResponse<T = any> {
  code: number;
  data: T;
  message: string;
  result: boolean;
  serverTime: Date;
  version: string;
  requestId: string;
}

export enum VirtualControlDisplayType {
  HideAll,
  DisplayMobile,
  DisplayPc,
  DisplayAll,
}

export enum InputHoverButton {
  Hide,
  Display,
}

export enum ButtonSizeType {
  Small = 1,
  Middle,
  Large,
}

export enum ScreenDataType {
  Normal = 1,
  UDLR,
  WASD,
  Joystick,
  Mouse,
}

export enum SolutionShape {
  Rectangle = 1,
  Circle,
}

export type SolutionValue = {
  pos: number[];
  value: number[];
  width?: number;
  height: number;
  shape?: SolutionShape;
};

export type VirtualDataType = {
  type: ScreenDataType;
  value: SolutionValue;
  scale?: number;
};

export interface VirtualGlobalType {
  resolutionRatio: string;
  buttonSize: ButtonSizeType;
  showButton: boolean;
  landscape: VirtualDataType[];
  portrait: VirtualDataType[];
}

export interface BaseOptionsType {
  address: string; // address
  appId?: string; // appId
  appKey?: string; // appKey
  appSecret?: string; // appSecret
  startType?: StartType;
  castScreenMaxQty?: number; // 并发数
  castScreenNickname?: string; // 投屏昵称
  castScreenPwd?: string; // 投屏密码
  isCastScreenMaster?: boolean; // 是否是主控端
  serverIp?: string; //for coturn server
  joinType?: ScreenJoinType; //only screen
  optionalParam?: string; // command line parameters
  exeParameter?: string; // command line parameters for privatization
  enableVirtualCamera?: boolean;
}
export interface ExtendOptionType {
  maxBitrate?: number;
  minBitrate?: number;
  startBitrate?: number;
  bitrate?: number;
  ueMultiTouch?: boolean;
  enableTCP?: boolean;
  iceTransportPolicy?: RTCIceTransportPolicy;
  frameRate?: number;
  autorunRivatuner?: boolean;
  onPlay?: () => void;
  onMount?: (element: HTMLElement) => void;
  onRotate?: (rotate: boolean) => void;
  onQueue?: (rank: number) => void;
  toolOption?: ToolOptionType;
  eventOption?: eventOptionType;
  holdToolDisplay?: boolean;
  audioToastDisplay?: boolean;
  audioOptions?: MediaTrackConstraintSet;
  loadingImage?: string | HTMLImageElement;
  toolBarLogoImage?: string | HTMLImageElement;
  loadingBarImage?: string | HTMLImageElement;
}

export type Option = { baseOptions: BaseOptionsType } & {
  extendOptions?: ExtendOptionType;
};

export enum Status {
  Scheduling = 10, //加入调度中
  QueueWaiting = 15, //排队等待中
  QueueCancel = 16, //取消排队等待
  Pending = 20, //分配到节点，等待连接
  Running = 30, //运行中
  Failed = 40, //应用运行失败
  NoIdle = 50, //没有空闲节点
  Stopped = 60, //运行结束
}

export interface StatusInterface {
  status: Status;
  coturns: RTCIceServer[];
  token: string;
  signaling: string;
  ice: string[];
  rank: number;
  agoraServiceVerify: string;
}
export interface StatusPrivateInterface
  extends Omit<StatusInterface, "status"> {
  status: string;
}
export type StatusResponse = CommonResponse<StatusInterface>;
export type StatusResponsePrivate = CommonResponse<StatusPrivateInterface>;

export type InitializeConfigType = {
  appName: string;
  taskId: number;
  inputHoverButton?: InputHoverButton;
  keyboardMappingConfig: undefined | VirtualGlobalType;
  horizontalLoading: string; //新版 loading 移动端横屏字段
  verticalLoading: string; //新版 loading 移动端竖屏字段
  pcLoading: string; //新版 loading PC 端字段
  loadingImage: string; //loading 加载中的图，在公有云中包括无背景图时的中间图标、及有背景图时进度条左边的小图标
  settingHoverButton?: VirtualControlDisplayType;
  token?: string;
  needLandscape?: boolean; //是否初始化横屏
  landscapeType?: LandscapeType; //初始化显示模式
  toolbarLogo?: string; //猫头图标
  showCastScreenUsers: boolean; //投屏时显示用户列表
  openMicrophone: boolean;
  openMultiTouch: boolean;
  rateLevel?: RateLevel;
  agoraServiceVerify?: string;
  isFullScreen: boolean; //是否自动全屏
  isReconnectEnabled: boolean; //是否自动重连
};

/**
 * some intefaces of UI
 */
export interface CheckboxOption {
  label: string;
  value: number;
}

export enum ScreenJoinType {
  Secret = 1,
  Link,
}

export interface DesignInfo {
  backgroundImagePc: string;
  backgroundImageH5: string;
  loadingImage: string;
  toolbarLogo: string;
  browserIco: string;
  logo: string;
  horizontalLoading?: string; //预留横竖屏
  verticalLoading?: string; //预留横竖屏
}

export enum ToolsPlatformType {
  Pc = 1,
  Mobile,
  All,
}
export interface DropToolsType {
  toolsIndex: number[];
  platform: ToolsPlatformType;
}

export interface ExtendToolsType {
  icon: string;
  text: string;
  platform: ToolsPlatformType;
  order: number;
  onClick: () => void;
}

export interface ToolOptionType {
  dropTools?: DropToolsType;
  extendTools?: ExtendToolsType[];
}

export interface eventOptionType {
  enableKeyBoard?: boolean;
  enableTouchInteraction?: boolean;
  enableZoomInteraction?: boolean;
}
