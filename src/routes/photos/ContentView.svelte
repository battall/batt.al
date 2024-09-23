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
  /** @param s {ReturnType<typeof rect_to_xywh>} */
  const xywh_to_rect = (s) => ({ left: s.x + "px", top: s.y + "px", width: s.w + "px", height: s.h + "px" });

  /**
   * returns image rect in which container it is. used for transitions, only returns image rect (no padding etc included).
   * @param {number} contentIndex
   * @param {"grid" | "view" | "view_fullscreen" | "view_info"} container
   * @returns {XYWH}
   */
  const getContentRect = (contentIndex, container) => {
    let contentRect = { x: 0, y: 0, w: 0, h: 0 };

    switch (container) {
      case "grid":
        return rect_to_xywh(getRect(contentIndex));
      case "view": {
        // create two not visible containers with no children, get rect of them, one is fullpage other is not.
        // i think that would be the best way. and watch with resize observer.
        const image = contentContainer.children[contentIndex].children[0];
        if (!(image instanceof HTMLImageElement)) throw new Error();

        const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const parentRect = { x: 0, y: 8 * REM, w: window.innerWidth, h: window.innerHeight - 16 * REM };

        const imagePaddingBottom = Math.max(
          0,
          Math.min(parentRect.w * (image.naturalHeight / image.naturalWidth) - (parentRect.h - 2 * REM), REM),
        );

        const scaleX = parentRect.w / image.naturalWidth;
        const scaleY = (parentRect.h - imagePaddingBottom) / image.naturalHeight;
        const scale = Math.min(scaleX, scaleY);

        contentRect.w = image.naturalWidth * scale;
        contentRect.h = image.naturalHeight * scale;
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

    if (!(contentIsOpenAnim.children[0] instanceof HTMLImageElement)) throw new Error();
    contentIsOpenAnimRun(getRect(contentIndex), contentContainer.getBoundingClientRect());
  };
  const hide = () => {
    // on close click
    console.log("HIDE", contentIndex);
    contentIsOpenAnimRun(getRect(contentIndex), contentContainer.getBoundingClientRect(), true);
    contentId = "";
  };

  //$state.snapshot(contentIndex);

  /** @type {HTMLDivElement} */
  let page;
  /** @type {HTMLDivElement} */
  let contentContainer;
  /** @type {HTMLDivElement} */
  let contentPreview;

  let contentIsOpen = $derived(!!contentId);
  /** @type {HTMLDivElement} */
  let contentIsOpenAnim;
  let contentIsOpenAnimDone = $state(false);

  $effect(() => {
    contentIsOpen;
    untrack(() => show());
  });

  let isFullpage = $state(false);
  let isFullpageAnimDone = $state(false);

  //$effect(() => {
  //  console.log("$effect(): contentIsOpen", contentIsOpen);
  //  untrack(() => animate(contentIsOpen));
  //});

  const contentIsOpenAnimRun = (/** @type {DOMRect} */ _rect0, /** @type {DOMRect} */ _rect1, reverse = false) => {
    let imageSize = library[contentId].download_url
      .split("/")
      .slice(-2)
      .map((i) => parseInt(i));
    let windowSize = [window.innerWidth, window.innerHeight];
    let scaleFactor = Math.min(windowSize[0] / imageSize[0], windowSize[1] / imageSize[1]);

    if (!(contentIsOpenAnim.children[0] instanceof HTMLImageElement)) throw new Error();
    contentIsOpenAnim.style.visibility = "visible";
    contentIsOpenAnim.children[0].src =
      library[contentId].download_url.slice(0, library[contentId].download_url.indexOf("/", 25)) +
      `/${(imageSize[0] * scaleFactor).toFixed(0)}/${(imageSize[1] * scaleFactor).toFixed(0)}`;

    contentIsOpenAnimDone = false;
    //rect0 = rect_to_xywh(getRect(contentIndex));
    //rect1 = rect_to_xywh(contentContainer.getBoundingClientRect());
    const rect0 = rect_to_xywh(_rect0);
    const rect1 = rect_to_xywh(_rect1);

    if (!(contentIsOpenAnim.children[0] instanceof HTMLImageElement)) throw new Error();
    const image = contentIsOpenAnim.children[0];

    // calculate max scale for the container TODO: window -> container size in the futur.
    const scaleX = rect1.w / image.naturalWidth;
    const scaleY = rect1.h / image.naturalHeight;

    // To maintain the aspect ratio, take the minimum of the two scaling factors
    const scale = Math.min(scaleX, scaleY);
    console.log("[SCALE]", scale);

    rect1.w = image.naturalWidth * scale;
    rect1.h = image.naturalHeight * scale;
    rect1.x += (_rect1.width - rect1.w) / 2;
    rect1.y += (_rect1.height - rect1.h) / 2;
    // take care of the offset generated because of centering x, y

    console.log("[RECT0:FROM]", rect0);
    console.log("[RECT1:INTO]", rect1);

    const animStates = [xywh_to_rect(rect0), xywh_to_rect(rect1)];

    if (reverse) animStates.reverse();

    return Promise.all(contentIsOpenAnim.getAnimations().map((anim) => anim.finished))
      .then(() => {
        return contentIsOpenAnim.animate(animStates, {
          duration: 500,
          easing: "cubic-bezier(0.33, 1, 0.68, 1)",
        }).finished;
      })
      .then(() => {
        contentIsOpenAnimDone = true;
        if (!(contentIsOpenAnim.children[0] instanceof HTMLImageElement)) throw new Error();
        contentIsOpenAnim.style.visibility = "hidden";
        contentIsOpenAnim.children[0].src = "";
        return;
      });
  };

  if (typeof window !== "undefined") {
    $inspect(contentId).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentId     :", values_0);
    });
    $inspect(contentIndex).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentIndex  :", values_0);
    });
    $inspect(contentIsOpen).with((type, values_0) => {
      if (type === "init") return;
      console.log("[ContentView] contentIsOpen :", values_0);
    });
  }

  /** @type {string} */
  let contentIdPreview = $state(contentId);
  let contentIdPreviewDebounce = setTimeout(() => {});

  let isScrolling = $state(false);
  let isTouching = $state(false);
  let isScrollingDebounce = setTimeout(() => {});

  $effect(() => {
    // TODO make this function too, without side effects and running on first onMount
    console.log("[isFullpage]", isFullpage);

    let contentImage = contentContainer?.children[untrack(() => contentIndex)]?.children[0];
    if (!(contentImage instanceof HTMLImageElement)) return;

    untrack(() => {
      const rect1 = page.getBoundingClientRect();
      const rect2 = contentImage.getBoundingClientRect();

      const paddingBottom = Math.max(
        Math.min(
          16,
          contentContainer.clientWidth * parseFloat(contentImage.style.getPropertyValue("--aspect")) -
            (window.innerHeight - 18 * 16),
        ),
        0,
      );

      const currentAnims = contentIsOpenAnim.getAnimations();
      if (currentAnims.length > 0) {
        currentAnims.forEach((anim) => anim.reverse());
      } else
        contentIsOpenAnimRun(
          rect2,
          !isFullpage
            ? {
                ...JSON.parse(JSON.stringify(rect1)),
                top: 8 * 16,
                height: window.innerHeight - (16 * 16 + paddingBottom),
              }
            : rect1,
        ).then(() => {
          isFullpageAnimDone = isFullpage;
        });
    });

    return;

    // transition height for the current content doesnt work, ik it would be simpler.
    // transform scale current content, and set when scale *finished* inset without transform.
    let container = { width: window.innerWidth, height: window.innerHeight };
    if (!isFullpage) container.height -= (36 / 4) * (16 * 2); // py-36 = 9rem each side

    // determine the real client size of image (we have size-full etc on image, so .width etc not usable for scaling)
    let contentImageW = contentImage.width;
    let contentImageH = contentImage.height;
    if (contentImage.naturalWidth / contentImage.naturalHeight > contentImageW / contentImageH) {
      contentImageH = contentImage.naturalHeight * (contentImageW / contentImage.naturalWidth);
    } else {
      contentImageW = contentImage.naturalWidth * (contentImageH / contentImage.naturalHeight);
    }

    let scaleX = container.width / contentImageW;
    let scaleY = container.height / contentImageH;

    // To maintain the aspect ratio, take the minimum of the two scaling factors
    let scale = Math.min(scaleX, scaleY);

    console.log({
      container: { w: container.width, h: container.height },
      content: { w: contentImageW, h: contentImageH },
      scale,
    });
    contentContainer
      .animate([{ transform: "scale(1)" }, { transform: `scale(${scale})` }], {
        duration: 300,
        easing: "ease-in-out",
      })
      .finished.then(() => {
        isFullpageAnimDone = isFullpage;
      });
  });

  let contentPreviewDisableSnap = $state(false);
  onMount(() => {
    let window_events = new AbortController();

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
</script>

<div bind:this={contentIsOpenAnim} class="pointer-events-none fixed inset-0 z-50">
  <img alt="" class="mx-auto size-full rounded object-cover" />
</div>

<div
  bind:this={page}
  class="pointer-events-none fixed z-40 flex size-full flex-col bg-background/0
  pb-[max(var(--safe-b),1.75rem)] pt-[max(var(--safe-t),1.25rem)] transition-[opacity_background-color] duration-300"
  class:[&]:pointer-events-auto={contentId}
  class:[&]:bg-background={contentId}
  class:[&&]:bg-black={isFullpage}
>
  <div
    class="mb-10 flex items-center justify-between px-4 opacity-0 transition-opacity duration-300"
    class:[&]:opacity-100={contentId}
    class:[&&]:opacity-0={isFullpage}
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
    bind:this={contentContainer}
    class="fixed inset-x-0 bottom-32 top-32 -z-10 flex snap-x snap-mandatory gap-10 overflow-x-auto opacity-0
          *:h-full *:min-w-full *:snap-center *:snap-always
          *:pb-[clamp(0px,calc(100%*var(--aspect)-(100vh-18rem)),1rem)]"
    class:[&]:opacity-100={contentId && contentIsOpenAnimDone}
    class:[&]:inset-y-0={isFullpageAnimDone}
    class:[&]:*:pb-0={isFullpageAnimDone}
    class:scrollbar-none={true}
  >
    {#each Object.values(library) as content, i (content.id)}
      <!-- its so f ing weird, but if i don't add h-full to this, safari doesnt care max-h-full on img (which is ok i think?), but firefox is fine af-->
      <button
        style:--aspect={content.size[1] / content.size[0]}
        onclick={(e) => {
          // TODO this emits twice??
          isFullpage = !isFullpage;
        }}
      >
        <img
          alt=""
          data-src={content.download_url}
          style:--aspect={content.size[1] / content.size[0]}
          class="mx-auto max-h-full rounded object-scale-down"
          onclick={(e) => {
            e.stopPropagation();
            console.log("REAL", rect_to_xywh(e.target.getBoundingClientRect()));
            console.log("FAKE", getContentRect(contentIndex, isFullpage ? "view_fullscreen" : "view"));
          }}
        />
        {#if content.video}
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
            src={content.video}
            size={content.size}
          />
        {/if}
      </button>
    {/each}
  </div>
  <div
    bind:this={contentPreview}
    class="mb-6 mt-3 flex min-h-8 snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-0.625rem)] transition-opacity"
    class:scrollbar-none={true}
    class:[&]:snap-none={contentPreviewDisableSnap}
    class:opacity-0={!contentId || isFullpage}
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
    class:opacity-0={!contentId || isFullpage}
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
