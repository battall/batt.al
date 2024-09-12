<script>
  import { onMount, tick } from "svelte";

  import { Icon } from "@steeze-ui/svelte-icon";
  import { ArrowUpDown, X, Search, PanelRightClose, User } from "@steeze-ui/lucide-icons";
  import Navbar from "./Navbar.svelte";
  import ContentView from "./ContentView.svelte";

  let menuHidden = $state(true);

  /** @type {HTMLElement} */
  let photos;

  /** @type {HTMLElement} */
  let menu;

  /** @type {HTMLElement} */
  let snapper;

  /** @type {HTMLElement} */
  let container;

  /** this is true when user is on top/bottom of the page, so can get to next stage */
  let section = $state(1);
  let sectionSnapped = $state(false);
  let sectionDebounce = setTimeout(() => {});
  let sectionSnapAt = 0;

  $effect(() => {
    //if (sectionStage > 0) {
    //  // document.documentElement.style.overscrollBehaviorY = "none";
    //}
  });
  $effect(() => {
    //photos.style.height = isSnapped ? "100vh" : "60vh";

    console.log("[SECTION]", section);

    switch (section) {
      case 0:
        photos.style.height = "90vh";
        photos.style.overflowY = "auto";
        //setInterval(() => {
        //  menu.style.height = "10px";
        //});
        //// disabling container overflow takes effect after user stops scrolling fully, so its a little inconvenient
        container.style.overflowY = "hidden";
        setTimeout(() => photos.scrollTo({ top: photos.scrollHeight, behavior: "instant" }));
        break;
      case 1:
        photos.style.height = "60vh";
        photos.style.overflowY = "hidden";
        document.body.style.overflowY = "";
        document.documentElement.style.overflowY = "";
        setTimeout(() => photos.scrollTo({ top: photos.scrollHeight, behavior: "instant" }));

        // photos.style.height = "calc(60vh + 100px)";
        //window.scrollY = 100;
        break;
    }
  });

  $effect(() => {
    console.log("[SECTION][SNAPPED]", sectionSnapped);
    switch (sectionSnapped) {
      case false:
        photos.style.height = section === 0 ? "calc(100vh)" : "calc(60vh)";
        photos.scrollTo({ top: photos.scrollHeight, behavior: "instant" });
        break;
      case true:
        // if (section === 1) container.scrollTo({ top: sectionSnapAt });
        photos.style.height = section === 0 ? "calc(100vh)" : "calc(100vh)";
        // console.log(container.clientHeight - container.scrollHeight + 240);
        //container.scrollTo({ top: container.clientHeight - container.scrollHeight + 240, behavior: "instant" });
        break;
    }
  });

  onMount(() => {
    const window_events = new AbortController();

    const section_1_scroll_height = container.scrollHeight - container.clientHeight;
    container.addEventListener(
      "scroll",
      function (e) {
        if (section === 0) {
          this.style.setProperty("--scroll", "1");
        } else if (sectionSnapped && section === 1)
          this.style.setProperty(
            "--scroll",
            (
              (this.scrollTop * -1 - section_1_scroll_height) /
              (this.scrollHeight - (section_1_scroll_height + container.clientHeight))
            ).toFixed(2),
          );
        else {
          this.style.setProperty("--scroll", "0");
        }

        //console.log("[WINDOW][SCROLL]", this.scrollTop, this.scrollHeight, this.clientHeight);
        clearTimeout(sectionDebounce);

        // if snap pos ~ scroll pos
        if (!sectionSnapped && this.scrollTop < this.clientHeight - this.scrollHeight + 3) {
          // if snap pos <! scroll pos (user is not over)
          if (Math.abs(this.scrollTop - (this.clientHeight - this.scrollHeight)) < 3) {
            sectionDebounce = setTimeout(() => {
              sectionSnapAt = this.scrollTop;
              sectionSnapped = true;
            }, 150);
          }
        } else if (this.scrollTop < this.clientHeight - this.scrollHeight + 3) {
          if (Math.abs(this.scrollTop - (this.clientHeight - this.scrollHeight)) < 3) {
            sectionDebounce = setTimeout(() => {
              section = 0;
            }, 150);
          }
        } else if (this.scrollTop > this.clientHeight - this.scrollHeight + 3 + window.innerHeight * 0.4) {
          clearTimeout(sectionDebounce);
          sectionSnapped = false;
        }
      },
      { signal: window_events.signal },
    );

    photos.addEventListener(
      "scroll",
      function (e) {
        if (section !== 0) return;
        clearTimeout(sectionDebounce);
        //console.log("[SCROLL][PHOTOS]", { scroll: this.scrollTop, height: this.scrollHeight });
        if (photos.scrollHeight < photos.scrollTop + photos.clientHeight + 1) {
          sectionDebounce = setTimeout(async () => {
            sectionSnapped = true;
          }, 300);
        } else {
          sectionSnapped = false;
        }
      },
      { signal: window_events.signal },
    );
    window.addEventListener(
      "scroll",
      function (e) {
        return;

        console.log("[WINDOW][SCROLL]", window.scrollY);
        if (sectionStage === 2) return;
        if (1 > window.scrollY) {
          sectionDebounce = setTimeout(async () => {
            sectionStage = 1;
          }, 1000 / 60);
        } else {
          sectionStage = 0;
        }
        //switch (section) {
        //  case 0:
        //    console.log(photos.scrollTop, photos.scrollHeight);
        //    if (2 > window.scrollY || photos.scrollTop + 1 > photos.scrollHeight) {
        //      sectionDebounce = setTimeout(async () => {
        //        section = 0;
        //      }, 150);
        //      if (section) {
        //        // next stage!!!!!! with scroll snap, smooth scroll to there,
        //      }
        //    }
        //    break;
        //  case 1:
        //    if (2 > window.scrollY || window.scrollY > document.body.scrollHeight) {
        //      sectionDebounce = setTimeout(async () => {
        //        section = 0;
        //        // initial_event_received = false;
        //      }, 150);
        //      if (section) {
        //        // next stage!!!!!! with scroll snap, smooth scroll to there,
        //      }
        //    }
        //}
      },
      { signal: window_events.signal, passive: true },
    );
    window.addEventListener(
      "scrollend",
      (e) => {
        // console.log("scrollemnd");
      },
      { signal: window_events.signal },
    );

    let touchstart = 0;
    let touchdelta = 0;
    window.addEventListener(
      "touchstart",
      (e) => {
        return;

        if (sectionStage === 0) return;
        touchstart = e.touches[0].clientY;
      },
      { signal: window_events.signal, passive: true },
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        return;

        if (sectionStage === 0) return;
        photos.scrollTo({ top: photos.scrollHeight, behavior: "instant" });
        switch (section) {
          case 0:
            if (touchstart - e.touches[0].clientY > 0 && touchstart - e.touches[0].clientY < window.innerHeight * 0.3) {
              sectionStage = 2;
              photos.style.height = `calc(90vh - ${touchstart - e.touches[0].clientY}px)`;
              //  menu.style.marginTop = `${e.touches[0].clientY - touchstart}px`;
            }
            break;
          case 1:
            if (e.touches[0].clientY - touchstart > 0 && e.touches[0].clientY - touchstart < window.innerHeight * 0.3) {
              sectionStage = 2;
              photos.style.height = `calc(60vh + ${e.touches[0].clientY - touchstart}px)`;
              //  menu.style.marginTop = `${e.touches[0].clientY - touchstart}px`;
            }
            break;
        }
      },
      { signal: window_events.signal },
    );
    window.addEventListener(
      "touchend",
      (e) => {
        // if its touch end scroll to start of snap position,
        // or scroll to next section, based on which one is closer,
        // if user leaved at that position, if user swiped fast, dont call scrollTo()
        return;

        if (sectionStage !== 2) return;
        console.log("[TOUCH][END]", photos.clientHeight, document.documentElement.clientHeight * 0.85);
        sectionStage = 1;
        if (photos.clientHeight > document.documentElement.clientHeight * 0.85) {
          section = 0;
          photos.style.transition = "height 150ms";
          photos.style.height = "90vh";
          requestIdleCallback(() => photos.scrollTo({ top: photos.scrollHeight, behavior: "instant" }));
        } else {
          section = 1;
          photos.style.transition = "height 150ms";
          photos.style.height = "60vh";

          requestIdleCallback(() => photos.scrollTo({ top: photos.scrollHeight, behavior: "instant" }));
        }
      },
      { signal: window_events.signal, passive: true },
    );
    container.addEventListener(
      "wheel",
      (e) => {
        if (true) {
          //e.preventDefault();
          //e.stopPropagation();
          //return false;
        }
        //console.log("[WINDOW][WHEEL]", e.deltaMode, e.deltaY);
      },
      { signal: window_events.signal },
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          //console.log("[main gallery] got", entry.target);

          const img = entry.target.children[0];

          if (!entry.isIntersecting) continue;
          //console.log("[main gallery] int", entry.target);
          if (!(img instanceof HTMLImageElement)) continue;
          if (!img.dataset.src) continue;

          observer.unobserve(entry.target); // Stop observing the image once it's loaded

          let imageSize = img.dataset.src
            .split("/")
            .slice(-2)
            .map((i) => parseInt(i));
          let windowSize = [window.innerWidth, window.innerHeight];
          let scaleFactor = Math.min(windowSize[0] / imageSize[0], windowSize[1] / imageSize[1]);

          img.src =
            img.dataset.src.slice(0, img.dataset.src.indexOf("/", 25)) +
            `/${(imageSize[0] * scaleFactor).toFixed(0)}/${(imageSize[1] * scaleFactor).toFixed(0)}`;
          img.onload = () => (img.style.opacity = "1");
        }
      },
      { root: photos, rootMargin: "0px 0px 100% 0px" },
    );

    (async () => {
      await libraryLoad;
      await tick();
      console.log("lib load & tick");

      console.log("adding", photos.childElementCount);
      for (const img of photos.children) {
        observer.observe(img);
      }
    })();

    console.log("[PAGE] onMount");

    return () => {
      observer.disconnect();
      window_events.abort();
    };
  });

  import { library, libraryLoad } from "./stores.svelte.js";
  import Highlights from "./Highlights.svelte";
  import Dashboard from "./Dashboard.svelte";

  let hash = typeof window !== "undefined" && window.location.hash;

  /** @type {string} */
  let contentId = $state("");
  if (hash) {
    contentId = hash.slice(1); // remove #
  }

  let hiddenDashboard = $state(true);
</script>

<svelte:body
  onwheel={(e) => {
    //console.log("[BODY][WHEEL]", e.deltaX, e.deltaY);
  }}
/>

{#await Promise.all([libraryLoad]) then}
  <ContentView bind:contentId getRect={(/** @type {number} */ i) => photos.children[i].getBoundingClientRect()}
  ></ContentView>
{/await}

<span class="hidden">
  - imo the best solution would be increase the height of menu section when snapped - so if user scrolls one more time
  it transitions, - after that scroll ends disable body overflow, enable photos overflow, - but i couldn't find a way to
  increase scroll height without layout shift.
</span>

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
></button>

<Dashboard bind:hidden={hiddenDashboard}></Dashboard>

<div
  class="flex size-full flex-col-reverse overflow-y-auto transition-[margin-left] duration-300"
  class:lg:ml-80={!menuHidden}
  style="--scroll:0"
  bind:this={container}
>
  <div class="relative">
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
      <div class="text-lg">7.672 Items <span>{section} {sectionSnapped}</span></div>
    </div>

    <div
      class="grid h-full grid-cols-5 gap-px overflow-y-hidden bg-background pt-[calc(5.5rem+var(--safe-t))] *:aspect-square md:grid-cols-7 lg:grid-cols-9"
      bind:this={photos}
    >
      {#if false}
        <div class="bg-red col-start-4">TODO make last row full, first row partial</div>
      {/if}
      {#each Object.values(library) as content, i}
        <button
          class="bg-card"
          onclick={(e) => {
            if (!(e.target instanceof HTMLImageElement)) return;
            const image = e.target;
            contentId = content.id;

            return;

            const rect0 = { x: 0, y: 0, w: 0, h: 0 };
            const rect1 = { x: 0, y: 0, w: 0, h: 0 };
            const rectc = { w: window.innerWidth, h: window.innerHeight - (36 / 4) * (16 * 2) };

            // calculate image size, like as if it was not square. (square img -> real img aspect)
            const rect = image.getBoundingClientRect();
            if (image.naturalWidth / image.naturalHeight < rect.width / rect.height) {
              rect0.w = image.naturalWidth * (rect.width / image.naturalWidth);
              rect0.h = image.naturalHeight * (rect.width / image.naturalWidth);
              rect0.y = rect.top - (rect0.h - rect.height) / 2; // (h_curr - h_prev) / 2 => increase in top
              rect0.x = rect.left;
            } else {
              rect0.w = image.naturalWidth * (rect.height / image.naturalHeight);
              rect0.h = image.naturalHeight * (rect.height / image.naturalHeight);
              rect0.y = rect.top;
              rect0.x = rect.left - (rect0.w - rect.width) / 2;
            }

            // calculate max scale for the container TODO: window -> container size in the futur.
            let scaleX = window.innerWidth / rect0.w;
            let scaleY = (window.innerHeight - (36 / 4) * (16 * 2)) / rect0.h;

            // To maintain the aspect ratio, take the minimum of the two scaling factors
            let scale = Math.min(scaleX, scaleY);
            console.log("[SCALE]", scale);

            // its centered on the target container so (we should get this from our contentContainer, without calculating ourself IMO)
            rect1.w = rect0.w * scale;
            rect1.h = rect0.h * scale;
            rect1.x = 0.5 * (window.innerWidth - rect1.w);
            rect1.y = 0.5 * (window.innerHeight - rect1.h);

            console.log("[RECT0:FROM]", rect0);
            console.log("[RECT1:INTO]", rect1);

            /*

            if (false) {
              image.style.transformOrigin = `${parseInt(image.style.left.slice(0, -2)) / (scale - 1)}px -${parseInt(image.style.top.slice(0, -2)) / scale}px`;
              image
                .animate([{ transform: "scale(1)" }, { transform: `scale(${scale})` }], {
                  duration: 300,
                  easing: "ease-in-out",
                })
                .finished.then(() => {
                  contentId = content.id;
                });
            } else {
              contentId = content.id;


              // Apply the transform and correct transform origin
              // window.contentContainer.style.transformOrigin = `${transformOriginX}% ${transformOriginY}%`;

              // image top goes from

              const transformOriginX2 = (375 - (rect0.x + rect0.w / 2)) / scale;
            }
            */

            let method = "transform_inset";
            switch (method) {
              case "scale_only":
                const transformOriginX = (rect0.x - rect1.x * (1 / scale)) * (scale / (scale - 1));
                const transformOriginY = (rect0.y - rect1.y * (1 / scale)) * (scale / (scale - 1));
                //                        (196 - 80.5) * (3.46 / 2.46)
                //console.log("[ORIG0]", transformOriginX, transformOriginY);
                //console.log("[ORIG1]", transformOriginX1, transformOriginY1);
                //console.log("[ORIG2]", transformOriginX2, transformOriginY1);
                window.contentContainer.style.transformOrigin = `${transformOriginX}px ${transformOriginY}px`;
                //            window.contentContainer.style.transform = `scale(${1 / scale})`;
                contentId = content.id;
                tick().then(() => {
                  window.contentContainer
                    .animate([{ transform: `scale(${1 / scale})` }, { transform: `scale(${1})` }], {
                      duration: 300,
                      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
                    })
                    .finished.then(async () => {});
                });
                break;
              case "transform_inset":
                contentId = content.id;
                break;
              case "transform":
                contentId = content.id;
                tick().then(() => {
                  contentAnim.getAnimations().forEach((anim) => anim.cancel());
                  contentAnim.style.opacity = "1";
                  contentAnim
                    .animate(
                      [
                        { transform: `scale(${rect.width / rect1.w}, ${rect.height / rect1.h})` },
                        { transform: `scale(1)` },
                      ],
                      {
                        duration: 500 * 10,
                        fill: "forwards",
                        easing: "cubic-bezier(0.33, 1, 0.68, 1)",
                      },
                    )
                    .finished.then(async () => {
                      //contentAnim.style.opacity = "0";
                    });
                  contentAnim.children[0]
                    .animate(
                      [
                        { transform: `scale(${rect.height / rect1.h}, ${rect.width / rect1.w})` },
                        { transform: `scale(1)` },
                      ],
                      {
                        duration: 500 * 10,
                        fill: "forwards",
                        easing: "cubic-bezier(0.33, 1, 0.68, 1)",
                      },
                    )
                    .finished.then(async () => {
                      //contentAnim.style.opacity = "0";
                    });
                });
                break;
            }
          }}
        >
          <img alt="" data-src={content.download_url} class="size-full object-cover opacity-0 transition-opacity" />
        </button>
      {/each}
      <div class="col-span-full h-[80px] bg-background"></div>
    </div>

    <div
      class:gallery-menu={1}
      class="sticky bottom-0 col-span-full mx-auto flex w-full max-w-96 scale-[var(--scroll)] items-center justify-around overflow-y-hidden px-6
      pb-[calc(((var(--scroll)-0.5)*2)*max(var(--safe-b),1.75rem))]
      pt-[calc(((var(--scroll)-0.5)*2)*0.5rem)]
      text-accent
      opacity-[calc((var(--scroll)-0.8)*5)] blur-[calc(var(--scroll)*-4px+4px)]"
    >
      <Icon src={ArrowUpDown} theme="solid" class="flex size-11 rounded-full bg-card p-3" />
      <div class="rounded-full bg-card py-2.5 font-semibold">
        <span class="m-1 rounded-full px-3 py-1.5">Years</span>
        <span class="m-1 rounded-full px-3 py-1.5">Months</span>
        <span class="m-1 rounded-full bg-card-foreground px-3 py-1.5 text-foreground">All</span>
      </div>
      <Icon src={X} theme="solid" class="flex size-11 rounded-full bg-card p-3" />
    </div>

    <Highlights />
  </div>
</div>

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
