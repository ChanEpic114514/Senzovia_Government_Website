# Senzovia government information portal

Eight complete language editions: English, Simplified Chinese, Traditional Chinese, Japanese, Korean, French, Spanish and Kamotish (`art-x-kamotish`). All routes are pre-rendered HTML. No front-end runtime dependency or remote font service is required.

## Build

Python 3.9+ and Node.js 18+ are required. No package installation is needed.

`python build.py`

## Validate

`python verify.py`

`node --check dist/assets/site.js`

## Content

Edit `content.json` for English and Simplified Chinese, and the corresponding `content-*.json` for the remaining six editions. Rebuild to update every page, search index and downloadable document. Traditional Chinese source is checked in; rebuilding does not depend on OpenCC.

Policy frameworks are explicitly proposals. National identity and other factual content are limited to established material. Read `RESEARCH.md` for the 21-country research record and the distinction between established information and proposed policy.

The supplied national flag is retained byte-for-byte in `dist/assets/senzovia-flag.jpeg`. It is never cropped, redrawn, filtered, stretched or surface-animated. All image displays preserve its 3:2 ratio.

## Interaction

- Page-preserving language selection, remembered locally.
- Local full-text search across the twelve document records in each language.
- Publication filters; all documents are readable and downloadable.
- Accessible single-open policy disclosures with linked ARIA controls.
- Reading progress, animated navigation underline, policy index transitions and optional reduced motion.
- Responsive layouts, semantic HTML, print stylesheet, skip links and keyboard focus states.

Contact and consultation forms hand submissions to FormSubmit only when the visitor submits them; see the localized privacy notice. No authentication or payments are implemented.

## Hosting

Static directory: `dist`. Site identity is recorded in `.openai/hosting.json`. Source and published versions are managed by Sites.

## Kamotish edition

Open `/art-x-kamotish/`. The edition covers all 21 routes, all policy paragraphs and nested sections, navigation, form notices, search, downloads, and optional animation labels. The three unpublished full-policy templates remain unpublished.

Edit `content-art-x-kamotish.json`, `policies/*/art-x-kamotish.json`, and `kamotish-ui.json`. The optional animation dictionaries in `dist/assets/*-intro.js`, `theme-gallery.js` and `pride-particles.js` contain the same translated labels. See [the translation notes](docs/kamotish.md) for terminology, sources, and review limits.

The local MIT-licensed renderer generates real SVG glyphs during the build, using a shared sprite. Body text remains readable without JavaScript; dynamic search and animation text use progressive enhancement. Native controls, metadata, and assistive text use readable Kamotish spelling. Copying rendered text preserves its editable source.

Additional validation:

```sh
python tests/kamotish.py
node tests/search_helpers.cjs
python prepare_pages.py
```

Generated pages, search indexes, downloads, and the glyph sprite are build outputs. Hand-maintained assets stay tracked. The existing GitHub Pages workflow builds the project-path deployment on `main`.
