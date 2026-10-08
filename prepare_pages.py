"""Create a project-path deployment without changing local preview assets."""

from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'dist'
OUTPUT = ROOT / 'dist-pages'
BASE = '/Senzovia_Government_Website'

shutil.copytree(SOURCE, OUTPUT, dirs_exist_ok=True)

for path in OUTPUT.rglob('*.html'):
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'((?:href|src|value)=")/(?!/)',
                  lambda match: match[1] + BASE + '/', text)
    path.write_text(text, encoding='utf-8')

for path in (OUTPUT / 'assets').glob('search-*.json'):
    records = json.loads(path.read_text(encoding='utf-8'))
    for record in records:
        record['url'] = BASE + record['url']
        target = OUTPUT / record['url'][len(BASE):].strip('/') / 'index.html'
        assert target.is_file(), record['url']
    path.write_text(json.dumps(records, ensure_ascii=False), encoding='utf-8')

script = OUTPUT / 'assets/site.js'
text = script.read_text(encoding='utf-8')
replacements = {
    "languages.value.split('/')[1]": "languages.selectedOptions[0].lang",
    "location.pathname==='/'": "location.pathname==='" + BASE + "/'",
    "location.replace('/'+preferred+'/')": "location.replace('" + BASE + "/'+preferred+'/')",
    "fetch('/assets/": "fetch('" + BASE + "/assets/",
    "a.href='/'+body.dataset.lang+'/publications/'": "a.href='" + BASE + "/'+body.dataset.lang+'/publications/'",
}
for old, new in replacements.items():
    assert text.count(old) == 1, 'Unexpected source pattern: ' + old
    text = text.replace(old, new)
script.write_text(text, encoding='utf-8')

for name in ['flag-intro.js', 'flag-intro.css']:
    path = OUTPUT / 'assets' / name
    text = path.read_text(encoding='utf-8')
    text = text.replace('/assets/senzovia-flag.jpeg', BASE + '/assets/senzovia-flag.jpeg')
    path.write_text(text, encoding='utf-8')

class References(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ('href', 'src', 'value') or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path.startswith('/'):
                continue
            assert url.path.startswith(BASE + '/'), value
            target = OUTPUT / unquote(url.path[len(BASE):]).lstrip('/')
            if target.is_dir():
                target = target / 'index.html'
            assert target.is_file(), value

pages = list(OUTPUT.rglob('*.html'))
for page in pages:
    References().feed(page.read_text(encoding='utf-8'))
flag = 'assets/senzovia-flag.jpeg'
assert (SOURCE / flag).read_bytes() == (OUTPUT / flag).read_bytes()
print(json.dumps({'pages': len(pages), 'base_path': BASE,
                  'deployment_links': 'passed',
                  'flag_sha256': hashlib.sha256((OUTPUT / flag).read_bytes()).hexdigest()}))
