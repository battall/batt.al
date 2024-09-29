<script>
  import { onMount } from "svelte";

  /** @type {HTMLInputElement}*/
  let checkbox;

  let i = 0;

  let timeout;
</script>

<input type="checkbox" switch bind:this={checkbox} />

<input type="checkbox" switch class="custom-color" />

<input type="checkbox" />

<div
  class="overflow-y-auto"
  onscroll={(e) => {
    i++;
    if (i % 100 === 0) {
      checkbox.click();
    }
  }}
>
  {#each { length: 300 } as _, i}
    <p>{i}</p>
  {/each}
</div>

<style>
  .custom-color {
    accent-color: DarkViolet;
  }

  body {
    margin: 2rem;
  }
  input {
    display: block;
    margin-block-end: 1lh;
  }
  @media (prefers-color-scheme: dark) {
    body {
      background: #121212;
    }
  }
</style>
