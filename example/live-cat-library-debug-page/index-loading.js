import { LauncherBase } from "live-cat";
import { LoadingCompoent } from "live-cat-library";
let loading, initializeConfig, launcherBase;
const container = document.querySelector("body");
document.querySelector("body").style.width = "100%";
document.querySelector("body").style.height = "100%";
const options = {
  startType: 1,
  onQuit: () => {},
  onPlay: () => {
    loading.destroy();
  },
  onError: (error) => {
    console.error("error", error);
    launcherBase.destroy(error);
    //不能用loading去展示，因为已经在onPlay阶段被销毁
    launcherBase.player.showTextOverlay(error);
  },
  onPhaseChange: (phase) => {
    console.info("phase", phase);
    loading.changePhase(phase);
  },
  //...Options
};
const address = "https://app.3dcat.live";
const appKey = "xxxx";
const bootstrap = async () => {
  loading = new LoadingCompoent(
    container,
    {
      showDefaultLoading: true,
      showFakePercent: true,
    },
    (cb) => {
      console.log("cb", cb);
    }
  );

  const getPlayerUrlRes = await getPlayerUrl({ appKey });
  if (getPlayerUrlRes.result) {
    const search = new URL(getPlayerUrlRes.data).search;
    const configStr = new URLSearchParams(search).get("config");
    const config = JSON.parse(b64DecodeUnicode(configStr));
    //config: InitializeConfigType
    const { taskId, ...rest } = config;
    initializeConfig = rest;
    console.info("initializeConfig", rest);
    // loading.loadingCompoent.loadingImage = "xxx";

    return waitingForStatus(taskId);
  } else {
    loading.showLoadingText(getPlayerUrlRes.message, false);
    // loading.showLoadingText(getPlayerUrlRes.message);
  }
};
const waitingForStatus = async (taskId) => {
  const statusRes = await status(taskId);
  //statusRes：StatusInterface
  if (statusRes.result) {
    const { status, rank } = statusRes.data;
    if (status === 15) {
      //Status.QueueWaiting: 15
      console.info(`排队，排在：${rank ?? 0}位`);
      loading.showLoadingText(`排队，排在：${rank ?? 0}位`, false);
      await sleep(1000);
      return await waitingForStatus(taskId);
    }
    if (status !== 10) {
      //Status.Scheduling: 10
      if (status === 20 || status === 30) {
        //Status.Pending:20,Status.Running:30
        const { signaling, token, coturns } = statusRes.data;
        launcherBase = new LauncherBase(
          `${signaling}/clientWebsocket/${token}`,
          coturns,
          container,
          { ...initializeConfig, ...options }
        );
        window.launcherBase = launcherBase;
        return;
      }
      console.error("失败", status);
      loading.showLoadingText(`失败：${status}`, false);
      return statusRes.data;
    }
    await sleep(500);
    return await waitingForStatus(taskId);
  }
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getPlayerUrl(params) {
  const { appKey } = params;
  return fetch(`${address}/api/3dcat/application/playerUrl?appKey=${appKey}`, {
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.json());
}

async function status(taskId) {
  return fetch(`${address}/api/3dcat/application/running/status/${taskId}`, {
    method: "GET",
  })
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

function b64DecodeUnicode(str) {
  // return  atob(decodeURIComponent()) //该方法，如果有中文会乱码，弃用
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(decodeURIComponent(str))
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
}

function iceParse(ice, enableTCP = false) {
  return ice.map((server) => {
    const [urls, auth] = server.split("@");
    const [username, credential] = auth.split(":");
    return {
      urls: [enableTCP ? urls.concat("?transport=tcp") : urls],
      username,
      credential,
    };
  });
}

window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.userAgent.includes("miniProgram") ||
    navigator.userAgent.includes("MicroMessenger")
  ) {
    //NOTE: wechat environment started
    document.addEventListener("WeixinJSBridgeReady", bootstrap);
  } else {
    bootstrap();
  }
});
