<script>
  import { onMount } from "svelte";

  /**
   * @type {HTMLDivElement}
   */
  let test;
  onMount(() => {
    const window_events = new AbortController();

    let timeout = setTimeout(() => {});
    let i = 0;
    test.addEventListener(
      "scroll",
      function (e) {
        clearTimeout(timeout);
        console.log("[WINDOW][SCROLL]", test.scrollTop, test.scrollHeight, test.clientHeight);
        if (test.scrollTop < test.clientHeight - test.scrollHeight + 1) {
          timeout = setTimeout(() => {
            console.log("appending");
            let el = document.createElement("p");
            el.innerText = "hello" + i++;
            el.style.height = "100px";
            test.append(el);
          }, 150);
        } else {
        }
      },
      { signal: window_events.signal },
    );

    return () => window_events.abort();
  });
</script>

<div class="flex size-[200px] flex-col-reverse overflow-y-auto" bind:this={test}>
  {#each { length: 10 } as _, i}
    <p class="flex-shrink-0">This is some content that will be scrollable. {i}</p>
  {/each}
</div>

<style>
  .container {
    position: relative;
    height: 400px;
    border: 1px solid #ccc;
  }
  .scrollable {
    position: absolute;
    top: -100px; /* Extend 100px upwards */
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 500px; /* 300px (container height) + 100px (extended top) */
    max-height: 500px;
    overflow-y: auto;
    padding: 10px;
  }
</style>
