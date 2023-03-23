import FeedbackPanelEl from "./components/feedback-panel.svelte";
export class FeedbackPanel {
  private container: HTMLDivElement;
  constructor() {
    this.container = document.createElement("div");
    document.body.appendChild(this.container);
    new FeedbackPanelEl({ target: this.container });
  }
}