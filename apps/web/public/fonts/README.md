# Fonts

## Cy (display / titles)

The "Cy" typeface is proprietary and is **not** committed to the repo.
Place the web font file here so titles render with the intended typeface:

```
public/fonts/cy-regular.woff2
```

The `@font-face` is declared in `src/styles/fonts.css` (family `Cy`, weight 400).
Until the file is present, the site falls back to the serif stack defined by
`--font-display` in `src/styles/tokens.css`.

Geist and Geist Mono are provided by the `geist` npm package (self-hosted by
`next/font`) and need no manual files.
