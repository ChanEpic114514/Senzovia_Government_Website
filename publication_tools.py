"""Localized publication metadata and section-level search helpers."""
import html
import json
from pathlib import Path

LABELS = {'en': {'summary': 'Read policy summary',
        'esxSummary': 'Read ESX summary',
        'esxFull': 'Read the full ESX policy',
        'reference': 'Document reference',
        'published': 'Published',
        'updated': 'Last updated',
        'version': 'Version',
        'history': 'Revision history',
        'initial': 'Initial full policy publication.',
        'revised': 'Policy text revised.',
        'dateNote': 'Dates refer to publication records in this repository, not legislative '
                    'adoption.',
        'topic': 'Topic',
        'allTopics': 'All topics',
        'format': 'Document format',
        'allFormats': 'All formats',
        'summaryFormat': 'Policy summary',
        'fullFormat': 'Full policy',
        'recordFormat': 'Information note',
        'searchError': 'Search is temporarily unavailable. Please try again.'},
 'zh-Hans': {'summary': '阅读政策概要',
             'esxSummary': '阅读 ESX 概要',
             'esxFull': '阅读 ESX 完整政策',
             'reference': '文件编号',
             'published': '发布日期',
             'updated': '最后更新',
             'version': '版本',
             'history': '修订记录',
             'initial': '首次发布完整政策。',
             'revised': '修订政策文本。',
             'dateNote': '日期依据本仓库的发布记录，不代表立法通过日期。',
             'topic': '主题',
             'allTopics': '所有主题',
             'format': '文件形式',
             'allFormats': '所有形式',
             'summaryFormat': '政策概要',
             'fullFormat': '完整政策',
             'recordFormat': '资料说明',
             'searchError': '搜索暂时不可用，请重试。'},
 'zh-Hant': {'summary': '閱讀政策概要',
             'esxSummary': '閱讀 ESX 概要',
             'esxFull': '閱讀 ESX 完整政策',
             'reference': '文件編號',
             'published': '發布日期',
             'updated': '最後更新',
             'version': '版本',
             'history': '修訂紀錄',
             'initial': '首次發布完整政策。',
             'revised': '修訂政策文本。',
             'dateNote': '日期依據本倉庫的發布紀錄，不代表立法通過日期。',
             'topic': '主題',
             'allTopics': '所有主題',
             'format': '文件形式',
             'allFormats': '所有形式',
             'summaryFormat': '政策概要',
             'fullFormat': '完整政策',
             'recordFormat': '資料說明',
             'searchError': '搜尋暫時無法使用，請重試。'},
 'ja': {'summary': '政策概要を読む',
        'esxSummary': 'ESX の概要を読む',
        'esxFull': 'ESX 政策全文を読む',
        'reference': '文書番号',
        'published': '公開日',
        'updated': '最終更新日',
        'version': '版',
        'history': '改訂履歴',
        'initial': '政策全文の初回公開。',
        'revised': '政策本文を改訂。',
        'dateNote': '日付はこのリポジトリの公開記録に基づき、法律の成立日を示すものではありません。',
        'topic': '分野',
        'allTopics': 'すべての分野',
        'format': '文書形式',
        'allFormats': 'すべての形式',
        'summaryFormat': '政策概要',
        'fullFormat': '政策全文',
        'recordFormat': '参考資料',
        'searchError': '現在検索を利用できません。再度お試しください。'},
 'ko': {'summary': '정책 개요 읽기',
        'esxSummary': 'ESX 개요 읽기',
        'esxFull': 'ESX 정책 전문 읽기',
        'reference': '문서 번호',
        'published': '공개일',
        'updated': '최종 수정일',
        'version': '버전',
        'history': '개정 이력',
        'initial': '정책 전문 최초 공개.',
        'revised': '정책 본문 개정.',
        'dateNote': '날짜는 이 저장소의 공개 기록을 기준으로 하며 법률의 제정일을 뜻하지 않습니다.',
        'topic': '주제',
        'allTopics': '모든 주제',
        'format': '문서 형식',
        'allFormats': '모든 형식',
        'summaryFormat': '정책 개요',
        'fullFormat': '정책 전문',
        'recordFormat': '안내 문서',
        'searchError': '현재 검색을 사용할 수 없습니다. 다시 시도해 주세요.'},
 'fr': {'summary': 'Lire le résumé de la politique',
        'esxSummary': 'Lire le résumé ESX',
        'esxFull': 'Lire la politique ESX complète',
        'reference': 'Référence du document',
        'published': 'Date de publication',
        'updated': 'Dernière mise à jour',
        'version': 'Version',
        'history': 'Historique des révisions',
        'initial': 'Première publication de la politique complète.',
        'revised': 'Révision du texte de la politique.',
        'dateNote': 'Les dates correspondent aux publications dans ce dépôt, et non à une adoption '
                    'législative.',
        'topic': 'Thème',
        'allTopics': 'Tous les thèmes',
        'format': 'Format du document',
        'allFormats': 'Tous les formats',
        'summaryFormat': 'Résumé de politique',
        'fullFormat': 'Politique complète',
        'recordFormat': 'Note d’information',
        'searchError': 'La recherche est temporairement indisponible. Veuillez réessayer.'},
 'es': {'summary': 'Leer el resumen de la política',
        'esxSummary': 'Leer el resumen de ESX',
        'esxFull': 'Leer la política ESX completa',
        'reference': 'Referencia del documento',
        'published': 'Fecha de publicación',
        'updated': 'Última actualización',
        'version': 'Versión',
        'history': 'Historial de revisiones',
        'initial': 'Primera publicación de la política completa.',
        'revised': 'Revisión del texto de la política.',
        'dateNote': 'Las fechas corresponden a publicaciones en este repositorio, no a la '
                    'aprobación legislativa.',
        'topic': 'Tema',
        'allTopics': 'Todos los temas',
        'format': 'Formato del documento',
        'allFormats': 'Todos los formatos',
        'summaryFormat': 'Resumen de política',
        'fullFormat': 'Política completa',
        'recordFormat': 'Nota informativa',
        'searchError': 'La búsqueda no está disponible temporalmente. Inténtelo de nuevo.'}}
VERSIONS = json.loads((Path(__file__).parent / "policy_versions.json").read_text(encoding="utf-8"))


def metadata_html(lang, topic, content):
    labels = LABELS[lang]
    record = VERSIONS[topic]
    escape = lambda value: html.escape(str(value), quote=True)
    fields = [(labels["reference"], record["reference"]),
              (labels["published"], record["published"]),
              (labels["updated"], record["updated"]),
              (labels["version"], record["version"]),
              (content["status"], content["proposal"])]
    rows = "".join(f"<div><dt>{escape(label)}</dt><dd>{escape(value)}</dd></div>" for label, value in fields)
    history = "".join(
        f'<li><time datetime="{escape(item["date"])}">{escape(item["date"])}</time> '
        f'— {escape(labels["version"])} {escape(item["version"])}: '
        f'{escape(labels[item["change"]])} '
        f'<a href="https://github.com/ChanEpic114514/Senzovia_Government_Website/commit/{item["commit"]}">'
        f'{escape(item["commit"][:7])}</a></li>' for item in record["history"]
    )
    return (f'<section class="policy-version" aria-label="{escape(labels["history"])}">'
            f'<dl>{rows}</dl><details><summary>{escape(labels["history"])}</summary>'
            f'<ol>{history}</ol><p>{escape(labels["dateNote"])}</p></details></section>')


def search_sections(root, lang, topic):
    source = Path(root) / "policies" / topic / f"{lang}.json"
    document = json.loads(source.read_text(encoding="utf-8"))
    records = []
    def visit(section, anchor):
        picture = section.get("image") or {}
        parts = [*section.get("paragraphs", []), *section.get("items", []),
                 *section.get("closing", []), picture.get("alt", ""), picture.get("caption", "")]
        records.append({"anchor": anchor, "heading": section["heading"], "text": " ".join(parts)})
        for number, child in enumerate(section.get("subsections", []), 1):
            visit(child, f"{anchor}-{number}")
    for number, section in enumerate(document.get("sections", []), 1):
        visit(section, f"policy-section-{number}")
    return records


def search_controls(lang, content):
    labels = LABELS[lang]
    escape = lambda value: html.escape(str(value), quote=True)
    topics = '<option value="">' + escape(labels["allTopics"]) + '</option>'
    topics += ''.join(f'<option value="{escape(t["id"])}">{escape(t["title"])}</option>' for t in content["topics"])
    formats = ''.join(f'<option value="{value}">{escape(labels[key])}</option>' for value, key in
                      [("", "allFormats"), ("summary", "summaryFormat"), ("full", "fullFormat"), ("record", "recordFormat")])
    return (f'<div class="search-facets"><label for="search-topic">{escape(labels["topic"])}'
            f'<select id="search-topic">{topics}</select></label>'
            f'<label for="search-format">{escape(labels["format"])}'
            f'<select id="search-format">{formats}</select></label></div>'
            '<script type="application/json" id="search-extra-labels">' + json.dumps(labels, ensure_ascii=False) + '</script>')
