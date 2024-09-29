<script>
  import { ChevronRight } from "@steeze-ui/lucide-icons";
  import { Icon } from "@steeze-ui/svelte-icon";

  import { library } from "./stores.svelte";

  const data = {
    albums: [
      {
        title: "midas",
        count: 8,
        images: [
          "https://picsum.photos/200?random=1",
          "https://picsum.photos/200?random=2",
          "https://picsum.photos/200?random=3",
          "https://picsum.photos/200?random=4",
          "https://picsum.photos/200?random=5",
        ],
      },
      {
        title: "Snapchat",
        count: 286,
        images: [
          "https://picsum.photos/200?random=1",
          "https://picsum.photos/200?random=2",
          "https://picsum.photos/200?random=3",
          "https://picsum.photos/200?random=4",
          "https://picsum.photos/200?random=5",
        ],
      },
      {
        title: "midas",
        count: 8,
        images: [
          "https://picsum.photos/200?random=1",
          "https://picsum.photos/200?random=2",
          "https://picsum.photos/200?random=3",
          "https://picsum.photos/200?random=4",
          "https://picsum.photos/200?random=5",
        ],
      },
      {
        title: "midas",
        count: 8,
        images: [
          "https://picsum.photos/200?random=1",
          "https://picsum.photos/200?random=2",
          "https://picsum.photos/200?random=3",
          "https://picsum.photos/200?random=4",
          "https://picsum.photos/200?random=5",
        ],
      },
    ],
  };
  data.albums = [...data.albums, ...data.albums, ...data.albums];
</script>

<div class="z-20 flex flex-col gap-7 bg-background pt-2 text-foreground">
  <div class="w-full">
    <div class="mb-3 flex items-center">
      <h3 class="ml-[calc(1.5rem+var(--safe-s))] text-[1.40rem] font-bold">Recent Days</h3>
      <Icon src={ChevronRight} class="size-6 stroke-[3] text-accent" />
    </div>
    <div class:container-h={1}>
      {#each { length: 10 } as _, i}
        <div class="aspect-square snap-start rounded-2xl bg-card">
          <img class="rounded-2xl" src={"https://picsum.photos/200?random=" + i} alt="" width="100%" height="100%" />
        </div>
      {/each}
    </div>
  </div>

  <div class="w-full">
    <div class="mb-3 flex items-center">
      <h3 class="ml-[calc(1.5rem+var(--safe-s))] text-[1.40rem] font-bold">Albums</h3>
      <Icon src={ChevronRight} class="size-6 stroke-[3] text-accent" />
    </div>

    <div class:container-h={1} class="grid-rows-2 !gap-y-0 ![--cols-count:1] sm:grid-rows-3 sm:![--cols-count:2]">
      {#each data.albums as album}
        <div
          class="snap-start bg-card pl-6 pr-4
            [&:nth-child(2n+1)]:rounded-t-2xl
            sm:[&:nth-child(2n+1)]:rounded-none
            [&:nth-child(2n+2)]:rounded-b-2xl
            sm:[&:nth-child(2n+2)]:rounded-none
            sm:[&:nth-child(3n+1)]:rounded-t-2xl
            sm:[&:nth-child(3n+3)]:rounded-b-2xl"
        >
          <div class="flex min-w-full justify-between py-4 text-lg">
            <div class="flex flex-col justify-center">
              <h4>{album.title}</h4>
              <span class="font-light text-accent">{album.count}</span>
            </div>
            <div class="grid w-1/2 grid-cols-4 gap-[3px]">
              <img
                src={album.images[0]}
                alt=""
                class="col-span-2 row-span-2 aspect-square rounded rounded-l-lg bg-red-300"
              />
              <img src={album.images[1]} alt="" class="aspect-square rounded bg-red-300" />
              <img src={album.images[2]} alt="" class="aspect-square rounded rounded-tr-lg bg-red-300" />
              <img src={album.images[3]} alt="" class="aspect-square rounded bg-red-300" />
              <img src={album.images[4]} alt="" class="aspect-square rounded rounded-br-lg bg-red-300" />
            </div>
          </div>
          <div class="ml-2 h-[1px] w-full bg-accent"></div>
        </div>
      {/each}
    </div>
  </div>

  <div class="w-full">
    <div class="mb-3 flex items-center">
      <h3 class="ml-[calc(1.5rem+var(--safe-s))] text-[1.40rem] font-bold">People</h3>
      <Icon src={ChevronRight} class="size-6 stroke-[3] text-accent" />
    </div>

    <div class:container-h={1}>
      <div class="col-span-2 row-span-2 aspect-square snap-start">
        <img alt="" src="https://picsum.photos/300?random=5" class="opacity-1 rounded-2xl transition-opacity" />
      </div>
      {#each { length: 20 } as _, i}
        <div class="aspect-square snap-start">
          <img alt="" src="https://picsum.photos/200?random={i}" class="opacity-1 rounded-2xl transition-opacity" />
        </div>
      {/each}
    </div>
  </div>

  <div class="w-full">
    <div class="mb-3 flex items-center">
      <h3 class="ml-[calc(1.5rem+var(--safe-s))] text-[1.40rem] font-bold">Media Types</h3>
      <Icon src={ChevronRight} class="size-6 stroke-[3] text-accent" />
    </div>

    <div class:container-h={1} class="grid-rows-4 !gap-y-0 ![--cols-count:1]">
      {#each { length: 20 } as _, i}
        <div class="snap-y snap-start">
          <span>Media Type {i}</span>
          <span>Media Type {i}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  .container-h {
    --gap: 0.75rem;
    --cols-count: 3;

    /* gaps between items that will be in the center */
    --gap-sum: calc(var(--gap) * (var(--cols-count) - 1));

    @apply grid w-full snap-x snap-mandatory scroll-pl-[calc(var(--gap)*2+var(--safe-s))] auto-cols-[calc((100%-var(--gap-sum))/var(--cols-count))] grid-flow-col gap-[var(--gap)] overflow-x-auto px-[calc((var(--safe-x)+var(--gap)*4)/2)] sm:[--cols-count:6];

    scrollbar-width: none;
  }
  .container-h::-webkit-scrollbar {
    display: none;
  }
</style>
