// import { LoadingCompoent } from "live-cat-library";
import { LauncherUI } from "live-cat-library";

const container = document.createElement("div");
container.style.width = "100%";
container.style.height = "100%";
container.style.margin = "auto";
document.body.appendChild(container);

function bootstrap() {
  let launcherUI = new LauncherUI(
    {
      address: "https://app.3dcat.live",
      appKey: "5wBhF6hR5TLZUSgl", //unity 多点
      // appKey: "kLofk3YjeQMIILqQ", //ue 多点
    },
    container,
    {
      onPlay: () => {
        console.log("player---------");
      },
      onChange: (res) => {
        console.log("onChange", res);
      },
      onQueue: (res) => {
        console.log("onQueue", res);
      },

      onLoadingError: (res) => {
        console.error("onLoadingError", res);
      },

      onError: (res) => {
        console.error("onError", res);
      },
      onPhaseChange: (res) => {
        console.log("onPhaseChange", res);
      },
      onMount: (res) => {
        console.log("onMount", res);
      },
      onRotate: (r) => {
        console.log("onRotate", r);
      },
      onTaskId: (r) => {
        console.log("onTaskId", r);
      },
      onShowUserList: (r) => {
        console.log("onShowUserList", r);
      },
      onRunningOptions: (r) => {
        console.log("onRunningOptions", r);
      },
    }
  );
  window.launcher = launcherUI;
}

window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.userAgent.includes("miniProgram") ||
    navigator.userAgent.includes("MicroMessenger")
  ) {
    //微信浏览器/微信小程序环境
    document.addEventListener("WeixinJSBridgeReady", bootstrap, false);
  } else {
    bootstrap();
  }
});
