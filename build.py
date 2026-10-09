from pathlib import Path
import json, html, hashlib, re
from policy_pages import LABELS, render_policy

ROOT = Path(__file__).parent
OUT = ROOT / 'dist'
data = json.loads((ROOT/'content.json').read_text())
for lang in ['zh-Hant','ja','ko','fr','es']:
    data[lang] = json.loads((ROOT/f'content-{lang}.json').read_text())
LANGS = ['en','zh-Hans','zh-Hant','ja','ko','fr','es']
ROUTES = ['home','priorities','publications','about','flag','education','research','rights','culture','governance','reconstruction','scope','accessibility','privacy','references','search']
ROUTES += [f'{topic["id"]}-full' for topic in data["en"]["topics"]]
refs = [
 ('United Kingdom','https://www.gov.uk/','Topic-led services; clear separation of policy, guidance and transparency.'),
 ('United States','https://www.usa.gov/','Plain-language task labels and a compact topic directory.'),
 ('Canada','https://www.canada.ca/en.html','Consistent topic hierarchy, bilingual identity and page details.'),
 ('Singapore','https://www.gov.sg/','Clear government identity, policy explainers and featured information.'),
 ('New Zealand','https://www.govt.nz/','Life-event groupings with short descriptive link labels.'),
 ('Australia','https://www.pmc.gov.au/','Distinct areas for policy, accountability and national symbols.'),
 ('France','https://www.info.gouv.fr/','Thematic dossiers, public-information features and display controls.'),
 ('Germany','https://www.bundesregierung.de/breg-en','Government, news and service sections; dated article summaries.'),
 ('Netherlands','https://www.government.nl/','Topic index, concise summaries and separation of news and government.'),
 ('Belgium','https://www.belgium.be/en','Visible language options and nested service categories.'),
 ('Switzerland','https://www.ch.ch/en/','Question-oriented information and conspicuous search/language entry points.'),
 ('Austria','https://www.oesterreich.gv.at/en','Accessible shortcuts and commonly requested subjects.'),
 ('Sweden','https://www.government.se/','Separate policy areas, document types and governance explanations.'),
 ('Norway','https://www.regjeringen.no/en/id4/','Explicit distinction between proposals, white papers, reports and law.'),
 ('Finland','https://valtioneuvosto.fi/en/frontpage','Multilingual navigation, dated releases and current-issue sections.'),
 ('Denmark','https://www.borger.dk/','Life situations, shortcuts and topic-based information architecture.'),
 ('South Korea','https://www.korea.kr/','Policy briefings organised by topic, department and content format.'),
 ('Spain','https://www.lamoncloa.gob.es/','Clear institutional sections and differentiated government publications.'),
 ('South Africa','https://www.gov.za/','Separate service, document and statement directories.'),
 ('Brazil','https://www.gov.br/pt-br','Audience-specific navigation and prominent access-to-information links.'),
 ('Poland','https://www.gov.pl/web/gov','Search-led access, topic categories and audience-specific service grouping.')
]
def esc(v): return html.escape(str(v), quote=True)
def url(lang, route): return f'/{lang}/' if route=='home' else f'/{lang}/{route}/'
def link(lang,route,label,cls=''):
    return f'<a class="{cls}" href="{url(lang,route)}">{esc(label)}</a>'
def icon(kind):
    paths={'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>','globe':'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>','menu':'<path d="M4 6h16M4 12h16M4 18h16"/>'}
    return f'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">{paths[kind]}</svg>'
def flag(c,cls=''):
    return f'<img class="flag {cls}" src="/assets/senzovia-flag.jpeg" width="1536" height="1024" alt="{esc(c["flag"])}">'
def badge(c,typ='proposal'):
    return f'<span class="badge {typ}">{esc(c[typ])}</span>'
def head(lang,c,route,title,desc):
    options=''.join(f'<option value="{url(k,route)}" lang="{k}" {"selected" if k==lang else ""}>{data[k]["name"]}</option>' for k in LANGS)
    nav=''.join(link(lang,r,label,'current' if route==r or (r=='priorities' and route in [t['id'] for t in c['topics']]) else '') for r,label in zip(['home','priorities','publications','about'],c['nav']))
    alternates=''.join(f'<link rel="alternate" hreflang="{k}" href="{url(k,route)}">' for k in LANGS)
    return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{esc(title)} | {esc(c['government'])}</title><meta name="description" content="{esc(desc)}"><meta name="theme-color" content="#121416"><link rel="icon" href="/assets/senzovia-flag.jpeg" type="image/jpeg"><link rel="stylesheet" href="/assets/site.css">{alternates}<script src="/assets/site.js" defer></script><link rel="stylesheet" href="/assets/flag-intro.css">
<script src="/assets/flag-intro.js" defer></script></head><body data-lang="{lang}" data-route="{route}" data-motion-on="{esc(c['motionOn'])}" data-motion-off="{esc(c['motionOff'])}">
<a class="skip" href="#main">{esc(c['skip'])}</a><div class="reading-line" aria-hidden="true"></div>
<div class="utility"><div class="wrap utility-inner"><span>{esc(c['portal'])}</span><span class="utility-right">{esc(c['date'])}</span></div></div>
<header class="site-header"><div class="wrap masthead"><a class="brand" href="{url(lang,'home')}" aria-label="{esc(c['government'])}">{flag(c,'brand-flag')}<span><strong>SENZOVIA</strong><small>{esc(c['government'])}</small></span></a>
<div class="tools"><label class="language-control">{icon('globe')}<span class="sr-only">{esc(c['language'])}</span><select id="language-select" aria-label="{esc(c['language'])}">{options}</select></label><a class="search-trigger" href="{url(lang,'search')}">{icon('search')}<span>{esc(c['search'])}</span></a></div></div>
<div class="nav-shell"><div class="wrap"><button class="mobile-menu" aria-expanded="false" aria-controls="primary-nav">{icon('menu')}{esc(c['menu'])}</button><nav id="primary-nav" aria-label="{esc(c['menu'])}">{nav}<span class="nav-indicator" aria-hidden="true"></span></nav></div></div></header>'''
def foot(lang,c):
    return f'''<footer><div class="wrap"><div class="footer-top"><div><div class="footer-wordmark">SENZOVIA<span>.</span></div><p>{esc(c['footerLine'])}</p></div><a class="top-link" href="#top">{esc(c['top'])}</a></div><div class="footer-links">{link(lang,'about',c['aboutTitle'])}{link(lang,'accessibility',c['access'])}{link(lang,'privacy',c['privacy'])}{link(lang,'references',c['sources'])}<button class="motion-toggle">{esc(c['motionOn'])}</button></div><div class="footer-bottom"><span>© 2026 {esc(c['footer'])}</span><span>{esc(c['updated'])} · 2026-10-03</span></div></div></footer><script type="application/json" id="search-labels">{json.dumps({k:c[k] for k in ['empty','results','count','proposal','record']},ensure_ascii=False)}</script></body></html>'''
def crumbs(lang,c,title):
    return f'<div class="wrap breadcrumb">{link(lang,"home",c["nav"][0])}<span aria-hidden="true">/</span><span>{esc(title)}</span></div>'
def intro(lang,c,title,desc,kicker=''):
    return crumbs(lang,c,title)+f'<section class="page-intro wrap"><div class="eyebrow">{esc(kicker or c["government"])}</div><h1>{esc(title)}</h1><p>{esc(desc)}</p></section>'
def topic_cards(lang,c):
    return '<div class="topic-grid">'+''.join(f'<a class="topic-card reveal" href="{url(lang,t["id"])}"><span class="card-number">0{i+1}</span><h3>{esc(t["title"])}</h3><p>{esc(t["desc"])}</p><span class="card-rule" aria-hidden="true"></span></a>' for i,t in enumerate(c['topics']))+'</div>'
def notice_cards(lang,c):
    return '<div class="notice-grid">'+''.join(f'<article class="notice reveal"><div class="notice-meta">{badge(c,"proposal" if i==1 else "record")}<span>2026-10-03</span></div><h3>{link(lang,r,n[0])}</h3><p>{esc(n[1])}</p></article>' for i,(r,n) in enumerate(zip(['flag','education','scope'],c['notices'])))+'</div>'
def scope_box(lang, c, topic=None):
    actions = link(lang, "scope", LABELS[lang][0])

    if topic:
        actions += link(lang, f"{topic}-full", LABELS[lang][1])

    return (
        f'<aside class="scope-note">'
        f'<strong>{esc(c["scope"])}</strong>'
        f'<p>{esc(c["scopeText"])}</p>'
        f'<div class="scope-actions">{actions}</div></aside>'
    )
def sections(c,items):
    return ''.join(f'<section id="section-{i+1}" class="article-section"><span class="section-marker">0{i+1}</span><h2>{esc(h)}</h2><p>{esc(p)}</p></section>' for i,(h,p) in enumerate(items))
def article(lang,c,title,desc,items,docid,typ='proposal',extra='',topic=None):
    toc=''.join(f'<a href="#section-{i+1}"><span>0{i+1}</span>{esc(x[0])}</a>' for i,x in enumerate(items))
    return intro(lang,c,title,desc,c[typ])+f'''<div class="wrap article-grid"><aside class="article-aside"><div class="toc"><h2>{esc(c['onPage'])}</h2>{toc}<div class="doc-details"><span>{esc(c['status'])}</span>{badge(c,typ)}<span>{esc(c['updated'])}</span><strong>{esc(c['date'])}</strong><span class="doc-code">{docid}</span></div></div></aside><article class="article-body">{extra}{sections(c,items)}{scope_box(lang,c,topic) if typ=='proposal' else ''}<div class="document-actions"><a class="button outline" download href="/assets/documents/{lang}-{docid}.txt">{esc(c['download'])}</a><button class="button outline print-button">{esc(c['print'])}</button></div><div class="related"><h2>{esc(c['related'])}</h2>{link(lang,'publications',c['allDocs'])}{link(lang,'priorities',c['nav'][1])}</div></article></div>'''
def home(lang,c):
    return f'''<section class="hero"><div class="wrap hero-grid"><div class="hero-copy"><div class="eyebrow">{esc(c['portal'])}</div><h1><span>{esc(c['hero'][0])}</span><span>{esc(c['hero'][1])}</span></h1><p>{esc(c['intro'])}</p>{link(lang,'priorities',c['explore'],'button light')}</div><figure class="hero-flag">{flag(c)}<figcaption><span>SENZOVIA</span>{link(lang,'flag',c['flagLink'])}</figcaption></figure></div><div class="wrap principle-strip">{''.join(f'<span><i aria-hidden="true">0{i+1}</i>{esc(v)}</span>' for i,v in enumerate(c['principles']))}</div></section>
<section class="wrap section"><div class="section-heading"><div><div class="eyebrow">01 / SENZOVIA</div><h2>{esc(c['quick'])}</h2></div><p>{esc(c['quickIntro'])}</p></div>{topic_cards(lang,c)}</section>
<section class="feature"><div class="wrap feature-grid"><div class="feature-copy"><div class="eyebrow">{esc(c['featured'])} / ESX</div><h2>{esc(c['featureTitle'])}</h2><p>{esc(c['featureText'])}</p>{link(lang,'education',c['featureLink'],'button dark')}</div><div class="feature-facts"><div class="esx-mark" aria-hidden="true">ESX<span>·</span></div><span class="badge">{esc(c['draftLabel'])}</span><div class="fact-row"><strong>5</strong><span>{esc(c['five'])}</span></div><div class="fact-row"><strong>2<span>+</span></strong><span>{esc(c['two'])}</span></div></div></div></section>
<section class="wrap section"><div class="section-heading"><div><div class="eyebrow">02 / SENZOVIA</div><h2>{esc(c['latest'])}</h2></div>{link(lang,'publications',c['allDocs'],'text-link')}</div>{notice_cards(lang,c)}</section>'''
def priority(lang,c):
    rows=''
    for i,t in enumerate(c['topics']):
        rows+=f'''<div class="priority-row"><h2><button class="accordion-button" aria-expanded="{str(i==0).lower()}" aria-controls="priority-{i}"><span class="priority-number">0{i+1}</span><span>{esc(t['title'])}</span><span class="plus" aria-hidden="true"></span></button></h2><div class="accordion-panel" id="priority-{i}" {'hidden' if i else ''}><div class="priority-detail"><p>{esc(t['sections'][0][1])}</p><div>{badge(c)}{link(lang,t['id'],c['read'],'button dark')}</div></div></div></div>'''
    return intro(lang,c,c['nav'][1],c['priorityIntro'])+f'<div class="wrap priorities-layout"><div class="priority-index" aria-hidden="true"><span>SENZOVIA</span><strong id="priority-counter">01</strong><span>01 — 06</span></div><div class="accordion">{rows}</div></div><div class="wrap after-priorities">{scope_box(lang,c)}</div>'
def documents(lang,c):
    docs=[(t['id'],t['title'],t['desc'],'proposal',f'P-{i+1:02}') for i,t in enumerate(c['topics'])]+[('flag',c['notices'][0][0],c['notices'][0][1],'record','N-01'),('scope',c['scope'],c['scopeText'],'record','N-02')]
    rows=''.join(f'<article class="doc-row" data-type="{typ}"><span class="doc-code">{code}</span><div><h2>{link(lang,r,title)}</h2><p>{esc(desc)}</p></div><div class="doc-row-meta">{badge(c,typ)}<time datetime="2026-10-03">2026-10-03</time></div></article>' for r,title,desc,typ,code in docs)
    return intro(lang,c,c['nav'][2],c['docsIntro'])+f'<section class="wrap publications"><div class="filter-bar" role="group" aria-label="{esc(c["filter"])}">'+''.join(f'<button class="filter-button {"selected" if value=="all" else ""}" data-filter="{value}" aria-pressed="{str(value=="all").lower()}">{esc(c[label])}</button>' for value,label in [('all','all'),('proposal','proposal'),('record','record')])+f'<span id="document-count" aria-live="polite">8 {esc(c["count"])}</span></div><div>{rows}</div></section>'
def reference_page(lang,c):
    names={'en':['United Kingdom','United States','Canada','Singapore','New Zealand','Australia','France','Germany','Netherlands','Belgium','Switzerland','Austria','Sweden','Norway','Finland','Denmark','South Korea','Spain','South Africa','Brazil','Poland'],
    'zh-Hans':['英国','美国','加拿大','新加坡','新西兰','澳大利亚','法国','德国','荷兰','比利时','瑞士','奥地利','瑞典','挪威','芬兰','丹麦','韩国','西班牙','南非','巴西','波兰'],
    'zh-Hant':['英國','美國','加拿大','新加坡','紐西蘭','澳洲','法國','德國','荷蘭','比利時','瑞士','奧地利','瑞典','挪威','芬蘭','丹麥','韓國','西班牙','南非','巴西','波蘭'],
    'ja':['英国','米国','カナダ','シンガポール','ニュージーランド','オーストラリア','フランス','ドイツ','オランダ','ベルギー','スイス','オーストリア','スウェーデン','ノルウェー','フィンランド','デンマーク','韓国','スペイン','南アフリカ','ブラジル','ポーランド'],
    'ko':['영국','미국','캐나다','싱가포르','뉴질랜드','호주','프랑스','독일','네덜란드','벨기에','스위스','오스트리아','스웨덴','노르웨이','핀란드','덴마크','대한민국','스페인','남아프리카공화국','브라질','폴란드'],
    'fr':['Royaume-Uni','États-Unis','Canada','Singapour','Nouvelle-Zélande','Australie','France','Allemagne','Pays-Bas','Belgique','Suisse','Autriche','Suède','Norvège','Finlande','Danemark','Corée du Sud','Espagne','Afrique du Sud','Brésil','Pologne'],
    'es':['Reino Unido','Estados Unidos','Canadá','Singapur','Nueva Zelanda','Australia','Francia','Alemania','Países Bajos','Bélgica','Suiza','Austria','Suecia','Noruega','Finlandia','Dinamarca','Corea del Sur','España','Sudáfrica','Brasil','Polonia']}
    return intro(lang,c,c['sources'],c['sourcesText'])+'<section class="wrap reference-list">'+''.join(f'<a href="{u}" rel="noreferrer"><span>{i+1:02}</span><strong>{names[lang][i]}</strong><small>{esc(u.replace("https://", ""))}</small></a>' for i,(_,u,_) in enumerate(refs))+'</section><div class="wrap open-source"><a href="https://github.com/alphagov/govuk-frontend">GOV.UK Frontend</a><a href="https://github.com/uswds/uswds">USWDS</a><a href="https://github.com/motiondivision/motion">Motion</a></div>'
def search_page(lang,c):
    return intro(lang,c,c['search'],c['searchHint'])+f'''<section class="wrap search-page"><form id="search-form" role="search"><label class="sr-only" for="search-input">{esc(c['search'])}</label><input type="search" id="search-input" name="q" placeholder="{esc(c['searchHint'])}" autocomplete="off"><button class="button dark" type="submit">{icon('search')}{esc(c['search'])}</button></form><p id="search-status" role="status"></p><div id="search-results"></div><noscript>{link(lang,'publications',c['allDocs'])}</noscript></section>'''

(OUT/'assets/documents').mkdir(parents=True,exist_ok=True)
for lang in LANGS:
    c=data[lang]
    assert set(c)==set(data['en']), (lang,set(data['en'])-set(c))
    search=[]
    for route in ROUTES:
        title=c['nav'][0]; desc=c['intro']; body=''; items=None; code=None; typ='record'
        if route=='home': body=home(lang,c)
        elif route.endswith('-full'):
            topic_id = route.removesuffix('-full')
            i = next(
                i for i, t in enumerate(c['topics'])
                if t['id'] == topic_id
            )
            topic = c['topics'][i]
            title = topic['title'] + ' — ' + LABELS[lang][2]
            desc = topic['desc']

            full_body, full_text = render_policy(ROOT, lang, topic, c)
            body = intro(lang, c, title, desc, c['proposal']) + full_body

            search.append({
                'title': title,
                'description': desc,
                'text': full_text,
                'url': url(lang, route),
                'type': 'proposal',
                'code': f'P-{i+1:02}-FULL'
            })
        elif route=='priorities': title=c['nav'][1];desc=c['priorityIntro'];body=priority(lang,c)
        elif route=='publications': title=c['nav'][2];desc=c['docsIntro'];body=documents(lang,c)
        elif route.removesuffix('-full') in [t['id'] for t in c['topics']]:
            i=next(i for i,t in enumerate(c['topics']) if t['id']==route);t=c['topics'][i]
            title=t['title'];desc=t['desc'];items=t['sections'];code=f'P-{i+1:02}';typ='proposal';body=article(lang,c,title,desc,items,code,topic=route)
        elif route=='flag':
            title=c['flag'];desc=c['flagIntro'];items=c['flagNotes'];code='N-01'
            extra=f'<figure class="flag-document">{flag(c)}<figcaption>{esc(c["flag"])} · 3:2</figcaption></figure><div class="flag-actions"><a class="button dark" download="Senzovia-flag.jpeg" href="/assets/senzovia-flag.jpeg">{esc(c["original"])}</a><a href="/assets/senzovia-flag.jpeg">{esc(c["viewOriginal"])}</a></div>'
            body=article(lang,c,title,desc,items,code,'record',extra)
        elif route=='about':
            title=c['aboutTitle'];desc=c['aboutIntro'];items=c['aboutSections'];code='N-03';body=article(lang,c,title,desc,items,code,'record')
        elif route=='scope':
            title=c['scope'];desc=c['scopeText'];items=[(c['proposal'],c['scopeText']),(c['aboutSections'][3][0],c['aboutSections'][3][1]),(c['updated'],c['docsIntro'])];code='N-02';body=article(lang,c,title,desc,items,code,'record')
        elif route in ['privacy','accessibility']:
            key='access' if route=='accessibility' else 'privacy';title=c[key];desc=c[key+'Text'];body=intro(lang,c,title,'')+f'<section class="wrap simple-content"><p>{esc(desc)}</p>'+ (f'<button class="button dark motion-toggle">{esc(c["motionOn"])}</button>' if key=='access' else '')+'</section>'
        elif route=='references':title=c['sources'];desc=c['sourcesText'];body=reference_page(lang,c)
        elif route=='search':title=c['search'];body=search_page(lang,c)
        if items:
            text=f'{c["government"]}\n{title}\n{code} | {c[typ]}\n{c["updated"]}: {c["date"]}\n\n{desc}\n\n'+'\n\n'.join(h+'\n'+p for h,p in items)
            if typ=='proposal':text+='\n\n'+c['scope']+'\n'+c['scopeText']
            (OUT/f'assets/documents/{lang}-{code}.txt').write_text(text+'\n')
            search.append({'title':title,'description':desc,'text':' '.join(p for _,p in items),'url':url(lang,route),'type':typ,'code':code})
        folder=OUT/lang/('' if route=='home' else route);folder.mkdir(parents=True,exist_ok=True)
        (folder/'index.html').write_text(head(lang,c,route,title,desc)+f'<main id="main"><div id="top"></div>{body}</main>'+foot(lang,c))
    (OUT/f'assets/search-{lang}.json').write_text(json.dumps(search,ensure_ascii=False))
# English default is a complete useful page, not a redirect or loading placeholder.
(OUT/'index.html').write_text((OUT/'en/index.html').read_text())
(OUT/'404.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Senzovia — 404</title><link rel="stylesheet" href="/assets/site.css"><main class="wrap simple-content"><p>SENZOVIA</p><h1>404</h1><p>This page could not be found.</p><a class="button dark" href="/">Government of Senzovia</a></main></html>')
(ROOT/'RESEARCH.md').write_text('# Senzovia — pre-implementation research\n\nReviewed 2026-10-03 before first product-source implementation. Successful national sources: 21. Inaccessible Irish, Japanese and Icelandic homepages and thin Portuguese output were excluded from the count. Australia.gov.au redirected, so PM&C was read instead.\n\n| Country | Official source | Observed structure and adaptation |\n|---|---|---|\n'+'\n'.join(f'| {n} | {u} | {note} |' for n,u,note in refs)+'\n\n## Design synthesis\nTopic-first navigation; content-status labels; publication metadata; persistent seven-language selector; national-symbol page; high-contrast typography; keyboard-accessible disclosure controls. The flag is copied byte-for-byte, never drawn in CSS or SVG. Visual source review used extracted page structures, not screenshot-based pixel analysis.\n\n## Open-source research\n- https://github.com/alphagov/govuk-frontend — reviewed navigation and accessibility approach.\n- https://github.com/uswds/uswds/blob/develop/packages/usa-accordion/src/index.js — source read directly before implementation; adopted the linked aria-controls/aria-expanded, single-open disclosure behaviour, independently implemented without vendoring its CommonJS dependency graph.\n- https://github.com/motiondivision/motion/blob/main/packages/motion/README.md — reviewed animation and view-transition examples. Native CSS/WAAPI chosen for this static site; Motion is not shipped.\n\n## Content provenance\nUser-confirmed: Senzovia name, supplied flag, post-war state, national goals not yet confirmed achieved. User educational proposals: five upper-secondary subjects, at least two languages, voluntary extracurricular research or fifth research subject, nationality-neutral admissions, low-income activity support, academics before activities for university selection. Other programme text is explicitly proposed policy based on user interests and values, not enacted national law. No biography, personal school records, financial details or private conversations are published. Historical Chinese state name not asserted as current. No invented flag symbolism, capital, population, leaders, constitution, budgets, geographical claims or diplomatic recognition.\n\n## Editions\nEnglish, Simplified Chinese, Traditional Chinese, Japanese, Korean, French and Spanish. Traditional Chinese converted using OpenCC s2twp and retained as a checked-in editable source file; remaining editions independently authored.\n')
print(json.dumps({'pages':len(LANGS)*len(ROUTES)+2,'languages':LANGS,'flag_sha256':hashlib.sha256((OUT/'assets/senzovia-flag.jpeg').read_bytes()).hexdigest(),'research_sources':len(refs)}))
