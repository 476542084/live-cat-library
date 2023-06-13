export class AutoRetry {
  static MaxCount = 5;
  static Power = 3; //3
  private timer?: number;
  constructor(private readonly appKey: string) {}
  get isOverMaxCount() {
    return this.getRetryInfo()?.count! > AutoRetry.MaxCount;
  }
  get isEmpty() {
    return !window.localStorage.getItem(this.appKey);
  }
  setupCount(count: number) {
    const res = this.getRetryInfo();
    if (res) {
      const { appKey, taskId } = res;
      window.localStorage.setItem(appKey, `${this.appKey}-${count}-${taskId}`);
      return true;
    }
    return false;
  }
  clearRetryInfo() {
    if (!this.isEmpty) window.localStorage.removeItem(this.appKey);
  }
  initializeRetryInfo(taskId: number) {
    window.localStorage.setItem(this.appKey, `${this.appKey}-1-${taskId}`);
  }
  increaseRetryCount(countFlag: number = 1) {
    const res = this.getRetryInfo();
    if (res) {
      const { appKey, count, taskId } = res;
      if (count > AutoRetry.MaxCount) {
        return false;
      }
      window.localStorage.setItem(
        appKey,
        `${appKey}-${count + countFlag}-${taskId}`
      );
      return true;
    }
    return false;
  }
  getRetryInfo() {
    if (!this.isEmpty) {
      const [appKey, count, taskId] = window.localStorage
        .getItem(this.appKey)!
        .split("-");
      return { appKey, count: +count, taskId: +taskId };
    }
    return null;
  }
  handlerSetTimeout(callBack: () => void, delay?: number) {
    const { count } = this.getRetryInfo()!;
    if (count > AutoRetry.MaxCount + 1) throw `over max retry count`;
    let countDown = delay ?? count * AutoRetry.Power * 1000;
    this.timer = window.setTimeout(() => {
      callBack();
    }, countDown);
  }

  destroy() {
    this.timer && window.clearTimeout(this.timer);
  }
}
