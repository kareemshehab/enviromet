"""
Collects every English text that the Arabic pages need, from the running site's API
(pages, shared sections, solutions, projects) and from template-blocks.en.json.
Writes src/seed/translations/work/strings.en.json (all strings) and work/untranslated.json (strings
that ar.json does not translate yet: translate those and add them to ar.json).

usage: python3 scripts/arabic/extract_strings.py http://localhost:3000
"""
import json, re, sys, urllib.request
from pathlib import Path

B = sys.argv[1].rstrip('/')
ROOT = Path(__file__).resolve().parents[2]
T = ROOT / 'src/seed/translations'
targets = json.loads((Path(__file__).with_name('targets.json')).read_text())

# Keys whose values are technical (class names, urls, ids, options), never visible text
TECH = {'blockType', 'id', 'blockName', 'className', 'sectionClass', 'wrapClass', 'wrapperClass', 'url', 'href',
        'anchorId', 'elementId', 'level', 'tag', 'sectionTag', 'layout', 'background', 'appearance', 'type',
        'source', 'filter', 'variant', 'style', 'kind', 'gridClass', 'cardClass', 'imageFit', 'relationTo',
        '$mediaFile', 'arrowSpan', 'target', 'rel', 'slug', 'enquiryKey', 'key', 'mimeType', 'filename',
        'createdAt', 'updatedAt', '_status', 'pageType', 'scripts', 'menuColumn', 'width', 'height', 'figureClass', 'linkClass'}
# Inside "attrs" (extra HTML attributes) only these are visible / read aloud
ATTR_TEXT = {'aria-label', 'title', 'placeholder', 'alt', 'data-label'}


def login():
    r = urllib.request.Request(B + '/api/users/login', method='POST',
                               data=json.dumps({'email': 'admin@enviromet.local', 'password': 'ChangeMe!2026'}).encode(),
                               headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(r).read())['token']


TOKEN = login()


def get(path):
    r = urllib.request.Request(B + path, headers={'Authorization': 'JWT ' + TOKEN})
    return json.loads(urllib.request.urlopen(r).read())


def is_text(s):
    return isinstance(s, str) and re.search(r'[A-Za-z]{2,}', s) and not re.match(r'^(https?:|/|#|mailto:|tel:)\S*$', s.strip())


def walk(o, out):
    if isinstance(o, str):
        if is_text(o):
            out.add(o.strip())
    elif isinstance(o, list):
        for x in o:
            walk(x, out)
    elif isinstance(o, dict):
        for k, v in o.items():
            if k in TECH:
                continue
            if k == 'attrs' and isinstance(v, dict):
                out.update(x for a, x in v.items() if a in ATTR_TEXT and is_text(x))
                continue
            if isinstance(v, str):
                if is_text(v):
                    out.add(v.strip())
            else:
                walk(v, out)


strings = set()
q = '?limit=500&depth=0&locale=en&draft=false'
pages = {p['slug']: p for p in get('/api/pages' + q)['docs']}
pages_ar = {p['slug']: p for p in get('/api/pages?limit=500&depth=0&locale=ar&fallback-locale=none')['docs']}
missing_pages = sorted(s for s, p in pages_ar.items() if not p.get('layout') and s in pages and s not in targets['pages'])
for s in missing_pages:
    p = pages[s]
    walk([p.get('title'), p.get('layout'), p.get('meta')], strings)
for s in get('/api/shared-sections' + q)['docs']:
    walk(s.get('layout'), strings)
services = get('/api/services' + q)['docs']
for s in services:  # card grids that list solutions, and the solution titles / SEO
    walk([s.get('title'), s.get('category'), s.get('summary') or s.get('solutionIntro'), s.get('meta'),
          s.get('cardImageAlt') or f"{s.get('title')} equipment or assessment use case"], strings)
for p in get('/api/projects' + q)['docs']:
    walk([p.get('title'), p.get('meta')], strings)
walk(json.loads((T / 'template-blocks.en.json').read_text()), strings)
for p in targets['pages']:
    walk([pages[p].get('title'), pages[p].get('meta')], strings)
# Interface texts used by the Arabic components
strings.update(['Explore the service', 'All services', 'All applications', 'Filter services', 'Filter use cases'])

out = sorted(strings)
W = T / 'work'
W.mkdir(exist_ok=True)
known = json.loads((T / 'ar.json').read_text())
todo = [s for s in out if s not in known]
(W / 'strings.en.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
(W / 'untranslated.json').write_text(json.dumps(todo, ensure_ascii=False, indent=1), encoding='utf-8')
print('not yet in ar.json:', len(todo))
print('pages without Arabic:', len(missing_pages), missing_pages)
print('strings:', len(out), 'words:', sum(len(s.split()) for s in out), 'chars:', sum(len(s) for s in out))
