<script>
  import { onMount, untrack } from "svelte";

  /** @typedef {{ x: number, y: number, w: number, h: number }} XYWH */

  const rect_to_xywh = (/** @type {DOMRect} */ rect) => ({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
  /** @param s {XYWH} */
  const xywh_to_rect = (s) => ({ left: `${s.x}px`, top: `${s.y}px`, width: `${s.w}px`, height: `${s.h}px` });

  /** @type {{ from: HTMLImageElement, into: HTMLImageElement, contentAnim: Animation, contentAnimOpts: KeyframeAnimationOptions }} */
  let { from = $bindable(), into = $bindable(), contentAnim = $bindable(), contentAnimOpts = $bindable() } = $props();

  /** @type {HTMLDivElement} */
  let contentAnimNode;

  // we prepare the animation here, but element should control the contentAnim progress itself.

  /** @type {DOMRect} */
  let fromRect;
  /** @type {DOMRect} */
  let intoRect;

  $effect(() => {
    if (!from) return;
    console.log("[ContentAnim] rect from");
    fromRect = from.getBoundingClientRect();

    if (!(contentAnimNode.children[0] instanceof HTMLImageElement)) throw new Error();
    contentAnimNode.children[0].src = from.src;
  });

  $effect(() => {
    into;

    if (!into) return;
    into.style.opacity = "0";

    untrack(async () => {
      console.log("[ContentAnim] rect into", into.src);
      const t0 = performance.now();
      await into.decode();
      intoRect = into.getBoundingClientRect();
      console.log(`[ContentAnim] rect into took ${(performance.now() - t0).toFixed(2)}ms`);

      if (contentAnim && contentAnim.playState !== "finished") {
        contentAnim.playbackRate = 1;
        contentAnim.finish();
      }

      let rectRoot = rect_to_xywh(contentAnimNode.getBoundingClientRect());
      let rect0 = rect_to_xywh(fromRect);
      let rect1 = rect_to_xywh(intoRect);

      let delta1 = { x: 0, y: 0, sx: rect0.w / rectRoot.w, sy: rect0.h / rectRoot.h };
      if (delta1.sx === Number.POSITIVE_INFINITY || delta1.sx === Number.NEGATIVE_INFINITY) delta1.sx = 1;
      if (delta1.sy === Number.POSITIVE_INFINITY || delta1.sy === Number.NEGATIVE_INFINITY) delta1.sy = 1;
      delta1.x = rect0.x - (rectRoot.w - rectRoot.w * delta1.sx) / 2;
      delta1.y = rect0.y - (rectRoot.h - rectRoot.h * delta1.sy) / 2;

      let delta2 = { x: 0, y: 0, sx: rect1.w / rectRoot.w, sy: rect1.h / rectRoot.h };
      if (delta2.sx === Number.POSITIVE_INFINITY || delta2.sx === Number.NEGATIVE_INFINITY) delta2.sx = 1;
      if (delta2.sy === Number.POSITIVE_INFINITY || delta2.sy === Number.NEGATIVE_INFINITY) delta2.sy = 1;
      delta2.x = rect1.x - (rectRoot.w - rectRoot.w * delta2.sx) / 2;
      delta2.y = rect1.y - (rectRoot.h - rectRoot.h * delta2.sy) / 2;

      //rectRoot.w* delta1.sx = "elements width";

      let imageX = rectRoot.w / from.naturalWidth;
      let imageY = rectRoot.h / from.naturalHeight;
      let imageS = Math.min(imageX, imageY);
      let imageRect = {
        w: from.naturalWidth * imageS,
        h: from.naturalHeight * imageS,
      };

      let scale1X = rect0.w / imageRect.w;
      let scale1Y = rect0.h / imageRect.h;

      let scale2X = rect1.w / imageRect.w;
      let scale2Y = rect1.h / imageRect.h;

      /** @type {Keyframe[]} */
      const keyframes = [
        {
          transform: `translate3d(${delta1.x}px, ${delta1.y}px, 0) scale(${delta1.sx}, ${delta1.sy})`,
          "--scale-x": Math.max(scale1X, scale1Y) * (1 / delta1.sx),
          "--scale-y": Math.max(scale1X, scale1Y) * (1 / delta1.sy), // fuck math
          opacity: 1,
        },
        {
          transform: `translate3d(${delta2.x}px, ${delta2.y}px, 0) scale(${delta2.sx}, ${delta2.sy})`,
          "--scale-x": Math.max(scale2X, scale2Y) * (1 / delta2.sx),
          "--scale-y": Math.max(scale2X, scale2Y) * (1 / delta2.sy), // fuck math
          opacity: 1,
        },
      ];

      // TODO animate clip-path and only image, safari doesnt interpolate variables great, or performance issues idk.

      console.log("[ContentAnim] init:", keyframes);

      // hide the image in the horizontal container view, so it doesn't overlap with animated image element

      contentAnim = contentAnimNode.animate(keyframes, {
        duration: 500,
        easing: "cubic-bezier(0.33, 1, 0.68, 1)",
        fill: "none",
        ...contentAnimOpts,
        playbackRate: undefined,
      });
      if (contentAnimOpts.playbackRate === 0) contentAnim.pause(); // this is a safari only problem, setting playbackrate:0 makes aniamte only work on css variables

      contentAnim.ready.then(() => {
        from.style.opacity = "0";
      });
      contentAnim.finished.then(() => {
        console.log("[ContentAnim] done");
        contentAnimOpts = {};

        if (!(contentAnimNode.children[0] instanceof HTMLImageElement)) throw new Error();
        contentAnimNode.children[0].src = "";

        from.style.opacity = "";
        into.style.opacity = "";
      });
    });
  });
</script>

<div
  bind:this={contentAnimNode}
  class="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-0 will-change-transform"
  style="--scale-x: 1; --scale-y: 1"
>
  <img
    alt=""
    class="mx-auto size-full rounded object-contain will-change-transform"
    style="transform: scale(var(--scale-x), var(--scale-y));"
    class:[&]:rounded-none={false}
  />
</div>

<style>
  @property --scale-x {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
  }
  @property --scale-y {
    syntax: "<number>";
    inherits: true;
    initial-value: 0;
  }
</style>
