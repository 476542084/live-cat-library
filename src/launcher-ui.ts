import { LauncherBase2 as LauncherBase } from "../../rtc-connect/example/live-cat-debug-page/node_modules/live-cat";
import type { Option } from "./client/interface";
export class LauncherUI extends LauncherBase {
  constructor(
    protected url: string,
    protected iceConfig: RTCIceServer[],
    protected hostElement: HTMLElement,
    options?: Partial<Option>
  ) {
    super(options);
  }
  
}
