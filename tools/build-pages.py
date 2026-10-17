"""Regenerate directory routes after editing the root HTML source pages."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = 'https://liloufalco.github.io'
for name in ['index', 'projets', 'parcours', 'voyages', 'contact']:
    source = ROOT / (name + '.html')
    text = source.read_text()
    # Root-relative resources work in both /page.html and /page/ versions.
    def absolute(match):
        attr, value = match.groups()
        if re.match(r'^(?:https?:|mailto:|tel:|#|/|data:)', value):
            return match.group(0)
        if value.endswith('.html'):
            page = value[:-5]
            value = '/' if page == 'index' else '/' + page + '/'
        else:
            value = '/' + value
        return attr + '="' + value + '"'
    text = re.sub(r'(href|src)="([^"]+)"', absolute, text)
    # Keep metadata derived from the page title/description.
    text = re.sub(r'<link rel="canonical"[^>]*>\n?', '', text)
    text = re.sub(r'<meta property="og:[^"]+"[^>]*>\n?', '', text)
    title = re.search(r'<title>(.*?)</title>', text).group(1)
    description = re.search(r'<meta name="description" content="([^"]*)"', text).group(1)
    url = DOMAIN + ('/' if name == 'index' else '/' + name + '/')
    metadata = '\n'.join([
        '<link rel="canonical" href="' + url + '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="fr_FR">',
        '<meta property="og:site_name" content="Lilou Falco">',
        '<meta property="og:title" content="' + html.escape(html.unescape(title), quote=True) + '">',
        '<meta property="og:description" content="' + description + '">',
        '<meta property="og:url" content="' + url + '">',
        '<meta property="og:image" content="' + DOMAIN + '/assets/avatar-hd.png">',
        '<meta property="og:image:alt" content="Avatar illustré de Lilou Falco">',
    ])
    text = text.replace('</head>', metadata + '\n</head>')
    source.write_text(text)
    if name != 'index':
        destination = ROOT / name / 'index.html'
        destination.parent.mkdir(exist_ok=True)
        destination.write_text(text)
print('Generated four GitHub Pages directory routes and canonical/social metadata.')
