<script>
  import { flip } from "svelte/animate";
  let expanded = false;

  function toggleExpand() {
    expanded = !expanded;
  }
</script>

<div class="image-wrapper">
  <img
    src="http://100.68.150.84:3000/IMG_9587.png"
    alt=""
    class:image={!expanded}
    class:expanded
    on:click={toggleExpand}
    in:flip
    out:flip
  />
</div>

<style>
  .image-wrapper {
    position: relative;
    overflow: hidden;
    width: 100%;
  }

  .image {
    width: 100%;
    height: 300px; /* Initial height for object-fit */
    object-fit: cover;
    cursor: pointer;
    transition: height 0.5s ease;
  }

  .expanded {
    width: 100%;
    height: auto; /* Full size when expanded */
    object-fit: cover;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
