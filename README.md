# charbelnasseh.dev

Portfolio of Charbel Nasseh, web developer and IT engineer in Lebanon.
A single-page React + Vite site with a live, explorable three.js room, English and Arabic (RTL), light and dark themes.

In the room, every object opens something: the monitor is a working terminal, the clock shows Beirut, Dubai and Riyadh time,
the bookshelf lists the stack, the pinboard the projects, the phone the contact details, and the character waves back.
The lamp, mug, plant and beanbag are small toys. The scene code lives in `src/scene/` (room, character, screens, stage).

## Stack

- React 19, TypeScript, Vite
- three.js for the 3D desk (lazy-loaded; a pre-rendered poster shows first)
- [`@lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) figures in the services section (lazy-loaded)
- Self-hosted fonts: Switzer (Latin), IBM Plex Sans Arabic (Arabic)
- Hosted on Cloudflare, deployed from GitHub

## Develop

```bash
npm install
npm run dev
```

Useful URLs while developing: `?lang=ar` for Arabic, `?theme=dark` / `?theme=light` to force a theme.

## Build

```bash
npm run build     # type-check, build to dist/, then write dist/_headers
npm run preview   # serve dist/ locally
```

`scripts/headers.mjs` runs after every build. It writes `dist/_headers` with a Content-Security-Policy
(including the sha256 hash of the inline boot script in `index.html`), security headers, and cache rules:
hashed assets and fonts are cached for a year as immutable, HTML always revalidates.

## Deploy (Cloudflare)

The site is deployed by Cloudflare from the `main` branch of
[charbel-dot/charbel-portfolio](https://github.com/charbel-dot/charbel-portfolio): every push to `main` builds with
`npm run build` and serves `dist/` on charbelnasseh.dev. `dist/_headers` (security headers and caching) is applied by Cloudflare.

Turn off the `workers.dev` and preview URLs in the project's Domains settings so only charbelnasseh.dev serves the site,
and submit `https://charbelnasseh.dev/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Edit content

All copy, in both languages, plus contact details and picture credits, lives in `src/content.ts`.

**Before launch:** `CONTACT.whatsappNumber` is still the placeholder `96100000000`.

## Regenerate the room posters

The hero shows a still of the room (`public/images/room-*.webp`) until the live scene starts.
If you change the scene, re-capture them from the dev server at 1600×1000:

- `http://localhost:5173/?poster&theme=light`
- `http://localhost:5173/?poster&theme=dark`

Save as `room-wide-{light,dark}.webp` (1600 px) and `room-narrow-{light,dark}.webp` (800 px).

## Picture credits

Photographs come from open collections and are credited in the footer:
“Beirut Corniche from Sea” by Wusel007 (CC BY-SA 3.0), “Cedar of Lebanon (Cedar of God), Lebanon”
by Vyacheslav Argenberg (CC BY 4.0), “Zaytunay Bay, Beirut” by abdallahh (CC BY 2.0).
