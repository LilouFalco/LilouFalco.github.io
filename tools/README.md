Travel atlas data

Edit visited-places.json to add a destination or move China from locked to visited, then run python3 tools/build-travel-map.py. Commit voyages.html and both regenerated assets/travel-*.svg along with the configuration. This does not automatically add a story to the chronological timeline, whose text remains in app.js and voyages.html.

Sicily is included in Italy, not counted as a separate country. Gibraltar has a visible marker because it is too small for the country polygons in the source. France highlights metropolitan France only, without implying visits to overseas territories. The map uses an equirectangular projection with snapped pixel-style coordinates.

world-countries.geojson is Natural Earth public-domain 1:110m geometry, distributed by https://github.com/datasets/geo-boundaries-world-110m. It is intentionally vendored so regeneration works offline. Source data is generalized and the atlas is illustrative, not a navigational or authoritative boundary map. No tracking, remote map scripts, or API keys are used.

GitHub Pages is served at https://liloufalco.github.io/ from the repository root.
Edit the root HTML pages, then run `python3 tools/build-pages.py` before committing.
This refreshes canonical/Open Graph metadata and copies each page to its directory
route, such as `voyages/index.html`, so /voyages redirects to /voyages/ and works
without JavaScript. Root .html URLs remain compatible. All site resources and
navigation links are root-relative. No Netlify redirects or build service needed.
