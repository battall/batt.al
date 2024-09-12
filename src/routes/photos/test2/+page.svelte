<script>
  export let id;
  export let isSelected = false;
  export let pointOfInterest = 0;
  export let backgroundColor;
</script>

<style>
  .card-image-container {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    height: 420px;
    width: 100vw;
    transform: translateZ(0);
  }

  .card-image {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
</style>
