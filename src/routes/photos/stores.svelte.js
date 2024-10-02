/** @typedef {{ id: string, author: string, src: string, video?: string, size: [number, number], src_resize: (size: [number, number]) => string }} Content */

/** @type {Record<string, Content>} */
export const library = $state({});
export const libraryLoad = /** @type {Promise<void>} */ (
  new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    (async () => {
      for (let i = 1; i < 3; i++) {
        let body = await fetch(`https://picsum.photos/v2/list?page=${i}&limit=100`).then((res) => res.json());
        for (let item of body) {
          library[item.id] = {
            ...item,
            src: item.download_url,
            size: [item.width, item.height],
            src_resize: function (size) {
              const scale = Math.min(size[0] / this.size[0], size[1] / this.size[1]);
              return `${this.src.slice(0, this.src.indexOf("/", 25))}/${(this.size[0] * scale).toFixed(0)}/${(this.size[1] * scale).toFixed(0)}`; // Load the image
            },
          };
        }
      }
      library.vid = {
        id: "vid",
        size: [800, 332],
        author: "ben",
        src: "https://iandevlin.github.io/mdn/video-player-styled/img/poster.jpg",
        src_resize: function () {
          return this.src;
        },

        video: "https://iandevlin.github.io/mdn/video-player/video/tears-of-steel-battle-clip-medium.mp4",
      };
      library.vid2 = {
        id: "vid2",
        size: [756, 1582],
        author: "ben",
        src: "http://100.68.150.84:3000/output_image.jpg",
        src_resize: function () {
          return this.src;
        },

        video: "http://100.68.150.84:3000/Screen Recording 2024-09-03 at 00.35.47.mov",
      };
      library.vid3 = {
        id: "vid3",
        size: [1080, 1920],
        author: "ben",
        src: "http://100.68.150.84:3000/IMG_9587.png",
        src_resize: function () {
          return this.src;
        },

        video: "http://100.68.150.84:3000/IMG_9587.mov",
      };
      library.test1 = {
        id: "test1",
        size: [750, 1000],
        author: "ben",
        src: "https://placehold.co/750x1000",
        src_resize: function () {
          return this.src;
        },
      };
      library.test2 = {
        id: "test2",
        size: [750, 1070],
        author: "ben",
        src: "https://placehold.co/750x1070",
        src_resize: function () {
          return this.src;
        },
      };
      library.test3 = {
        id: "test3",
        size: [1080, 1920],
        author: "ben",
        src: "https://placehold.co/1080x1920",
        src_resize: function () {
          return this.src;
        },
      };

      //for (let [k, v] of Object.entries(library).slice(0, 20)) {
      //  delete library[k];
      //}
      //for (let [k, v] of Object.entries(library).slice(35)) {
      //  delete library[k];
      //}
      resolve();
    })();
  })
);

export const routes = /** @type {const} */ ({ "/": 1, "/content": 1, "/content/info": 1, "/content/expanded": 1 });
export const contentIndex = $state(-1);
// TODO we need to use this, to scroll +page's ContentGrid to image, when ContentView hide()
