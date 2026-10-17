Travel atlas data

Edit visited-places.json to add a destination or move China from locked to visited, then run python3 tools/build-travel-map.py. Commit voyages.html and both regenerated assets/travel-*.svg along with the configuration. This does not automatically add a story to the chronological timeline, whose text remains in app.js and voyages.html.

Sicily is included in Italy, not counted as a separate country. Gibraltar has a visible marker because it is too small for the country polygons in the source. France highlights metropolitan France only, without implying visits to overseas territories. The map uses an equirectangular projection with snapped pixel-style coordinates.

world-countries.geojson is Natural Earth public-domain 1:110m geometry, distributed by https://github.com/datasets/geo-boundaries-world-110m. It is intentionally vendored so regeneration works offline. Source data is generalized and the atlas is illustrative, not a navigational or authoritative boundary map. No tracking, remote map scripts, or API keys are used.
