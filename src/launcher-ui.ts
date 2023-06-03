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
  type: "app" | "task" | "connection";
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
  constructor(
    protected baseOptions: BaseOptionsType,
    protected hostElement: HTMLElement,
    protected options?: Partial<UIOptions>
  ) {
    this.extendUIOptions = { ...LauncherUI.defaultExtendOptions, ...options };

    this.loading = new LoadingCompoent(this.hostElement, {}, (cb: OnChange) => {
      this.extendUIOptions.onChange(cb);
    });

    this.client = new Client(baseOptions.address);

    this.autoRetry = new AutoRetry(this.baseOptions.appKey!);

    //判断有重连重连 - 仅普通连接
    if (this.baseOptions.startType === 1 && !this.autoRetry.isEmpty()) {
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
          //如果重连进去后服务器去掉了重连配置
          // !isReconnectEnabled && this.autoRetry.clearRetryInfo();
          this.autoRetry.clearRetryInfo();
          isReconnectEnabled && this.autoRetry.initializeRetryInfo(taskId);

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
          //重连配置判断：
          this.autoRetry.clearRetryInfo();
          isReconnectEnabled && this.autoRetry.initializeRetryInfo(taskId);

          this.options?.onTaskId && this.options.onTaskId(taskId);
          return { taskId, isReconnectEnabled };
        });
    }
    this.handlerStart();
  }
  private handlerNetworkChange = () => {
    (navigator as any).connection.removeEventListener(
      "change",
      this.handlerNetworkChange
    );
    console.info("切换网络了");
    this.handlerRetryAction();
  };

  private handlerOffline = () => {
    window.removeEventListener("offline", this.handlerOffline);
    console.info("断网了");
    this.handlerRetryAction();
  };

  private handlerRetryAction() {
    const { count } = this.autoRetry.getRetryInfo()!;
    this.launcherBase?.player.destory();
    this.launcherBase?.playerShell.destory();
    this.destory();
    // console.log("销毁player", +new Date() / 1000);
    //重新loading
    this.loading = new LoadingCompoent(this.hostElement, {}, (cb: OnChange) => {
      this.extendUIOptions.onChange(cb);
    });
    if (count > AutoRetry.MaxCount) {
      this.loading.showLoadingText("网络连接异常，请稍后重试", false);
      this.autoRetry.clearRetryInfo();
      return;
    }
    this.loading.showLoadingText(
      `当前网络异常，正在尝试重连...(${count}/${AutoRetry.MaxCount})`,
      false
    );
    this.handlerEntryConnetion();
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
    } = data;
    document.title = appName;
    this.token = token;

    this.options?.onShowUserList &&
      this.options.onShowUserList(showCastScreenUsers);

    this.diffServerAndDiyOptions = {
      ...LauncherBase.defaultOptions,
      ...this.options,
      isFullScreen,
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
          onPhaseChange: (phase: Phase, deltaTime: number) => {
            this.options?.onPhaseChange &&
              this.options.onPhaseChange(phase, deltaTime);
            this.loading.changePhase(phase);

            if (phase === "streaming-ready" && !isAutoLoadingVideo) {
              autoLoadingVideo.set(false);
              autoLoadingVideoHandler.set(() => {
                this.launcherBase?.resumeVideoStream();
              });
            }
          },
          onPlay: () => {
            this.options?.onPlay && this.options?.onPlay();
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
    this.loading.loadingCompoent.showDefaultLoading = false;
    this.loading.showLoadingText(err.reason, false);
    this.extendUIOptions.onLoadingError({
      code: err.code,
      type: err.type,
      reason: err.reason,
    });
    if (err.code === 60 && !this.autoRetry.isEmpty()) {
      // this.handlerRetryAction();
      this.autoRetry.clearRetryInfo();
      this.handlerStart();
    }
  }

  handlerEntryConnetion() {
    this.autoRetry.handlerSetTimeout(() => {
      //增加一次
      this.autoRetry.increaseRetryCount();
      //倒计完执行
      this.handlerStart();
    });
  }

  private handlerStart() {
    try {
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
          console.log("res----", res);
        });
    } catch (error) {
      console.log("error----", error);
    }
  }

  protected destory(
    text: string = "连接已关闭",
    opt: { videoScreenshot: boolean } = { videoScreenshot: false }
  ) {
    (navigator as any).connection.removeEventListener(
      "change",
      this.handlerNetworkChange
    );
    window.removeEventListener("offline", this.handlerOffline);

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
