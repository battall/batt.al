<script>
  import { User, X } from "@steeze-ui/lucide-icons";

  import { Icon } from "@steeze-ui/svelte-icon";
  import { cubicOut, quintOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  let { hidden = $bindable(true) } = $props();

  /** @type {FileList | undefined} */
  let files = $state();
</script>

{#if !hidden}
  <div
    class="fixed z-30 mt-[calc(max(var(--safe-t),1.5rem)+1.75rem)] flex size-full
  flex-col rounded-xl bg-[#f2f2f6] px-4 pb-[max(var(--safe-b),1.75rem)] transition-[opacity_background-color] duration-300"
    transition:fly={{ y: "100%", easing: cubicOut, opacity: 1 }}
  >
    <div class="flex justify-end py-3">
      <Icon
        class="size-7 rounded-full bg-[#dedee3] stroke-[3] p-1 text-primary"
        src={X}
        role="button"
        onclick={() => {
          hidden = true;
        }}
      ></Icon>
    </div>

    <div class="flex h-[21rem] flex-col items-center justify-center">
      <Icon class="size-24 rounded-full bg-lime-500 p-4" src={User}></Icon>
      <h2 class="my-4 text-2xl font-semibold">battal niye</h2>
      <h4 class="font-medium">6.712 Photos, 1.026 Videos</h4>
    </div>

    <div>
      <input
        type="file"
        multiple
        accept="image/*,image/heic"
        bind:files
        onchange={(e) => {
          if (!(e.target instanceof HTMLInputElement)) return;
          console.log(e.target.files);
        }}
      />
    </div>
    <div>
      {#each files || [] as file}
        {file.name}, {file.type}, {file.size}
      {/each}
    </div>

    <div>
      <span class="text-sm font-light text-accent">SHOW IN MAIN VIEW</span>
    </div>
  </div>
{/if}
