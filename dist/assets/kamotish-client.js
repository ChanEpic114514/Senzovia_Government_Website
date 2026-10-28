/* Progressive enhancement for dynamically inserted Kamotish text. Static content
 * is already rendered at build time. Copying a run preserves its editable source. */
(() => {
  'use strict';
  if (document.documentElement.lang !== 'art-x-kamotish' || !window.Kamotish) return;
  const K = window.Kamotish;
  const blocked = 'script,style,textarea,input,select,option,code,pre,svg,.kamo-run,[contenteditable="true"]';
  const plain = text => String(text).replace(/\\([a-z][a-z']*\d?)(?:\\([1-4]))?/g, (_, name, tone) =>
    ' ' + ({hou2:'hou',mou2:'mou'}[name] || name) + (tone ? '¹²³⁴'[Number(tone)-1] : '') + ' ').replace(/\s+/g,' ').trim();
  const opaque = text => /(?:https?:\/\/|mailto:|[\w.+-]+@[\w.-]+)/i.test(text) || /^[\d\s\W_A-Z]+$/.test(text);
  const opaqueTokens = /(?:https?:\/\/[^\s\\<>\u3400-\u9fff，。；！？）]+|mailto:[\w.+-]+@[\w.-]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:[a-z0-9-]+\.)+(?:com|org|net|gov|uk|fr|de|nl|be|ch|at|se|no|fi|dk|kr|es|za|br|pl)\b(?:\/[^\s\\<>\u3400-\u9fff，。；！？）]*)?)/gi;
  const escape = text => text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function inline(text) {
    let html='',at=0;
    for(const match of text.matchAll(opaqueTokens)) {
      html+=K.renderInline(text.slice(at,match.index))+escape(match[0]); at=match.index+match[0].length;
    }
    return html+K.renderInline(text.slice(at));
  }
  function renderText(node) {
    const text = node.nodeValue;
    if (!text?.trim() || !/\\|[a-z]/.test(text) || node.parentElement?.closest(blocked)) return;
    const html = inline(text);
    // A bad dynamic string remains readable instead of displaying error glyphs.
    if (html.includes('kamo-err')) return;
    const span = document.createElement('span');
    span.className = 'kamo-run'; span.dataset.kamotishSource = text;
    const readable = document.createElement('span'); readable.className = 'kamo-readable'; readable.textContent = plain(text);
    const ink = document.createElement('span'); ink.className = 'kamo-ink'; ink.setAttribute('aria-hidden','true'); ink.innerHTML = html;
    ink.querySelectorAll('svg').forEach(svg => { svg.setAttribute('aria-hidden','true'); svg.removeAttribute('aria-label'); svg.removeAttribute('role'); svg.setAttribute('focusable','false'); });
    span.append(readable,ink); node.replaceWith(span);
  }
  function attributes(element) {
    for (const key of ['aria-label','placeholder','alt','title']) {
      const value = element.getAttribute?.(key);
      if (value?.includes('\\')) element.setAttribute(key,plain(value));
    }
  }
  function render(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE || element.closest(blocked)) return;
    attributes(element);
    const walker = document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(renderText);
    element.querySelectorAll('[aria-label],[placeholder],[alt],[title]').forEach(attributes);
  }
  render(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') renderText(record.target);
      else if (record.type === 'attributes') attributes(record.target);
      else record.addedNodes.forEach(node => node.nodeType === Node.TEXT_NODE ? renderText(node) : render(node));
    }
  }).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','alt','title']});
  document.addEventListener('copy',event => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return;
    const fragment = selection.getRangeAt(0).cloneContents();
    const runs = fragment.querySelectorAll?.('.kamo-run');
    if (!runs?.length) return;
    runs.forEach(run => run.replaceWith(document.createTextNode(run.dataset.kamotishSource)));
    fragment.querySelectorAll?.('.kamo-readable').forEach(node => node.remove());
    event.clipboardData?.setData('text/plain',fragment.textContent); event.preventDefault();
  });

  // The existing optional intros draw labels on canvas. Adapt only Kamotish
  // strings, retaining the native methods for numbers, branding and other text.
  const paths = new Map();
  function tokens(text) {
    if (!/\\|^[a-z-]+$/.test(text) || opaque(text)) return null;
    const result=[]; let i=0;
    while(i<text.length) {
      const rest=text.slice(i),char=text[i];
      if(char==='\\') {
        const m=/^\\([a-z][a-z']*\d?)(?:\\([1-4]))?/.exec(rest); if(!m)return null;
        const key='g:'+m[0]; if(!paths.has(key)){const d=K._graphemePath(m[1],m[2]); if(!d)return null; paths.set(key,new Path2D(d));}
        result.push({path:paths.get(key)}); i+=m[0].length;
      } else if(/[a-z]/.test(char)) {
        const m=/^[a-z]+/.exec(rest)[0]; i+=m.length; const tone=/^\\([1-4])/.exec(text.slice(i)); if(tone)i+=tone[0].length;
        const key='s:'+m+(tone?.[1]||'');
        try { if(!paths.has(key))paths.set(key,new Path2D(K._syllablePath(m,tone?.[1]))); } catch { return null; }
        result.push({path:paths.get(key)});
      } else if(char==='-') { if(text[i+1]==='-'){result.push({text:'-'}); i+=2;}else i++; }
      else { result.push({text:char}); i++; }
    }
    return result;
  }
  if (window.CanvasRenderingContext2D && window.Path2D) {
    const prototype=CanvasRenderingContext2D.prototype, nativeFill=prototype.fillText, nativeStroke=prototype.strokeText, nativeMeasure=prototype.measureText;
    const size=ctx=>Number(/([\d.]+)px/.exec(ctx.font)?.[1]||16);
    const width=(ctx,items)=>items.reduce((sum,item)=>sum+(item.path?size(ctx)*1.11:nativeMeasure.call(ctx,item.text).width),0);
    prototype.measureText=function(text){const items=tokens(String(text));return items?{width:width(this,items)}:nativeMeasure.call(this,text);};
    function drawText(native, stroke, text,x,y,maxWidth){
      const items=tokens(String(text));if(!items)return native.call(this,text,x,y,maxWidth);
      const fontSize=size(this),total=width(this,items),scale=maxWidth&&total>maxWidth?maxWidth/total:1;
      this.save(); this.translate(x,y); this.scale(scale,1);
      let at=this.textAlign==='center'?-total/2:['right','end'].includes(this.textAlign)?-total:0;
      const top=['top','hanging'].includes(this.textBaseline)?0:this.textBaseline==='middle'?-fontSize/2:-fontSize*.86;
      this.textAlign='left';
      for(const item of items){
        if(item.path){this.save();this.translate(at+fontSize*.055,top);this.scale(fontSize/100,fontSize/100);if(stroke){this.lineWidth*=100/fontSize;this.stroke(item.path);}else this.fill(item.path);this.restore();at+=fontSize*1.11;}
        else {native.call(this,item.text,at,0);at+=nativeMeasure.call(this,item.text).width;}
      }
      this.restore();
    }
    prototype.fillText=function(text,x,y,maxWidth){return drawText.call(this,nativeFill,false,text,x,y,maxWidth);};
    prototype.strokeText=function(text,x,y,maxWidth){return drawText.call(this,nativeStroke,true,text,x,y,maxWidth);};
  }
  window.KamotishPage={render,plainText:plain};
})();
