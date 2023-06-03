<script lang="ts">
  export let w: number = 12;
  export let h: number = 12;
  export let width: number = w;
  export let height: number = 18;
</script>

<svg
  {width}
  {height}
  viewBox="0 0 {w} {h}"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="fill: currentColor;"
>
  <slot />
</svg>
