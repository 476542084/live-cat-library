<svelte:options accessors={true} />

<script lang="ts">
  import type { Options } from "./loading";
  import DefaultLoading from "./icons/3dcat-loading.svelte";
  import EnterButton from "./components/enter-button.svelte";
  import LoadingImage from "./components/loading-inage.svelte";
  import LoadingText from "./components/loading-text.svelte";
  import LoadingBar from "./components/loading-bar.svelte";
  import Portal from "../components/portal.svelte";
  import { autoLoadingVideo, windowOrientation } from "../store";

  export let loadingImage: string | HTMLImageElement;
  export let loadingBgImage: Options["loadingBgImage"];
  export let loadingBarImage: string | HTMLImageElement;
  export let showDefaultLoading: boolean;
  $: currentLoadingBgImage =
    $windowOrientation === "landscape"
      ? loadingBgImage.landscape
      : loadingBgImage.portrait;
  $: backgroundStyle = !!currentLoadingBgImage
    ? `url(${currentLoadingBgImage}) center center / cover`
    : "unset";
</script>

<Portal>
  <div class="loading-container" style="background:{backgroundStyle}">
    <div
      class="loading-content"
      style="
        height:{loadingImage ? 'auto' : showDefaultLoading ? '40%' : 'initial'};
      "
    >
      {#if !!currentLoadingBgImage}
        <LoadingBar {loadingBarImage}>
          <LoadingText />
        </LoadingBar>
      {:else if loadingImage}
        <LoadingImage {loadingImage} />
        <LoadingText />
      {:else if showDefaultLoading}
        <DefaultLoading />
        <LoadingText />
      {:else}
        <LoadingText />
      {/if}

      {#if !$autoLoadingVideo}
        <EnterButton hasLoadingBgImage={!!loadingBgImage} />
      {/if}
    </div>
  </div>
</Portal>

<style>
  .loading-container {
    font-size: 1.8em;
    color: white;
    width: 100%;
    height: 100%;
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
  }
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
  }
</style>
