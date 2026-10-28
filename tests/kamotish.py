"""Regression checks for complete locale coverage and source-safe glyph rendering."""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from kamotish_render import render_page, plain_text
from locales import LANGS
from participation import TEXT
from publication_tools import LABELS as PUBLICATIONS
from policy_pages import LABELS as POLICIES

LOCALE = 'art-x-kamotish'
def strings(value, path=()):
    if isinstance(value, str):
        yield path, value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from strings(item, path + (key,))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            yield from strings(item, path + (index,))

source = json.loads((ROOT / 'content.json').read_text())['zh-Hans']
target = json.loads((ROOT / f'content-{LOCALE}.json').read_text())
assert dict(strings(source)).keys() == dict(strings(target)).keys()
for labels in [TEXT, PUBLICATIONS, POLICIES]:
    assert len(labels[LOCALE]) == len(labels['zh-Hans'])
    if isinstance(labels[LOCALE], dict):
        assert labels[LOCALE].keys() == labels['zh-Hans'].keys()

translated = list(strings(target))
counts = {}
for topic in ['education', 'research', 'rights', 'culture', 'governance', 'reconstruction']:
    a = dict(strings(json.loads((ROOT / f'policies/{topic}/zh-Hans.json').read_text())))
    b = dict(strings(json.loads((ROOT / f'policies/{topic}/{LOCALE}.json').read_text())))
    assert a.keys() == b.keys(), topic
    for path, original in a.items():
        assert b[path].strip(), (topic, path)
        # Resource paths and proper names are shared; prose cannot silently fall back.
        if len(original) > 16 and not original.startswith('/'):
            assert b[path] != original, (topic, path, 'untranslated prose')
    counts[topic] = len(b)
    translated.extend(b.items())
ui = json.loads((ROOT / 'kamotish-ui.json').read_text())
translated.extend(strings(ui))
# Exercise every translated string, including hidden animation/error labels.
for path, text in translated:
    if text.startswith('/') or path[-1] == 'id':
        continue
    page = render_page('<html><head></head><body><p>' + escape(text) + '</p></body></html>')
    assert 'kamo-err' not in page, path
    assert not re.search(r'\\[1-4]\d', text), (path, 'tone/number separator')

sample = r'其\wou\3Senzovians@gmail.com\ou閱\pou\2\chi\4。'
page = render_page('<html><head></head><body><p>' + sample + '</p></body></html>')
assert page.count('<svg class="kamo"') == 4, 'Email swallowed adjacent Kamotish commands'
assert 'Senzovians@gmail.com' in page
assert '\\' not in plain_text(sample)
for malformed in [r'\unknown', r'\e1', 'pro', r'\5']:
    try:
        render_page('<html><head></head><body>' + malformed + '</body></html>')
    except ValueError:
        pass
    else:
        raise AssertionError(('Invalid source accepted', malformed))

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.glyphs = 0; self.options = []; self.language = False
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'use':
            self.glyphs += 1
            assert a['href'].startswith('/assets/kamotish-glyphs.svg#')
        if tag == 'select': self.language = a.get('id') == 'language-select'
        if tag == 'option' and self.language: self.options.append(a['value'])
    def handle_endtag(self, tag):
        if tag == 'select': self.language = False

pages = list((ROOT / 'dist' / LOCALE).rglob('index.html'))
assert len(pages) == 21
for file in pages:
    source = file.read_text(); page = Page(source)
    assert page.glyphs > 10, file  # real glyphs are present even with JS disabled
    assert len(page.options) == len(LANGS)
    assert 'kamotish.css?v=' in source
    assert len({option.rsplit('/', 2)[-2] for option in page.options}) in (1, len(LANGS))
for topic in ['education', 'research', 'rights']:
    doc = ROOT / 'dist/assets/documents' / f'{LOCALE}-P-{["education","research","rights"].index(topic)+1:02}-FULL.txt'
    assert doc.is_file() and len(doc.read_text()) > 10000
index = json.loads((ROOT / f'dist/assets/search-{LOCALE}.json').read_text())
assert len(index) == 12
for topic in ['education', 'research', 'rights']:
    record = next(d for d in index if d['topic'] == topic and d['format'] == 'full')
    assert len(record['sections']) > 15
    assert all(s['heading'] and s['anchor'] for s in record['sections'])
print(json.dumps({'kamotish_pages': len(pages), 'policy_string_coverage': counts,
                  'source_validation': 'passed', 'static_glyphs': 'passed'}, ensure_ascii=False))
