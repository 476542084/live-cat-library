import { iceParse, isTouch } from "../utils";
import type {
  StatusResponse,
  CommonResponse,
  StatusResponsePrivate,
  BaseOptionsType,
  DesignInfo,
  PrivateStartInfo,
  InitializeConfigType,
} from "./interface";
import { decode } from "js-base64";
function stringifyQuery(query: any) {
  return Object.keys(query)
    .reduce((ary, key) => {
      if (query[key] || typeof query[key] === "boolean") {
        ary.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(
            query[key]
          )}` as never
        );
      }
      return ary;
    }, [])
    .join("&");
}
export class Client {
  constructor(private address: string) {}
  async statusPrivate(params: {
    token: string;
    runningId: number;
    serverIp: string;
  }): Promise<StatusResponsePrivate> {
    return fetch(
      `${this.address}/app/running/status?${stringifyQuery(params)}`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.result && res.data.coturns) {
          try {
            res.data.coturns = iceParse(res.data.coturns);
          } catch (_) {}
        }
        return res;
      });
  }
  async status(taskId: number, token?: number): Promise<StatusResponse> {
    return fetch(
      `${this.address}/api/3dcat/application/running/status/${taskId}${
        !!token ? `?token=${token}` : ""
      }`,
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.result && res.data.coturns) {
          try {
            res.data.coturns = iceParse(res.data.coturns);
          } catch (_) {}
        }
        return res;
      });
  }
  /**
   * stop app with spectify runningId or token
   * @param params one of token or runningId must be provided
   * @returns fetch response
   */
  async stop(params: {
    token?: string;
    runningId?: string;
  }): Promise<CommonResponse> {
    return fetch(`${this.address}/api/3dcat/application/stopByToken`, {
      method: "POST",
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
  }

  async getAppConfig(
    params: BaseOptionsType
  ): Promise<CommonResponse<InitializeConfigType>> {
    const { address, ...currentParams } = params;
    return fetch(
      `${this.address}/api/3dcat/application/appConfig?${stringifyQuery(
        currentParams
      )}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.result) {
          res.data = this.handlerAppConfig(res.data);
        }
        // console.info(`return /api/3dcat/application/appConfig`, res.data);
        return res;
      });
  }

  async getPlayerUrl(
    params: BaseOptionsType
  ): Promise<CommonResponse<InitializeConfigType>> {
    const { address, ...currentParams } = params;
    return fetch(
      `${this.address}/api/3dcat/application/playerUrl?${stringifyQuery(
        currentParams
      )}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.result) {
          res.data = this.handlerAppConfig(res.data);
        }
        // console.info(`return /api/3dcat/application/playerUrl`, res.data);
        return res;
      });
  }

  async getDesignInfo(): Promise<CommonResponse<DesignInfo>> {
    return fetch(`${this.address}/siteDesign/info`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.result) {
          try {
            let {
              backgroundImagePc = "",
              backgroundImageH5 = "",
              loadingImage = "",
              toolbarLogo = "",
              browserIco = "",
              logo = "",
            } = res.data;
            loadingImage = loadingImage
              ? `${this.address}/${loadingImage}`
              : "";

            //重写横竖屏背景，不同端切换，背景图不会变更,私有化没有横竖屏
            let verticalLoading = isTouch()
              ? backgroundImageH5
              : backgroundImagePc;
            let horizontalLoading = isTouch()
              ? backgroundImageH5
              : backgroundImagePc;

            verticalLoading = verticalLoading
              ? `${this.address}/${verticalLoading}`
              : "";
            horizontalLoading = horizontalLoading
              ? `${this.address}/${horizontalLoading}`
              : "";

            toolbarLogo = toolbarLogo ? `${this.address}/${toolbarLogo}` : "";

            browserIco = browserIco ? `${this.address}/${browserIco}` : "";
            logo = logo ? `${this.address}/${logo}` : "";
            res.data = {
              ...res.data,
              horizontalLoading,
              verticalLoading,
              toolbarLogo,
              loadingImage,
              browserIco,
              logo,
            };
          } catch (_) {}
        }
        return res;
      });
  }

  async getPlayerUrlPrivate(
    params: BaseOptionsType
  ): Promise<CommonResponse<PrivateStartInfo>> {
    const { address, ...currentParams } = params;
    return fetch(`${this.address}/app/playerUrl`, {
      method: "POST",
      body: JSON.stringify(currentParams),
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
  }

  handlerAppConfig(data: URL) {
    let res;
    try {
      let search = new URL(data).search;
      let config: InitializeConfigType;
      let configStr = new URLSearchParams(search).get("config");
      config = JSON.parse(decode(decodeURIComponent(configStr || "")));
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
        ? `${this.address}${horizontalLoading}`
        : "";
      verticalLoading = verticalLoading
        ? `${this.address}${verticalLoading}`
        : "";

      //pc 背景图
      pcLoading = pcLoading ? `${this.address}${pcLoading}` : "";

      toolbarLogo = toolbarLogo ? `${this.address}${toolbarLogo}` : "";
      loadingImage = loadingImage ? `${this.address}${loadingImage}` : "";

      //重写横竖屏背景，不同端切换，背景图不会变更
      verticalLoading = isTouch() ? verticalLoading : pcLoading;
      horizontalLoading = isTouch() ? horizontalLoading : pcLoading;

      keyboardMappingConfig =
        keyboardMappingConfig &&
        typeof keyboardMappingConfig === "string" &&
        JSON.parse(keyboardMappingConfig);

      res = {
        ...config,
        appName,
        keyboardMappingConfig,
        horizontalLoading,
        verticalLoading,
        toolbarLogo,
        loadingImage,
      };
    } catch (_) {}
    return res;
  }
}
