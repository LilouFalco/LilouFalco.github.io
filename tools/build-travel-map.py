"""Regenerate maps and their HTML legend after editing visited-places.json.
Run from any directory with python3 tools/build-travel-map.py.
Natural Earth public-domain country geometry via datasets/geo-boundaries-world-110m.
No web request, API key, or runtime mapping dependency.
"""
import json
import html
from pathlib import Path

root = Path(__file__).resolve().parent.parent
data = json.loads((root/'tools/world-countries.geojson').read_text())
config = json.loads((root/'tools/visited-places.json').read_text())
visited = {p['id']:p['label'] for p in config['visited']}
locked = {p['id']:p['label'] for p in config['locked']}
assert not visited.keys() & locked.keys()
assert len(visited) == len(config['visited'])
labels = visited | locked

def polygons(feature):
    g = feature['geometry']
    return [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']

def make_map(name, bounds, width, height, pixel):
    west,south,east,north = bounds
    sx,sy = width/(east-west),height/(north-south)
    def project(lon,lat):
        return round((lon-west)*sx/pixel)*pixel,round((north-lat)*sy/pixel)*pixel
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc"><title id="title">Mes destinations, {html.escape(name)}</title><desc id="desc">Les destinations visitées en vert, la Chine en rose hachuré. Gibraltar est signalé par un repère.</desc>']
    svg.append('<defs><pattern id="sea" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#b9d1c5" stroke-opacity=".45" stroke-width=".7"/></pattern><pattern id="soon" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#f1d8df"/><path d="M0 0V7" stroke="#bd8195" stroke-width="2"/></pattern></defs>')
    svg.append(f'<rect width="{width}" height="{height}" fill="#e5eee6"/><rect width="{width}" height="{height}" fill="url(#sea)"/>')
    for f in data['features']:
        code=f['properties']['adm0_a3']
        if code=='ATA':continue
        for polygon in polygons(f):
            ring=polygon[0]
            if max(p[0] for p in ring)<west or min(p[0] for p in ring)>east or max(p[1] for p in ring)<south or min(p[1] for p in ring)>north:continue
            # A visit to France does not imply a visit to its overseas territories.
            is_visited=code in visited and (code!='FRA' or all(-6<=p[0]<=10 and 40<=p[1]<=52 for p in ring))
            fill='#93b484' if is_visited else 'url(#soon)' if code in locked else '#d3dcc9'
            stroke='#4d7048' if is_visited else '#b77a8d' if code in locked else '#acb9a0'
            parts=[]
            for r in polygon:
                coords=[project(*p[:2]) for p in r]
                coords=[p for i,p in enumerate(coords) if not i or p!=coords[i-1]]
                if len(set(coords))<3:continue
                parts.append('M'+'L'.join(f'{x:g},{y:g}' for x,y in coords)+'Z')
            if parts:svg.append(f'<path data-country="{code}" d="{"".join(parts)}" fill="{fill}" stroke="{stroke}" stroke-width="{.8 if name=="monde" else 1.2}" stroke-linejoin="miter"><title>{html.escape(labels.get(code,f["properties"]["name"]))}</title></path>')
    # Tiny territory is not present in the low-resolution Natural Earth dataset.
    x,y=project(-5.35257,36.14474)
    if 0<x<width and 0<y<height:
        svg.append(f'<rect data-country="GIB" x="{x-3}" y="{y-3}" width="6" height="6" fill="#435f49" stroke="#fffdf7" stroke-width="1"><title>Gibraltar</title></rect>')
    if name=='monde' and 'CHN' in locked:
        china=next(f for f in data['features'] if f['properties']['adm0_a3']=='CHN')
        ring=max(polygons(china),key=lambda p:len(p[0]))[0]
        x,y=project((min(p[0] for p in ring)+max(p[0] for p in ring))/2,(min(p[1] for p in ring)+max(p[1] for p in ring))/2)
        svg.append(f'<g transform="translate({x-8} {y-8})" fill="#fffdf7" stroke="#955a70" stroke-width="2"><rect x="0" y="7" width="16" height="12"/><path d="M4 7V3h8v4" fill="none"/></g>')
    svg.append('</svg>')
    return ''.join(svg)

(root/'assets/travel-world.svg').write_text(make_map('monde',(-180,-58,180,85),1000,398,2))
page=root/'voyages.html'
s=page.read_text()
a=s.index('<!-- visited-places:start -->');b=s.index('<!-- visited-places:end -->',a)
legend='<ul class="map-destinations" aria-label="Destinations visitées">'+''.join('<li data-visited="'+html.escape(p['id'])+'"><span aria-hidden="true">◆</span> '+html.escape(p['label'])+'</li>' for p in config['visited'])+'</ul>'
legend+='<p class="map-next"><span class="map-lock" aria-hidden="true">▣</span> '+html.escape(' · '.join(p['label'] for p in config['locked']))+'</p>'
s=s[:a]+'<!-- visited-places:start -->'+legend+s[b:]
page.write_text(s)
print('Generated world map and destination list.')
