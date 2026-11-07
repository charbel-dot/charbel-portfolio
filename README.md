# charbelnasseh.dev

Portfolio of Charbel Nasseh, web developer and IT engineer in Lebanon.
A single-page React + Vite site with a live three.js desk scene, English and Arabic (RTL), light and dark themes.

## Stack

- React 19, TypeScript, Vite
- three.js for the 3D desk (lazy-loaded; a pre-rendered poster shows first)
- [`@lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) figures in the services section (lazy-loaded)
- Self-hosted fonts: Switzer (Latin), IBM Plex Sans Arabic (Arabic)
- Hosted on Cloudflare Pages

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

## Deploy to Cloudflare Pages

1. Push this repository to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repository.
3. Build settings:
   - Framework preset: **None** (or Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable: `NODE_VERSION` = `22`
4. After the first deploy: Custom domains → add `charbelnasseh.dev` (and `www.charbelnasseh.dev`).
   Redirect `www` to the apex with a Cloudflare redirect rule.
5. Submit `https://charbelnasseh.dev/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

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
