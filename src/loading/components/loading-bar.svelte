<script lang="ts">
  export let loadingBarImage: string | HTMLImageElement;
  import LoadingBar from "../icons/loading-bar.svelte";
</script>

<div class="bar-container">
  {#if loadingBarImage instanceof HTMLImageElement}
    {loadingBarImage}
  {:else if loadingBarImage}
    <img style="width:24px" src={loadingBarImage} alt="loadingBarImage" />
  {:else}
    <LoadingBar />
  {/if}

  <slot />
</div>

<style>
  .bar-container {
    position: fixed;
    bottom: 0px;
    height: 80px;
    width: 100%;
    background-color: rgb(38, 38, 38);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 14px;
  }
</style>
