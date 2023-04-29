import Loading from "./loading.svelte";
import { showFakePercent, endPercentNum, loadingText } from "../store";
import { Phase, PhasePercentMap } from "./phase-profile";
export interface Options {
  loadingImage: string | HTMLImageElement;
  loadingBgImage: { portrait: string; landscape: string };
  loadingBarImage: string | HTMLImageElement;
  showDefaultLoading: boolean;
  showFakePercent: boolean;
  enabledPlayButton: boolean;
}

interface ChangedOptions {
  phaseChanged: boolean;
  percentChanged: boolean;
}

interface OnChange {
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
  };
  static defaultChangedOptions: ChangedOptions = {
    phaseChanged: true,
    percentChanged: true,
  };
  private loadingCompoent: Loading;
  private options: Options;
  private changedOptions: ChangedOptions;
  private onChange: (cb: OnChange) => void;

  // @see https://github.com/rbuckton/reflect-metadata, but decorators are not stableable
  private _deltaTimeMetadata: number;
  private _phase?: Phase;
  private _percent: number = 0;
  set phase(v: Phase) {
    this._phase = v;
    this.changedOptions.phaseChanged &&
      this.handerAllChange(~~(performance.now() - this._deltaTimeMetadata));
  }
  get phase() {
    return this._phase!;
  }

  set percent(v: number) {
    this._percent = v;
    this.changedOptions.percentChanged &&
      this.handerAllChange(~~(performance.now() - this._deltaTimeMetadata));
  }
  get percent() {
    return this._percent;
  }
  constructor(
    container: HTMLElement,
    options: Options,
    changedOptions: ChangedOptions,
    onChange: (cb: OnChange) => void
  ) {
    this.options = { ...LoadingCompoent.defaultOptions, ...options };
    this.changedOptions = {
      ...LoadingCompoent.defaultChangedOptions,
      ...changedOptions,
    };
    this.onChange = onChange;
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
        showDefaultLoading,
      },
    });
  }
  protected showLoadingText(text: string, showPercent: boolean) {
    showFakePercent.set(this.options.showFakePercent || showPercent);
    loadingText.set(text);
  }
  protected changePhase(phase: Phase) {
    try {
      const [percent, text] = PhasePercentMap.get(phase)!;
      this.phase = phase;
      this.percent = percent;
      showFakePercent.set(this.options.showFakePercent); //reset
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
  protected destroy() {
    this.loadingCompoent.$destroy();
  }
  protected updateOptions(options: Options) {
    this.loadingCompoent.$set({
      ...this.options,
      ...options,
      loadingBgImage: {
        ...this.options.loadingBgImage,
        ...options.loadingBgImage,
      },
    });
  }
}
