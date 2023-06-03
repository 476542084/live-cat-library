import Loading from "../loading/loading.svelte";
import {
  showFakePercent,
  endPercentNum,
  loadingText,
  currentPercentNum,
} from "../store";
import { PhasePercentMap } from "../loading/phase-profile";
import type { Phase } from "live-cat/types/launcher-base";

export interface Options {
  loadingImage: string | HTMLImageElement;
  loadingBgImage: { portrait: string; landscape: string };
  loadingBarImage: string | HTMLImageElement;
  showDefaultLoading: boolean;
  showFakePercent: boolean;
  enabledPlayButton: boolean;

  phaseChanged: boolean;
  percentChanged: boolean;
}
export interface OnChange {
  phase: Phase;
  fakePercent: number;
  deltaTime: number;
}

export class LoadingCompoent {
  static defaultOptions: Options = {
    loadingImage: "",
    loadingBgImage: { portrait: "", landscape: "" },
    loadingBarImage: "",
    showDefaultLoading: true,
    showFakePercent: true,
    enabledPlayButton: false,

    phaseChanged: true,
    percentChanged: true,
  };
  loadingCompoent: Loading;
  private options: Options;
  // private onChange: (cb: OnChange) => void;

  // @see https://github.com/rbuckton/reflect-metadata, but decorators are not stableable
  private _deltaTimeMetadata: number;
  private _phase?: Phase;
  private _percent: number = 0;
  set phase(v: Phase) {
    this._phase = v;
    this.options.phaseChanged &&
      this.handerAllChange(~~(performance.now() - this._deltaTimeMetadata));
  }
  get phase() {
    return this._phase!;
  }

  set percent(v: number) {
    this._percent = v;
    this.options.percentChanged &&
      this.handerAllChange(~~(performance.now() - this._deltaTimeMetadata));
  }
  get percent() {
    return this._percent;
  }
  constructor(
    protected container: HTMLElement,
    options?: Partial<Options>,
    protected onChange?: (cb: OnChange) => void
  ) {
    this.options = {
      ...LoadingCompoent.defaultOptions,
      ...options,
    };
    this.changePhase("initial");
    this._deltaTimeMetadata = performance.now();
    const {
      loadingImage,
      loadingBgImage,
      showDefaultLoading,
      loadingBarImage,
    } = this.options;

    this.loadingCompoent = new Loading({
      target: container,
      props: {
        loadingImage,
        loadingBgImage,
        loadingBarImage,
        showDefaultLoading: showDefaultLoading ?? false,
      },
    });
    currentPercentNum.subscribe((percent) => {
      this.percent = percent;
    });
  }
  showLoadingText(text: string, showPercent?: boolean) {
    showFakePercent.set(showPercent! ?? this.options.showFakePercent);
    loadingText.set(text);
  }

  changePhase(phase: Phase) {
    try {
      const [percent, text] = PhasePercentMap.get(phase)!;
      this.phase = phase;
      showFakePercent.set(this.options.showFakePercent!); //reset
      endPercentNum.set(percent);
      loadingText.set(text);
    } catch {
      throw new Error(`No detail was found for this phase: "${phase}"`);
    }
  }
  private handerAllChange(deltaTime: number) {
    this.onChange &&
      this.onChange({
        phase: this.phase,
        fakePercent: this.percent,
        deltaTime: deltaTime,
      });
  }
  destroy() {
    this.loadingCompoent.$destroy();
  }
}
