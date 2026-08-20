# SoulAuth Documentation

The documentation site for [SoulAuth](https://github.com/RcityHarold/SoulAuth),
built with [VitePress](https://vitepress.dev/).

English is the primary version and lives at the site root. Simplified Chinese
lives under `/zh/`.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # output in docs/.vitepress/dist
npm run preview
```

Set `DOCS_BASE` to change the deployment base path (defaults to
`/SoulAuth-docs/` for GitHub Pages project sites):

```bash
DOCS_BASE=/ npm run build
```

## Verification

```bash
npm run verify   # build + anchor check
```

Two checks exist because VitePress does not cover them:

| Script | What it catches |
| --- | --- |
| `npm run check:anchors` | Links whose `#anchor` does not exist on the target page. VitePress validates that a page exists, but not the fragment — a wrong anchor produces no build error and no visible failure, just a click that does nothing. Chinese headings are especially easy to get wrong because punctuation is transliterated into `-`. |
| `npm run check:endpoints` | Endpoint counts in the docs drifting from the actual axum router. During review this project's endpoint count was quoted as 66, 68 and 70 — none of which were correct. |

`check:endpoints` needs the SoulAuth source. It looks for `../SoulAuth` by
default and **skips silently** if it is not there, so this repository still
builds standalone:

```bash
SOULAUTH_SRC=/path/to/SoulAuth npm run check:endpoints
```

## Structure

```
docs/
├── index.md                 English home
├── guide/                   positioning, setup, operations
├── integrate/               OIDC integration paths
├── reference/               HTTP API and appendices
├── zh/                      the same tree in Simplified Chinese
└── .vitepress/
    ├── config.mts           site config, both locales
    └── theme/               brand colours only
scripts/
├── extract-endpoints.mjs    parses the axum router out of SoulAuth
├── check-endpoints.mjs      compares docs counts against it
└── check-anchors.mjs        validates #anchors in built HTML
```

## Editing

Both locales carry the same 26 pages. When you change one, change the other —
`check:anchors` will catch broken cross-references, but nothing catches a
translation that has silently fallen behind.

## Licence

Apache-2.0, matching SoulAuth itself.
