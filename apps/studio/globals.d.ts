// Allow importing CSS files for their side effects (e.g. maplibre-gl styles),
// including via dynamic `import()`. Vite handles the actual bundling.
declare module '*.css';

// Vite `?worker&url` imports resolve to the bundled worker's URL.
declare module '*?worker&url' {
  const url: string;
  export default url;
}
