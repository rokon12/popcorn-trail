# Story Time

A bilingual picture-book library with matching page-flip readers for:

- **Rushda and the Secret Popcorn Trail** — English and Bangla.
- **One Thankful Word / শোকরের কথা** — English and Bangla, 30 pages per edition.

## Website

- `website/index.html`: story selection and the original Popcorn Trail reader, including its bundled assets.
- `website/thankful.html`: One Thankful Word reader with language switching, thumbnails, page-turn sound, fullscreen, and PDF downloads.
- `website/books/one-thankful-word/`: web-optimized pages and thumbnails rendered from the supplied PDFs, separated into `en/` and `bn/` editions.
- `website/pdf/One-Thankful-Word-en.pdf` and `One-Thankful-Word-bn.pdf`: unchanged original PDFs.
- `website/assets/`: reader code, extracted page text for assistive technology, and the same page-flip library and fonts used by Popcorn Trail.
- `print/` and `texts/`: original Popcorn Trail print layouts, artwork, and story text.

The new reader loads nearby pages as needed and shows a single page on phones or a spread on larger screens. Switch language without losing your page. The language-specific reading links are `thankful.html?lang=en` and `thankful.html?lang=bn`.

## Deployment

GitHub Actions publishes `website/` to GitHub Pages on pushes to `main`. The Pages source is **GitHub Actions**.

Live site: https://rokon12.github.io/popcorn-trail/
