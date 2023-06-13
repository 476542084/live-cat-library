import { LauncherBase } from "live-cat";
import type { Options } from "live-cat/types/launcher-base";
import { Client } from "./client";
import {
  BaseOptionsType,
  InitializeConfigType,
  Status,
  StatusInterface,
  StatusResponse,
} from "./client/interface";
import { LoadingCompoent } from "./loading/loading";
import type { OnChange } from "./loading/loading";

import {
  handlerSendAgoraVerfy,
  isIOS,
  isWeiXin,
  sleep,
  takeScreenshotUrl,
} from "./utils";
import { autoLoadingVideoHandler, autoLoadingVideo } from "./store";
import { ErrorStateMap } from "./utils/error-profile";
import type { Phase } from "live-cat/types/launcher-base";
import type { ErrorState } from "live-cat/types/launcher-base";
import { StatusMap } from "./utils/status-code";
import type { Options as loadingOptions } from "./loading/loading";
import { AutoRetry } from "./utils/auto-retry";
interface LoadingError {
  code: number | string;
  type: "app" | "task" | "connection" | "reConnection";
  reason: string | ErrorState;
}

interface OnRunningOptions {
  token: string;
  coturns: RTCIceServer[];
  signaling: string;
}

interface ExtendUIOptions {
  onChange: (cb: OnChange) => void;
  onQueue: (rank: number) => void;
  onLoadingError: (err: LoadingError) => void;
  onTaskId: (taskId: number) => void;
  onShowUserList: (showCastScreenUsers: boolean) => void;
  onRunningOptions: (opt: OnRunningOptions) => void;
}

type UIOptions = Options & loadingOptions & ExtendUIOptions;

interface StartClient {
  taskId: number;
  isReconnectEnabled: boolean;
}
export class LauncherUI {
  static defaultExtendOptions: ExtendUIOptions = {
    onChange: () => {},
    onQueue: () => {},
    onLoadingError: () => {},
    onTaskId: () => {},
    onShowUserList: () => {},
    onRunningOptions: () => {},
    ...LoadingCompoent.defaultOptions,
  };
  loading: LoadingCompoent;
  launcherBase?: LauncherBase;

  private client: Client;
  private extendUIOptions: ExtendUIOptions;
  private token?: string;
  private startClient?: Promise<StartClient>;
  private diffServerAndDiyOptions?: Options;
  private autoRetry: AutoRetry;
  private isReconnectEnabled: boolean = false;
  private taskId?: number;
  private offline: boolean = false;
  private tempOption?: InitializeConfigType;
  constructor(
    protected baseOptions: BaseOptionsType,
    protected hostElement: HTMLElement,
    protected options?: Partial<UIOptions>
  ) {
    this.extendUIOptions = { ...LauncherUI.defaultExtendOptions, ...options };

    this.loading = new LoadingCompoent(
      this.hostElement,
      { showDefaultLoading: false },
      (cb: OnChange) => {
        this.extendUIOptions.onChange(cb);
      }
    );

    this.client = new Client(baseOptions.address);

    this.autoRetry = new AutoRetry(this.baseOptions.appKey!);

    //判断有重连重连 - 仅普通连接

    this.handlerStart();
  }
  private handlerNetworkChange = () => {
    if ("connection" in navigator) {
      (navigator as any).connection.removeEventListener(
        "change",
        this.handlerNetworkChange
      );
    }

    this.offline = true;
    this.handlerRetryAction();
  };

  private handlerOffline = () => {
    window.removeEventListener("offline", this.handlerOffline);
    this.offline = true;
    this.handlerRetryAction();
  };

  private handlerRetryAction() {
    const { count } = this.autoRetry.getRetryInfo()!;
    this.launcherBase?.playerShell.destory();
    this.launcherBase?.player.destory();
    this.destory();

    //重新loading
    this.loading = new LoadingCompoent(
      this.hostElement,
      { showDefaultLoading: false },
      (cb: OnChange) => {
        this.extendUIOptions.onChange(cb);
      }
    );
    const { loadingImage, verticalLoading, horizontalLoading } =
      this.tempOption!;
    this.loading.loadingCompoent.loadingImage =
      this.options?.loadingImage || loadingImage!;

    this.loading.loadingCompoent.loadingBgImage = {
      portrait: this.options?.loadingBgImage?.portrait || verticalLoading!,
      landscape: this.options?.loadingBgImage?.landscape || horizontalLoading!,
    };

    this.loading.loadingCompoent.loadingBarImage =
      this.options?.loadingImage || loadingImage!;

    this.loading.loadingCompoent.showDefaultLoading =
      this.options?.showDefaultLoading ?? true;

    //第一次马上重连
    if (count === 1) {
      this.autoRetry.increaseRetryCount();
      this.handlerStart();
      return;
    }
    if (this.autoRetry.isOverMaxCount) {
      this.loading.showLoadingText("网络连接异常，请稍后重试", false);
      return;
    }

    this.loading.showLoadingText(
      `当前网络异常，正在尝试重连...(${count}/${AutoRetry.MaxCount})`,
      false
    );
    const increaseRetryRes = this.autoRetry.increaseRetryCount();
    if (increaseRetryRes) {
      this.handlerEntryConnetion();
    } else {
      this.loading.showLoadingText("网络连接异常，请稍后重试", false);
      return;
    }
  }
  private handlerMultipleOptions(data: InitializeConfigType) {
    const {
      appName,
      loadingImage,
      horizontalLoading,
      verticalLoading,
      showCastScreenUsers,
      landscapeType,
      needLandscape,
      settingHoverButton,
      keyboardMappingConfig,
      inputHoverButton,
      token,
      isFullScreen,
      openMicrophone,
    } = data;
    this.tempOption = data;
    document.title = appName;
    this.token = token;

    this.options?.onShowUserList &&
      this.options.onShowUserList(showCastScreenUsers);

    this.diffServerAndDiyOptions = {
      ...LauncherBase.defaultOptions,
      ...this.options,
      isFullScreen: this.options?.isFullScreen || isFullScreen!,
      openMicrophone: this.options?.openMicrophone || openMicrophone!,
      landscapeType: this.options?.landscapeType || landscapeType!,
      needLandscape: this.options?.needLandscape || needLandscape!,
      settingHoverButton:
        this.options?.settingHoverButton || settingHoverButton!,
      keyboardMappingConfig:
        this.options?.keyboardMappingConfig || keyboardMappingConfig!,
      inputHoverButton: this.options?.inputHoverButton || inputHoverButton!,
    };

    this.loading.loadingCompoent.loadingImage =
      this.options?.loadingImage || loadingImage!;

    this.loading.loadingCompoent.loadingBgImage = {
      portrait: this.options?.loadingBgImage?.portrait || verticalLoading!,
      landscape: this.options?.loadingBgImage?.landscape || horizontalLoading!,
    };

    this.loading.loadingCompoent.loadingBarImage =
      this.options?.loadingImage || loadingImage!;

    this.loading.loadingCompoent.showDefaultLoading =
      this.options?.showDefaultLoading ?? true;
  }

  private waitForRunning = async (
    taskId: number
  ): Promise<StatusResponse["data"]> => {
    const res = await this.client.status(taskId);
    return this.handerWaitForRunning(res, taskId);
  };

  private handerWaitForRunning = async (
    res: StatusResponse,
    taskId: number
  ) => {
    const { status } = res.data;
    if (status === Status.QueueWaiting) {
      //Todo: 排队时候网络异常，触发重连，需要取消上一次轮训排队
      this.loading.showLoadingText(
        `当前排在第 ${res.data.rank ?? 0} 位，请耐心等待...`,
        false
      );
      this.extendUIOptions.onQueue(res.data.rank);
      await sleep(1000);
      return await this.waitForRunning(taskId);
    }
    if (status !== Status.Scheduling) {
      return res.data;
    }
    await sleep(500);
    return await this.waitForRunning(taskId);
  };

  private handlerStatusSwitch = (res: StatusInterface): void => {
    let { token = "", signaling, coturns, status, agoraServiceVerify } = res;
    switch (status) {
      case Status.Pending:
      case Status.Running:
        //note: only in screen mode, replace the Status token
        //note: this.token defalut value is undefined
        this.token && (token = this.token);
        this.options?.onRunningOptions &&
          this.options.onRunningOptions({
            token,
            coturns,
            signaling,
          });
        const isAutoLoadingVideo =
          this.options?.autoLoadingVideo ?? !(isWeiXin() && isIOS());
        const options = {
          ...this.diffServerAndDiyOptions,
          autoLoadingVideo: isAutoLoadingVideo,
          onQuit: () => {
            //主动退出，清除taskId缓存
            this.autoRetry.clearRetryInfo();
          },
          onPhaseChange: (phase: Phase, deltaTime: number) => {
            this.options?.onPhaseChange &&
              this.options.onPhaseChange(phase, deltaTime);
            this.loading.changePhase(phase);

            if (phase === "data-channel-open" && !isAutoLoadingVideo) {
              autoLoadingVideo.set(false);
              autoLoadingVideoHandler.set(() => {
                this.launcherBase?.resumeVideoStream();
              });
            }
          },
          onPlay: () => {
            this.options?.onPlay && this.options?.onPlay();
            //只要进来，初始化重连缓存
            //去掉可以测试重连失败多次
            this.offline = false;
            if (this.isReconnectEnabled && !this.autoRetry.isEmpty) {
              this.autoRetry.setupCount(1);
            }
            this.loading.destroy();
          },
          onError: (reason: ErrorState) => {
            this.options?.onError && this.options?.onError(reason);
            this.handlerError({
              code: reason, //Launcher error reason as code
              type: "connection",
              reason: ErrorStateMap.get(reason) ?? reason,
            });
            //todo：may loading destory before emit error
            this.destory(ErrorStateMap.get(reason) ?? reason);
          },
        };

        this.launcherBase = new LauncherBase(
          `${signaling}/clientWebsocket/${token}`,
          coturns,
          this.hostElement,
          options
        );

        !!agoraServiceVerify &&
          handlerSendAgoraVerfy(
            this.launcherBase.connection,
            agoraServiceVerify
          );
        break;
      case Status.QueueCancel:
        this.handlerError({
          code: Status.QueueCancel,
          type: "task",
          reason: "排队已取消，请重新连接",
        });
        break;
      case Status.Failed:
        this.handlerError({
          code: Status.Failed,
          type: "task",
          reason: "运行失败",
        });
        break;
      case Status.NoIdle:
        this.handlerError({
          code: Status.NoIdle,
          type: "task",
          reason: "节点资源不足",
        });
        break;
      case Status.Stopped:
        this.handlerError({
          code: Status.Stopped,
          type: "task",
          reason: "运行结束",
        });
        break;
      default:
        this.handlerError({
          code: "Unknown",
          type: "task",
          reason: "未知错误",
        });
        break;
    }
  };
  private handlerError(err: LoadingError) {
    if (
      this.isReconnectEnabled &&
      !this.autoRetry.isEmpty &&
      err.type === "connection" &&
      err.code === "disconnect"
    ) {
      //在网络不稳定/断网的情况下，需要对重连进行适配
      this.offline = true; //设定为断网
      const { taskId } = this.autoRetry.getRetryInfo()!;
      this.handlerDetectTaskIsRunning(taskId)
        .then((res) => {
          if (res.result) {
            //taskId关联进程还在运行
            this.handlerRetryAction();
          } else {
            //断网的情况下重连/服务错误
            this.handlerRetryAction();
          }
        })
        .catch(() => {
          this.handlerRetryAction();
        });

      return;
    }
    if (
      !this.autoRetry.isEmpty &&
      err.type !== "connection" &&
      err.type !== "task"
    ) {
      //重连
      this.extendUIOptions.onLoadingError({
        code: err.code,
        type: "reConnection",
        reason: err.reason,
      });

      this.loading = new LoadingCompoent(
        this.hostElement,
        {},
        (cb: OnChange) => {
          this.extendUIOptions.onChange(cb);
        }
      );
      setTimeout(() => {
        this.handlerStart();
      });
      return;
    }
    this.loading.loadingCompoent.showDefaultLoading = false;
    this.loading.showLoadingText(err.reason, false);
    this.extendUIOptions.onLoadingError({
      code: err.code,
      type: err.type,
      reason: err.reason,
    });
  }

  handlerEntryConnetion() {
    this.autoRetry.handlerSetTimeout(() => {
      this.handlerStart();
    });
  }
  private handlerDetectTaskIsRunning(taskId: number) {
    return new Promise<{ result: boolean; data?: StatusInterface }>((r) => {
      const res: Promise<StatusResponse> = this.client.status(taskId);
      res
        .then((res) => {
          const { status } = res.data;
          if (status === Status.Running) {
            //taskId关联进程还在运行
            r({ result: true, data: res.data });
          } else {
            //实际没有运行
            r({ result: false, data: res.data });
          }
        })
        .catch(() => r({ result: false }));
    });
  }
  private handlerStart() {
    //Todo：如果有本地缓存
    if (!this.autoRetry.isEmpty && !this.offline) {
      const { taskId } = this.autoRetry.getRetryInfo()!;
      this.handlerDetectTaskIsRunning(taskId).then((res) => {
        if (res.result) {
          //taskId关联进程还在运行
          // this.handlerStatusSwitch(res.data!);
          this.handlerRun();
        } else {
          //实际没有运行清空
          this.autoRetry.clearRetryInfo();
          this.handlerStart();
        }
      });
      return;
    }
    this.handlerRun();
  }

  private handlerRun() {
    try {
      if (this.baseOptions.startType === 1 && !this.autoRetry.isEmpty) {
        this.startClient = this.client
          .getAppConfig(this.baseOptions)
          .then(async (res) => {
            if (!res.result) {
              this.handlerError({
                code: res.code,
                type: "app",
                reason: StatusMap.get(res.code) || res.message,
              });
              throw res.code;
            }
            return res.data;
          })
          .then((data) => {
            this.handlerMultipleOptions(data);
            const { taskId } = this.autoRetry.getRetryInfo()!;
            const { isReconnectEnabled } = data;

            if (isReconnectEnabled) {
              this.autoRetry.initializeRetryInfo(taskId);
            }
            this.isReconnectEnabled = isReconnectEnabled;

            this.taskId = taskId;
            this.options?.onTaskId && this.options.onTaskId(taskId);
            return { taskId, isReconnectEnabled };
          });
      } else {
        //正常连接
        this.startClient = this.client
          .getPlayerUrl(this.baseOptions)
          .then(async (res) => {
            if (!res.result) {
              this.handlerError({
                code: res.code,
                type: "app",
                reason: StatusMap.get(res.code) || res.message,
              });
              throw res.code;
            }
            return res.data;
          })
          .then((data) => {
            this.handlerMultipleOptions(data);
            const { taskId, isReconnectEnabled } = data;
            if (isReconnectEnabled) {
              this.autoRetry.initializeRetryInfo(taskId);
            }

            //重连配置判断：

            this.isReconnectEnabled = isReconnectEnabled;
            this.taskId = taskId;
            this.options?.onTaskId && this.options.onTaskId(taskId);
            return { taskId, isReconnectEnabled };
          });
      }

      this.startClient!.then(({ taskId, isReconnectEnabled }) => {
        if (this.baseOptions.startType === 1 && isReconnectEnabled) {
          window.addEventListener("offline", this.handlerOffline);
          if ("connection" in navigator) {
            (navigator as any).connection.addEventListener(
              "change",
              this.handlerNetworkChange
            );
          }
        }
        return this.waitForRunning(taskId);
      })
        .then((res) => this.handlerStatusSwitch(res))
        .catch((res) => {
          //只有重连以及有命中缓存才会触发 offline 为 true
          if (this.offline) {
            //断网了
            this.handlerRetryAction();
          }
        });
    } catch (_) {
      console.error(_);
    }
  }

  protected destory(
    text: string = "连接已关闭",
    opt: { videoScreenshot: boolean } = { videoScreenshot: false }
  ) {
    if ("connection" in navigator) {
      (navigator as any).connection.removeEventListener(
        "change",
        this.handlerNetworkChange
      );
    }

    window.removeEventListener("offline", this.handlerOffline);
    this.autoRetry.destroy();
    this.loading.destroy();
    this.launcherBase?.player.showTextOverlay(text);
    if (opt.videoScreenshot) {
      this.loading.destroy();
      const imageUrl = takeScreenshotUrl(this.launcherBase?.player.video!, {
        accuracy: 5,
        alpha: 0.5,
      });
      this.launcherBase?.player.setUpOverlayElementBg(imageUrl);
    }
    this.launcherBase?.destory();
  }
}
