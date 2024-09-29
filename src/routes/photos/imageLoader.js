/** @type {import('svelte/action').Action<HTMLDivElement, any>}  */
export const ImageLoader = (node, size) => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (let entry of entries) {
        const img = entry.target.children[0];

        if (!entry.isIntersecting) continue;
        if (!(img instanceof HTMLImageElement)) continue;
        if (!img.dataset.src) continue;

        //observer.unobserve(entry.target); // Stop observing the image once it's loaded

        if (img.src !== img.dataset.src) img.src = img.dataset.src;
      }
    },
    { root: document, rootMargin: "100% 100% 100% 100%" },
  );

  return {
    update() {
      for (const img of node.children) {
        observer.observe(img);
      }
    },
    destroy() {
      observer.disconnect();
    },
  };
};
