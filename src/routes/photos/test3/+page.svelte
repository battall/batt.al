<script>
  // See "Ease Visualizer" at https://svelte.dev/examples#easing.
  import { backInOut, linear } from "svelte/easing";
  import { blur, fade, fly, scale, slide } from "svelte/transition";
  let show = true;

  // Setting the easing function to "linear" makes it more
  // obvious that the animations are happening simultaneously.
  let options = { duration: 1000, easing: linear };

  // The "back" easing function is more interesting.
  //let options = {duration: 1000, easing: backInOut};
</script>

<button on:click={() => (show = !show)}> Toggle </button>
{#if show}
  <h1 transition:fade={options}>This is fade.</h1>
  <h1 transition:blur={options}>This is blur.</h1>
  <h1 transition:slide={{ ...options, x: -150 }}>This is slide.</h1>
  <h1 transition:scale={options}>This is scale.</h1>
  <h1 transition:fly={{ ...options, x: -150 }}>This is fly.</h1>
  <h1 transition:fly={{ ...options, opacity: 1, x: -400 }}>This is fly retaining opacity.</h1>
  <h1 in:fly={{ ...options, opacity: 1, x: -400 }} out:fly={{ ...options, opacity: 1, x: 500 }}>
    Enter from left and exit right.
  </h1>
{/if}
