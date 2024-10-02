<script>
  import { ImageLoader } from "./imageLoader";
  import { library, libraryLoad } from "./stores.svelte";

  let { _this = $bindable() } = $props();
</script>

<div
  bind:this={_this}
  class="grid grid-cols-5 gap-px overflow-y-auto bg-background pt-[calc(5.5rem+var(--safe-t))] md:grid-cols-7 lg:grid-cols-9 [&>a]:aspect-square"
  use:ImageLoader={{ update: library }}
>
  {#if false}
    <div class="bg-red col-start-4">TODO make last row full, first row partial</div>
  {/if}
  {#each Object.values(library) as content, i}
    <a class="bg-card" href="content?id={content.id}" aria-label={content.author} data-sveltekit-keepfocus>
      <img
        alt=""
        data-src={content.src_resize([
          (Math.max(window.innerWidth, window.innerHeight) / 5) * window.devicePixelRatio,
          (Math.max(window.innerWidth, window.innerHeight) / 5) * window.devicePixelRatio,
        ])}
        class="size-full object-cover"
      />
    </a>
  {/each}
</div>
