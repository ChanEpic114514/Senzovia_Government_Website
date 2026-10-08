# Senzovia government information portal

Seven complete language editions: English, Simplified Chinese, Traditional Chinese, Japanese, Korean, French and Spanish. All routes are pre-rendered HTML. No front-end runtime dependency or remote font service is required.

## Build

`python build.py`

## Validate

`python verify.py`

`node --check dist/assets/site.js`

## Content

Edit `content.json` for English and Simplified Chinese, and the corresponding `content-*.json` for the remaining five editions. Rebuild to update every page, search index and downloadable document. Traditional Chinese source is checked in; rebuilding does not depend on OpenCC.

Policy frameworks are explicitly proposals. National identity and other factual content are limited to established material. Read `RESEARCH.md` for the 21-country research record and the distinction between established information and proposed policy.

The supplied national flag is retained byte-for-byte in `dist/assets/senzovia-flag.jpeg`. It is never cropped, redrawn, filtered, stretched or surface-animated. All image displays preserve its 3:2 ratio.

## Interaction

- Page-preserving language selection, remembered locally.
- Local full-text search across the nine document records in each language.
- Publication filters; all documents are readable and downloadable.
- Accessible single-open policy disclosures with linked ARIA controls.
- Reading progress, animated navigation underline, policy index transitions and optional reduced motion.
- Responsive layouts, semantic HTML, print stylesheet, skip links and keyboard focus states.

No administrative applications, authentication, payments, analytics, news feeds or outbound messages are implemented or implied.

## Hosting

Static directory: `dist`. Site identity is recorded in `.openai/hosting.json`. Source and published versions are managed by Sites.
