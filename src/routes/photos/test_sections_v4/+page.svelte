<script>
  /** this one doesn't have a raf, which is good for ios jagginess, but, how could we show the menu underneath with this method?? */
  import { tweened } from "svelte/motion";

  /** 0 for first, 1 for second */
  let section = $state(0);
  let menuP = tweened(0, { duration: 0 });
</script>

<div
  class="relative size-full snap-y snap-mandatory overflow-y-auto overscroll-none
    before:absolute before:top-0 before:h-px before:w-full before:snap-center
    after:absolute after:bottom-0 after:h-px after:w-full after:snap-center"
  onscroll={(e) => {
    if (!(e.target instanceof HTMLDivElement)) return;

    let scrollPercent = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    section = Math.round(scrollPercent * 10) / 10; // if its between 0.1 0.9 dont set section. so both are unscrollable.

    menuP.set(scrollPercent);
  }}
>
  <div class="h-[125%] w-full overflow-y-auto" class:[&]:overflow-y-hidden={section !== 1}>
    <div class="h-[calc(100%*100/125)] w-full overflow-y-auto bg-gray-900" class:[&]:overflow-y-hidden={section !== 0}>
      <div class=" bg-blue-500">
        {#each { length: 300 } as _, i}
          <p>{i}</p>
        {/each}
      </div>
      <div class="sticky bottom-0 h-32 bg-transparent"></div>
    </div>
    <div class="bg-red-500" style:transform="translateY(calc({-$menuP} * 8rem))">
      {#each { length: 300 } as _, i}
        <p>{i}</p>
      {/each}
    </div>
  </div>
</div>
