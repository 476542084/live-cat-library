<script lang="ts">
  export let w: number = 12
  export let h: number = 12
</script>

<svg
  width={w}
  height="18"
  viewBox="0 0 {w} {h}"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="fill: currentColor;"
>
  <slot />
</svg>
