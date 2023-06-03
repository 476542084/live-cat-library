<script lang="ts">
  import Viewport from "svelte-viewport-info";
  import { windowOrientation } from "../store";
  const handlerOrientation = () =>
    Viewport.Orientation && windowOrientation.set(Viewport.Orientation);
  handlerOrientation();
</script>

<svelte:window on:orientationchangeend={() => handlerOrientation()} />
<div id="live-cat-library">
  <slot />
</div>

<style>
  :global(
      #live-cat-library *,
      #live-cat-library *:before,
      #live-cat-library *:after
    ) {
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
  }
  #live-cat-library {
    font-family: "Source Han Sans CN", "Segoe UI", "PingFang SC",
      "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial,
      sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    text-rendering: optimizeLegibility;
    -ms-overflow-style: scrollbar;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100%;
    height: 100%;
    z-index: 99999;
    background-color: black;
    position: fixed;
    left: 0;
    top: 0;
  }
</style>
