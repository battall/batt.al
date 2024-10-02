<script>
  import { InformationCircle } from "@steeze-ui/heroicons";
  import { Ellipsis, Heart, Play, SlidersHorizontal, Trash2, Upload, VolumeX, X } from "@steeze-ui/lucide-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  import { onMount, tick, untrack } from "svelte";

  import { beforeNavigate, goto, onNavigate, replaceState } from "$app/navigation";
  import { page, updated } from "$app/stores";
  import ContentInfo from "./ContentInfo.svelte";
  import ContentVideo from "./ContentVideo.svelte";
  import { ImageLoader } from "./imageLoader";
  import { library, libraryLoad, routes } from "./stores.svelte.js";

  /** @type {{  _this: HTMLDivElement | undefined, contentAnim: Animation, contentAnimOpts: KeyframeAnimationOptions}} */
  let { _this = $bindable(), contentAnim = $bindable(), contentAnimOpts = $bindable() } = $props();

  let contentId = $state((typeof window !== "undefined" && new URLSearchParams(window.location.search).get("id")) || "");
  /** index 0 to content.length, based on container */
  const contentIndex = $derived(Object.keys(library).findIndex((id) => id === contentId));

  $effect(() => {
    if (contentId === (new URLSearchParams(window.location.search).get("id") || "")) return;
    replaceState(`${window.location.pathname}?id=${contentId}`, $page.state);
    // window.history.replaceState(history.state, "", `${window.location.pathname}?id=${contentId}`);
  });

  onMount(() => {
    libraryLoad.then(() => {
      console.log("[ContentView] scroll", contentId, contentIndex);
      contentContainer.scrollTo({ left: contentIndex * (window.innerWidth + 40) });
      contentContainer.focus();
    });
  });
  beforeNavigate((navigation) => {
    if (typeof navigation.to?.route.id !== "string") return;
    if (navigation.from?.route.id === "/photos" && navigation.to?.route.id === "/photos/content") {
      contentId = navigation.to?.url.searchParams.get("id") || "";
      console.log("[NAVIGATION][ContentView] before", contentId, contentIndex);
      contentContainer.scrollTo({ top: 0, left: contentIndex * (window.innerWidth + 40) });
      contentContainer.focus();
      console.log("[NAVIGATION][ContentView] before, setting contentId");
    }
  });

  /** @type {HTMLDivElement} */
  let main;
  /** @type {HTMLDivElement} */
  let contentContainerY;
  /** @type {HTMLDivElement} */
  let contentContainer;
  /** @type {HTMLDivElement} */
  let contentPreview;

  let route = $derived(/** @type {keyof typeof routes} */ (`/${$page.route.id?.slice(8)}`));

  if (typeof window !== "undefined") {
    $inspect(contentId).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentId     :", values_0);
    });
    $inspect(contentIndex).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentIndex  :", values_0);
    });
    $inspect(route).with((type, values_0) => {
      console.log(`[ContentView] route ${type.slice(0, 4)} : ${values_0}`);
    });
  }

  /** @type {string} */
  let contentIdPreview = $state(contentId);
  let contentIdPreviewDebounce = setTimeout(() => {});

  let isScrolling = $state(false);
  let isTouching = $state(false);
  let isScrollingDebounce = setTimeout(() => {});

  let contentPreviewDisableSnap = $state(false);
  onMount(() => {
    const window_events = new AbortController();

    let contentInfoRunning = false;

    // scroll to top on info
    if (route === "/content/info") contentContainerY.scrollTo({ top: contentContainerY.scrollHeight - contentContainerY.clientHeight });
    contentContainerY.addEventListener(
      "scroll",
      async (e) => {
        if (!(e.target instanceof HTMLDivElement)) return;
        // clamp to between 0-1, safari sends negative and more than scroll values
        const contentInfoPNext = Math.min(Math.max(e.target.scrollTop / (e.target.scrollHeight - window.innerHeight), 0), 1);
        if (contentInfoP === contentInfoPNext) return;
        //console.log(
        //  contentInfoP > contentInfoPNext ? "+y" : "-y",
        //  contentInfoP.toFixed(3),
        //  contentInfoPNext.toFixed(3),
        //);
        contentInfoP = contentInfoPNext;

        const info = contentContainer.children[contentIndex]?.children[1];
        if (!(info instanceof HTMLDivElement)) return;

        if (!contentInfoRunning) {
          contentInfoRunning = true;
          contentAnimOpts = { easing: undefined };
          switch (route) {
            case "/content":
              await goto(`info?id=${contentId}`);
              break;
            case "/content/expanded":
              await goto(`../info?id=${contentId}`);
              break;
            case "/content/info":
              await goto(`..?id=${contentId}`);
              break;
          }

          contentAnim.pause();
          console.log("[ContentView] goto done");
        }

        contentAnim.currentTime = 500 * (route === "/content" ? 1 - contentInfoP : contentInfoP);

        info.style.transform = `translateY(calc(${contentInfoP < 0.2 ? 100 : 0}%))`;
        info.style.opacity = contentInfoP.toFixed(3);
        //        info.children[0].style.transform =
        //          contentInfoP < 0.2
        //            ? ""
        //            : `translateY(${-1 * (rect0.y + rect0.h - (rect1.y + rect1.h)) * (viewCurr === "view" ? contentInfoP : 1 - contentInfoP)}px)`;

        if (contentInfoP === 0 || contentInfoP === 1) {
          let url =
            contentInfoP === 0
              ? route !== "/content"
                ? `/photos/content?id=${contentId}`
                : ""
              : route !== "/content/info"
                ? `/photos/content/info?id=${contentId}`
                : "";

          contentInfoRunning = false;
          if (url) {
            goto(url).then(() => {
              contentAnim.playbackRate = 1; // cant finish animation with 0 playbackrate.... yea nice design!
              contentAnim.finish();
            });
          } else {
            contentAnim.playbackRate = 1; // cant finish animation with 0 playbackrate.... yea nice design!
            contentAnim.finish();
          }

          info.style.transform = "";
          info.style.opacity = "";
          info.children[0].style.transform = "";
        }
      },
      { signal: window_events.signal, passive: true },
    );

    let scrollCurr = 0; // currently scrolling element, 1 for container, 2 for preview
    let scrollTries = 0; // scroll tries of the other element, if it gets to 2, `scrollCurr` changes
    /** @param {number} index element index */
    const scrollMutex = (index) => {
      if (scrollCurr === index) {
        scrollTries = 0;
        return true;
      }

      scrollTries += 1;
      if (scrollTries === 2) {
        console.log("[SCROLL][CURRENT]", index);

        scrollCurr = index;
        scrollTries = 0;

        // if we dont disable snap, scrollTo() doesn't scroll partially (only scrolls to snap elements)
        contentPreviewDisableSnap = scrollCurr === 1;
        return true;
      }
    };

    let translateX = 0;
    let animFrameRequested = false;
    contentContainer.addEventListener(
      "scroll",
      (e) => {
        if (!(e.target instanceof HTMLDivElement)) return;
        if (!scrollMutex(1)) return;

        //console.log("[CONTAINER SCROLLLEFT]", e.target.scrollLeft);
        const id = e.target.scrollLeft / (e.target.clientWidth + 40);
        contentId = library[Object.keys(library)[Math.round(id)]].id;

        translateX = (id * (20 + 4)) % 1;
        if (!animFrameRequested)
          requestAnimationFrame(() => {
            contentPreview.style.translate = `-${translateX}px`;
            animFrameRequested = false;
          });
        animFrameRequested = true;
        contentPreview.scrollTo({ left: id * (20 + 4), behavior: "instant" });
      },
      { signal: window_events.signal, passive: true },
    );
    contentPreview.addEventListener(
      "scroll",
      (e) => {
        if (!(e.target instanceof HTMLElement)) return;
        if (!scrollMutex(2)) return;

        const id = e.target.scrollLeft / (20 + 4); // width of each element + gap
        try {
          contentId = library[Object.keys(library)[Math.round(id)]].id;
        } catch (error) {
          console.log("ERROR", e.target.scrollLeft, id, e.target.scrollWidth);
        }

        contentContainer.scrollTo({ left: contentIndex * (contentContainer.clientWidth + 40), behavior: "instant" });

        /*
        // some tries making current content image bigger on preview image, but no luck... TODO!
        isScrolling = true;
        clearTimeout(isScrollingDebounce);
        isScrollingDebounce = setTimeout(() => {
          isScrolling = false;
        }, 150);

        // last items width doesnt contribute to scrolling
        let total_width = (Object.keys(library).length - 1) * 24 + 28;
        let offset = e.target.scrollLeft;

        console.log(offset);

        e.target.children[offset - 28];

        let current_content = (offset - 12) / 24;

        console.log(current_content, contentId);
        contentId = Math.round(current_content).toString();
        return;

        clearTimeout(contentIdPreviewDebounce);
        contentIdPreviewDebounce = setTimeout(() => {
          contentIdPreview = contentId;
        }, 300);
        */
      },
      { signal: window_events.signal, passive: true },
    );

    window.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 0) isTouching = true;
      },
      { passive: true },
    );
    window.addEventListener(
      "touchend",
      (e) => {
        if (e.touches.length === 0) isTouching = false;
      },
      { passive: true },
    );

    // TODO: when preview active class is added, until the transition ends, scrollinstant every frame.
    // so ios doesnt broke the snapping

    const observer_resize = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          // console.log("Size changed");

          const contentBoxSize = entry.contentBoxSize[0];
        }
      }
    });
    observer_resize.observe(contentContainer);

    return () => {
      window_events.abort();
      observer_resize.disconnect();
    };
  });

  let contentInfoRunning = $state(false);
  let contentInfoP = $state(0);
</script>

<div
  bind:this={main}
  class="fixed z-40 flex size-full flex-col bg-background pb-[max(var(--safe-b),1.75rem)]
  pt-[max(var(--safe-t),1.25rem)] transition-[opacity_background-color] duration-300 contain-strict"
  class:[&]:pointer-events-none={route === "/"}
  class:[&]:opacity-0={route == "/"}
  class:[&&]:bg-black={route === "/content/expanded"}
>
  <div
    class="mb-10 flex items-center justify-between px-4 transition-opacity duration-300"
    class:[&]:opacity-0={route === "/content/info" || route === "/content/expanded"}
  >
    <div class="flex flex-col">
      <h2 class="text-xl font-bold">Wednesday 15 {isScrolling || isTouching}</h2>
      <span class="text-sm leading-4 text-accent">15:46 {contentIndex} {route}</span>
    </div>
    <div class="flex gap-2 text-primary">
      <Icon class="size-7 rounded-full bg-[#f3f3f3] stroke-[1.5] p-1" src={Ellipsis}></Icon>
      <Icon
        class="size-7 rounded-full bg-[#f3f3f3] stroke-[1.5] p-1"
        src={X}
        onclick={() => {
          goto("/photos", { keepFocus: true, state: "a" }); // TODO maybe use page state etc. for transition to info
        }}
        role="button"
      ></Icon>
    </div>
  </div>

  <div class="-z-20 min-h-0 flex-grow"></div>
  <div
    class="fixed inset-0 -z-10 snap-y snap-mandatory overflow-y-auto contain-strict [content-visibility:auto]
        before:absolute before:top-0 before:h-px before:w-full before:snap-start
        after:absolute after:bottom-0 after:h-px after:w-full after:snap-start"
    class:scrollbar-none={1}
    bind:this={contentContainerY}
  >
    <div
      use:ImageLoader={{ update: library }}
      bind:this={contentContainer}
      bind:this={_this}
      class="sticky top-0 flex size-full snap-x snap-mandatory gap-10
          overflow-x-auto overflow-y-hidden py-32
          *:h-full *:min-w-full *:snap-center *:snap-always
          *:pb-[clamp(0px,calc(100%*var(--aspect)-(100vh-18rem)),1rem)]"
      class:[&]:py-0={route === "/content/expanded"}
      class:[&]:*:-mt-32={route === "/content/info"}
      class:[&]:*:pb-0={route === "/content/info" || route === "/content/expanded"}
      class:[&]:*:h-[calc(100%+16rem)]={route === "/content/info"}
      class:scrollbar-none={1}
    >
      {#each Object.values(library) as content, i (content.id)}
        <!-- its so f ing weird, but if i don't add h-full to this, safari doesnt care max-h-full on img (which is ok i think?), but firefox is fine af-->
        <button
          class="relative [content-visibility:auto]"
          style:--aspect={content.size[1] / content.size[0]}
          onclick={(e) => {
            // TODO this emits twice??

            // if clicked element (target) is not button or img, return
            if (e.target !== e.currentTarget && e.target !== e.currentTarget.children[0]) return;

            // if is in info view return;
            if (route === "/content/info") return;
            if (route === "/content") goto("expanded?id=" + content.id);
            if (route === "/content/expanded") goto("../?id=" + content.id);
          }}
        >
          <img
            alt=""
            width={content.size[0]}
            height={content.size[1]}
            src={`data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${content.size[0]}" height="${content.size[1]}"></svg>`}
            data-src={content.src}
            style:--aspect={content.size[1] / content.size[0]}
            class="mx-auto max-h-full w-auto rounded object-contain"
            class:[&]:h-[100vw]={route === "/content/info"}
            class:[&]:object-cover={route === "/content/info"}
            class:[&]:rounded-none={route === "/content/info"}
          />
          <div
            class="absolute size-full opacity-0 transition-transform duration-300"
            class:[&]:static={route === "/content/info"}
            class:opacity-100={route === "/content/info"}
          >
            <ContentInfo />
          </div>
          {#if false && content.video}
            <video
              src={content.video + "#t=0.1"}
              class="absolute ml-[50%] hidden max-h-full -translate-x-1/2 -translate-y-full rounded object-scale-down"
              playsinline
              preload="metadata"
            >
              <track kind="captions" />
            </video>
            <ContentVideo class="absolute ml-[50%] -translate-x-1/2 -translate-y-full" src={content.video || ""} size={content.size} />
          {/if}
        </button>
      {/each}
    </div>
    <div class="invisible h-96">this div to increase scroll height, so fucking messy tbh</div>
  </div>
  <div
    use:ImageLoader={{ update: library }}
    bind:this={contentPreview}
    class="mb-6 mt-3 flex min-h-8 snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-0.625rem)] transition-opacity"
    class:scrollbar-none={true}
    class:[&]:snap-none={contentPreviewDisableSnap}
    class:opacity-0={route === "/content/info" || route === "/content/expanded"}
    class:translate-x-0={true || "this is to imply will-change transform... otherwise chrome does fullpage repaint like crazy"}
  >
    {#each Object.values(library) as content, i}
      <button
        class="h-8 w-5 shrink-0 snap-center transition-[width_padding] [content-visibility:auto]"
        class:[&]:w-12={contentIdPreview === content.id}
        class:px-2={contentIdPreview === content.id}
        onclick={() => {
          return alert("implement!!!");
          contentId = content.id;
          contentIdPreview = "-1";

          setTimeout(() => {
            contentPreview.scrollTo({ left: i * 24 + 12, behavior: "smooth" });
            console.log("called scroll to");

            setTimeout(() => {
              console.log("set prev");
              contentIdPreview = contentId;
            }, 550);
          });
        }}
      >
        <img alt="" data-src={content.src_resize([64, 64])} class="opacity-1 size-full rounded object-cover transition-opacity" />
      </button>
    {/each}
  </div>

  <div
    class="bottom-0 mx-auto flex w-full max-w-96 items-center justify-around px-6 text-primary transition-opacity"
    class:opacity-0={route === "/content/expanded"}
  >
    <Icon src={Upload} theme="solid" class="flex size-11 rounded-full bg-[#f3f3f3] p-3" />
    <div class="flex rounded-full bg-[#f3f3f3] px-1">
      <Icon class="mx-1 size-11 rounded-full p-3" src={Heart}></Icon>
      <Icon
        class="mx-1 size-11 rounded-full stroke-[1.75] p-2.5"
        src={InformationCircle}
        theme={route === "/content/info" ? "solid" : "outline"}
        onclick={() => {
          goto(route === "/content" ? `info?id=${contentId}` : `../?id=${contentId}`, { keepFocus: true });
        }}
      ></Icon>
      <Icon class="mx-1 size-11 rounded-full p-3" src={SlidersHorizontal}></Icon>
    </div>
    <Icon src={Trash2} theme="solid" class="flex size-11 rounded-full bg-[#f3f3f3] p-3" />
  </div>
</div>
