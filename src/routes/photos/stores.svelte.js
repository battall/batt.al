/** @type {Record<string, { id: string, author: string, download_url: string, video?: string, size: [number, number] }>} */
export const library = $state({});
export const libraryLoad = /** @type {Promise<void>} */ (
  new Promise(async (resolve) => {
    if (typeof window === "undefined") return resolve();
    for (let i = 1; i < 3; i++) {
      let body = await fetch(`https://picsum.photos/v2/list?page=${i}&limit=100`).then((res) => res.json());
      for (let item of body) {
        library[item.id] = { ...item, size: [item.width, item.height] };
      }
    }
    library["vid"] = {
      id: "vid",
      size: [800, 332],
      author: "ben",
      download_url: "https://iandevlin.github.io/mdn/video-player-styled/img/poster.jpg",

      video: "https://iandevlin.github.io/mdn/video-player/video/tears-of-steel-battle-clip-medium.mp4",
    };
    library["vid2"] = {
      id: "vid2",
      size: [756, 1582],
      author: "ben",
      download_url: "http://100.68.150.84:3000/output_image.jpg",

      video: "http://100.68.150.84:3000/Screen Recording 2024-09-03 at 00.35.47.mov",
    };
    library["vid3"] = {
      id: "vid3",
      size: [1080, 1920],
      author: "ben",
      download_url: "http://100.68.150.84:3000/IMG_9587.png",

      video: "http://100.68.150.84:3000/IMG_9587.mov",
    };
    library["test1"] = {
      id: "test1",
      size: [750, 1000],
      author: "ben",
      download_url: "https://placehold.co/750x1000",
    };
    library["test2"] = {
      id: "test2",
      size: [750, 1070],
      author: "ben",
      download_url: "https://placehold.co/750x1070",
    };
    library["test3"] = {
      id: "test3",
      size: [1080, 1920],
      author: "ben",
      download_url: "https://placehold.co/1080x1920",
    };

    resolve();
  })
);

export const contentIndex = $state(-1);
// TODO we need to use this, to scroll +page's ContentGrid to image, when ContentView hide()
