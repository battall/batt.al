<script>
  import "./style.css";

  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
</script>

<div class="px-4">
  <div class="h-16" />

  <Header />

  <div class="h-8" />

  <main class="flex flex-grow flex-col">
    <slot />
  </main>

  <div class="h-6" />

  <Footer />

  <div class="h-8" />
</div>
