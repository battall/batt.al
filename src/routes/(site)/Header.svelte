<script>
  import info_base from "$lib/info.json";
  import info_lang from "$lib/info-en.json";
  import avatar from "$lib/images/avatar.png";

  const info = { ...info_base, ...info_lang };
</script>

<header class="flex flex-col">
  <div class="flex">
    <span class="block" style="height: 32px">
      <img src={avatar} style="width: 100%; height: 100%; border-radius: 50%" alt="avatar" />
    </span>
    <div class="w-2"></div>
    <div class="flex flex-col">
      <span class="text font-medium" style="line-height: 1.1rem">
        {info.full_name.split(" ")[0]}
      </span>
      <span class="text text-xs" style="color: #444">
        {info.about_short}
      </span>
    </div>
  </div>
  <div class="h-4"></div>
  <div>
    <a class="link text-sm" href="/about-me"> ABOUT ME </a>
    <a class="link text-sm" href="https://github.com/battall"> OPEN SOURCE PROJECTS </a>
  </div>
</header>

<style>
</style>
