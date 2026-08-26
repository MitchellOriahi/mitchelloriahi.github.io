// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://mitchelloriahi.github.io',

    // Everything is prerendered to plain HTML at build time. There is no server
    // and no client-side router: each page ships as a real file, which is what
    // GitHub Pages wants and what keeps the site crawlable.
    output: 'static',

    integrations: [sitemap()],

    vite: {
        // @ts-expect-error @tailwindcss/vite publishes its types against a
        // different Vite major than the one Astro bundles, so the Plugin types
        // do not line up. This is a type level skew only: the plugin loads and
        // the build passes. Remove this line if `astro check` starts flagging
        // it as unnecessary, which means the versions have converged.
        plugins: [tailwindcss()],
    },

    build: {
        // Emit /404.html rather than /404/index.html so GitHub Pages picks it up.
        format: 'file',
    },

    // Astro inlines small stylesheets automatically; this keeps the threshold
    // generous because the whole design system is a single modest file.
    devToolbar: { enabled: false },
});
