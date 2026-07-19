// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
//
// The homepage is pure static forever (edge-cached, fast first paint).
// Any future dynamic route (contact form, /book, /api, backend) opts into
// SSR individually by setting `export const prerender = false` on that page
// — the rest of the site stays static.
export default defineConfig({
  output: 'static',
  adapter: vercel(),
});