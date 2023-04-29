<script lang="ts">
  import { showFakePercent, loadingText, endPercentNum } from "../../store";
  import { onMount } from "svelte";
  import { CountUp } from "countup.js";

  export const updatePrecentHandler = "";
  let percentEl: HTMLSpanElement;
  let countUpIns: CountUp;
  onMount(() => {
    countUpIns = new CountUp(percentEl, $endPercentNum, {
      startVal: 0,
      duration: 2.5,
    });
    endPercentNum.subscribe((num) => {
      countUpIns && countUpIns.update(num);
    });
  });
</script>

<div class="loading-text">
  <span>{$loadingText}</span>
  {#if $showFakePercent}
    <span class="percent-num" bind:this={percentEl} />
    <span>%</span>
  {/if}
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
