# Bundled typography

These are unmodified Latin-subset WOFF2 files downloaded from Google's official font CDN on 2026-09-22. They require no external requests at runtime.

| File | Face | Weight | SHA-256 |
| --- | --- | --- | --- |
| `barlow-condensed-semibold-latin.woff2` | Barlow Condensed | 600, static | `215a93c696f442034a46fbb382958f753fda60e30490683aeea6b235fcbb2b66` |
| `ibm-plex-sans-latin-variable.woff2` | IBM Plex Sans | 100–700, variable | `e2291e842cf5af167122a22881a740c7f2dda7716f1e8cd76680264f4a859470` |

Both fonts are distributed under the SIL Open Font License 1.1. Original copyright notices and full licenses are retained in `BarlowCondensed-OFL.txt` and `IBMPlexSans-OFL.txt`. Font bundling is permitted by section 2 when the copyright notice and license accompany the files. These fonts have not been modified or renamed internally.

Official distribution sources:

- [Google Fonts CSS response](https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600&family=IBM+Plex+Sans:wght@100..700&display=swap)
- [Barlow Condensed Latin WOFF2](https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2)
- [IBM Plex Sans Latin variable WOFF2](https://fonts.gstatic.com/s/ibmplexsans/v23/zYXzKVElMYYaJe8bpLHnCwDKr932-G7dytD-Dmu1syxeKYY.woff2)
- [Barlow Condensed license](https://github.com/google/fonts/blob/main/ofl/barlowcondensed/OFL.txt)
- [IBM Plex Sans license](https://github.com/google/fonts/blob/main/ofl/ibmplexsans/OFL.txt)

The subset includes Latin characters, common punctuation, arrows up/down, minus, euro, and trademark. The normal CSS system-font fallback remains responsible for characters outside the subset. Use Barlow Condensed at weight 600 for display text; IBM Plex Sans supports the full specified variable weight range.
