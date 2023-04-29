<script lang="ts">
  export let loadingImage: string | HTMLImageElement;
</script>

{#if loadingImage instanceof HTMLImageElement}
  {loadingImage}
{:else}
  <img class="loading-image" src={loadingImage} alt="loadingImage" />
{/if}

<style>
  .loading-image {
    height: 200px;
    margin-bottom: 30px;
  }
</style>
