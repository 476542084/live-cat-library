import FBPanel from "./feedback-panel.svelte";
export class FeedbackPanel {
  constructor(container: HTMLElement) {
    new FBPanel({ target: container });
  }
}
