'use strict';
document.documentElement.classList.add('js');
const root=document.documentElement;
const body=document.body;
const readPreference=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
const savePreference=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
const systemMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let reduce=readPreference('senzovia-motion')==='reduce'||(readPreference('senzovia-motion')!=='full'&&systemMotion.matches);
function applyMotion(){
 root.classList.toggle('reduce-motion',reduce);root.classList.toggle('motion-enabled',!reduce);
 document.querySelectorAll('.motion-toggle').forEach(b=>{b.textContent=reduce?body.dataset.motionOff:body.dataset.motionOn;b.setAttribute('aria-pressed',String(reduce));});
}
applyMotion();
document.querySelectorAll('.motion-toggle').forEach(b=>b.addEventListener('click',()=>{reduce=!reduce;savePreference('senzovia-motion',reduce?'reduce':'full');applyMotion()}));
systemMotion.addEventListener('change',e=>{if(!readPreference('senzovia-motion')){reduce=e.matches;applyMotion()}});
const languages=document.querySelector('#language-select');
languages?.addEventListener('change',()=>{savePreference('senzovia-language',languages.value.split('/')[1]);location.assign(languages.value+ (body.dataset.route==='search'?location.search:''));});
if(location.pathname==='/'){
 const preferred=readPreference('senzovia-language');
 if(preferred&&['en','zh-Hans','zh-Hant','ja','ko','fr','es'].includes(preferred)&&preferred!=='en')location.replace('/'+preferred+'/');
}
const menu=document.querySelector('.mobile-menu'),nav=document.querySelector('#primary-nav');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');menu.focus()}});
const indicator=document.querySelector('.nav-indicator');
function positionIndicator(a){if(!a||!indicator||!nav)return;indicator.style.width=a.offsetWidth+'px';indicator.style.transform=`translateX(${a.offsetLeft}px)`;indicator.style.opacity='1'}
if(nav){const current=nav.querySelector('.current');positionIndicator(current);if(current)root.classList.add('nav-ready');nav.querySelectorAll('a').forEach(a=>{a.addEventListener('mouseenter',()=>positionIndicator(a));a.addEventListener('focus',()=>positionIndicator(a))});nav.addEventListener('mouseleave',()=>positionIndicator(current));nav.addEventListener('focusout',()=>positionIndicator(current));window.addEventListener('resize',()=>positionIndicator(current));}
// Disclosure interaction follows the USWDS single-open, aria-controls/aria-expanded pattern.
// Independently implemented for the static portal; no USWDS source is distributed.
const disclosures=[...document.querySelectorAll('.accordion-button')];
disclosures.forEach((b,i)=>b.addEventListener('click',()=>{
 const was=b.getAttribute('aria-expanded')==='true';
 disclosures.forEach(other=>{const open=other===b&&!was;other.setAttribute('aria-expanded',String(open));document.getElementById(other.getAttribute('aria-controls')).hidden=!open});
 const counter=document.getElementById('priority-counter');
 if(counter&&!was){counter.textContent=String(i+1).padStart(2,'0');if(!reduce&&counter.animate)counter.animate([{opacity:.3,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'})}
}));
const labels=JSON.parse(document.querySelector('#search-labels')?.textContent||'{}');
document.querySelectorAll('.filter-button').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('.filter-button').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button))});
 let count=0;document.querySelectorAll('.doc-row').forEach(row=>{row.hidden=button.dataset.filter!=='all'&&row.dataset.type!==button.dataset.filter;if(!row.hidden)count++});
 document.querySelector('#document-count').textContent=count+' '+labels.count;
}));
document.querySelectorAll('.print-button').forEach(b=>b.addEventListener('click',()=>window.print()));
const progress=document.querySelector('.reading-line');
let scrollPending=false;
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;scrollPending=false}
window.addEventListener('scroll',()=>{if(!scrollPending){requestAnimationFrame(updateProgress);scrollPending=true}},{passive:true});updateProgress();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
const searchForm=document.querySelector('#search-form');
if(searchForm){
 const input = document.querySelector('#search-input');
 const results = document.querySelector('#search-results');
 const status = document.querySelector('#search-status');
 const topicFilter = document.querySelector('#search-topic');
 const formatFilter = document.querySelector('#search-format');
 const extra = JSON.parse(document.querySelector('#search-extra-labels').textContent);
 let documents = [];
 let loaded = false;
 const normalise = value => value.normalize('NFKC').toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

 // Keep source offsets so accent-insensitive matches highlight original text.
 function matchRanges(text, words) {
  let folded = '', offsets = [], source = 0;
  for (const character of text) {
   const normalized = normalise(character);
   for (let i = 0; i < normalized.length; i++) offsets.push([source, source + character.length]);
   folded += normalized;
   source += character.length;
  }
  const ranges = [];
  for (const word of words) {
   let at = folded.indexOf(word);
   while (at !== -1) {
    ranges.push([offsets[at][0], offsets[at + word.length - 1][1]]);
    at = folded.indexOf(word, at + word.length);
   }
  }
  ranges.sort((a,b) => a[0] - b[0]);
  return ranges.reduce((merged, range) => {
   const last = merged[merged.length - 1];
   if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
   else merged.push([...range]);
   return merged;
  }, []);
 }

 function highlight(node, text, words) {
  let offset = 0;
  for (const [start, end] of matchRanges(text, words)) {
   node.append(document.createTextNode(text.slice(offset, start)));
   const mark = document.createElement('mark');
   mark.textContent = text.slice(start, end);
   node.append(mark);
   offset = end;
  }
  node.append(document.createTextNode(text.slice(offset)));
 }

 function excerpt(text, words) {
  const first = matchRanges(text, words)[0];
  const start = Math.max(0, (first ? first[0] : 0) - 65);
  const end = Math.min(text.length, start + 260);
  return (start ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
 }

 function bestSection(record, words) {
  if (!words.length) return null;
  let best = null, bestScore = 0;
  for (const section of record.sections || []) {
   const text = normalise(section.heading + ' ' + section.text);
   const score = words.filter(word => text.includes(word)).length;
   if (score > bestScore) { best = section; bestScore = score; }
  }
  return best;
 }

 function render() {
  if (!loaded) return;
  const words = [...new Set(normalise(input.value.trim()).split(/\s+/).filter(Boolean))];
  const matches = documents.filter(d =>
   (!topicFilter.value || d.topic === topicFilter.value) &&
   (!formatFilter.value || d.format === formatFilter.value) &&
   words.every(word => normalise(d.title + ' ' + d.description + ' ' + d.text + ' ' + d.code).includes(word))
  );
  results.replaceChildren();
  status.textContent = matches.length ? labels.results + ' · ' + matches.length + ' ' + labels.count : labels.empty;
  for (const d of matches) {
   const section = bestSection(d, words);
   const target = d.url + (section ? '#' + section.anchor : '');
   const card = document.createElement('article');
   card.className = 'result-item';
   const tag = document.createElement('span');
   tag.className = 'badge ' + d.type;
   tag.textContent = labels[d.type];
   const format = document.createElement('span');
   format.className = 'search-format';
   format.textContent = extra[d.format + 'Format'] || '';
   const heading = document.createElement('h2');
   const a = document.createElement('a');
   a.href = target;
   highlight(a, d.title, words);
   heading.append(a);
   card.append(tag, format, heading);
   if (section) {
    const paragraph = document.createElement('p');
    paragraph.className = 'search-section';
    const link = document.createElement('a');
    link.href = target;
    highlight(link, section.heading, words);
    paragraph.append(link);
    card.append(paragraph);
   }
   const desc = document.createElement('p');
   highlight(desc, section ? excerpt(section.text || section.heading, words) : (words.length ? excerpt(d.text, words) : d.description), words);
   card.append(desc);
   results.append(card);
  }
 }

 function restoreQuery() {
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') || '';
  for (const [select, key] of [[topicFilter, 'topic'], [formatFilter, 'format']]) {
   const value = params.get(key) || '';
   select.value = [...select.options].some(option => option.value === value) ? value : '';
  }
 }
 function update() {
  const params = new URLSearchParams();
  if (input.value.trim()) params.set('q', input.value.trim());
  if (topicFilter.value) params.set('topic', topicFilter.value);
  if (formatFilter.value) params.set('format', formatFilter.value);
  history.replaceState(null, '', location.pathname + (params.size ? '?' + params.toString() : ''));
  render();
 }
 restoreQuery();
 fetch('/assets/search-'+body.dataset.lang+'.json?v=20261012-sections-1').then(r => {
  if (!r.ok) throw new Error('index');
  return r.json();
 }).then(data => {
  documents = data;
  loaded = true;
  render();
 }).catch(() => {
  status.textContent = extra.searchError;
  const a = document.createElement('a');
  a.href='/'+body.dataset.lang+'/publications/';
  a.textContent = document.querySelector('#primary-nav a:nth-child(3)').textContent;
  results.append(a);
 });
 searchForm.addEventListener('submit', event => { event.preventDefault(); update(); });
 input.addEventListener('input', update);
 topicFilter.addEventListener('change', update);
 formatFilter.addEventListener('change', update);
 window.addEventListener('popstate', () => { restoreQuery(); render(); });
}
