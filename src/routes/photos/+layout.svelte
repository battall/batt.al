<script>
  import "./style.css";
  import { onMount, tick } from "svelte";

  import { afterNavigate, beforeNavigate, onNavigate, preloadData } from "$app/navigation";

  import { ArrowUpDown, PanelRightClose, Search, User, X } from "@steeze-ui/lucide-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  import ContentAnim from "./ContentAnim.svelte";
  import ContentGrid from "./ContentGrid.svelte";
  import ContentView from "./ContentView.svelte";
  import Dashboard from "./Dashboard.svelte";
  import Highlights from "./Highlights.svelte";
  import Navbar from "./Navbar.svelte";
  import { library, libraryLoad } from "./stores.svelte";

  const CONFIG = {
    DISABLE_ANIMATIONS: false,
  };

  /** @type {{ children: any, data: import('./$types').PageData }} */
  const { children, data } = $props();

  onMount(() => {
    console.log("PAGE DATA", data);
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if ("sources" in entry && Array.isArray(entry.sources)) {
          console.log("[ENTRY]", entry.sources.length === 1 ? entry.sources[0] : entry);
        }
      }
    });
    observer.observe({ type: "layout-shift" });

    return () => {
      observer.disconnect();
    };
  });

  let contentId = $state("");

  /** @type {HTMLDivElement | undefined} */
  let contentGrid = $state();
  /** @type {HTMLDivElement | undefined} */
  let contentView = $state();

  let rect0 = $state();
  let rect1 = $state();

  /**
   * @param navigation {import("@sveltejs/kit").NavigationTarget}
   * @param contentIndex {number}
   * @returns {HTMLImageElement}
   */
  const getContent = (navigation, contentIndex) => {
    const path = `/${navigation.url.pathname.split("/").slice(2).slice(0, -1).join("/")}`;
    console.log("[NAVIGATION][LAYOUT]", path, contentIndex);
    let content;
    switch (path) {
      case "/":
        if (!contentGrid) throw new Error();
        content = contentGrid.children[contentIndex].children[0];
        break;
      case "/content":
      case "/content/info":
      case "/content/expanded":
        if (!contentView) throw new Error();
        content = contentView.children[0].children[contentIndex % 3].children[0]; // TODO this 3 must be gathered from VirtualList.visibleItemCount.
        break;
    }
    if (!(content instanceof HTMLImageElement)) throw new Error();
    return content;
  };
  onNavigate(() => {
    console.log("[NAVIGATION][LAYOUT] on");
  });
  beforeNavigate((navigation) => {
    console.log("[NAVIGATION][LAYOUT] before");
    if (!navigation.to) return; // initial page load
    if (!navigation.from) throw new Error(JSON.stringify(navigation.from));

    contentId =
      new URLSearchParams(window.location.search).get("id") ||
      navigation.from.url.searchParams.get("id") ||
      navigation.to.url.searchParams.get("id") ||
      "";

    if (!CONFIG.DISABLE_ANIMATIONS) {
      rect0 = document.createElement("div");
      rect0 = getContent(
        navigation.from,
        Object.keys(library).findIndex((id) => id === contentId),
      );
    }
  });
  afterNavigate((navigation) => {
    console.log("[NAVIGATION][LAYOUT] after");
    if (!navigation.from) return; // initial page load
    if (!navigation.to) throw new Error(JSON.stringify(navigation.from));

    if (!CONFIG.DISABLE_ANIMATIONS) {
      // get rect here, after dom update
      rect1 = document.createElement("div");
      rect1 = getContent(
        navigation.to,
        Object.keys(library).findIndex((id) => id === contentId),
      );
    }

    // console.log("[RECT0]", rect0);
    // console.log("[RECT1]", rect1);
  });

  onMount(() => {
    let t0 = performance.now();
    Promise.all(["/photos", "/photos/content", "/photos/content/info", "/photos/content/expanded"].map((href) => preloadData(href))).then(
      (result) => {
        console.log(`[LAYOUT] preloaded everything in ${performance.now() - t0}ms`);
      },
    );

    libraryLoad
      .then(() => {
        return tick();
      })
      .then(() => {
        container.scrollTo({ top: container.scrollHeight });
      });
  });

  /** 0 for first, 1 for second */
  let section = $state(1);

  /** @type {HTMLDivElement} */
  let container;

  let menuHidden = $state(true);
  let hiddenDashboard = $state(true);

  /** @type {Animation} */
  let contentAnim = $state();
  let contentAnimOpts = $state({});
</script>

<ContentAnim bind:from={rect0} bind:into={rect1} bind:contentAnim bind:contentAnimOpts />

<div
  onscroll={(e) => {
    if (e.target instanceof HTMLElement) {
      console.log("NAVBAR", e.target.scrollTop);
    }
  }}
  class="fixed left-0 z-30 flex h-full w-80 -translate-x-full
  flex-col gap-5 overflow-y-auto bg-background/85 px-6 py-10 font-light text-foreground
  backdrop-blur-lg transition-transform duration-300
  [&_a]:flex [&_a]:items-center [&_a]:gap-3
  [&_a_svg]:size-6 [&_a_svg]:text-primary"
  class:translate-x-0={!menuHidden}
>
  <Navbar></Navbar>
</div>
<button
  class="pointer-events-none fixed z-20 size-full bg-black/20 opacity-0 transition-opacity duration-300"
  class:pointer-events-auto={!menuHidden}
  class:opacity-100={!menuHidden}
  onclick={() => (menuHidden = !menuHidden)}
  aria-label="overlay"
></button>

<Dashboard bind:hidden={hiddenDashboard}></Dashboard>

<div
  class:title={1}
  class="fixed top-0 z-10 flex w-full flex-col gap-3 pl-[calc(1.5rem+var(--safe-s))] pr-[calc(1.5rem+var(--safe-s))] pt-[max(var(--safe-t),1rem)] font-bold text-white"
>
  <div class="flex items-center justify-between">
    <button
      onclick={() => {
        menuHidden = !menuHidden;
      }}
    >
      <Icon class="hidden size-8 sm:block" src={PanelRightClose}></Icon>
    </button>
    <h2 class="text-4xl sm:hidden">{section === 0 ? "Library" : "Photos"}</h2>
    <div class="flex gap-2 *:rounded-full">
      <span class="bg-black/50 px-2 py-1.5 text-xs backdrop-blur-3xl">Select</span>
      <Icon class="size-7 bg-primary stroke-[3] p-1.5" src={Search} />
      <Icon
        class="size-7 bg-lime-500 stroke-[3] p-1.5"
        src={User}
        role="button"
        onclick={() => {
          hiddenDashboard = false;
        }}
      />
    </div>
  </div>
  <h2 class="hidden text-4xl sm:block">{section === 0 ? "Library" : "Photos"}</h2>
  <div class="text-lg">7.672 Items <span>{section}</span></div>
</div>
<div
  class="relative z-0 flex size-full snap-y snap-mandatory flex-col-reverse overflow-y-auto overscroll-none contain-strict [--scroll:0]
    before:absolute before:top-0 before:h-px before:w-full before:snap-center
    after:absolute after:bottom-0 after:h-px after:w-full after:snap-center"
  class:lg:ml-80={!menuHidden}
  class:transition-[margin-left]={1}
  onscroll={(e) => {
    // TODO on touch, make focused scroll change more quicker, like user shouldn't have to wait for scroll end to get to next section.
    if (!(e.target instanceof HTMLDivElement)) return;

    let scrollPercent = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    scrollPercent = scrollPercent + 1;
    section = Math.round(scrollPercent * 10) / 10; // if its between [0.1.9] dont set section. so both are unscrollable.

    // set scroll of only menu and section1, don't touch contentgrid, interestinly, this does improve "recalculate styles" performance, a LOT (~40ms -> 12-13ms)
    // tested on chrome with 20x slowdown, with 200 content
    if (
      !(e.target.children[0].children[0].children[1] instanceof HTMLDivElement) ||
      !(e.target.children[0].children[1] instanceof HTMLDivElement)
    )
      throw new Error();
    e.target.children[0].children[0].children[1].style.setProperty("--scroll", (1 - scrollPercent).toFixed(3));
    e.target.children[0].children[1].style.setProperty("--scroll", (1 - scrollPercent).toFixed(3));
  }}
>
  <div class="min-h-[125%] w-full overflow-y-auto" class:[&]:overflow-y-hidden={section !== 1} class:scrollbar-none={1}>
    <div
      class="h-[calc(100%*100/125)] w-full overflow-y-auto bg-[#f2f2f6]"
      class:[&]:overflow-y-hidden={section !== 0}
      class:scrollbar-none={1}
      bind:this={container}
    >
      <div class=" bg-blue-500">
        <ContentGrid bind:_this={contentGrid} />
      </div>
      <div class="sticky bottom-0 h-16 bg-transparent">
        <div
          class="mx-auto flex w-full max-w-96 scale-[var(--scroll)] items-center justify-around overflow-y-hidden px-6 py-2
          text-accent opacity-[calc((var(--scroll)-0.8)*5)] blur-[calc(var(--scroll)*-4px+4px)]"
        >
          <Icon src={ArrowUpDown} theme="solid" class="flex size-11 rounded-full bg-card p-3" />
          <div class="rounded-full bg-card py-2.5 font-semibold">
            <span class="m-1 rounded-full px-3 py-1.5">Years</span>
            <span class="m-1 rounded-full px-3 py-1.5">Months</span>
            <span class="m-1 rounded-full bg-card-foreground px-3 py-1.5 text-foreground">All</span>
          </div>
          <Icon src={X} theme="solid" class="flex size-11 rounded-full bg-card p-3" />
        </div>
      </div>
    </div>
    <div class="bg-red-500" style:transform="translateY(calc((var(--scroll) - 1) * 4rem))">
      <Highlights />
    </div>
  </div>
</div>

<ContentView bind:_this={contentView} bind:contentAnim bind:contentAnimOpts />

{@render children()}

<style type="postcss">
  .title::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: -2rem;
    z-index: -1;

    background: rgba(0, 0, 0, 0.3);
    mask: linear-gradient(to top, transparent, black 50%);
    backdrop-filter: blur(2px);
  }
</style>
