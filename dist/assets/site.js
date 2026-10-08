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
 const input=document.querySelector('#search-input'),results=document.querySelector('#search-results'),status=document.querySelector('#search-status');
 let documents=[];
 const normalise=s=>s.normalize('NFKC').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const render=()=>{
  const query=input.value.trim(),words=normalise(query).split(/\s+/).filter(Boolean);
  const matches=documents.filter(d=>!words.length||words.every(w=>normalise(d.title+' '+d.description+' '+d.text+' '+d.code).includes(w)));
  results.replaceChildren();status.textContent=matches.length?labels.results+' · '+matches.length+' '+labels.count:labels.empty;
  matches.forEach(d=>{const card=document.createElement('article');card.className='result-item';const tag=document.createElement('span');tag.className='badge '+d.type;tag.textContent=labels[d.type];const heading=document.createElement('h2'),a=document.createElement('a');a.href=d.url;a.textContent=d.title;heading.append(a);const desc=document.createElement('p');desc.textContent=d.description;card.append(tag,heading,desc);results.append(card)});
 };
 input.value=new URLSearchParams(location.search).get('q')||'';
 fetch('/assets/search-'+body.dataset.lang+'.json').then(r=>{if(!r.ok)throw new Error('index');return r.json()}).then(d=>{documents=d;render()}).catch(()=>{status.textContent=labels.empty;const a=document.createElement('a');a.href='/'+body.dataset.lang+'/publications/';a.textContent=document.querySelector('#primary-nav a:nth-child(3)').textContent;results.append(a)});
 searchForm.addEventListener('submit',e=>{e.preventDefault();history.replaceState(null,'',location.pathname+(input.value.trim()?'?q='+encodeURIComponent(input.value.trim()):''));render()});
 input.addEventListener('input',render);
}
