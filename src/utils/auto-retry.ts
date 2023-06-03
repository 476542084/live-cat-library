export class AutoRetry {
  static MaxCount = 5;
  constructor(private readonly appKey: string) {}
  isEmpty() {
    return !window.localStorage.getItem(this.appKey);
  }
  clearRetryInfo() {
    if (!this.isEmpty()) window.localStorage.removeItem(this.appKey);
  }
  initializeRetryInfo(taskId: number) {
    if (this.isEmpty())
      window.localStorage.setItem(this.appKey, `${this.appKey}-1-${taskId}`);
  }
  increaseRetryCount(countFlag: number = 1) {
    const res = this.getRetryInfo();
    if (res) {
      const { appKey, count, taskId } = res;
      if (count + countFlag > AutoRetry.MaxCount) {
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
    if (!this.isEmpty()) {
      try {
        const [appKey, count, taskId] = window.localStorage
          .getItem(this.appKey)!
          .split("-");
        return { appKey, count: +count, taskId: +taskId };
      } catch (_) {
        throw _;
      }
    }
    return null;
  }
  handlerSetTimeout(
    callBack: () => void,
    // conutDownCallBack: (countDown: number) => void,
    delay?: number
  ) {
    const { count } = this.getRetryInfo()!;
    if (count > AutoRetry.MaxCount) throw `over max retry count`;
    let countDown = delay ?? count * 15 * 1000;
    // let setIntervaler = window.setInterval(() => {
    //   conutDownCallBack(countDown / 1000 - 1);
    // }, 1000);
    window.setTimeout(() => {
      callBack();
    //   window.clearInterval(setIntervaler);
    }, countDown);
  }
}
