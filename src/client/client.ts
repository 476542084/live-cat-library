import type {
  StatusResponse,
  CommonResponse,
  StatusResponsePrivate,
  BaseOptionsType,
  DesignInfo,
  PrivateStartInfo,
} from "./interface";
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
  public taskId?: number;
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
    ).then((response) => response.json());
  }
  async status(token?: string): Promise<StatusResponse> {
    return fetch(
      `${this.address}/api/3dcat/application/running/status/${this.taskId}${
        !!token ? `?token=${token}` : ""
      }`,
      {
        method: "GET",
      }
    ).then((response) => response.json());
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

  async getPlayerUrl(params: BaseOptionsType): Promise<CommonResponse<string>> {
    const { address, ...currentParams } = params;
    return fetch(
      `${this.address}/api/3dcat/application/playerUrl?${stringifyQuery(
        currentParams
      )}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    ).then((response) => response.json());
  }

  async getDesignInfo(): Promise<CommonResponse<DesignInfo>> {
    return fetch(`${this.address}/siteDesign/info`, {
      headers: { "Content-Type": "application/json" },
    }).then((response) => response.json());
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
}
