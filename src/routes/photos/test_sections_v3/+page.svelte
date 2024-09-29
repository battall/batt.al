<script>
  /**
   * this one only calls raf when needed
   *
   * TODO: what about we use getBoundingClientRect instead of scroll top to calculate position, would it be less jaggier?
   * idk tbh. if safari renders scrolls in a custom thing. it wont,
   */

  import { onMount } from "svelte";

  /** @type {HTMLDivElement} */
  let sections;
  /** @type {HTMLDivElement} */
  let section0;
  /** @type {HTMLDivElement} */
  let section1;

  let section_current = $state(0);

  /** @type {number} */
  let raf;
  let section0TranslateY = 0;
  const rafUpdate = () => {
    section0.style.transform = `translate3d(0, ${section0TranslateY}px, 0)`;
    raf = 0; // raf done, so remove it, we dont call any more requestAnimationFrames(), if scroll emits more than per frame.
  };
  onMount(() => {
    const window_events = new AbortController();
    section1.addEventListener(
      "scroll",
      () => {
        let section0TranslateYNext = -Math.min(sections.clientHeight * 0.6, section1.scrollTop);
        if (section0TranslateY !== section0TranslateYNext && !raf) {
          section0TranslateY = section0TranslateYNext;
          raf = requestAnimationFrame(rafUpdate);
        } // if raf:0, raf()
      },
      { passive: true, signal: window_events.signal },
    );
    rafUpdate();

    return () => {
      cancelAnimationFrame(raf);
      window_events.abort();
    };
  });
</script>

<div
  bind:this={sections}
  class="relative size-full snap-y snap-mandatory overflow-y-auto overscroll-none"
  onscroll={(e) => {
    if (!(e.target instanceof HTMLDivElement)) return;

    let scrollPercent = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    section_current = Math.round(scrollPercent);
  }}
>
  <div
    bind:this={section0}
    class="absolute top-0 size-full snap-start overflow-y-auto"
    class:pointer-events-none={section_current !== 0}
  >
    <div class=" bg-blue-500">
      {#each { length: 300 } as _, i}
        <p>{i}</p>
      {/each}
    </div>
  </div>
  <div
    bind:this={section1}
    class="absolute top-[40%] size-full snap-end overflow-y-auto"
    class:pointer-events-none={section_current !== 1}
  >
    <button
      class="h-[60%] w-full bg-transparent"
      onclick={(e) => {
        console.log("click TODO use this for clicking to grid.......... fuuuu! ");
      }}
    ></button>
    <div class="bg-red-500">
      {#each { length: 300 } as _, i}
        <p>{i}</p>
      {/each}
    </div>
  </div>
</div>
