#!/usr/bin/env python3
"""
Imports the original static EnviroMET site (dist/*.html) into CMS seed data.

    python3 scripts/import_static_site.py <path-to-dist> src/seed/import

Produces JSON consumed by `npm run seed`:
    pages.json      generic block-based pages (EN + AR layouts)
    services.json   the 20 solution pages (structured Services template) + Arabic custom layouts
    projects.json   the 9 reference projects (card + detail page)
    globals-ar.json Arabic header / footer / settings
    report.json     what was imported and which elements fell back to "Custom HTML"

Every element maps 1:1 onto a CMS item (see src/blocks/section.ts), so the rendered
markup — and therefore the design — matches the original.
"""
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else '../dist')
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'src/seed/import')
OUT.mkdir(parents=True, exist_ok=True)

# Pages already built by hand in src/seed/pages/*.ts (EN versions)
HANDMADE_EN = {'index', 'about', 'projects', 'contact', 'wind'}
SKIP = {'404', 'service'}  # 404 → Next.js not-found; service.html → redirect to /services

SERVICE_PAGES = [
    'air', 'compliance', 'construction', 'decommissioning', 'diligence', 'dispersion', 'emissions',
    'engineering-advisory', 'feasibility', 'grid', 'lender', 'performance', 'power', 'water',
    'meteorology', 'power-curve', 'testing', 'data', 'solar', 'maintenance',
]
AR_MAP = {  # Arabic file → (collection, slug)
    'ar-index': ('pages', 'home'), 'ar-about': ('pages', 'about'), 'ar-services': ('pages', 'services'),
    'ar-contact': ('pages', 'contact'), 'ar-lidar': ('pages', 'lidar'), 'ar-quality': ('pages', 'quality'),
    'ar-procurement': ('pages', 'for-procurement'), 'ar-wind': ('services', 'wind'), 'ar-solar': ('services', 'solar'),
}

PAGE_TYPES = {
    'services': 'hub', 'use-cases': 'hub', 'insights': 'hub', 'technologies': 'hub', 'sitemap': 'hub',
    'customers': 'hub', 'partners': 'hub', 'expertise': 'expertise', 'engineering': 'expertise',
    'measurement-expertise': 'expertise', 'compliance-expertise': 'expertise', 'water-expertise': 'expertise',
    'air-expertise': 'expertise', 'environment': 'expertise', 'renewable-energy': 'expertise',
    'lidar': 'product', 'met-masts': 'product', 'braced-towers': 'product', 'self-supporting-towers': 'product',
    'solar-stations': 'product', 'wind-lidar': 'product', 'campaign-cost-calculator': 'tool',
    'campaign-brief': 'tool',
}

report = {'pages': [], 'htmlFallbacks': [], 'warnings': []}
current_page = ''

# ---------------------------------------------------------------- helpers


def route(href):
    """Legacy file name → clean route (mirrors src/lib/routes.ts)."""
    if href is None:
        return None
    if re.match(r'^(https?:|mailto:|tel:|#|//)', href):
        return href
    m = re.match(r'^([^?#]*)(.*)$', href.lstrip('./'))
    file, rest = m.group(1), m.group(2)
    if file.startswith('assets/'):
        return '/' + file + rest
    if not file.endswith('.html'):
        return href if href.startswith('/') else '/' + href
    name = file[:-5]
    if name == 'index':
        return '/' + rest
    if name == 'ar-index':
        return '/ar' + rest
    if name == 'ar-procurement':
        return '/ar/for-procurement' + rest
    if name.startswith('ar-'):
        return '/ar/' + name[3:] + rest
    if name == 'service':
        return '/services' + rest
    return '/' + name + rest


def media(src, alt=''):
    src = src.lstrip('./').lstrip('/')
    return {'$media': src, 'alt': alt}


def classes(el):
    return el.get('class', []) if isinstance(el, Tag) else []


def cls(el):
    return ' '.join(classes(el))


def norm_space(s):
    return re.sub(r'[ \t\r\f\v]*\n[ \t\r\f\v]*', '\n', re.sub(r'[ \t]+', ' ', s)).strip()


def inner_html(el):
    """Inner HTML with links normalised; <br> → newline (the renderer turns newlines back into <br>)."""
    frag = BeautifulSoup(el.decode_contents(), 'html.parser')
    for a in frag.find_all('a', href=True):
        a['href'] = route(a['href'])
    html = str(frag)
    html = re.sub(r'\s*<br\s*/?>\s*', '\n', html)
    html = re.sub(r'\s+\n', '\n', html)
    html = re.sub(r'[ \t]{2,}', ' ', html).strip()
    if '<' not in html:
        # Plain text: store readable characters (&amp; → &). &lt; / &gt; stay escaped.
        html = html.replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'").replace('&nbsp;', '\u00a0')
    return html


def text(el):
    return norm_space(el.get_text(' ', strip=True)) if el else ''


def other_attrs(el, skip=('class', 'id', 'href', 'src', 'alt')):
    a = {k: (' '.join(v) if isinstance(v, list) else v) for k, v in el.attrs.items() if k not in skip}
    return a or None


def children(el):
    return [c for c in el.children if isinstance(c, Tag)]


def has_text_nodes(el):
    return any(isinstance(c, NavigableString) and not isinstance(c, Comment) and c.strip() for c in el.children)


BLOCK_TAGS = {'div', 'section', 'article', 'aside', 'figure', 'ul', 'ol', 'table', 'details', 'form', 'h1', 'h2', 'h3', 'h4', 'p', 'img', 'dl', 'fieldset', 'video'}
TEXT_STYLES = {'eyebrow', 'lede', 'small-note', 'large-copy'}
LINK_STYLES = {'button', 'button secondary', 'button white', 'text-link'}


def html_item(el, reason):
    report['htmlFallbacks'].append({'page': current_page, 'element': f'{el.name}.{cls(el)}', 'reason': reason})
    return {
        'blockType': 'itemHtml',
        'tag': el.name,
        'className': cls(el) or None,
        'elementId': el.get('id'),
        'attrs': other_attrs(el),
        'html': str(BeautifulSoup(str_with_routes(el.decode_contents()), 'html.parser')),
    }


def str_with_routes(html):
    frag = BeautifulSoup(html, 'html.parser')
    for a in frag.find_all('a', href=True):
        a['href'] = route(a['href'])
    return str(frag)


# ---------------------------------------------------------------- element → item


def convert_children(el, level):
    items, kids = [], children(el)
    skip = set()
    for i, c in enumerate(kids):
        if id(c) in skip:
            continue
        # Filter buttons + status line belong to the card grid that follows
        if 'filters' in classes(c):
            grid = next((k for k in kids[i + 1:] if 'cards' in classes(k)), None)
            if grid is not None:
                for k in kids[i + 1:]:
                    if k is grid:
                        break
                    skip.add(id(k))
                skip.add(id(grid))
                items.append(cards_item(grid, c))
                continue
        item = convert(c, level)
        if item:
            items.append(item)
    if has_text_nodes(el):
        report['warnings'].append({'page': current_page, 'msg': f'loose text in {el.name}.{cls(el)}'})
    return items


def group(el, level):
    if level > 3:
        return html_item(el, 'nesting deeper than 3 groups')
    return {
        'blockType': f'itemGroup{level}',
        'tag': el.name,
        'className': cls(el) or None,
        'elementId': el.get('id'),
        'url': route(el.get('href')) if el.name == 'a' else None,
        'attrs': other_attrs(el),
        'items': convert_children(el, level + 1),
    }


def link_item(a):
    c = cls(a)
    item = {
        'blockType': 'itemLink',
        'label': inner_html(a),
        'url': route(a.get('href', '#')),
        'newTab': a.get('target') == '_blank' or None,
        'elementId': a.get('id'),
        'attrs': other_attrs(a, skip=('class', 'id', 'href', 'target', 'rel')),
    }
    if c in LINK_STYLES:
        item['style'] = c
    elif c:
        item['className'] = c
    return item


def image_item(img, figure=None):
    item = {
        'blockType': 'itemImage',
        'image': media(img['src'], img.get('alt', '')),
        'alt': img.get('alt'),
    }
    c = classes(img)
    if c == ['rounded']:
        item['rounded'] = True
    elif c:
        item['className'] = ' '.join(c)
    if figure is not None:
        item['figure'] = True
        item['figureClass'] = cls(figure) or None
        item['elementId'] = figure.get('id')
        cap = figure.find('figcaption')
        if cap:
            item['caption'] = text(cap)
    return item


def table_item(table, wrapper=None):
    if table.find(attrs={'id': True}):
        # Cells targeted by scripts (e.g. calculator results) keep their exact markup
        return html_item(wrapper if wrapper is not None else table, 'table with element ids (used by a script)')
    head = table.find('thead')
    rows = []
    for tr in (table.find('tbody') or table).find_all('tr', recursive=False):
        cells = [{'text': inner_html(td)} for td in tr.find_all(['th', 'td'], recursive=False)]
        rows.append({'cells': cells})
    first = (table.find('tbody') or table).find('tr')
    return {
        'blockType': 'itemTable',
        'caption': text(table.find('caption')) or None,
        'header': [{'text': text(th)} for th in head.find_all('th')] if head else [],
        'rows': rows,
        'firstCellIsHeading': bool(first and first.find(recursive=False) and first.find(recursive=False).name == 'th'),
        'wrapperClass': cls(wrapper) if wrapper is not None else None,
    }


def faq_item(d):
    summ = d.find('summary')
    rest = [c for c in children(d) if c.name != 'summary']
    if any(c.name != 'p' for c in rest):
        return None
    return {
        'blockType': 'itemFaq',
        'question': text(summ),
        'answer': '\n\n'.join(inner_html(p) for p in rest),
        'className': cls(d) or None,
    }


SERVICE_SLUGS = set(SERVICE_PAGES) | {'wind'}


def cards_item(grid, filters=None):
    arts = grid.find_all('article', recursive=False)
    cards, service_slugs = [], []
    arrow_span, hide_link, link_label = False, False, None
    for a in arts:
        img_link = a.find('a', class_='image-link')
        img = a.find('img')
        body = a.find(class_='card-body')
        title_a = body.find('h3').find('a') if body and body.find('h3') else None
        url = route(title_a['href']) if title_a else route(img_link['href'])
        tl = body.find('a', class_='text-link') if body else None
        if tl is not None:
            arrow_span = arrow_span or tl.find('span') is not None
            link_label = norm_space(tl.get_text(' ', strip=True)).replace('↗', '').strip()
        if img_link is not None and img_link.get('aria-hidden'):
            hide_link = True
        ps = body.find_all('p', recursive=False) if body else []
        card = {
            'title': text(title_a) if title_a else text(body.find('h3')),
            'eyebrow': text(body.find('p', class_='eyebrow')) or None,
            'category': a.get('data-category') or a.get('data-case-category'),
            'text': text([p for p in ps if 'eyebrow' not in classes(p)][0]) if [p for p in ps if 'eyebrow' not in classes(p)] else None,
            'url': url,
            'image': media(img['src'], img.get('alt', '')) if img else None,
            'imageAlt': img.get('alt') if img else None,
        }
        cards.append(card)
        service_slugs.append(url.strip('/'))
    is_services = all(s in SERVICE_SLUGS for s in service_slugs) and all(c['eyebrow'] == c['category'] for c in cards)
    filter_kind, filter_labels = 'none', []
    if filters is not None:
        btns = filters.find_all('button')
        filter_kind = 'cases' if btns and btns[0].get('data-case-filter') else 'services'
        filter_labels = [{'label': text(b)} for b in btns[1:]]
    item = {
        'blockType': 'itemCards',
        'source': 'services' if is_services else 'manual',
        'linkLabel': link_label or 'Explore the service',
        'filter': filter_kind,
        'filters': filter_labels,
        'gridClass': cls(grid),
        'cardClass': cls(arts[0]) if arts else 'service-card',
        'arrowSpan': arrow_span or None,
        'hideImageLink': hide_link or None,
    }
    if is_services:
        item['services'] = [{'$service': s} for s in service_slugs]
        # Card data is stored on each service (summary / card image)
        for c, s in zip(cards, service_slugs):
            SERVICE_CARDS.setdefault(s, c)
    else:
        item['cards'] = cards
    return item


SERVICE_CARDS = {}


def convert(el, level):
    """Convert one element into a CMS item, with a readable name for the admin list."""
    item = _convert(el, level)
    if item and not item.get('blockName'):
        h = el.find(['h1', 'h2', 'h3', 'h4', 'strong', 'summary']) if el.name not in ('h1', 'h2', 'h3', 'h4') else el
        label = text(h) if h else ''
        if not label and el.name == 'img':
            label = el.get('alt', '')
        if not label:
            label = text(el)
        label = re.sub(r'\s+', ' ', label).strip()
        if label:
            item['blockName'] = label[:60] + ('…' if len(label) > 60 else '')
    return item


def _convert(el, level):
    """Convert one element into a CMS item."""
    name, c = el.name, classes(el)
    if name in ('script', 'style', 'noscript') and name != 'noscript':
        return None
    if name in ('h1', 'h2', 'h3', 'h4'):
        if children(el) and any(k.name not in ('br', 'span', 'small', 'sup', 'a', 'em', 'strong', 'b') for k in children(el)):
            return html_item(el, 'heading with block content')
        return {'blockType': 'itemHeading', 'level': name, 'text': inner_html(el), 'className': cls(el) or None, 'elementId': el.get('id')}
    if name in ('p', 'span', 'strong', 'small', 'b', 'em', 'label') and not any(k.name in BLOCK_TAGS - {'p'} for k in children(el)):
        if name == 'label' and el.find(['input', 'select', 'textarea']):
            return html_item(el, 'form control')
        item = {'blockType': 'itemText', 'tag': name, 'text': inner_html(el), 'elementId': el.get('id'),
                'attrs': other_attrs(el)}
        if cls(el) in TEXT_STYLES:
            item['style'] = cls(el)
        elif c:
            item['className'] = cls(el)
        return item
    if name == 'a':
        if any(k.name in BLOCK_TAGS | {'span', 'b', 'strong'} for k in children(el)) and not (
            len(children(el)) == 1 and children(el)[0].name in ('span',) and not children(el)[0].get('class')
        ):
            return group(el, level)
        return link_item(el)
    if name in ('ul', 'ol'):
        lis = el.find_all('li', recursive=False)
        if all(not any(k.name in BLOCK_TAGS for k in children(li)) for li in lis) and len(children(el)) == len(lis):
            item = {'blockType': 'itemList', 'ordered': name == 'ol' or None, 'items': [{'text': inner_html(li)} for li in lis],
                    'elementId': el.get('id')}
            if cls(el) in ('check-list', 'steps'):
                item['style'] = cls(el)
            elif c:
                item['className'] = cls(el)
            return item
        return group(el, level)
    if name == 'img':
        return image_item(el)
    if name == 'figure':
        kids = children(el)
        if len([k for k in kids if k.name == 'img']) == 1 and all(k.name in ('img', 'figcaption') for k in kids):
            return image_item(el.find('img'), el)
        if el.find('video') and all(k.name in ('video', 'figcaption') for k in kids):
            v = el.find('video')
            src = v.find('source')['src'] if v.find('source') else v.get('src')
            return {'blockType': 'itemVideo', 'video': media(src, text(el.find('figcaption')) or 'Video'),
                    'poster': media(v['poster']) if v.get('poster') else None,
                    'caption': text(el.find('figcaption')) or None, 'figureClass': cls(el) or None}
        return group(el, level)
    if name == 'table':
        return table_item(el)
    if name == 'div' and c == ['b2b-table'] and el.find('table') and len(children(el)) == 1:
        return table_item(el.find('table'), el)
    if name == 'details':
        return faq_item(el) or html_item(el, 'details with complex content')
    if 'cards' in c and el.find('article', recursive=False):
        return cards_item(el)
    if name in ('div', 'section', 'article', 'aside', 'li', 'header', 'nav'):
        if has_text_nodes(el) and not children(el):
            return {'blockType': 'itemText', 'tag': name, 'text': inner_html(el), 'className': cls(el) or None,
                    'elementId': el.get('id'), 'attrs': other_attrs(el)}
        if has_text_nodes(el):
            return html_item(el, 'mixed text and elements')
        return group(el, level)
    if name == 'form' and el.get('id') == 'enquiry-form':
        sel = el.find('select', attrs={'name': 'service'})
        st = el.find('select', attrs={'name': 'stage'})
        return {
            'blockType': 'itemEnquiryForm',
            'heading': text(el.find('h2')),
            'help': text(el.find('p', class_='form-help')),
            'serviceOptions': [{'label': text(o), 'value': o.get('value') if o.get('value') != text(o) else None,
                                'key': o.get('data-service')} for o in sel.find_all('option') if o.get('value') != ''],
            'stageOptions': [{'label': text(o)} for o in st.find_all('option') if o.get('value') != ''],
            'note': 'يُرسل استفسارك مباشرة إلى فريق EnviroMET، وتحصل أيضًا على نسخة يمكنك إرسالها من تطبيق البريد.'
                    if el.find_parent('html').get('lang') == 'ar' else None,
        }
    if name == 'br':
        return None
    return html_item(el, f'<{name}> element')


# ---------------------------------------------------------------- sections → blocks

DEFAULT_CTA = {
    'en': ('Your next project', 'What do you need\nto measure?', 'Share your site, project stage and objectives.', '/contact'),
}


def cta_block(sec, lang):
    inner = sec.find(class_='cta-inner')
    div = inner.find('div')
    a = inner.find('a', recursive=False)
    eyebrow = text(div.find('p', class_='eyebrow'))
    h2 = inner_html(div.find('h2'))
    ps = [p for p in div.find_all('p') if 'eyebrow' not in classes(p)]
    txt = text(ps[0]) if ps else None
    url = route(a['href']) if a else None
    label = text(a) if a else None
    if lang == 'en' and (eyebrow, h2, txt, url) == DEFAULT_CTA['en'] and label == 'Discuss your campaign ↗':
        return {'blockType': 'cta', 'useDefault': True}
    if lang == 'ar' and AR_DEFAULT_CTA and (eyebrow, h2, txt, url) == AR_DEFAULT_CTA[:4] and label == AR_DEFAULT_CTA[4]:
        return {'blockType': 'cta', 'useDefault': True}
    return {
        'blockType': 'cta', 'useDefault': False,
        'custom': {'eyebrow': eyebrow, 'heading': h2, 'text': txt,
                   'link': {'type': 'custom', 'label': text(a), 'url': url, 'appearance': 'white'} if a else None},
    }


AR_DEFAULT_CTA = None


def page_intro_block(sec):
    wrap = sec.find('div', class_='wrap')
    kids = children(wrap) if wrap else []
    names = [(k.name, cls(k)) for k in kids]
    simple = all(n in (('p', 'eyebrow'), ('h1', ''), ('p', 'lede')) for n in names) and ('h1', '') in names
    if not simple:
        return None
    return {
        'blockType': 'pageIntro',
        'eyebrow': text(wrap.find('p', class_='eyebrow')) or None,
        'heading': inner_html(wrap.find('h1')),
        'lede': text(wrap.find('p', class_='lede')) or None,
    }


LAYOUTS = {'wrap', 'wrap narrow', 'wrap split', 'wrap solution-layout', 'wrap seo-article-layout'}


def section_block(sec):
    c = classes(sec)
    block = {'blockType': 'section', 'anchorId': sec.get('id'), 'attrs': other_attrs(sec)}
    if sec.name != 'section':
        block['sectionTag'] = sec.name
    if c == ['section']:
        block['background'] = 'none'
    elif c == ['section', 'pale']:
        block['background'] = 'pale'
    else:
        block['sectionClass'] = ' '.join(c)
    kids = children(sec)
    if len(kids) == 1 and kids[0].name == 'div' and 'wrap' in classes(kids[0]) and not has_text_nodes(sec):
        wc = cls(kids[0])
        if wc in LAYOUTS:
            block['layout'] = wc
        else:
            block['wrapClass'] = wc
        if kids[0].get('id') or kids[0].attrs.keys() - {'class'}:
            report['warnings'].append({'page': current_page, 'msg': f'wrap attributes dropped: {kids[0].attrs}'})
        block['items'] = convert_children(kids[0], 1)
    else:
        block['wrapClass'] = '-'
        block['items'] = convert_children(sec, 1)
    # Friendly admin label
    h = sec.find(['h1', 'h2', 'h3'])
    e = sec.find(class_='eyebrow')
    label = text(e) or text(h)
    block['blockName'] = (label[:1] + label[1:].lower())[:60] if label else None
    return block


def main_blocks(main, lang):
    blocks = []
    for sec in children(main):
        c = classes(sec)
        if sec.name == 'section' and c == ['page-intro']:
            blocks.append(page_intro_block(sec) or section_block(sec))
        elif sec.name == 'section' and c == ['cta']:
            blocks.append(cta_block(sec, lang))
        else:
            blocks.append(section_block(sec))
    return blocks


def meta_of(soup):
    t = soup.title.string.strip() if soup.title and soup.title.string else None
    d = soup.find('meta', attrs={'name': 'description'})
    return {'title': t, 'description': d['content'] if d else None}


def admin_title(soup):
    """Readable title for the admin list: the browser-tab title without the brand suffix."""
    t = meta_of(soup)['title'] or ''
    return t.split(' | ')[0].strip() or text(soup.find('h1'))


def scripts_of(soup):
    s = []
    if soup.find(attrs={'data-cro-calculator': True}):
        s.append('calculator')
    if soup.find(attrs={'data-print': True}) or soup.find(id='b2b-resource-query'):
        s.append('b2b')
    return s


def load(name):
    return BeautifulSoup((DIST / f'{name}.html').read_text(encoding='utf-8'), 'html.parser')


# ---------------------------------------------------------------- services


def parse_service(name):
    global current_page
    current_page = name
    soup = load(name)
    main = soup.find('main')
    secs = children(main)
    intro = secs[0]
    hero = intro.find(class_='detail-hero')
    out = {
        'slug': name,
        'title': text(hero.find('h1')),
        'category': text(hero.find('p', class_='eyebrow')),
        'lede': text(hero.find('p', class_='lede')),
        'heroImage': media(hero.find('img')['src'], hero.find('img').get('alt', '')),
        'meta': meta_of(soup),
        'showBusinessCase': False,
    }
    cov = main.find('section', class_='coverage-highlight')
    if cov:
        h2 = cov.find('h2')
        out['coverage'] = {'enabled': True, 'eyebrow': text(cov.find('p', class_='eyebrow')),
                           'value': text(h2.find('span')), 'unit': text(h2.find('small')).replace(' ', '').replace('2', '^2') if h2.find('sup') else text(h2.find('small')),
                           'text': text(cov.find('p', class_=False))}
    sub = main.find(class_='ux-subnav')
    m = re.search(r'service=([\w-]+)', sub.find_all('a')[-1]['href']) if sub else None
    out['enquiryKey'] = m.group(1) if m else name
    lay = main.find(class_='solution-layout')
    left, right = children(lay)[0], children(lay)[1]
    out['eyebrow'] = text(left.find('p', class_='eyebrow', recursive=False))
    out['solutionHeading'] = inner_html(left.find('h2', recursive=False))
    out['solutionIntro'] = text(left.find('p', class_='large-copy'))
    out['scopeItems'] = [{'title': text(d.find('h3'))} for d in left.find(class_='scope-grid').find_all('div', recursive=False)]
    st = left.find(class_='standards-strip')
    out['standardsNote'] = text(st.find('span')) if st else None
    dt = left.find('h3', class_='deliver-title')
    out['deliverTitle'] = text(dt) if dt else None
    out['deliverText'] = '\n\n'.join(text(p) for p in left.find_all('p', recursive=False) if not classes(p))
    spec = left.find('section', class_='b2b-spec')
    if spec:
        tl = spec.find('a', class_='text-link')
        out['procurement'] = {
            'eyebrow': text(spec.find('p', class_='eyebrow')), 'heading': inner_html(spec.find('h2')),
            'caption': text(spec.find('caption')),
            'rows': [{'label': text(tr.find('th')), 'value': text(tr.find('td'))} for tr in spec.find('tbody').find_all('tr')],
            'link': {'type': 'custom', 'label': text(tl), 'url': route(tl['href']), 'appearance': 'text'} if tl else None,
        }
    nb = left.find(class_='page-neighbours')
    if nb:
        a = nb.find_all('a')
        out['previousLink'] = {'type': 'custom', 'label': text(a[0]), 'url': route(a[0]['href']), 'appearance': 'plain'}
        out['nextLink'] = {'type': 'custom', 'label': text(a[1]), 'url': route(a[1]['href']), 'appearance': 'plain'}
    rel = right.find(class_='related-nav')
    out['relatedSolutions'] = [{'type': 'custom', 'label': text(a), 'url': route(a['href']), 'appearance': 'plain'} for a in rel.find_all('a')] if rel else []
    box = right.find(class_='detail-box')
    proof = box.find(class_='b2b-proof-links')
    out['enquiryBox'] = {
        'heading': text(box.find('h3')), 'text': text(box.find('p', recursive=False)),
        'buttonLabel': text(box.find('a', class_='button')),
        'evidenceTitle': text(proof.find('strong')) if proof else None,
        'evidenceLinks': [{'type': 'custom', 'label': text(a), 'url': route(a['href']), 'appearance': 'plain'} for a in proof.find_all('a')] if proof else [],
    }
    # Sections after the main solution section
    after = secs[secs.index(lay.parent) + 1:]
    extra = []
    for sec in after:
        c = classes(sec)
        if c == ['section', 'pale'] and sec.find(class_='project-grid'):
            out['evidence'] = {
                'eyebrow': text(sec.find('p', class_='eyebrow')), 'heading': inner_html(sec.find('h2')),
                'projects': [{'$project': route(a['href']).strip('/')} for a in sec.select('.project-card > a')],
            }
        elif 'seo-service-brief' in c:
            l, r = children(sec.find(class_='split'))
            note = l.find('p', class_='small-note')
            ps = [p for p in l.find_all('p', recursive=False) if not classes(p)]
            guide = r.find('a', class_='text-link')
            out['brief'] = {
                'eyebrow': text(l.find('p', class_='eyebrow')), 'heading': inner_html(l.find('h2')),
                'body': text(ps[0]) if ps else None,
                'audience': text(ps[1]) if len(ps) > 1 else None,
                'note': text(note) if note else None,
                'faqs': [{'question': text(d.find('summary')), 'answer': text(d.find('p'))} for d in r.find_all('details')],
                'guideLink': {'type': 'custom', 'label': text(guide), 'url': route(guide['href']), 'appearance': 'text'} if guide else None,
            }
        elif 'cro-next' in c:
            out['showBusinessCase'] = True
        elif c == ['section', 'pale'] and sec.find('p', class_='eyebrow') and text(sec.find('p', class_='eyebrow')) == 'TECHNICAL BASIS':
            tl = sec.find('a', class_='text-link')
            out['technicalBasis'] = {
                'eyebrow': 'TECHNICAL BASIS', 'heading': inner_html(sec.find('h2')),
                'body': '\n\n'.join(text(p) for p in sec.find_all('p') if not classes(p)),
                'link': {'type': 'custom', 'label': text(tl), 'url': route(tl['href']), 'appearance': 'text'} if tl else None,
            }
        elif c == ['cta']:
            pass
        else:
            extra.append(section_block(sec))
    out['extraSections'] = extra
    report['pages'].append({'file': f'{name}.html', 'to': f'services/{name}'})
    return out


# ---------------------------------------------------------------- projects


def parse_projects():
    global current_page
    soup = load('projects')
    projects = []
    for i, art in enumerate(soup.select('.project-grid > article.project-card')):
        a = art.find('a')
        slug = route(a['href']).strip('/')
        dd = art.find_all('dd')
        p = {
            'slug': slug, 'sortOrder': (i + 1) * 10,
            'title': text(art.find('h3')), 'category': art['data-project-category'],
            'badge': text(art.select_one('.project-image > span')),
            'imageNote': text(art.select_one('.project-image > small')),
            'image': media(art.find('img')['src'], art.find('img').get('alt', '')),
            'challenge': text(dd[0]), 'delivery': text(dd[1]), 'scope': text(dd[2]),
        }
        current_page = slug
        d = load(slug)
        main = d.find('main')
        p['lede'] = text(main.find('p', class_='lede'))
        fig = main.find('figure', class_='project-detail-media')
        p['mediaCaption'] = text(fig.find('figcaption')) if fig else None
        ov = main.find(class_='refine-case-overview')
        ps = ov.find_all('p') if ov else []
        if ps and (text(ps[0]) != p['challenge'] or text(ps[1]) != p['delivery']):
            report['warnings'].append({'page': slug, 'msg': 'detail challenge/delivery differ from card'})
        summ = main.find(class_='project-summary')
        p['summaryValue'] = text(summ.find('strong')) if summ else None
        p['summaryNote'] = text(summ.find('span')) if summ else None
        ul = main.find('ul', class_='check-list')
        p['scopeItems'] = [{'text': text(li)} for li in ul.find_all('li')] if ul else []
        sn = main.find('p', class_='small-note')
        p['sourceNote'] = text(sn) if sn else None
        rel = main.find(class_='related-nav')
        p['relatedSolutions'] = [{'type': 'custom', 'label': text(x), 'url': route(x['href']), 'appearance': 'plain'} for x in rel.find_all('a')] if rel else []
        p['meta'] = meta_of(d)
        projects.append(p)
        report['pages'].append({'file': f'{slug}.html', 'to': f'projects/{slug}'})
    return projects


# ---------------------------------------------------------------- globals (Arabic)


def parse_arabic_globals():
    soup = load('ar-index')
    nav = soup.find('nav', id='nav')
    items = []
    for a in nav.find_all('a', recursive=False):
        items.append({'label': text(a), 'kind': 'link', 'url': route(a['href']),
                      'className': cls(a) or None, 'lang': a.get('lang')})
    foot = soup.find('footer')
    grid = foot.find(class_='footer-grid')
    cols = children(grid)
    columns = []
    for col in cols[1:]:
        columns.append({'heading': text(col.find('h3')), 'links': [
            {'type': 'custom', 'label': text(a), 'url': route(a['href']), 'appearance': 'plain',
             'newTab': a.get('target') == '_blank' or None} for a in col.find_all('a')]})
    bottom = foot.find(class_='footer-bottom')
    cta = soup.find('section', class_='cta')
    div = cta.find(class_='cta-inner').find('div')
    a = cta.find(class_='cta-inner').find('a', recursive=False)
    global AR_DEFAULT_CTA
    AR_DEFAULT_CTA = (text(div.find('p', class_='eyebrow')), inner_html(div.find('h2')),
                      text([p for p in div.find_all('p') if 'eyebrow' not in classes(p)][0]), route(a['href']), text(a))
    return {
        'header': {'navItems': items, 'cta': None, 'languageLink': None, 'showSearch': False},
        'footer': {
            'tagline': inner_html(cols[0].find('p')), 'linkedinLabel': None, 'columns': columns,
            'contactColumn': {'heading': None},
            'bottomLinks': [{'type': 'custom', 'label': text(x), 'url': route(x['href']), 'appearance': 'plain'} for x in bottom.find_all('a')],
            'copyrightSuffix': None, 'backToTopLabel': None,
        },
        'settings': {
            'utilityText': None, 'skipLinkText': text(soup.find('a', class_='skip')),
            'offices': None,
            'defaultCta': {'eyebrow': AR_DEFAULT_CTA[0], 'heading': AR_DEFAULT_CTA[1], 'text': AR_DEFAULT_CTA[2],
                           'link': {'type': 'custom', 'label': text(a), 'url': AR_DEFAULT_CTA[3], 'appearance': 'white'}},
            'titleSuffix': ' | EnviroMET',
            'defaultDescription': meta_of(soup)['description'],
        },
    }


# ---------------------------------------------------------------- run

def run():
    global current_page
    globals_ar = parse_arabic_globals()

    # Generic pages (EN)
    pages = []
    all_names = sorted(p.stem for p in DIST.glob('*.html'))
    for name in all_names:
        if name in HANDMADE_EN or name in SKIP or name in SERVICE_PAGES or name.startswith(('ar-', 'project-')):
            continue
        current_page = name
        soup = load(name)
        ptype = PAGE_TYPES.get(name) or ('guide' if name.endswith('-guide') else 'use-case' if name.startswith('use-case-')
                                         else 'audience' if name.startswith('for-') else 'general')
        pages.append({'slug': name, 'title': admin_title(soup) or name, 'pageType': ptype,
                      'scripts': scripts_of(soup), 'meta': meta_of(soup), 'layout': main_blocks(soup.find('main'), 'en')})
        report['pages'].append({'file': f'{name}.html', 'to': f'pages/{name}'})

    services = [parse_service(n) for n in SERVICE_PAGES]
    # The hub order defines the services' sort order; card data lives on each service
    hub = load('services')
    order = [route(a.find('a')['href']).strip('/') for a in hub.select('.service-grid > article')]
    for s in services + [{'slug': 'wind'}]:
        card = SERVICE_CARDS.get(s['slug'])
        s['sortOrder'] = (order.index(s['slug']) + 1) * 10 if s['slug'] in order else 999
        if card:
            s['summary'] = card['text']
            s['cardImage'] = card['image']
            s['cardImageAlt'] = card['imageAlt']
    wind_card = [s for s in services if s['slug'] == 'wind'][0] if False else None
    projects = parse_projects()

    # Arabic layouts
    arabic = []
    for file, (coll, slug) in AR_MAP.items():
        current_page = file
        soup = load(file)
        arabic.append({'collection': coll, 'slug': slug, 'title': admin_title(soup),
                       'meta': meta_of(soup), 'layout': main_blocks(soup.find('main'), 'ar')})
        report['pages'].append({'file': f'{file}.html', 'to': f'{coll}/{slug} (ar)'})

    windcard = {k: v for k, v in [s for s in services + [{'slug': 'wind'}] if s['slug'] == 'wind'][0].items()}
    for name, data in [('pages', pages), ('services', services), ('projects', projects), ('arabic', arabic),
                       ('globals-ar', globals_ar), ('wind-card', windcard), ('report', report)]:
        (OUT / f'{name}.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f"pages: {len(pages)}  services: {len(services)}  projects: {len(projects)}  arabic: {len(arabic)}")
    print(f"html fallbacks: {len(report['htmlFallbacks'])}  warnings: {len(report['warnings'])}")


if __name__ == '__main__':
    run()
