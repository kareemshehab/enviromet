"""
Turns pages that are rendered from a fixed template (solutions, projects, the projects hub)
into editable Section blocks, so their Arabic version can be edited block by block like the
other Arabic pages.

It reads the English page as the website renders it and converts <main> with the same
converter that imported the original site (scripts/import_static_site.py).

usage: python3 scripts/arabic/template_to_blocks.py http://localhost:3000 src/seed/translations/en-blocks.json
"""
import json, re, sys, urllib.request
from pathlib import Path
from bs4 import BeautifulSoup

base, out = sys.argv[1].rstrip('/'), Path(sys.argv[2])
sys.argv = [sys.argv[0], '/nonexistent', '/tmp/importer-unused']  # importer reads argv at import time
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import import_static_site as imp  # noqa: E402


def media(src, alt=''):
    """Images are referenced by their file name; the apply script resolves them to media ids."""
    name = re.sub(r'^https?://[^/]+', '', src or '').split('?')[0]
    m = re.match(r'^/api/media/file/(.+)$', name)
    return {'$mediaFile': m.group(1) if m else name.lstrip('/'), 'alt': alt}


imp.media = media


def main_of(path):
    html = urllib.request.urlopen(base + path).read().decode('utf-8')
    soup = BeautifulSoup(html, 'html.parser')
    main = soup.find('main')
    for s in main.find_all(['script', 'template']):
        s.decompose()
    # React text separators and Next.js streaming markers are not content
    for c in main.find_all(string=lambda t: isinstance(t, type(soup.new_string('')).__class__) and False):
        pass
    for img in main.find_all('img'):
        img['src'] = re.sub(r'^https?://[^/]+', '', img.get('src', ''))
    return main


def convert(path, lang='en'):
    imp.current_page = path
    blocks = imp.main_blocks(main_of(path), lang)
    return [b for b in blocks if b]


targets = json.loads(Path(__file__).with_name('targets.json').read_text())
result = {}
for kind, slugs in targets.items():
    for slug in slugs:
        result[f'{kind}:{slug}'] = convert('/' + slug)
        print(kind, slug, len(result[f'{kind}:{slug}']), 'blocks')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding='utf-8')
print('html fallbacks:', len(imp.report['htmlFallbacks']), 'warnings:', len(imp.report['warnings']))
for w in imp.report['warnings'][:10]:
    print('  warning', w)
for f in imp.report['htmlFallbacks'][:10]:
    print('  fallback', {k: (str(v)[:120]) for k, v in f.items()})
