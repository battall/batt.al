<script>
  import { Ellipsis, Heart, Info, Play, SlidersHorizontal, Trash2, Upload, VolumeX, X } from "@steeze-ui/lucide-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  import { onMount, tick, untrack } from "svelte";

  import ContentInfo from "./ContentInfo.svelte";
  import ContentVideo from "./ContentVideo.svelte";
  import { library, libraryLoad } from "./stores.svelte.js";

  const ImageLog = (
    /** @type {{ stopPropagation: () => void; target: { getBoundingClientRect: () => DOMRect; }; }} */ e,
  ) => {
    e.stopPropagation();
    console.log("REAL", rect_to_xywh(e.target.getBoundingClientRect()));
    console.log("FAKE", getContentRect(contentIndex, viewCurr));
  };

  /** @typedef {{ x: number, y: number, w: number, h: number }} XYWH */

  const rect_to_xywh = (/** @type {DOMRect} */ rect) => ({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
  /** @param s {XYWH} */
  const xywh_to_rect = (s) => ({ left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px` });

  /**
   * returns image rect in which container it is. used for transitions, only returns image rect (no padding etc included).
   * @param {number} contentIndex
   * @param {"grid" | "view" | "view_fullscreen" | "view_info"} container
   * @returns {XYWH}
   */
  const getContentRect = (contentIndex, container) => {
    let contentRect = { x: 0, y: 0, w: 0, h: 0 };

    const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
    switch (container) {
      case "grid":
        return rect_to_xywh(getRect(contentIndex));
      case "view": {
        // create two not visible containers with no children, get rect of them, one is fullpage other is not.
        // i think that would be the best way. and watch with resize observer.
        const image = { w: library[contentId].size[0], h: library[contentId].size[1] };

        const parentRect = { x: 0, y: 8 * REM, w: window.innerWidth, h: window.innerHeight - 16 * REM };

        const imagePaddingBottom = Math.max(
          0,
          Math.min(parentRect.w * (image.h / image.w) - (parentRect.h - 2 * REM), REM),
        );

        const scaleX = parentRect.w / image.w;
        const scaleY = (parentRect.h - imagePaddingBottom) / image.h;
        const scale = Math.min(scaleX, scaleY);

        contentRect.w = image.w * scale;
        contentRect.h = image.h * scale;
        contentRect.x = parentRect.x + (parentRect.w - contentRect.w) / 2;
        contentRect.y = parentRect.y + (parentRect.h - (contentRect.h + imagePaddingBottom)) / 2;

        return contentRect;
      }
      case "view_fullscreen": {
        const image = contentContainer.children[contentIndex].children[0];
        if (!(image instanceof HTMLImageElement)) throw new Error();

        const parentRect = { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };

        const scaleX = parentRect.w / image.naturalWidth;
        const scaleY = parentRect.h / image.naturalHeight;
        const scale = Math.min(scaleX, scaleY);

        contentRect.w = image.naturalWidth * scale;
        contentRect.h = image.naturalHeight * scale;
        contentRect.x = (parentRect.w - contentRect.w) / 2;
        contentRect.y = (parentRect.h - contentRect.h) / 2; // centered...

        return contentRect;
      }
      // TODO! we should really use invisible cloneNode()'s to calculate rects.
      case "view_info": {
        const image = contentContainer.children[contentIndex].children[0];
        if (!(image instanceof HTMLImageElement)) throw new Error();

        return { x: 0, y: 0, w: window.innerWidth, h: Math.min(window.innerWidth, window.innerHeight - 16 * REM) };
      }
    }
  };

  /** @type {{ contentId: string, getRect: (contentIndex: number) => DOMRect }} */
  let { contentId = $bindable(""), getRect } = $props();
  /** index 0 to content.length, based on container */
  let contentIndex = $derived(Object.keys(library).findIndex((id) => id === contentId));

  const show = () => {
    // on contentId change
    if (!contentId) return;

    console.log("[ContentView] show()");
    contentContainer.scrollTo({ left: contentIndex * (window.innerWidth + 40) });
    contentContainer.focus();

    if (!(contentAnimNode.children[0] instanceof HTMLImageElement)) throw new Error();
    viewNext = "view";
  };
  const hide = () => {
    // on close click
    console.log("HIDE", contentIndex);
    viewNext = "grid";
    contentAnim.finished.then(() => {
      contentId = "";
    });
  };

  //$state.snapshot(contentIndex);

  /** @type {HTMLDivElement} */
  let page;
  /** @type {HTMLDivElement} */
  let contentContainerY;
  /** @type {HTMLDivElement} */
  let contentContainer;
  /** @type {HTMLDivElement} */
  let contentPreview;

  /** @type {HTMLDivElement} */
  let contentAnimNode;
  /** progress */
  /** @type {Animation} */
  let contentAnim;
  /** for autoplay, set this before viewNext
   * @type {KeyframeAnimationOptions} */
  let contentAnimOpts = {};
  let contentAnimDone = $state(true);

  $effect(() => {
    if (viewCurr === "grid" && contentId !== "") {
      untrack(() => show());
    }
  });

  /** elements depend on this for layout change
   * @type {"grid" | "view" | "view_fullscreen" | "view_info"} */
  let viewCurr = $state("grid");
  /** animation reacts to this
   * @type {"grid" | "view" | "view_fullscreen" | "view_info"} */
  let viewNext = $state("grid");

  $effect(() => {
    console.log("[views]", viewCurr, viewNext);
  });

  $effect(() => {
    console.log("[viewNext]", viewNext);

    // we prepare the animation here, but element should control the contentAnim progress itself.
    untrack(async () => {
      if (viewCurr === viewNext) return;

      if (!contentAnimDone) {
        contentAnim.finish();
        await contentAnim.finished;
      }

      contentAnimDone = false;

      let sizeImage = library[contentId].size;
      let sizeWindow = [window.innerWidth, window.innerHeight];
      let scale = Math.min(sizeWindow[0] / sizeImage[0], sizeWindow[1] / sizeImage[1]);

      if (!(contentAnimNode.children[0] instanceof HTMLImageElement)) throw new Error();
      contentAnimNode.style.visibility = "visible";
      contentAnimNode.children[0].src =
        library[contentId].download_url.slice(0, library[contentId].download_url.indexOf("/", 25)) +
        `/${(sizeImage[0] * scale).toFixed(0)}/${(sizeImage[1] * scale).toFixed(0)}`;

      const rect0 = getContentRect(contentIndex, viewCurr);
      const rect1 = getContentRect(contentIndex, viewNext);

      console.log("[RECT0:FROM]", rect0);
      console.log("[RECT1:INTO]", rect1);

      const keyframes = [xywh_to_rect(rect0), xywh_to_rect(rect1)];

      let contentImage = contentContainer.children[contentIndex].children[0];
      if (!(contentImage instanceof HTMLImageElement)) return;

      // hide the image in the horizontal container view, so it doesn't overlap with animated image element
      contentImage.style.opacity = "0";

      contentAnim = contentAnimNode.animate(keyframes, {
        duration: 500 * 10,
        easing: "cubic-bezier(0.33, 1, 0.68, 1)",
        ...contentAnimOpts,
      });
      contentAnim.finished.then(() => {
        console.log("ANIM FINISHED CB");
        contentAnimDone = true;
        contentAnimOpts = {};
        viewCurr = viewNext;

        if (!(contentAnimNode.children[0] instanceof HTMLImageElement)) throw new Error();
        contentAnimNode.style.visibility = "hidden";
        contentAnimNode.children[0].src = "";

        contentImage.style.opacity = "";
      });
    });
  });

  if (typeof window !== "undefined") {
    $inspect(contentId).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentId     :", values_0);
    });
    $inspect(contentIndex).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentIndex  :", values_0);
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
    let window_events = new AbortController();

    let contentInfoRunning = false;
    contentContainerY.addEventListener(
      "scroll",
      (e) => {
        if (!(e.target instanceof HTMLDivElement)) return;
        let contentInfoPNext = e.target.scrollTop / (e.target.scrollHeight - window.innerHeight);
        if (contentInfoP === contentInfoPNext) return;
        contentInfoP = contentInfoPNext;

        let currentContent = contentContainer.children[contentIndex];
        if (!(currentContent instanceof HTMLElement)) return;
        let image = currentContent.children[0];
        let info = currentContent.children[1];
        if (!(image instanceof HTMLImageElement)) return;
        if (!(info instanceof HTMLDivElement)) return;

        if (!contentInfoRunning) {
          contentInfoRunning = true;
          console.log(viewCurr, viewNext);

          contentAnimOpts = { playbackRate: 0, easing: undefined };
          if (viewCurr === "view") {
            viewNext = "view_info";
          }
          if (viewCurr === "view_info") {
            viewNext = "view";
          }
        }

        contentAnim.playbackRate = 0;
        contentAnim.currentTime = 5000 * (viewNext === "view" ? 1 - contentInfoP : contentInfoP);

        const rect0 = getContentRect(contentIndex, viewCurr);
        const rect1 = getContentRect(contentIndex, viewNext);

        info.style.transform = `translateY(calc(${contentInfoP < 0.2 ? 100 : 0}%))`;
        info.style.opacity = contentInfoP.toFixed(3);
        info.children[0].style.transform =
          contentInfoP < 0.2
            ? ""
            : `translateY(${-1 * (rect0.y + rect0.h - (rect1.y + rect1.h)) * (viewCurr === "view" ? contentInfoP : 1 - contentInfoP)}px)`;

        if (contentInfoP === 0 || contentInfoP === 1) {
          contentAnim.playbackRate = 1; // cant finish animation with 0 playbackrate.... yea nice design!
          contentAnim.finish();
          contentInfoRunning = false;

          contentAnim.finished.then(() => {
            viewCurr = contentInfoP === 0 ? "view" : "view_info";
            viewNext = viewCurr;
          });

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
    let scrollMutex = (index) => {
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          const img = entry.target.children[0];

          if (!entry.isIntersecting) continue;
          if (!(img instanceof HTMLImageElement)) continue;
          if (!img.dataset.src) continue;

          //observer.unobserve(entry.target); // Stop observing the image once it's loaded
          if (!img.src && img.dataset.src.startsWith("https://picsum.photos")) {
            let imageSize = img.dataset.src
              .split("/")
              .slice(-2)
              .map((i) => parseInt(i));
            let windowSize = [window.innerWidth, window.innerHeight];
            let scaleFactor = Math.min(windowSize[0] / imageSize[0], windowSize[1] / imageSize[1]);

            img.src =
              img.dataset.src.slice(0, img.dataset.src.indexOf("/", 25)) +
              `/${(imageSize[0] * scaleFactor).toFixed(0)}/${(imageSize[1] * scaleFactor).toFixed(0)}`; // Load the image

            // load resolution that is max at current screen size. (it doesn't care about dpi)
            // `
            img.onload = () => (img.style.opacity = "1");
          } else if (!img.src) {
            img.src = img.dataset.src;
          }
        }
      },
      { root: contentContainer, rootMargin: "0px 200% 0px 200%" },
    );
    const observer2 = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          const img = entry.target.children[0];

          if (!entry.isIntersecting) continue;
          if (!(img instanceof HTMLImageElement)) continue;
          if (!img.dataset.src) continue;

          //observer.unobserve(entry.target); // Stop observing the image once it's loaded

          if (!img.src && img.dataset.src.startsWith("https://picsum.photos")) {
            let imageSize = img.dataset.src
              .split("/")
              .slice(-2)
              .map((i) => parseInt(i));
            let containerSize = [page.clientWidth, page.clientHeight];
            let scaleFactor = Math.min(containerSize[0] / imageSize[0], containerSize[1] / imageSize[1]);

            img.src = img.dataset.src; // Load the image

            // load resolution that is max at current screen size. (it doesn't care about dpi)
            // .slice(0, img.dataset.src.indexOf("/", 25)) + `/${parseInt(imageSize[0] * scaleFactor)}/${parseInt(imageSize[1] * scaleFactor)}`
            img.onload = () => (img.style.opacity = "1");
          } else if (!img.src) {
            img.src = img.dataset.src;
          }
        }
      },
      { root: contentPreview, rootMargin: "0px 2000% 0px 2000%" },
    );

    (async () => {
      await libraryLoad;
      await tick();

      for (const img of contentContainer.children) {
        observer.observe(img);
      }
      for (const img of contentPreview.children) {
        observer2.observe(img);
      }
    })();

    const observer_resize = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          console.log("Size changed");

          const contentBoxSize = entry.contentBoxSize[0];
        }
      }
    });
    observer_resize.observe(contentContainer);

    return () => {
      window_events.abort();
      observer.disconnect();
      observer2.disconnect();
      observer_resize.disconnect();
    };
  });

  let contentInfoRunning = $state(false);
  let contentInfoP = $state(0);
</script>

<div bind:this={contentAnimNode} class="pointer-events-none fixed inset-0 z-50">
  <img
    alt=""
    class="mx-auto size-full rounded object-cover"
    class:[&]:rounded-none={viewCurr === "view_info" || viewNext === "view_info"}
  />
</div>

<div
  bind:this={page}
  class="pointer-events-none fixed z-40 flex size-full flex-col bg-background/0
  pb-[max(var(--safe-b),1.75rem)] pt-[max(var(--safe-t),1.25rem)] transition-[opacity_background-color] duration-300"
  class:[&]:pointer-events-auto={viewCurr !== "grid"}
  class:[&]:bg-background={viewCurr !== "grid"}
  class:[&&]:bg-black={viewCurr === "view_fullscreen"}
>
  <div
    class="mb-10 flex items-center justify-between px-4 opacity-0 transition-opacity duration-300"
    class:[&]:opacity-100={viewNext === "view"}
  >
    <div class="flex flex-col">
      <h2 class="text-xl font-bold">Wednesday 15 {isScrolling || isTouching}</h2>
      <span class="text-sm leading-4 text-accent">15:46 {contentIndex}</span>
    </div>
    <div class="flex gap-2 text-primary">
      <Icon class="size-7 rounded-full bg-[#f3f3f3] stroke-[1.5] p-1" src={Ellipsis}></Icon>
      <Icon class="size-7 rounded-full bg-[#f3f3f3] stroke-[1.5] p-1" src={X} onclick={hide} role="button"></Icon>
    </div>
  </div>

  <div class="-z-20 min-h-0 flex-grow"></div>
  <div
    class="fixed inset-0 -z-10 snap-y snap-mandatory overflow-y-auto"
    class:scrollbar-none={1}
    bind:this={contentContainerY}
  >
    <div class="h-px w-full snap-center"></div>
    <div
      bind:this={contentContainer}
      class="sticky top-0 flex size-full snap-x snap-mandatory gap-10
          overflow-x-auto overflow-y-hidden py-32 opacity-0
          *:h-full *:min-w-full *:snap-center *:snap-always
          *:pb-[clamp(0px,calc(100%*var(--aspect)-(100vh-18rem)),1rem)]"
      class:[&]:opacity-100={viewCurr !== "grid"}
      class:[&]:*:pb-0={viewCurr === "view_fullscreen" || viewCurr === "view_info"}
      class:scrollbar-none={1}
    >
      {#each Object.values(library) as content, i (content.id)}
        <!-- its so f ing weird, but if i don't add h-full to this, safari doesnt care max-h-full on img (which is ok i think?), but firefox is fine af-->
        <button
          class="relative"
          class:[&]:-mt-32={viewCurr === "view_info"}
          style:--aspect={content.size[1] / content.size[0]}
          onclick={(e) => {
            // TODO this emits twice??

            // if clicked element (target) is not button or img, return
            if (e.target !== e.currentTarget && e.target !== e.currentTarget.children[0]) return;

            // if is in info view return;
            if (viewCurr === "view_info") return;
            if (viewCurr === "view") viewNext = "view_fullscreen";
            if (viewCurr === "view_fullscreen") viewNext = "view";
          }}
        >
          <img
            alt=""
            width={content.size[0]}
            height={content.size[0]}
            data-src={content.download_url}
            style:--aspect={content.size[1] / content.size[0]}
            class="mx-auto max-h-full w-[unset] rounded object-contain"
            class:[&]:w-full={viewCurr === "view_info"}
            class:[&]:h-[100vw]={viewCurr === "view_info"}
            class:[&]:object-cover={viewCurr === "view_info"}
            class:[&]:rounded-none={viewCurr === "view_info"}
          />
          <div
            class="absolute w-full opacity-0 transition-transform duration-300"
            class:[&]:static={viewCurr === "view_info"}
            class:opacity-100={viewCurr === "view_info"}
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
            <ContentVideo
              class="absolute ml-[50%] -translate-x-1/2 -translate-y-full"
              src={content.video || ""}
              size={content.size}
            />
          {/if}
        </button>
      {/each}
    </div>
    <div class="invisible h-96">this div to increase scroll height, so fucking messy tbh</div>
    <div class="h-px w-full snap-center"></div>
  </div>
  <div
    bind:this={contentPreview}
    class="mb-6 mt-3 flex min-h-8 snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-0.625rem)] transition-opacity"
    class:scrollbar-none={true}
    class:[&]:snap-none={contentPreviewDisableSnap}
    class:opacity-0={viewCurr !== "view"}
    class:translate-x-0={true ||
      "this is to imply will-change transform... otherwise chrome does fullpage repaint like crazy"}
  >
    {#each Object.values(library) as content, i}
      <button
        class="h-8 w-5 shrink-0 snap-center transition-[width_padding]"
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
        <img
          alt=""
          data-src={content.download_url.slice(0, content.download_url.indexOf("/", 25)) + "/64"}
          class="opacity-1 size-full rounded object-cover transition-opacity"
        />
      </button>
    {/each}
  </div>

  <div
    class="bottom-0 mx-auto flex w-full max-w-96 items-center justify-around px-6 text-primary transition-opacity"
    class:opacity-0={viewCurr === "grid" || viewCurr === "view_fullscreen"}
  >
    <Icon src={Upload} theme="solid" class="flex size-11 rounded-full bg-[#f3f3f3] p-3" />
    <div class="flex rounded-full bg-[#f3f3f3] px-1">
      <Icon class="mx-1 size-11 rounded-full p-3" src={Heart}></Icon>
      <Icon class="mx-1 size-11 rounded-full p-3" src={Info}></Icon>
      <Icon class="mx-1 size-11 rounded-full p-3" src={SlidersHorizontal}></Icon>
    </div>
    <Icon src={Trash2} theme="solid" class="flex size-11 rounded-full bg-[#f3f3f3] p-3" />
  </div>
</div>

<style type="postcss">
</style>
