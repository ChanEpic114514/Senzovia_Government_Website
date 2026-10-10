import html
import json
from pathlib import Path


LABELS = {
    "en": (
        "About publication scope", "Read the full policy document",
        "Full policy document", "Back to policy summary",
        "The full policy document is not yet available in this language."
    ),
    "zh-Hans": (
        "了解发布范围", "阅读完整政策文件", "完整政策文件", "返回政策概要",
        "本语言版本的完整政策文件尚未发布。"
    ),
    "zh-Hant": (
        "瞭解發布範圍", "閱讀完整政策文件", "完整政策文件", "返回政策概要",
        "本語言版本的完整政策文件尚未發布。"
    ),
    "ja": (
        "公表範囲について", "政策文書の全文を読む", "政策文書全文", "政策概要に戻る",
        "この言語の政策文書全文は、まだ公表されていません。"
    ),
    "ko": (
        "공개 범위 안내", "정책 문서 전문 읽기", "정책 문서 전문", "정책 개요로 돌아가기",
        "이 언어로 된 정책 문서 전문은 아직 공개되지 않았습니다."
    ),
    "fr": (
        "Portée de la publication", "Lire le document de politique complet",
        "Document de politique complet", "Retour au résumé",
        "Le document complet n’est pas encore disponible dans cette langue."
    ),
    "es": (
        "Alcance de la publicación", "Leer el documento de política completo",
        "Documento de política completo", "Volver al resumen",
        "El documento completo aún no está disponible en este idioma."
    ),
}


def escape(value):
    return html.escape(str(value), quote=True)


def render_policy(root, lang, topic, content):
    root = Path(root)
    source = root / "policies" / topic["id"] / f"{lang}.json"
    document = json.loads(source.read_text(encoding="utf-8")) if source.exists() else {}
    sections = document.get("sections", [])
    labels = LABELS[lang]
    navigation = []
    rendered = []
    searchable = []

    def render_section(section, anchor, level=2):
        heading = section["heading"]
        paragraphs = section.get("paragraphs", [])

        if not isinstance(paragraphs, list) or not all(
            isinstance(p, str) for p in paragraphs
        ):
            raise ValueError(
                f"{source}: paragraphs must be a list of strings"
            )

        body = "".join(
            f"<p>{escape(paragraph)}</p>"
            for paragraph in paragraphs
        )
        searchable.extend([heading, *paragraphs])

        picture = section.get("image")

        if picture:
            src = picture["src"]
            alt = picture["alt"]

            if not src.startswith("/assets/") or not alt.strip():
                raise ValueError(
                    f"{source}: images need an /assets/ path "
                    "and descriptive alt text"
                )

            assets = (root / "dist" / "assets").resolve()
            target = (root / "dist" / src.lstrip("/")).resolve()

            if assets not in target.parents or not target.is_file():
                raise ValueError(
                    f"{source}: image not found or outside assets: {src}"
                )

            caption = picture.get("caption", "")

            body += (
                '<figure class="policy-image">'
                f'<img src="{escape(src)}" alt="{escape(alt)}" '
                'loading="lazy" decoding="async">'
                f'<figcaption>{escape(caption)}</figcaption></figure>'
            )

            searchable.extend([alt, caption])

        subsections = section.get("subsections", [])
        if not isinstance(subsections, list) or (subsections and level >= 3):
            raise ValueError(f"{source}: only one subsection level is supported")

        for child_number, child in enumerate(subsections, 1):
            body += render_section(child, f"{anchor}-{child_number}", level + 1)

        closing = section.get("closing", [])
        if not isinstance(closing, list) or not all(isinstance(p, str) for p in closing):
            raise ValueError(f"{source}: closing must be a list of strings")
        body += "".join(f"<p>{escape(paragraph)}</p>" for paragraph in closing)
        searchable.extend(closing)

        section_class = "article-section" if level == 2 else "policy-subsection"
        return (
            f'<section class="{section_class}" id="{anchor}">'
            f'<h{level}>{escape(heading)}</h{level}>{body}</section>'
        )

    for number, section in enumerate(sections, 1):
        anchor = f"policy-section-{number}"
        navigation.append(
            f'<a href="#{anchor}">'
            f'<span>{number:02}</span>{escape(section["heading"])}</a>'
        )
        subsections = section.get("subsections", [])
        if subsections:
            links = "".join(
                f'<li><a href="#{anchor}-{index}">{escape(child["heading"])}</a></li>'
                for index, child in enumerate(subsections, 1)
            )
            navigation.append(f'<ul class="policy-toc-children">{links}</ul>')
        rendered.append(render_section(section, anchor))

    if not sections:
        rendered.append(
            f'<p class="policy-pending">{escape(labels[4])}</p>'
        )
        searchable.append(labels[4])

    body = (
        '<div class="wrap article-grid policy-document">'
        '<aside class="article-aside"><nav class="toc"'
        f' aria-label="{escape(content["onPage"])}">'
        f'<h2>{escape(content["onPage"])}</h2>'
        f'{"".join(navigation)}</nav></aside>'
        '<article class="article-body">'
        f'<p class="policy-back">'
        f'<a href="/{lang}/{topic["id"]}/">{escape(labels[3])}</a></p>'
        f'{"".join(rendered)}'
        f'<aside class="scope-note">'
        f'<strong>{escape(content["scope"])}</strong>'
        f'<p>{escape(content["scopeText"])}</p>'
        f'<a href="/{lang}/scope/">{escape(labels[0])}</a></aside>'
        '</article></div>'
    )

    return body, " ".join(searchable)
