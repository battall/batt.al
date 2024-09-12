<script>
  import info_lang from "$lib/info-en.json";

  const info = info_lang;
</script>

<svelte:head>
  <meta name="description" content="TODO" />
</svelte:head>

<span class="text-color-444 text-base" style="border-bottom: 2px solid #777"> Fun Projects </span>
<div class="h-8" />

{#each info.projects.filter((i) => i.viewable_on.site) as project}
  <a class="project group" href={project.link.replace("https://batt.al", "")}>
    <span class="text-base">{project.title}</span>
    <span class="project-description">{project.desc} </span>
  </a>
  <div class="h-4" />
{/each}
