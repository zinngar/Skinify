# Skinify

A high-performance, web-based Minecraft Java Edition skin editor with built-in reference image support.

## Live Demo

[https://zinngar.github.io/Skinify/](https://zinngar.github.io/Skinify/)

## Features

- **3D Real-time Preview**: Powered by `skinview3d`, providing a live view of your skin as you edit.
- **2D Pixel Editor**: Precision editing with zoom, grid, and standard pixel art tools (Brush, Eraser, Fill, Color Picker).
- **Reference Image System**: Upload any image and overlay it on the editor with adjustable opacity, scale, and position to guide your creation.
- **Skin Template**: Toggle a standard Steve skin template for easier alignment.
- **History Management**: 50-step undo/redo buffer.
- **Import/Export**: Load existing skin files or export your creation as a standard 64x64 PNG.
- **Modern UI**: Dark-themed, responsive interface built with Tailwind CSS and Lucide icons.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- skinview3d (3D Rendering)
- Lucide React (Icons)
- react-color-palette (Color picking)

## Getting Started

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
Open `http://localhost:3000` in your browser.

## Building for Production

Run `npm run build` to generate a production-ready bundle in the `dist` directory.

## Deployment

### GitHub Pages

This application is deployed to GitHub Pages. To deploy your own version:

1. Update the `homepage` field in `package.json` to your GitHub Pages URL.
2. Update the `base` path in `vite.config.ts`.
3. Run:
```bash
npm run deploy
```

### Local Preview

To preview the production build locally:

```bash
npm run preview
```
