import { LauncherBase } from "../../rtc-connect/example/live-cat-debug-page/node_modules/live-cat";
import type { Options } from "../../rtc-connect/example/live-cat-debug-page/node_modules/live-cat/types/launcher-base";
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

import { isTouch, sleep } from "./utils";

interface ExtendUIOptions {
  onChange: (cb: OnChange) => void;
  onQueue: (rank: number) => void;
  onError: (reason: string) => void;
}
type UIOptions = Options & ExtendUIOptions;

export class LauncherUI {
  static defaultExtendOptions: ExtendUIOptions = {
    onChange: () => {},
    onQueue: () => {},
    onError: () => {},
  };
  private client: Client;
  private extendUIOptions: ExtendUIOptions;
  loading?: LoadingCompoent;

  taskId?: string;
  token?: string;
  agoraServiceVerify?: string;
  coturns?: RTCIceServer[];
  signaling?: string;
  showCastScreenUsers?: boolean;

  launcherBase?: LauncherBase;
  constructor(
    protected baseOptions: BaseOptionsType,
    protected hostElement: HTMLElement,
    protected options?: Partial<UIOptions>
  ) {
    this.extendUIOptions = { ...LauncherUI.defaultExtendOptions, ...options };
    this.client = new Client(baseOptions.address);
    this.client
      .getPlayerUrl(this.baseOptions)
      .then(async (res) => {
        if (+res.code !== 200) {
          throw res.code;
        }
        return res.data;
      })
      .then((data) => {
        const {
          loadingImage,
          horizontalLoading,
          verticalLoading,
          taskId,
          showCastScreenUsers,
          token,
        } = this.formatInitializeConfig(data);
        this.showCastScreenUsers = showCastScreenUsers;
        this.token = token;

        this.loading = new LoadingCompoent(
          this.hostElement,
          {
            loadingImage: loadingImage,
            loadingBgImage: {
              portrait: verticalLoading,
              landscape: horizontalLoading,
            },
            loadingBarImage: loadingImage,
          },
          (cb: OnChange) => {
            this.extendUIOptions.onChange(cb);
          }
        );
        return taskId.toString();
      })
      .then((taskId) => this.waitForRunning(taskId))
      .then((res) => this.handlerStatusSwitch(res));
  }

  private waitForRunning = async (
    taskId: string
  ): Promise<StatusResponse["data"]> => {
    const res = await this.client.status({ taskId });
    return this.handerWaitForRunning(res, taskId);
  };

  private handerWaitForRunning = async (
    res: StatusResponse,
    taskId: string
  ) => {
    const { status } = res.data;
    if (status === Status.QueueWaiting) {
      this.loading?.showLoadingText(
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
        //only in screen mode, replace the Status token
        this.token && (token = this.token);
        this.token = token;
        this.agoraServiceVerify = agoraServiceVerify;
        this.coturns = coturns ?? [];
        this.signaling = signaling ?? "";

        const options = { ...LauncherUI.defaultExtendOptions, ...this.options };

        this.launcherBase = new LauncherBase(
          signaling,
          coturns,
          this.hostElement,
          options
        );
        break;
      case Status.QueueCancel:
        this.loading?.showLoadingText("排队已取消，请重新连接", false);
        this.extendUIOptions.onError(
          `status:${Status.QueueCancel}, message:排队已取消，请重新连接`
        );
        break;
      case Status.Failed:
        this.loading?.showLoadingText("运行失败", false);
        this.extendUIOptions.onError(
          `status:${Status.Failed}, message:运行失败`
        );
        break;
      case Status.NoIdle:
        this.loading?.showLoadingText("节点资源不足", false);
        this.extendUIOptions.onError(
          `status:${Status.NoIdle}, message:节点资源不足`
        );
        break;
      case Status.Stopped:
        this.loading?.showLoadingText("运行结束", false);
        this.extendUIOptions.onError(
          `status:${Status.Stopped}, message:运行结束`
        );
        break;
      default:
        this.loading?.showLoadingText("Unknown", false);
        this.extendUIOptions.onError(`status:Unknown, message:未知错误`);
        break;
    }
  };

  private formatInitializeConfig(config: InitializeConfigType) {
    let {
      appName = "Player",
      horizontalLoading,
      verticalLoading,
      pcLoading,
      keyboardMappingConfig,
      toolbarLogo,
      loadingImage,
    } = config;

    horizontalLoading = horizontalLoading
      ? `${this.baseOptions.address}${horizontalLoading}`
      : "";
    verticalLoading = verticalLoading
      ? `${this.baseOptions.address}${verticalLoading}`
      : "";

    //pc 背景图
    pcLoading = pcLoading ? `${this.baseOptions.address}${pcLoading}` : "";
    toolbarLogo = toolbarLogo
      ? `${this.baseOptions.address}${toolbarLogo}`
      : "";
    loadingImage = loadingImage
      ? `${this.baseOptions.address}${loadingImage}`
      : "";

    verticalLoading = isTouch() ? verticalLoading : pcLoading;
    horizontalLoading = isTouch() ? horizontalLoading : pcLoading;

    keyboardMappingConfig =
      keyboardMappingConfig &&
      typeof keyboardMappingConfig === "string" &&
      JSON.parse(keyboardMappingConfig);
    return {
      ...config,
      appName,
      keyboardMappingConfig,
      horizontalLoading,
      verticalLoading,
      toolbarLogo,
      loadingImage,
    };
  }
}
