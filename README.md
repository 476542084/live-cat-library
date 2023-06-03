# live-cat-library

> This is a component library for [3DCAT](https://www.3dcat.live/)

# live-cat Launcher

<p align="center">
<a title="MIT" target="_blank" href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square"></a>
<a title="npm bundle size" target="_blank" href="https://www.npmjs.com/package/live-cat"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/live-cat?style=flat-square&color=blueviolet"></a>
<a title="Version" target="_blank" href="https://www.npmjs.com/package/live-cat"><img src="https://img.shields.io/npm/v/live-cat.svg?style=flat-square"></a><br>
<a title="Downloads" target="_blank" href="https://www.npmjs.com/package/live-cat"><img src="https://img.shields.io/npm/dt/live-cat.svg?style=flat-square&color=97ca00"></a>
<a title="jsdelivr" target="_blank" href="https://www.jsdelivr.com/package/npm/live-cat"><img src="https://data.jsdelivr.com/v1/package/npm/live-cat/badge"/></a>
</p>

# Features： 

- [x] Loading Component
- [ ] FeedbackPanel Component
- [ ] ScreenManager Component
- [x] AgoraRTCVerify Component
- [x] LauncherUI
- [x] LauncherPrivateUI
- [x] Client

# Technologies

- Svelte v3.57.0
- Rollup v2.78.0
- Typescript v4.9.5

# quick start

## instantiation parameter

```typescript
interface BaseOptionsType {
  address: string; // address
  appId?: string; // appId
  appKey?: string; // appKey
  appSecret?: string; // appSecret
  startType?: StartType;
  castScreenMaxQty?: number;
  castScreenNickname?: string;
  castScreenPwd?: string;
  isCastScreenMaster?: boolean;
  serverIp?: string; //for coturn server
  joinType?: ScreenJoinType; //only screen
  optionalParam?: string; // command line parameters
  exeParameter?: string; // command line parameters for privatization
}
```

> Options detail to see [live-cat](https://www.npmjs.com/package/live-cat?activeTab=readme)

```typescript
type UIOptions = Options & loadingOptions & ExtendUIOptions;

interface loadingOptions {
  loadingImage: string | HTMLImageElement;
  loadingBgImage: { portrait: string; landscape: string };
  loadingBarImage: string | HTMLImageElement;
  showDefaultLoading: boolean;
  showFakePercent: boolean;

  phaseChanged: boolean;
  percentChanged: boolean;
}
interface ExtendUIOptions {
  onChange: (cb: OnChange) => void;
  onQueue: (rank: number) => void;
  onLoadingError: (err: LoadingError) => void;
  onTaskId: (taskId: number) => void;
  onShowUserList: (showCastScreenUsers: boolean) => void;
  onRunningOptions: (opt: OnRunningOptions) => void;
}
enum StartType {
  Normal = 1,
  Screen = 3,
}
enum ScreenJoinType {
  Secret = 1,
  Link,
}
```

```typescript
// Public Cloud
import { LauncherUI } from "live-cat-library";

const container = document.querySelector("body");
document.querySelector("body").style.width = "100%";
document.querySelector("body").style.height = "100%";
const baseOptionsType = {
  address: "https://app.3dcat.live",
  appKey: "xxxx",
  startType: 1,
};
const uiOptions = {
  loadingImage: "",
};
let launcher = new LauncherUI(baseOptionsType, container, uiOptions);

window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.userAgent.includes("miniProgram") ||
    navigator.userAgent.includes("MicroMessenger")
  ) {
    //wechat
    document.addEventListener("WeixinJSBridgeReady", bootstrap, false);
  } else {
    bootstrap();
  }
});
```

```typescript
// Private Cloud
import { LauncherPrivateUI } from "live-cat-library";

const container = document.querySelector("body");
document.querySelector("body").style.width = "100%";
document.querySelector("body").style.height = "100%";
const baseOptionsType = {
  address: "xxxxx",
  appKey: "xxxx",
  startType: 1,
};
const uiOptions = {
  loadingImage: "",
};
let launcher = new LauncherPrivateUI(baseOptionsType, container, uiOptions);

window.addEventListener("DOMContentLoaded", () => {
  if (
    navigator.userAgent.includes("miniProgram") ||
    navigator.userAgent.includes("MicroMessenger")
  ) {
    //wechat
    document.addEventListener("WeixinJSBridgeReady", bootstrap, false);
  } else {
    bootstrap();
  }
});
```

# License

MIT
