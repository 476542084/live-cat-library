import { LauncherBase } from "live-cat";
import type { Options } from "live-cat/types/launcher-base";
import { Client } from "./client";
import type {
  BaseOptionsType,
  DesignInfo,
  PrivateStartInfo,
  StatusPrivateInterface,
  StatusResponsePrivate,
} from "./client/interface";
import { LoadingCompoent } from "./loading/loading";
import type { OnChange } from "./loading/loading";

import { isIOS, isWeiXin, sleep, takeScreenshotUrl } from "./utils";
import { autoLoadingVideoHandler, autoLoadingVideo } from "./store";
import { ErrorStateMap } from "./utils/error-profile";
import type { Phase } from "live-cat/types/launcher-base";
import type { ErrorState } from "live-cat/types/launcher-base";
import { StatusMap } from "./utils/status-code";
import type { Options as loadingOptions } from "./loading/loading";

enum VirtualControlDisplayType {
  HideAll = 0,
  DisplayMobile = 1,
  DisplayPc = 2,
  DisplayAll = 3,
}
enum InputHoverButton {
  Hide,
  Display,
}

interface LoadingError {
  code: number | string;
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
  onRunningId: (taskId: number) => void;
  onShowUserList: (showCastScreenUsers: boolean) => void;
  onRunningOptions: (opt: OnRunningOptions) => void;
}

type UIOptions = Options & ExtendUIOptions & loadingOptions;

export class LauncherPrivateUI {
  static defaultExtendOptions: ExtendUIOptions = {
    onChange: () => {},
    onQueue: () => {},
    onLoadingError: () => {},
    onRunningId: () => {},
    onShowUserList: () => {},
    onRunningOptions: () => {},
    ...LoadingCompoent.defaultOptions,
  };
  loading: LoadingCompoent;
  launcherBase?: LauncherBase;
  private location: URL;
  private client: Client;
  private extendUIOptions: ExtendUIOptions;
  private toolbarLogo?: string;
  private diffServerAndDiyOptions?: Options;
  constructor(
    protected baseOptions: BaseOptionsType,
    protected hostElement: HTMLElement,
    protected options?: Partial<UIOptions>
  ) {
    this.extendUIOptions = {
      ...LauncherPrivateUI.defaultExtendOptions,
      ...options,
    };
    this.location = new URL(this.baseOptions.address);
    this.loading = new LoadingCompoent(this.hostElement, {}, (cb: OnChange) => {
      this.extendUIOptions.onChange(cb);
    });

    this.client = new Client(baseOptions.address);

    this.client
      .getDesignInfo()
      .then((res) => {
        if (!res.result) {
          this.handlerError({
            code: res.code,
            reason: StatusMap.get(res.code) || res.message,
          });
          throw res.code;
        }
        return res.data;
      })
      .then((data) => {
        this.handlerMultipleOptions(data);
        this.client
          .getPlayerUrlPrivate({
            ...this.baseOptions,
            serverIp: this.location.hostname,
          })
          .then(async (res) => {
            if (!res.result) {
              this.handlerError({
                code: res.code,
                reason: StatusMap.get(res.code) || res.message,
              });
              throw res.code;
            }
            return res.data;
          })
          .then((data) => {
            const { token, id: runningId } = data;
            this.formatInitializeConfig(data);
            this.options?.onRunningId && this.options.onRunningId(runningId);
            return { token, runningId };
          })
          .then(({ token, runningId }) => this.waitForRunning(token, runningId))
          .then((res) => this.handlerStatusSwitch(res));
      });
  }

  private formatInitializeConfig(data: PrivateStartInfo) {
    let {
      appName = "Player",
      keyboardMappingConfig,
      pcFloatingButton,
      defaultBitrate,
      userList,
      needLandscape,
    } = data;
    keyboardMappingConfig =
      keyboardMappingConfig &&
      typeof keyboardMappingConfig === "string" &&
      JSON.parse(keyboardMappingConfig);
    const display = this.checkVirtualDisplayType(data);
    const inputDisplayType = pcFloatingButton
      ? InputHoverButton.Display
      : InputHoverButton.Hide;

    document.title = appName;
    this.options?.onShowUserList && this.options.onShowUserList(userList);

    this.diffServerAndDiyOptions = {
      ...LauncherBase.defaultOptions,
      ...this.options,
      needLandscape: this.options?.needLandscape || needLandscape!,
      settingHoverButton: this.options?.settingHoverButton || display!,
      keyboardMappingConfig:
        this.options?.keyboardMappingConfig || keyboardMappingConfig!,
      inputHoverButton: this.options?.inputHoverButton || inputDisplayType!,
      rateLevel: this.options?.rateLevel || defaultBitrate,
    };
  }

  private checkVirtualDisplayType(data: PrivateStartInfo) {
    let { pcFloatingToolbar, mFloatingToolbar, mfloatingToolbar } = data;
    mFloatingToolbar = mFloatingToolbar! || mfloatingToolbar!;
    if (pcFloatingToolbar && mFloatingToolbar)
      return VirtualControlDisplayType.DisplayAll;
    if (pcFloatingToolbar) return VirtualControlDisplayType.DisplayPc;
    if (mFloatingToolbar) return VirtualControlDisplayType.DisplayMobile;
    return VirtualControlDisplayType.HideAll;
  }

  private handlerMultipleOptions(data: DesignInfo) {
    const {
      loadingImage,
      horizontalLoading,
      verticalLoading,
      toolbarLogo,
    } = data;
    this.toolbarLogo = toolbarLogo;
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
    token: string,
    runningId: number
  ): Promise<StatusResponsePrivate["data"]> => {
    const res = await this.client.statusPrivate({
      token,
      runningId,
      serverIp: this.location.hostname,
    });
    if (
      res.data.status === "running" ||
      res.data.status === "failed" ||
      res.data.status === "stopped"
    ) {
      return res.data;
    }
    await sleep(500);
    return await this.waitForRunning(token, runningId);
  };

  private handlerStatusSwitch = (res: StatusPrivateInterface): void => {
    let { token = "", signaling, coturns, status } = res;
    const socketProtocol = this.location.protocol === "https:" ? "wss:" : "ws:";
    const host = this.location.host;
    signaling = `${socketProtocol}//${host}`;
    switch (status) {
      case "running":
      case "pending":
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
          toolbarLogo: this.options?.toolbarLogo || this.toolbarLogo,
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
        break;
      case "failed":
        this.handlerError({
          code: "failed",
          reason: "节点资源不足，勿刷新页面，请稍后重新进入",
        });
        break;
      case "stopped":
        this.handlerError({
          code: "stopped",
          reason: "运行结束，勿刷新页面，请重新进入",
        });
        break;
      default:
        this.handlerError({ code: "Unknown", reason: "未知错误" });
        break;
    }
  };
  private handlerError(err: LoadingError) {
    this.loading.loadingCompoent.showDefaultLoading = false;
    this.loading.showLoadingText(err.reason, false);
    this.extendUIOptions.onLoadingError({
      code: err.code,
      reason: err.reason,
    });
  }

  protected destory(
    text: string = "连接已关闭",
    opt: { videoScreenshot: boolean } = { videoScreenshot: false }
  ) {
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
