<script>
  import { afterNavigate, beforeNavigate, onNavigate } from "$app/navigation";

  beforeNavigate((navigation) => {
    console.log("[NAVIGATE][B4]", navigation);

    // in befores, get the current content image rect
  });
  afterNavigate((navigation) => {
    console.log("[NAVIGATE][AT]", navigation);

    // in here, get the current saved rect from beforerect
    // get the newer rect
    // animate, based on which page were
  });
  onNavigate((navigation) => {
    console.log("[NAVIGATE][ON]", navigation);
  });
</script>

<div>
  <a href="/photos">go back to photos</a>
</div>
