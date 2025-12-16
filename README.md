# Personal Website (Next.js + TypeScript)

Minimal, clean personal site with sections for About and Projects. Uses the Geist font.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – build for production
- `npm run start` – run the production build

## Architecture

Vertical Slice structure:

```
app/                    # Next.js App Router (routing only)
features/               # Feature slices (home, projects, tools)
  home/
    components/
    index.ts            # Barrel export
  projects/
    components/
    index.ts
components/ui/          # Shared UI components (Shadcn)
lib/                    # Shared infrastructure (utils, db clients)
```

## Customize

- Update your name in `app/layout.tsx` (brand, footer text)
- Edit content in `features/home/components/HomeView.tsx` and `features/projects/components/ProjectsView.tsx`
- Add links to projects as needed

## Fonts

Geist Sans and Geist Mono via `next/font/google`. Base typography and layout live in `app/globals.css`.
