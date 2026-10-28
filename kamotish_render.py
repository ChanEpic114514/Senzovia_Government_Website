"""Prerender the Kamotish edition using one local, reusable SVG glyph sprite.

Call render_page(html) for Kamotish pages and finalize_assets() once at the end of
build.py. plain_text() supplies a readable transliteration for native controls,
metadata and accessible text. Existing editions must bypass this helper.
"""
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
import atexit
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent
LOCALE = "art-x-kamotish"
_worker = None


def plain_text(text):
    """Human-readable Kamotish spelling without renderer command syntax."""
    def token(match):
        name = {"hou2": "hou", "mou2": "mou"}.get(match[1], match[1])
        return " " + name + (match[2] or "").translate(str.maketrans("1234", "¹²³⁴")) + " "
    result = re.sub(r"\\([a-z][a-z']*\d?)(?:\\([1-4]))?", token, str(text))
    return re.sub(r"\s+", " ", result).strip()


def _request(payload):
    global _worker
    if _worker is None:
        _worker = subprocess.Popen(
            ["node", str(ROOT / "tools/render-kamotish.cjs")], cwd=ROOT,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding="utf-8",
        )
    _worker.stdin.write(json.dumps(payload, ensure_ascii=False) + "\n")
    _worker.stdin.flush()
    line = _worker.stdout.readline()
    if not line:
        raise RuntimeError("Kamotish renderer stopped unexpectedly")
    reply = json.loads(line)
    if "error" in reply:
        raise ValueError(reply["error"])
    return reply


def _close():
    global _worker
    if _worker is not None:
        _worker.stdin.close()
        try:
            _worker.wait(timeout=5)
        except subprocess.TimeoutExpired:
            _worker.terminate()
        _worker = None


atexit.register(_close)


class _Page(HTMLParser):
    SKIP = {"script", "style", "textarea", "option", "select", "code", "pre", "svg"}
    NATIVE = {"title", "option"}
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts = []
        self.texts = []
        self.stack = []
        self.in_body = False

    def handle_starttag(self, tag, attrs):
        attrs = list(attrs)
        changed = False
        for i, (key, value) in enumerate(attrs):
            if value and key in {"aria-label", "alt", "placeholder", "title"} and "\\" in value:
                attrs[i] = (key, plain_text(value)); changed = True
            if tag == "meta" and key == "content" and value and "\\" in value:
                attrs[i] = (key, plain_text(value)); changed = True
        if changed:
            source = "<" + tag + "".join(" " + k + ("" if v is None else '="' + escape(v, quote=True) + '"') for k, v in attrs) + ">"
        else:
            source = self.get_starttag_text()
        self.parts.append(source)
        if tag == "body": self.in_body = True
        if tag not in self.VOID: self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID: self.stack.pop()

    def handle_endtag(self, tag):
        self.parts.append("</" + tag + ">")
        if tag in self.stack:
            self.stack = self.stack[:len(self.stack) - 1 - self.stack[::-1].index(tag)]
        if tag == "body": self.in_body = False

    def handle_data(self, data):
        if any(tag in self.NATIVE for tag in self.stack):
            self.parts.append(escape(plain_text(unescape(data)))); return
        if not self.in_body or any(tag in self.SKIP for tag in self.stack) or not data.strip():
            self.parts.append(data); return
        # Keep literal URLs and technical identifiers readable, not phonetic.
        if re.fullmatch(r"\s*(?:[0-9a-f]{7,40}|https?://\S+|[\w.+-]+@[\w.-]+|(?:[\w-]+\.)+[a-z]{2,}(?:/\S*)?)\s*", data, re.I):
            self.parts.append(data); return
        index = len(self.texts)
        self.texts.append(unescape(data))
        self.parts.append((index,))

    def handle_entityref(self, name):
        self.handle_data(unescape("&" + name + ";"))

    def handle_charref(self, name):
        self.handle_data(unescape("&#" + name + ";"))

    def handle_comment(self, data): self.parts.append("<!--" + data + "-->")
    def handle_decl(self, decl): self.parts.append("<!" + decl + ">")
    def handle_pi(self, data): self.parts.append("<?" + data + ">")

    def html(self):
        rendered = _request({"action": "render", "texts": self.texts})["html"]
        def part(value):
            if not isinstance(value, tuple): return value
            index = value[0]
            text = self.texts[index]
            # Pure Han text, numbers and uppercase identifiers need no wrapper.
            if not re.search(r"\\|[a-z]", text): return escape(text)
            return ('<span class="kamo-run" data-kamotish-source="' + escape(text, quote=True) + '">'
                    '<span class="kamo-readable">' + escape(plain_text(text)) + '</span>'
                    '<span class="kamo-ink" aria-hidden="true">' + rendered[index] + '</span></span>')
        return "".join(map(part, self.parts))


def render_page(source):
    """Return static HTML. Does not depend on JavaScript to display the language."""
    page = _Page()
    page.feed(source)
    result = page.html()
    version = hashlib.sha256((ROOT / 'dist/assets/kamotish.css').read_bytes()).hexdigest()[:12]
    assets = (f'<link rel="stylesheet" href="/assets/kamotish.css?v={version}">'
              '<script src="/assets/kamotish-renderer.js" defer></script>'
              '<script src="/assets/kamotish-client.js" defer></script>')
    return result.replace("</head>", assets + "</head>", 1)


def finalize_assets():
    """Write the shared glyph sprite and return its glyph/byte statistics."""
    return _request({"action": "finalize"})
