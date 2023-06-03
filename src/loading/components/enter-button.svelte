<script lang="ts">
  import { autoLoadingVideoHandler } from "../../store";
  import Enter from "../icons/enter.svelte";
  export let hasLoadingBgImage: boolean;
</script>

<div
  class="enter-button-container {hasLoadingBgImage ? 'bg-flag' : 'not-bg-flag'}"
  on:touchstart={() => $autoLoadingVideoHandler()}
>
  <span class="enter-app">进入应用</span>
  <Enter class="enter-svg" />
</div>

<style>
  .enter-button-container {
    height: 50px;
    padding: 0px 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    cursor: pointer;
    color: white;
  }
  .enter-button-container:active {
    color: rgba(255, 255, 255, 0.6);
  }
  .bg-flag {
    position: relative;
    margin-top: 30px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  .not-bg-flag {
    position: fixed;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.4);
    left: 50%;
    top: 50%;
  }
  .enter-app {
    font-size: 14px;
    margin-right: 4px;
  }
</style>
