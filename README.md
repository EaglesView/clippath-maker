# Clip Path Maker

A visual editor for CSS `clip-path` shapes. Drag points around an interactive
canvas and copy production-ready CSS, SVG, or JSON — no more hand-writing
`polygon()` coordinates.

> Built with the Next.js App Router, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Features

- **Interactive canvas** — add, drag, select, and delete polygon points directly on the grid.
- **Snap-to-grid** with a configurable grid size for precise, aligned shapes.
- **Live preview** — see the clip applied to a gradient, an image, and a solid fill in real time.
- **Multiple export formats** — CSS (`clip-path`), SVG path, or JSON.
- **CSS options** — percentage or pixel units and an optional `-webkit-` prefix.
- **One-click copy** to clipboard and a full ready-to-paste CSS snippet.
- **Fullscreen, responsive layout** — dual sidebars on desktop, a two-tab bottom drawer on mobile.
- **Light & dark themes** with system preference detection.

## Tech stack

| Area       | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19)         |
| Language   | TypeScript                                |
| Styling    | Tailwind CSS v4                           |
| Components | shadcn/ui + Radix primitives              |
| Icons      | lucide-react                              |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Architecture

State and mutations live in a single hook so the UI stays declarative and the
editing logic is easy to reason about and test:

```
src/
├── app/                     # Next.js App Router entry, layout, and global styles
├── components/
│   ├── clip-path-maker.tsx  # App shell — composes the panels
│   ├── canvas/              # Interactive canvas, points, and control handles
│   ├── panels/              # Toolbar, settings, point properties, preview, code output
│   └── ui/                  # shadcn/ui primitives
├── hooks/
│   └── use-clip-path-editor.ts  # Owns editor state (points, tool, grid, selection)
├── lib/
│   ├── canvas-utils.ts      # Screen ↔ canvas coordinate math and helpers
│   └── clip-path-generator.ts   # CSS / SVG / JSON generation
└── types/
    └── clip-path.ts         # Shared domain types
```
