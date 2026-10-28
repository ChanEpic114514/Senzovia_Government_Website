'use strict';
// Small line-oriented worker. Paths come exclusively from the MIT Kamotish renderer.
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const readline = require('node:readline');
const path = require('node:path');
const { Kamotish } = require('../dist/assets/kamotish-renderer.js');
const symbols = new Map();
const rendered = new Map();
const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TOKEN = /^\\([a-z][a-z']*\d?)(?:\\([1-4]))?/;
const opaque = /^(?:https?:\/\/[^\s\\<>\u3400-\u9fff，。；！？）]+|mailto:[\w.+-]+@[\w.-]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:[a-z0-9-]+\.)+(?:com|org|net|gov|uk|fr|de|nl|be|ch|at|se|no|fi|dk|kr|es|za|br|pl)\b(?:\/[^\s\\<>\u3400-\u9fff，。；！？）]*)?)/i;
function glyph(kind, value, tone) {
  const label = value + (tone ? '\\' + tone : '');
  const key = kind + ':' + label;
  const id = 'k-' + createHash('sha256').update(key).digest('hex').slice(0, 16);
  if (!symbols.has(id)) {
    const data = kind === 'g' ? Kamotish._graphemePath(value, tone) : Kamotish._syllablePath(value, tone);
    if (!data) throw new Error('Unknown Kamotish grapheme: ' + value);
    symbols.set(id, `<symbol id="${id}" viewBox="0 0 100 100"><path d="${data}"/></symbol>`);
  }
  return `<svg class="kamo" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="/assets/kamotish-glyphs.svg#${id}"></use></svg>`;
}
function inline(text) {
  if (rendered.has(text)) return rendered.get(text);
  let html = '', i = 0;
  while (i < text.length) {
    const rest = text.slice(i);
    const url = opaque.exec(rest);
    if (url) { html += esc(url[0]); i += url[0].length; continue; }
    const c = text[i];
    if (c === '\\') {
      const token = TOKEN.exec(rest);
      if (!token) throw new Error('Malformed Kamotish command near ' + rest.slice(0, 40));
      html += glyph('g', token[1], token[2]); i += token[0].length;
    } else if (/[A-Za-z]/.test(c)) {
      const token = /^[A-Za-z]+/.exec(rest)[0]; i += token.length;
      if (/[A-Z]/.test(token)) { html += esc(token); continue; }
      let tone = null;
      const toneToken = /^\\([1-4])/.exec(text.slice(i));
      if (toneToken) { tone = toneToken[1]; i += toneToken[0].length; }
      html += glyph('s', token, tone);
    } else if (c === '-') {
      if (text[i + 1] === '-') { html += '-'; i += 2; } else i++;
    } else if (c === '\n') { html += '<br>'; i++; }
    else { html += esc(c); i++; }
  }
  rendered.set(text, html);
  return html;
}
readline.createInterface({ input: process.stdin, crlfDelay: Infinity }).on('line', line => {
  try {
    const request = JSON.parse(line);
    if (request.action === 'render') {
      const html = request.texts.map((text, index) => {
        try { return inline(text); }
        catch (error) { throw new Error('Kamotish text node ' + (index + 1) + ': ' + error.message + '; source ' + JSON.stringify(text.slice(0, 120))); }
      });
      process.stdout.write(JSON.stringify({ html }) + '\n');
    } else if (request.action === 'finalize') {
      const target = path.resolve(__dirname, '../dist/assets/kamotish-glyphs.svg');
      fs.writeFileSync(target, '<svg xmlns="http://www.w3.org/2000/svg">' + [...symbols.values()].join('') + '</svg>\n');
      process.stdout.write(JSON.stringify({ glyphs: symbols.size, bytes: fs.statSync(target).size }) + '\n');
    } else throw new Error('Unknown worker request');
  } catch (error) {
    process.stdout.write(JSON.stringify({ error: error.message }) + '\n');
  }
});
