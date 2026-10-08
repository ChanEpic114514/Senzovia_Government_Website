from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import hashlib,json

root=Path(__file__).parent/'dist'
errors=[]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.refs=[];self.ids=[];self.lang=None;self.h1=0;self.flags=[];self.selects=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if 'id' in a:self.ids.append(a['id'])
  if tag in ['a','link'] and 'href' in a:self.refs.append(a['href'])
  if tag in ['img','script'] and 'src' in a:self.refs.append(a['src'])
  if tag=='img':self.flags.append(a)
  if tag=='option':self.selects.append(a.get('value'))
pages=list(root.rglob('*.html'));parsed={p:Page(p.read_text()) for p in pages}
for p,page in parsed.items():
 if page.h1!=1:errors.append(f'{p}: h1 count {page.h1}')
 if len(page.ids)!=len(set(page.ids)):errors.append(f'{p}: duplicate IDs')
 if not page.lang:errors.append(f'{p}: missing lang')
 for ref in page.refs+page.selects:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=root/unquote(u.path).lstrip('/') if u.path else p
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{p}: missing target {ref}')
  elif u.fragment and target in parsed and u.fragment not in parsed[target].ids:errors.append(f'{p}: bad anchor {ref}')
 for img in page.flags:
  if img.get('src')!='/assets/senzovia-flag.jpeg':errors.append(f'{p}: unexpected flag')
  if not img.get('alt'):errors.append(f'{p}: missing image alt')
 if p.name=='index.html' and len(page.selects)!=7:errors.append(f'{p}: language coverage {len(page.selects)}')
for lang in ['en','zh-Hans','zh-Hant','ja','ko','fr','es']:
 index=json.loads((root/f'assets/search-{lang}.json').read_text())
 if len(index)!=9:errors.append(f'{lang}: search records {len(index)}')
 for d in index:
  if not (root/d['url'].strip('/')/'index.html').exists():errors.append(f'{lang}: bad index route')
  if not d['text']:errors.append(f'{lang}: missing translated body')
expected='15821ce299ab785bd3f58e39d9c674d2d6060e40edc956080d1738cc11b57c65'
assert hashlib.sha256((root/'assets/senzovia-flag.jpeg').read_bytes()).hexdigest()==expected
assert not errors,'\n'.join(errors)
print(json.dumps({'html_pages':len(pages),'internal_links':'passed','language_links':'7 per page','search_documents':63,'download_documents':len(list((root/'assets/documents').glob('*.txt'))),'flag':'byte-for-byte identical','errors':errors}))
