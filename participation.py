"""Render contact and public consultation pages for the static website."""

from html import escape

EMAIL = "Senzovians@gmail.com"
ENDPOINT = f"https://formsubmit.co/{EMAIL}"
CONSULTATION_OPEN = True
POLICY_IDS = ("education", "research", "rights")

TEXT = {
    "en": {
        "contact": "Contact and feedback",
        "consultation": "Public consultation",
        "contact_intro": "Contact the website operator, report a website problem or submit a policy comment.",
        "consultation_intro": "Submit views on the proposed education, science and equal opportunity policies.",
        "process": "How submissions are handled",
        "contact_process": "Messages are reviewed by the website operator. A reply is not guaranteed and no response deadline is specified. Include an email address if you would like a reply.",
        "consultation_process": "This is an open-ended consultation with no closing date currently set. Submissions inform policy review; they are not votes and do not guarantee adoption. Any future response summary will be published here. No publication date is currently set.",
        "closed": "This consultation is closed. You can still use the contact page.",
        "read": "Read the policies before submitting",
        "required": "Fields marked * are required. Name and email are optional.",
        "name": "Name or pseudonym",
        "email": "Email for a reply",
        "category": "Category",
        "categories": ["General enquiry", "Website problem", "Policy comment"],
        "subject": "Subject",
        "message": "Message",
        "policy": "Policy",
        "choose": "Please select",
        "section": "Relevant section or paragraph",
        "position": "Which provision do you support or question, and why?",
        "change": "What change would you propose?",
        "evidence": "What evidence, experience or possible effects should be considered?",
        "privacy": "Handling your information",
        "notice": "Submitting sends the entered information through FormSubmit to Senzovians@gmail.com, hosted by Gmail. These services process submissions under their own policies. Messages are kept in the contact mailbox for review and follow-up; deletion requests can be sent to the same address. Submissions are not published automatically. Avoid sensitive personal information and other people's private details.",
        "consent": "I have read the information-handling notice and agree to send this submission through FormSubmit.",
        "quote": "I permit excerpts of my comments to be quoted without my name or email in a public consultation summary. This is optional.",
        "send": "Submit",
        "handoff": "The next step opens FormSubmit for verification and submission confirmation. If submission fails, contact us by email.",
        "direct": "Email directly",
        "provider": "FormSubmit privacy information",
        "google": "Google privacy information",
        "base_privacy": "This website offers contact and consultation forms, but no user accounts or payment services. Search runs locally in your browser. Language and motion preferences are stored on this device. Hosting providers may process technical access information. Merely reading these pages does not send a form submission."
    },
    "zh-Hans": {
        "contact": "联系与反馈",
        "consultation": "公众咨询",
        "contact_intro": "联系网站运营者、报告网站问题或提交政策意见。",
        "consultation_intro": "就拟议的教育、科学研究及机会平等政策提交意见。",
        "process": "意见处理方式",
        "contact_process": "信息由网站运营者查阅。不保证逐一回复，目前未设回复时限。如需回复，请留下邮箱。",
        "consultation_process": "本次咨询持续开放，目前未设截止日期。意见用于政策审议，不属于投票，也不保证被采纳。后续如发布回应摘要，将在本页提供；目前未设发布日期。",
        "closed": "本次咨询已结束。你仍可通过联系页面提交信息。",
        "read": "提交前阅读相关政策",
        "required": "标有 * 的项目为必填项。姓名与邮箱均为选填项。",
        "name": "姓名或化名",
        "email": "接收回复的邮箱",
        "category": "信息类别",
        "categories": ["一般咨询", "网站问题", "政策意见"],
        "subject": "主题",
        "message": "信息内容",
        "policy": "相关政策",
        "choose": "请选择",
        "section": "相关章节或条款",
        "position": "你支持或质疑哪些规定？理由是什么？",
        "change": "你建议作出什么修改？",
        "evidence": "有哪些证据、经历或可能影响值得考虑？",
        "privacy": "信息处理说明",
        "notice": "提交后，填写的信息将经 FormSubmit 转发至由 Gmail 托管的 Senzovians@gmail.com。相关服务依各自政策处理信息。信息保留于联系邮箱，用于查阅及后续处理；可向同一邮箱提出删除请求。提交内容不会自动公开。请勿填写敏感个人信息或他人的隐私资料。",
        "consent": "我已阅读信息处理说明，同意通过 FormSubmit 发送本次提交内容。",
        "quote": "我允许在公众咨询摘要中引用我的部分意见，并隐去姓名与邮箱。此项自愿选择。",
        "send": "提交",
        "handoff": "下一步将前往 FormSubmit 完成验证并查看提交确认。如提交失败，可直接发送电子邮件。",
        "direct": "直接发送电子邮件",
        "provider": "FormSubmit 隐私说明",
        "google": "Google 隐私说明",
        "base_privacy": "本网站提供联系与公众咨询表单，不提供用户账户或付款服务。搜索在浏览器中执行，语言与动态效果偏好保存在本设备。托管服务商可能处理技术访问记录。仅浏览这些页面不会发送表单内容。"
    },
    "zh-Hant": {
        "contact": "聯絡與意見回饋",
        "consultation": "公眾諮詢",
        "contact_intro": "聯絡網站營運者、回報網站問題或提交政策意見。",
        "consultation_intro": "就擬議的教育、科學研究及機會平等政策提交意見。",
        "process": "意見處理方式",
        "contact_process": "資訊由網站營運者查閱。不保證逐一回覆，目前未設回覆時限。如需回覆，請留下電子郵件地址。",
        "consultation_process": "本次諮詢持續開放，目前未設截止日期。意見用於政策審議，不屬於投票，也不保證獲採納。後續如發布回應摘要，將在本頁提供；目前未設發布日期。",
        "closed": "本次諮詢已結束。你仍可透過聯絡頁面提交資訊。",
        "read": "提交前閱讀相關政策",
        "required": "標有 * 的項目為必填項。姓名與電子郵件均為選填項。",
        "name": "姓名或化名",
        "email": "接收回覆的電子郵件地址",
        "category": "訊息類別",
        "categories": ["一般詢問", "網站問題", "政策意見"],
        "subject": "主旨",
        "message": "訊息內容",
        "policy": "相關政策",
        "choose": "請選擇",
        "section": "相關章節或條款",
        "position": "你支持或質疑哪些規定？理由是什麼？",
        "change": "你建議作出什麼修改？",
        "evidence": "有哪些證據、經歷或可能影響值得考慮？",
        "privacy": "資訊處理說明",
        "notice": "提交後，填寫的資訊將經 FormSubmit 轉寄至由 Gmail 託管的 Senzovians@gmail.com。相關服務依各自政策處理資訊。資訊保留於聯絡信箱，用於查閱及後續處理；可向同一信箱提出刪除請求。提交內容不會自動公開。請勿填寫敏感個人資訊或他人的隱私資料。",
        "consent": "我已閱讀資訊處理說明，同意透過 FormSubmit 傳送本次提交內容。",
        "quote": "我允許在公眾諮詢摘要中引用我的部分意見，並隱去姓名與電子郵件地址。此項自願選擇。",
        "send": "提交",
        "handoff": "下一步將前往 FormSubmit 完成驗證並查看提交確認。如提交失敗，可直接傳送電子郵件。",
        "direct": "直接傳送電子郵件",
        "provider": "FormSubmit 隱私說明",
        "google": "Google 隱私說明",
        "base_privacy": "本網站提供聯絡與公眾諮詢表單，不提供使用者帳戶或付款服務。搜尋在瀏覽器中執行，語言與動態效果偏好儲存在本裝置。託管服務商可能處理技術存取紀錄。僅瀏覽這些頁面不會傳送表單內容。"
    },
    "ja": {
        "contact": "お問い合わせ・ご意見",
        "consultation": "政策への意見募集",
        "contact_intro": "サイト運営者へのお問い合わせ、不具合の報告、政策へのご意見を受け付けます。",
        "consultation_intro": "教育、科学研究、機会均等に関する政策案へのご意見をお寄せください。",
        "process": "ご意見の取り扱い",
        "contact_process": "サイト運営者が内容を確認します。個別の返信は保証されず、返信期限も設けていません。返信をご希望の場合はメールアドレスをご記入ください。",
        "consultation_process": "現在、締切を設けずに意見を募集しています。ご意見は政策検討の参考とし、投票としては扱わず、採用を保証するものでもありません。今後、回答の概要を公表する場合はこのページに掲載します。公表日は未定です。",
        "closed": "この意見募集は終了しました。お問い合わせページは引き続きご利用いただけます。",
        "read": "提出前に政策をご確認ください",
        "required": "* は必須項目です。氏名とメールアドレスは任意です。",
        "name": "氏名またはペンネーム",
        "email": "返信用メールアドレス",
        "category": "お問い合わせの種類",
        "categories": ["一般的なお問い合わせ", "サイトの不具合", "政策への意見"],
        "subject": "件名",
        "message": "内容",
        "policy": "対象の政策",
        "choose": "選択してください",
        "section": "関連する章・条項",
        "position": "支持する、または疑問を持つ規定と、その理由をお書きください。",
        "change": "どのような変更を提案しますか。",
        "evidence": "考慮すべき根拠、経験、予想される影響はありますか。",
        "privacy": "情報の取り扱い",
        "notice": "入力情報は FormSubmit を経由し、Gmail のメールボックス Senzovians@gmail.com に送信されます。各サービスは独自の方針に従って情報を処理します。内容は確認と対応のためメールボックスに保存されます。削除の依頼は同じアドレスにお送りください。自動的に公開されることはありません。機微な個人情報や他人の私的情報は記入しないでください。",
        "consent": "情報の取り扱いを確認し、FormSubmit を通じた送信に同意します。",
        "quote": "氏名とメールアドレスを伏せたうえで、意見募集の公開概要にコメントの一部を引用することを許可します。任意です。",
        "send": "送信",
        "handoff": "次に FormSubmit で認証と送信確認を行います。送信できない場合はメールでご連絡ください。",
        "direct": "メールで直接連絡",
        "provider": "FormSubmit のプライバシー方針",
        "google": "Google のプライバシー方針",
        "base_privacy": "本サイトには問い合わせ・意見募集フォームがありますが、利用者アカウントや決済サービスはありません。検索はブラウザ内で行われ、言語と動作の設定は端末に保存されます。ホスティング事業者が技術的なアクセス情報を処理する場合があります。閲覧するだけではフォームは送信されません。"
    },
    "ko": {
        "contact": "문의 및 의견",
        "consultation": "정책 의견 수렴",
        "contact_intro": "웹사이트 운영자에게 문의하거나 웹사이트 문제 및 정책 의견을 제출할 수 있습니다.",
        "consultation_intro": "교육, 과학 연구, 기회 평등 정책안에 대한 의견을 제출해 주세요.",
        "process": "의견 처리 방법",
        "contact_process": "웹사이트 운영자가 내용을 검토합니다. 개별 답변은 보장되지 않으며 답변 기한도 정해져 있지 않습니다. 답변을 원하면 이메일 주소를 남겨 주세요.",
        "consultation_process": "현재 마감일 없이 의견을 받고 있습니다. 의견은 정책 검토에 활용되며 투표로 간주되지 않고 채택이 보장되지 않습니다. 향후 검토 결과 요약을 공개하는 경우 이 페이지에 게시합니다. 게시일은 아직 정해지지 않았습니다.",
        "closed": "이번 의견 수렴은 종료되었습니다. 문의 페이지는 계속 이용할 수 있습니다.",
        "read": "제출 전에 정책 읽기",
        "required": "* 표시는 필수 항목입니다. 이름과 이메일은 선택 사항입니다.",
        "name": "이름 또는 가명",
        "email": "답변받을 이메일",
        "category": "문의 유형",
        "categories": ["일반 문의", "웹사이트 문제", "정책 의견"],
        "subject": "제목",
        "message": "내용",
        "policy": "관련 정책",
        "choose": "선택해 주세요",
        "section": "관련 장 또는 조항",
        "position": "어떤 규정을 지지하거나 의문을 제기하며, 그 이유는 무엇입니까?",
        "change": "어떤 변경을 제안합니까?",
        "evidence": "고려해야 할 근거, 경험 또는 예상 영향은 무엇입니까?",
        "privacy": "정보 처리 안내",
        "notice": "입력한 정보는 FormSubmit을 거쳐 Gmail에서 운영되는 Senzovians@gmail.com으로 전송됩니다. 각 서비스는 자체 정책에 따라 정보를 처리합니다. 내용은 검토와 후속 처리를 위해 문의 메일함에 보관되며 같은 주소로 삭제를 요청할 수 있습니다. 제출 내용은 자동 공개되지 않습니다. 민감한 개인정보나 타인의 사적 정보를 입력하지 마세요.",
        "consent": "정보 처리 안내를 읽었으며 FormSubmit을 통한 제출에 동의합니다.",
        "quote": "이름과 이메일을 제외한 의견 일부를 공개 의견 수렴 요약에 인용하는 것을 허용합니다. 선택 사항입니다.",
        "send": "제출",
        "handoff": "다음 단계에서는 FormSubmit에서 인증 및 제출 확인을 진행합니다. 제출에 실패하면 이메일로 문의해 주세요.",
        "direct": "이메일로 직접 문의",
        "provider": "FormSubmit 개인정보 안내",
        "google": "Google 개인정보 안내",
        "base_privacy": "이 웹사이트는 문의 및 의견 수렴 양식을 제공하지만 사용자 계정이나 결제 서비스는 제공하지 않습니다. 검색은 브라우저에서 실행되며 언어 및 동작 설정은 기기에 저장됩니다. 호스팅 업체가 기술적 접속 정보를 처리할 수 있습니다. 페이지를 보는 것만으로 양식이 제출되지는 않습니다."
    },
    "fr": {
        "contact": "Contact et observations",
        "consultation": "Consultation publique",
        "contact_intro": "Contactez le responsable du site, signalez un problème ou formulez une observation sur une politique.",
        "consultation_intro": "Donnez votre avis sur les propositions relatives à l’éducation, à la recherche et à l’égalité des chances.",
        "process": "Traitement des contributions",
        "contact_process": "Le responsable du site examine les messages. Une réponse individuelle n’est pas garantie et aucun délai de réponse n’est fixé. Indiquez votre adresse électronique si vous souhaitez une réponse.",
        "consultation_process": "Cette consultation est ouverte sans date de clôture fixée. Les contributions éclairent l’examen des politiques ; elles ne constituent pas un vote et leur adoption n’est pas garantie. Toute future synthèse des réponses sera publiée ici. Aucune date de publication n’est fixée.",
        "closed": "Cette consultation est close. La page de contact reste disponible.",
        "read": "Lire les politiques avant de contribuer",
        "required": "Les champs marqués * sont obligatoires. Le nom et l’adresse électronique sont facultatifs.",
        "name": "Nom ou pseudonyme",
        "email": "Adresse électronique pour la réponse",
        "category": "Catégorie",
        "categories": ["Demande générale", "Problème du site", "Observation sur une politique"],
        "subject": "Objet",
        "message": "Message",
        "policy": "Politique concernée",
        "choose": "Veuillez sélectionner",
        "section": "Section ou disposition concernée",
        "position": "Quelle disposition soutenez-vous ou contestez-vous, et pourquoi ?",
        "change": "Quelle modification proposez-vous ?",
        "evidence": "Quels éléments, expériences ou effets possibles devraient être examinés ?",
        "privacy": "Traitement de vos informations",
        "notice": "Les informations saisies transitent par FormSubmit vers Senzovians@gmail.com, une boîte hébergée par Gmail. Ces services appliquent leurs propres politiques. Les messages sont conservés dans cette boîte pour examen et suivi ; une demande de suppression peut être envoyée à la même adresse. Aucune contribution n’est publiée automatiquement. Évitez les données personnelles sensibles et les informations privées sur autrui.",
        "consent": "J’ai lu la notice et j’accepte la transmission de cette contribution par FormSubmit.",
        "quote": "J’autorise la citation d’extraits de mes observations, sans mon nom ni mon adresse électronique, dans une synthèse publique. Ce choix est facultatif.",
        "send": "Envoyer",
        "handoff": "L’étape suivante ouvre FormSubmit pour la vérification et la confirmation d’envoi. En cas d’échec, contactez-nous par courriel.",
        "direct": "Écrire directement par courriel",
        "provider": "Confidentialité chez FormSubmit",
        "google": "Confidentialité chez Google",
        "base_privacy": "Ce site propose des formulaires de contact et de consultation, mais aucun compte utilisateur ni service de paiement. La recherche s’exécute dans le navigateur. Les préférences de langue et d’animation sont stockées sur cet appareil. L’hébergeur peut traiter des données techniques d’accès. La simple consultation des pages n’envoie aucun formulaire."
    },
    "es": {
        "contact": "Contacto y comentarios",
        "consultation": "Consulta pública",
        "contact_intro": "Contacte con el responsable del sitio, informe de un problema o envíe comentarios sobre una política.",
        "consultation_intro": "Envíe sus opiniones sobre las propuestas de educación, investigación e igualdad de oportunidades.",
        "process": "Tratamiento de las aportaciones",
        "contact_process": "El responsable del sitio revisa los mensajes. No se garantiza una respuesta individual ni se establece un plazo de respuesta. Indique su correo si desea recibir una respuesta.",
        "consultation_process": "Esta consulta permanece abierta sin una fecha de cierre fijada. Las aportaciones sirven para revisar las políticas; no son votos ni garantizan su adopción. Cualquier futuro resumen de respuestas se publicará aquí. Aún no hay fecha de publicación.",
        "closed": "Esta consulta ha finalizado. La página de contacto sigue disponible.",
        "read": "Lea las políticas antes de participar",
        "required": "Los campos con * son obligatorios. El nombre y el correo electrónico son opcionales.",
        "name": "Nombre o seudónimo",
        "email": "Correo electrónico para la respuesta",
        "category": "Categoría",
        "categories": ["Consulta general", "Problema del sitio", "Comentario sobre una política"],
        "subject": "Asunto",
        "message": "Mensaje",
        "policy": "Política",
        "choose": "Seleccione una opción",
        "section": "Sección o disposición pertinente",
        "position": "¿Qué disposición apoya o cuestiona, y por qué?",
        "change": "¿Qué modificación propone?",
        "evidence": "¿Qué pruebas, experiencias o posibles efectos deberían considerarse?",
        "privacy": "Tratamiento de su información",
        "notice": "La información introducida se envía mediante FormSubmit a Senzovians@gmail.com, alojado en Gmail. Estos servicios aplican sus propias políticas. Los mensajes se conservan en ese buzón para su revisión y seguimiento; puede solicitar su eliminación escribiendo a la misma dirección. Las aportaciones no se publican automáticamente. Evite datos personales sensibles e información privada de otras personas.",
        "consent": "He leído el aviso y acepto enviar esta aportación mediante FormSubmit.",
        "quote": "Autorizo que se citen fragmentos de mis comentarios sin mi nombre ni correo en un resumen público de la consulta. Es opcional.",
        "send": "Enviar",
        "handoff": "El siguiente paso abre FormSubmit para la verificación y confirmación del envío. Si falla, contacte por correo electrónico.",
        "direct": "Enviar un correo directamente",
        "provider": "Privacidad de FormSubmit",
        "google": "Privacidad de Google",
        "base_privacy": "Este sitio ofrece formularios de contacto y consulta, pero no cuentas de usuario ni pagos. La búsqueda se ejecuta en el navegador. Las preferencias de idioma y animación se guardan en este dispositivo. El proveedor de alojamiento puede procesar información técnica de acceso. Visitar estas páginas no envía un formulario."
    },
}


def esc(value):
    return escape(str(value), quote=True)


def footer_links(lang):
    labels = TEXT[lang]
    return "".join(
        f'<a href="/{lang}/{route}/">{esc(labels[route])}</a>'
        for route in ("contact", "consultation")
    )


def privacy_text(lang):
    labels = TEXT[lang]
    return labels["base_privacy"] + " " + labels["notice"]


def field(labels, name, key, required=False, kind="text", limit=200):
    marker = " *" if required else ""
    attributes = f'id="participation-{name}" name="{name}"'
    attributes += ' required' if required else ''
    attributes += f' maxlength="{limit}"'
    if kind == "textarea":
        control = f'<textarea {attributes} rows="6"></textarea>'
    else:
        autocomplete = {"name": "name", "email": "email"}.get(name, "off")
        control = f'<input {attributes} type="{kind}" autocomplete="{autocomplete}">'
    return (
        '<div class="participation-field">'
        f'<label for="participation-{name}">{esc(labels[key])}{marker}</label>'
        f'{control}</div>'
    )


def select_field(labels, name, key, choices):
    options = f'<option value="" disabled selected>{esc(labels["choose"])}</option>'
    options += "".join(
        f'<option value="{esc(value)}">{esc(label)}</option>'
        for value, label in choices
    )
    return (
        '<div class="participation-field">'
        f'<label for="participation-{name}">{esc(labels[key])} *</label>'
        f'<select id="participation-{name}" name="{name}" required>'
        f'{options}</select></div>'
    )


def render_participation(lang, content, route):
    labels = TEXT[lang]
    consultation = route == "consultation"
    title = labels[route]
    description = labels[route + "_intro"]
    explanation = labels[route + "_process"]
    topics = [topic for topic in content["topics"] if topic["id"] in POLICY_IDS]

    policy_links = ""
    if consultation:
        policy_links = f'<h2>{esc(labels["read"])}</h2><ul>'
        policy_links += "".join(
            f'<li><a href="/{lang}/{topic["id"]}-full/">'
            f'{esc(topic["title"])}</a></li>'
            for topic in topics
        )
        policy_links += "</ul>"
        if not CONSULTATION_OPEN:
            explanation = labels["closed"]

    fields = '<div class="participation-pair">'
    fields += field(labels, "name", "name", limit=100)
    fields += field(labels, "email", "email", kind="email", limit=254)
    fields += "</div>"

    if consultation:
        fields += select_field(
            labels, "policy", "policy",
            [(topic["id"], topic["title"]) for topic in topics]
        )
        fields += field(labels, "section", "section")
        fields += field(labels, "position", "position", True, "textarea", 6000)
        fields += field(labels, "change", "change", False, "textarea", 6000)
        fields += field(labels, "evidence", "evidence", False, "textarea", 6000)
        fields += (
            '<label class="participation-check">'
            '<input type="checkbox" name="quotation_permission" value="Granted">'
            f'<span>{esc(labels["quote"])}</span></label>'
        )
    else:
        fields += select_field(
            labels, "category", "category",
            list(zip(("general", "website", "policy"), labels["categories"]))
        )
        fields += field(labels, "subject", "subject", True)
        fields += field(labels, "message", "message", True, "textarea", 10000)

    form = (
        f'<form class="participation-form" action="{esc(ENDPOINT)}" method="POST" '
        'accept-charset="UTF-8" aria-describedby="participation-required participation-notice">'
        f'<input type="hidden" name="_subject" value="[Senzovia | {route}] {lang}">'
        '<input type="hidden" name="_template" value="table">'
        f'<input type="hidden" name="language" value="{lang}">'
        f'<input type="hidden" name="channel" value="{route}">'
        '<input type="hidden" name="notice_version" value="2026-10-13">'
        '<input class="participation-honey" type="text" name="_honey" '
        'tabindex="-1" autocomplete="off" aria-hidden="true">'
        f'<p id="participation-required">{esc(labels["required"])}</p>'
        f'{fields}'
        '<section class="participation-notice" aria-labelledby="participation-privacy">'
        f'<h2 id="participation-privacy">{esc(labels["privacy"])}</h2>'
        f'<p id="participation-notice">{esc(labels["notice"])}</p>'
        '<p class="participation-provider-links">'
        f'<a href="https://formsubmit.co/privacy.pdf">{esc(labels["provider"])}</a>'
        f'<a href="https://policies.google.com/privacy">{esc(labels["google"])}</a>'
        '</p></section>'
        '<label class="participation-check">'
        '<input type="checkbox" name="handling_acknowledged" value="Yes" required>'
        f'<span>{esc(labels["consent"])} *</span></label>'
        f'<p class="participation-handoff">{esc(labels["handoff"])}</p>'
        f'<button class="button dark" type="submit">{esc(labels["send"])}</button>'
        '</form>'
    )
    if consultation and not CONSULTATION_OPEN:
        form = ""

    body = (
        '<div class="wrap participation-layout">'
        '<aside class="participation-aside">'
        f'<h2>{esc(labels["process"])}</h2><p>{esc(explanation)}</p>'
        f'{policy_links}'
        f'<h2>{esc(labels["direct"])}</h2>'
        f'<a href="mailto:{EMAIL}">{EMAIL}</a>'
        f'<nav aria-label="{esc(title)}">{footer_links(lang)}</nav>'
        f'</aside>{form}</div>'
    )
    return title, description, body
