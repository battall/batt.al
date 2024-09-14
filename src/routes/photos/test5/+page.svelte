<script>
  import { onMount } from "svelte";
  import { tweened } from "svelte/motion";

  /** @type {HTMLDivElement} */
  let sections;
  /** @type {HTMLDivElement} */
  let section0;
  /** @type {HTMLDivElement} */
  let section1;

  let innerHeight = $state(0);
  onMount(() => {
    innerHeight = window.innerHeight;

    function step() {
      let scrollContainer = sections.scrollTop / (sections.scrollHeight - sections.clientHeight);

      section0.style.transform = `translate3d(0, ${scrollContainer * innerHeight * 0.6 - Math.min(innerHeight * 0.6, section1.scrollTop)}px, 0)`;
      raf = requestAnimationFrame(step);
    }
    let raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
    };
  });
</script>

<div bind:this={sections} class="w-full snap-y snap-mandatory overflow-y-auto overscroll-none">
  <div class="h-px w-full snap-center"></div>
  <div bind:this={section0} class="size-full overflow-y-auto">
    <div class=" bg-blue-500">
      {#each { length: 300 } as _, i}
        <p>{i}</p>
      {/each}
    </div>
  </div>
  <div bind:this={section1} class="relative top-0 z-10 size-full snap-end overflow-y-auto pt-[60vh]">
    <div class="bg-red-500">
      {#each { length: 300 } as _, i}
        <p>{i}</p>
      {/each}
    </div>
  </div>
</div>
