# Rushda and the Secret Popcorn Trail

A bilingual illustrated story website, with English and Bangla book sources.

- `website/index.html`: self-contained interactive website, including its bundled assets.
- `print/`: printable English and Bangla layouts with artwork.
- `texts/`: English and Bangla story text.

## Website deployment

GitHub Actions publishes the contents of `website/` to GitHub Pages on pushes to `main`. In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source.

Live site: https://rokon12.github.io/popcorn-trail/

## PDF downloads

The source export does not include the downloadable PDFs. Add the final books as `website/pdf/rushda-english.pdf` and `website/pdf/rushda-bangla.pdf` to enable the site's existing download links.
