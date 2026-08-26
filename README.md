# mitchelloriahi.github.io

Portfolio for **Mitchell Oriahi**, embedded and software engineer.
Firmware on STM32, release tooling on Azure.

Live at **<https://mitchelloriahi.github.io>**

Built with [Astro](https://astro.build) and Tailwind v4, prerendered to static
HTML, deployed to GitHub Pages by Actions.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:4321>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output locally |
| `npm run check` | Astro and TypeScript diagnostics |

---

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes `dist/`.

> **One time setup.** In the repository, open **Settings > Pages** and set
> **Build and deployment > Source** to **GitHub Actions**. The site used to be
> plain files at the repo root; until that setting changes, GitHub keeps serving
> the old branch and ignores this workflow.

---

## Layout

```
src/
  pages/
    index.astro          The one page
    404.astro
  layouts/
    Base.astro           <head>, meta, JSON-LD, font loading
  components/
    Nav.astro            Floating pill nav + mobile sheet
    Hero.astro           Headline, portrait, quick facts
    Proof.astro          Affiliations + technology ticker
    Work.astro           Three featured projects
    Experience.astro     Dark band, roles with metrics
    Toolkit.astro        Skills grid + education card
    About.astro          Story + beyond the bench
    Contact.astro        CTA, links, footer
  data/
    site.ts              EVERY piece of copy on the site
  scripts/
    motion.ts            Lenis smooth scroll + GSAP reveals
  styles/
    global.css           Design tokens and component classes

public/                  Served as-is at the site root
assets/images/           Original photography. Build input only, NOT deployed.
tools/                   PowerShell build scripts for media and social assets
```

### Editing content

Almost everything lives in **`src/data/site.ts`**. Adding a project is one entry
in `PROJECTS`; adding a role is one entry in `ROLES`. The types mean a mistyped
key fails the build instead of silently rendering nothing.

---

## House style

**No em dashes.** Not in copy, not in comments. Use a comma, a colon, "to" for
ranges, or start a new sentence. There is a check for this below.

Numbers beat adjectives. "Ramps traffic from 0 to 25 percent across 7 services"
does more work than "improved deployments".

---

## Media

`public/img` and `public/video` are **generated**. Do not edit them by hand.

Put originals in `assets/images/`, then:

```bash
powershell -ExecutionPolicy Bypass -File tools/build-images.ps1
```

It emits WebP plus a same format fallback at each width listed in the script's
`$manifest`, never upscales past the source, strips EXIF, and prints intrinsic
dimensions so markup can carry accurate `width` and `height`.

> AVIF was benchmarked and deliberately skipped: ImageMagick's encoder produced
> *larger* files than WebP on this photo set, 116 KB against 89 KB at matched
> quality.

`tools/build-video.ps1` transcodes phone footage to H.264. Phone video is
usually HEVC in a QuickTime container, which Safari plays and Chrome and Firefox
do not, so this step is not optional if a clip needs to work everywhere.

`tools/build-social.ps1` regenerates the Open Graph card and app icons from the
palette and `public/favicon.svg`.

All three need [ImageMagick 7](https://imagemagick.org) on `PATH`;
the video script also needs [ffmpeg](https://ffmpeg.org).

### Still needed

- Photos of the APRS build and the STM32 WAV player. Drop originals in
  `assets/images/projects/`, add manifest entries in `tools/build-images.ps1`
  as `proj-aprs` and `proj-wav-player`, rebuild, then set each project's
  `gallery` in `src/data/site.ts`. The cards render a labelled placeholder
  until then.
- The official Whitacre College of Engineering logo. Save it as
  `assets/images/coe-logo.png`, add a manifest entry (`logo-coe`, widths
  96/192, alpha), rebuild, and swap the text lockup in
  `src/components/Proof.astro` for the image.

The hero portrait cutout is generated from `assets/images/profile.jpg` by an
ImageMagick flood fill pipeline (see the git history of `tools/` for the exact
seeds); if the portrait photo ever changes, easiest is to re-cut it with any
background removal tool and export `portrait-cutout-{600,900,1200}.{png,webp}`.

---

## Design system

Warm editorial: bone paper, deep ink, one marigold accent.

- **Display**: Instrument Serif. **Body**: Plus Jakarta Sans. **Labels**: IBM Plex Mono.
- Tokens live in `@theme` in `global.css`, so Tailwind generates `text-ink`,
  `bg-bone` and friends from the same values the CSS uses.
- Every text and background pair clears **WCAG AA (4.5:1)**. Two token values
  (`--color-ink-faint`, `--color-marigold-deep`) were solved numerically to hit
  it, so do not lighten them casually.

---

## Motion

`src/scripts/motion.ts` adds Lenis smooth scrolling and GSAP scroll reveals.

The rule it follows: **the page is complete before motion runs.** Hidden start
states are only armed after the script sets `data-motion="on"` on `<html>`, so a
script failure, a blocked CDN, or `prefers-reduced-motion` leaves a fully
readable page rather than a blank one. Reduced motion disables Lenis entirely
and hands scrolling back to the browser.

---

## Checks worth re-running after edits

```bash
npm run build
```

In the browser console on the running site:

```js
// should be 0
document.body.innerText.match(/[—–]/g)?.length ?? 0
// should be false
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

---

## License

Code is MIT, see `LICENSE`. Photography, written content and the résumé are
not. Please replace them with your own if you build on this.
