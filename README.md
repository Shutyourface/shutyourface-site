# ShutYourFace

A retro political news aggregation concept inspired by old-school link-heavy front pages, built with Next.js and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## CMS setup

This site is wired for Sanity CMS, but it still works with fallback stories if Sanity is not configured.

1. Create a free Sanity project at `https://www.sanity.io/manage`.
2. Copy `.env.example` to `.env.local`.
3. Put your Sanity project ID in `.env.local`.

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
```

4. Restart the dev server.
5. Open `http://localhost:3000/studio`.
6. Add `Story` documents.

Use `Homepage Placement` to control where a story appears:

- `Breaking Ticker`
- `Main Story`
- `Left Rail`
- `Top Stories`
- `Trending Now`
- `Chaos Wall`

Lower `Priority` numbers appear first.

## Production build

```bash
npm run build
npm run start
```
