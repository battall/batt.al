<script>
  import { Pause, Play, VolumeX } from "@steeze-ui/lucide-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  /** @type {{ src: string, size: [number, number] } & import('svelte/elements').HTMLAttributes<HTMLDivElement>} */
  let { src, size, ...props } = $props();

  /** @type {HTMLVideoElement}*/
  let video;
  let videoPaused = $state(true);
  let videoCurrentTime = $state(0);
  let videoDuration = $state(0);

  let clientXStart = $state(0);
  let clientXDelta = $state(0);
  let isPointerDown = $state(false);

  // TODO on scroll of contentContainer stop video.
  // and animate range, while video playing...
</script>

<div
  {...props}
  style:max-width={size[0] + "px"}
  style:max-height={size[1] + "px"}
  style:aspect-ratio={size.join("/")}
  class:w-full={size[0] >= size[1]}
  class:h-full={size[1] >= size[0]}
>
  <video
    {src}
    class="size-full rounded object-scale-down"
    bind:this={video}
    playsinline
    loop
    preload="metadata"
    ontimeupdate={(e) => {
      if (!isPointerDown) videoCurrentTime = video.currentTime;
    }}
    onloadedmetadata={(e) => {
      videoDuration = video.duration;
    }}
  >
    <track kind="captions" />
  </video>
  <div class="absolute bottom-0 flex w-full flex-col gap-3 px-4 pb-5">
    <div class="relative z-30 w-full text-white" class:texts={1}>
      <div class="z-40 flex items-center justify-between {isPointerDown ? 'opacity-0' : 'opacity-100'}">
        <Icon
          class="size-6 rounded-full fill-white"
          style="filter: drop-shadow(0 0 0.75rem black)"
          src={videoPaused ? Play : Pause}
          onclick={(/** @type {{ stopPropagation: () => void; }} */ e) => {
            console.log("CLICKED??");
            e.stopPropagation();
            videoPaused ? video.play() : video.pause();
            videoPaused = !videoPaused;
          }}
        />
        <Icon class="size-6 fill-white" src={VolumeX} />
      </div>
      <div class="flex items-center justify-between {!isPointerDown ? 'opacity-0' : 'opacity-100'}">
        <span>{Math.floor(videoCurrentTime / 60) + ":" + (videoCurrentTime % 60).toFixed(0).padStart(2, "0")}</span>
        <span>{Math.floor(videoDuration / 60) + ":" + (videoDuration % 60).toFixed(0).padStart(2, "0")}</span>
      </div>
    </div>
    <button class="flex h-5 items-center">
      <input
        type="range"
        class="input touch-none transition-all"
        bind:value={videoCurrentTime}
        max={videoDuration}
        step={0.01}
        oninput={function (e) {
          video.currentTime = this.value;
        }}
        onpointerdown={(e) => {
          isPointerDown = true;
          clientXStart = e.clientX;
        }}
        onpointermove={(e) => {
          if (!isPointerDown) return;
          if (!(e.target instanceof HTMLInputElement)) return;
          clientXDelta = e.clientX - clientXStart;
          clientXStart = e.clientX;

          videoCurrentTime += (clientXDelta / e.target.clientWidth) * videoDuration;
          videoCurrentTime = Math.max(0, videoCurrentTime); // if negative make 0
          video.currentTime = videoCurrentTime;
        }}
        onpointerup={(e) => {
          isPointerDown = false;
        }}
        onclick={(e) => e.stopPropagation()}
      />
    </button>
  </div>
</div>

<style type="postcss">
  .texts {
    @apply *:absolute *:bottom-0 *:w-full *:transition-opacity *:duration-300;
  }

  .input {
    --h: 0.5rem;

    --fill: 254 254 254;
    --remaining: 220 220 220;

    @apply h-[var(--h)] w-full appearance-none overflow-hidden rounded-full bg-transparent backdrop-blur-sm transition-[height];
  }
  .input:active:hover {
    --h: 1rem;
  }

  .input::-webkit-slider-thumb {
    @apply size-0 appearance-none transition-all;
    cursor: ew-resize;
    box-shadow:
      -100vw 0 0 100vw rgb(var(--fill) / 0.8),
      100vw 0 0 100vw rgb(var(--remaining) / 0.8);

    transition: all;
  }

  /** FF*/
  .input::-moz-range-thumb {
    @apply size-0 appearance-none border-0 transition-all;
    box-shadow:
      -100vw 0 0 100vw rgb(var(--fill) / 0.8),
      100vw 0 0 100vw rgb(var(--remaining) / 0.8);
  }
</style>
