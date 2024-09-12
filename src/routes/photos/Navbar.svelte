<script>
  import { Icon } from "@steeze-ui/svelte-icon";
  import {
    Briefcase,
    ChevronDown,
    CircleUser,
    Clock9,
    FileSliders,
    FileText,
    Fullscreen,
    Heart,
    History,
    Image,
    Import,
    Map,
    TvMinimal,
    Video,
    View,
  } from "@steeze-ui/lucide-icons";

  const MENUS = [];
  const MENU_LISTS = {
    "Pinned Collections": [],
    Utilities: [],
    "Media Types": [
      ["Videos", ""],
      ["Selfies", ""],
      ["Live Photos", ""],
      ["Portrait", ""],
      ["Panoramas", ""],
      ["Time-lapse", ""],
      ["Slo-mo", ""],
      ["Bursts", ""],
      ["Screenshots", ""],
      ["Screen Recordings", ""],
      ["Animated", ""],
    ],
    Albums: [],
    "Shared Albums": [],
  };
</script>

<div class="flex justify-end">
  <span class="text-primary">Edit</span>
</div>

<a href="/photos/" class="">
  <Icon src={Clock9}></Icon>
  <span>Days</span>
</a>
<a href="/photos/">
  <Icon src={CircleUser}></Icon>
  <span>People & Pets</span>
</a>
<a href="/photos/">
  <Icon src={History}></Icon>
  <span>Memories</span>
</a>
<a href="/photos/">
  <Icon src={Briefcase}></Icon>
  <span>Trips</span>
</a>
<a href="/photos/">
  <Icon src={Image}></Icon>
  <span>Featured Photos</span>
</a>
<a href="/photos/">
  <Icon src={TvMinimal}></Icon>
  <span>Wallpaper Suggestions</span>
</a>

<div class="flex items-center justify-between">
  <span class="font-medium">Pinned Collections</span>
  <Icon class="size-6" src={ChevronDown}></Icon>
</div>

<a href="/photos/">
  <Icon src={Heart}></Icon>
  <span>Favorites</span>
</a>
<a href="/photos/">
  <Icon src={Import}></Icon>
  <span>Recently Saved</span>
</a>
<a href="/photos/">
  <Icon src={Map}></Icon>
  <span>Map</span>
</a>
<a href="/photos/">
  <Icon src={Video}></Icon>
  <span>Videos</span>
</a>
<a href="/photos/">
  <Icon src={Fullscreen}></Icon>
  <span>Screenshots</span>
</a>
<a href="/photos/">
  <Icon src={FileText}></Icon>
  <span>Documents</span>
</a>
<a href="/photos/">
  <Icon src={FileSliders}></Icon>
  <span>Recently Edited</span>
</a>
<a href="/photos/">
  <Icon src={View}></Icon>
  <span>Recently Viewed</span>
</a>
<a href="/photos/">
  <Icon src={Import}></Icon>
  <span>Imports</span>
</a>

<div class="flex items-center justify-between">
  <span class="font-medium">Utilities</span>
  <Icon class="size-6" src={ChevronDown}></Icon>
</div>

<a href="/photos/">
  <Icon src={Fullscreen}></Icon>
  <span>Hidden</span>
</a>
<a href="/photos/">
  <Icon src={FileText}></Icon>
  <span>Recently Deleted</span>
</a>
<a href="/photos/">
  <Icon src={FileSliders}></Icon>
  <span>Recently Saved</span>
</a>
<a href="/photos/">
  <Icon src={View}></Icon>
  <span>Recently Viewed</span>
</a>
<a href="/photos/">
  <Icon src={Import}></Icon>
  <span>Map</span>
</a>

<div>
  <Icon src={Fullscreen}></Icon>
  <span>Hidden</span>
</div>
<div>
  <Icon src={FileText}></Icon>
  <span>Recently Deleted</span>
</div>
<div>
  <Icon src={FileSliders}></Icon>
  <span>Recently Saved</span>
</div>
<div>
  <Icon src={View}></Icon>
  <span>Recently Viewed</span>
</div>
<div>
  <Icon src={Import}></Icon>
  <span>Map</span>
</div>
