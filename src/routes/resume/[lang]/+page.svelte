<script lang="ts">
  // loaded by +page.ts
  let { data } = $props();
  console.log(data);

  import { page } from "$app/stores";

  import info_base from "$lib/info.json";

  let language: "en" | "tr" = "en";
  if ($page.params.lang === "tr") {
    language = $page.params.lang;
  }

  const info = { ...info_base, ...data };

  const translation = {
    en: {
      about: "A B O U T&nbsp;&nbsp;&nbsp;M E",
      skills: "S K I L L S",
      skills_programming: "Programming",
      hobbies: "INTERESTS",
      projects: "PROJECTS",
      experience: "WORK EXPERIENCE",
      education: "EDUCATION",
    },
    tr: {
      about: "H A K K I M D A",
      skills: "Y E T E N E K L E R",
      skills_programming: "Yazılım",
      hobbies: "HOBİLER",
      projects: "PROJELERİM",
      experience: "TECRÜBE",
      education: "EĞİTİM",
    },
  };

  const translate = translation[language];
</script>

<div class="space large"></div>
<div class="header h-between v-center flex">
  <div class="col flex">
    <span class="text semibold large" style="letter-spacing: -0.04em">
      {info.full_name}
    </span>
    <span class="text semibold small green" style="margin-top: -0.3cm">
      {info.title}
    </span>
  </div>

  <div class="col flex" style="text-align: end">
    <a class="text purple" href={info.site}> {info.site} </a>
    <a class="text purple" href={`mailto:${info.email}`}>{info.email}</a>
  </div>
</div>
<div class="space large"></div>
<div class="content flex">
  <div class="col left flex" style="width: 36%">
    <div style="margin-bottom: auto">
      <span class="text semibold small green">{translate.skills}</span>
      <div class="space medium"></div>
      <span class="text semibold">{translate.skills_programming}</span>
      {#each info.skills_programming as skill}
        <div class="space small"></div>
        <span class="text gray">{skill}</span>
      {/each}
    </div>

    <div style="margin-bottom: auto">
      <span class="text semibold small green">{translate.hobbies}</span>
      {#each info.hobbies as hobby}
        <div class="space small"></div>
        <span class="text gray">{hobby}</span>
      {/each}
    </div>
  </div>

  <div class="col right flex" style="width: 64%">
    <span class="text semibold small green">{@html translate.about}</span>
    <div class="space medium"></div>
    <span class="text gray" style="line-height: 1.5em">{info.about}</span>

    <div class="space medium"></div>

    <span class="text semibold small green">{translate.projects}</span>
    <div class="space small"></div>

    {#each info.projects.filter((i) => i.viewable_on.resume) as project}
      <span class="text semibold">{project.title}</span>
      <div class="space tiny"></div>
      <span class="text gray" style="line-height: 1.25em">{project.desc}</span>
      <div class="space tiny"></div>
      <a class="text purple italic" href={project.link}>{project.link}</a>
      <div class="space medium"></div>
    {/each}

    <div>
      <span class="text semibold small green">{translate.experience}</span>
      <div class="space tiny"></div>
      {#each info.experience as work}
        <span class="text medium">{work.title}</span>
        <span class="text gray">{work.at}</span>
        {#if work.remote}
          <span class="text tiny green">REMOTE</span>
        {/if}
        <span class="text tiny">{work.timespan}</span>
        <br />
        <span class="text small gray">{work.desc}</span>
        <br />
        <div class="space tiny"></div>
      {/each}
    </div>

    <div class="space tiny"></div>

    <div style="margin-bottom: auto;">
      <span class="text semibold small green">{translate.education}</span>
      <div class="space tiny"></div>

      {#each info.education as education}
        <div class="space tiny"></div>
        <span class="text">{education.at}</span>
        <span class="text tiny" style="">{education.timespan}</span>
      {/each}
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Thin.ttf");
    font-weight: 100;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Light.ttf");
    font-weight: 300;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Regular.ttf");
    font-weight: normal;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Medium.ttf");
    font-weight: 500;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Semibold.ttf");
    font-weight: 600;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Bold.ttf");
    font-weight: bold;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-Black.ttf");
    font-weight: 900;
  }

  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-RegularItalic.ttf");
    font-style: italic;
  }
  @font-face {
    font-family: "Calibre";
    src: url("/font/Calibre-BoldItalic.ttf");
    font-weight: bold;
    font-style: italic;
  }

  :root {
    --color-gray: #58595b;
    --color-green: #0dd345;
  }

  :global(body) {
    width: 21cm;
    height: 29.7cm;
    margin: 0 auto;

    font-family: Calibre;
    font-weight: normal;
    font-style: normal;

    outline: 1px solid var(--color-green);
    line-height: 1.2;
  }

  .text.thin {
    font-weight: 100;
  }
  .text.light {
    font-weight: 300;
  }
  .text.w-500 {
    font-weight: 500;
  }
  .text.semibold {
    font-weight: 600;
  }
  .text.bold {
    font-weight: bold;
  }
  .text.black {
    font-weight: 900;
  }
  .text.italic {
    font-style: italic;
  }

  .text.tiny {
    font-size: 10px;
  }
  .text.small {
    font-size: 14px;
  }
  .text.medium {
    font-size: 20px;
  }
  .text.large {
    font-size: 64px;
  }

  .text.purple {
    color: purple;
  }
  .text.gray {
    color: var(--color-gray);
  }
  .text.green {
    color: var(--color-green);
  }

  .space.tiny {
    height: 10px;
  }
  .space.small {
    height: 20px;
  }
  .space.medium {
    height: 30px;
  }
  .space.large {
    height: 40px;
  }

  .list {
    margin: 0;
    padding: 0;

    list-style: none;
  }

  .flex {
    display: flex;
  }
  .flex.h-center {
    justify-content: center;
  }
  .flex.h-between {
    justify-content: space-between;
  }
  .flex.v-center {
    align-items: center;
  }
  .flex.col {
    flex-direction: column;
  }

  .header {
    margin: 0 48px 0 44px;
  }
  .content {
    margin: 0 48px 0 44px;
  }
</style>
