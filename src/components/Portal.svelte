<div
  on:pointerup|stopPropagation
  on:pointerdown|stopPropagation
  on:pointermove|stopPropagation
>
  <slot />
</div>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
