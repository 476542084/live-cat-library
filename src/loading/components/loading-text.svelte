<script lang="ts">
  import {
    showFakePercent,
    loadingText,
    endPercentNum,
    currentPercentNum,
  } from "../../store";
  import { onMount } from "svelte";
  import { CountUp } from "countup.js";

  export const updatePrecentHandler = "";
  let percentEl: HTMLSpanElement;
  let countUpIns: CountUp;
  let num: number = 0;
  onMount(() => {
    countUpIns = new CountUp(percentEl, $endPercentNum, {
      startVal: 0,
      duration: 2.5,
    });
    endPercentNum.subscribe((num) => {
      countUpIns && countUpIns.update(num);
    });

    const mutationCallback: MutationCallback = (mutations, observer) => {
      const textNum = +mutations[0].target.textContent!;
      if (!isNaN(textNum) && textNum > 0 && textNum !== num) {
        currentPercentNum.set(textNum);
        num = textNum;
      }
      if (!isNaN(textNum) && textNum === 100) {
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(mutationCallback);
    observer.observe(percentEl, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  });
</script>

<div class="loading-text">
  <span>{$loadingText}</span>
  <!-- 使用if标签会使排队(show：false)之后，MutationObserver监听失效 -->
  <span
    class="percent-num"
    style="display:{$showFakePercent ? 'inline-block' : 'none'}"
    bind:this={percentEl}
  />
  <span style="display:{$showFakePercent ? 'inline-block' : 'none'}">%</span>
</div>

<style>
  .loading-text {
    font-size: 14px;
    display: flex;
  }
  .loading-text span + span {
    display: block;
  }
  .percent-num {
    margin-left: 4px;
  }
</style>
