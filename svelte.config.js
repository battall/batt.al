import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  kit: { adapter: adapter(), inlineStyleThreshold: 1024 * 1024 * 32 }, // 32kb
  compilerOptions: { runes: undefined, modernAst: true },
  preprocess: vitePreprocess(),
};

export default config;
