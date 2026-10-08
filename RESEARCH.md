# Senzovia — pre-implementation research

Reviewed 2026-10-03 before first product-source implementation. Successful national sources: 21. Inaccessible Irish, Japanese and Icelandic homepages and thin Portuguese output were excluded from the count. Australia.gov.au redirected, so PM&C was read instead.

| Country | Official source | Observed structure and adaptation |
|---|---|---|
| United Kingdom | https://www.gov.uk/ | Topic-led services; clear separation of policy, guidance and transparency. |
| United States | https://www.usa.gov/ | Plain-language task labels and a compact topic directory. |
| Canada | https://www.canada.ca/en.html | Consistent topic hierarchy, bilingual identity and page details. |
| Singapore | https://www.gov.sg/ | Clear government identity, policy explainers and featured information. |
| New Zealand | https://www.govt.nz/ | Life-event groupings with short descriptive link labels. |
| Australia | https://www.pmc.gov.au/ | Distinct areas for policy, accountability and national symbols. |
| France | https://www.info.gouv.fr/ | Thematic dossiers, public-information features and display controls. |
| Germany | https://www.bundesregierung.de/breg-en | Government, news and service sections; dated article summaries. |
| Netherlands | https://www.government.nl/ | Topic index, concise summaries and separation of news and government. |
| Belgium | https://www.belgium.be/en | Visible language options and nested service categories. |
| Switzerland | https://www.ch.ch/en/ | Question-oriented information and conspicuous search/language entry points. |
| Austria | https://www.oesterreich.gv.at/en | Accessible shortcuts and commonly requested subjects. |
| Sweden | https://www.government.se/ | Separate policy areas, document types and governance explanations. |
| Norway | https://www.regjeringen.no/en/id4/ | Explicit distinction between proposals, white papers, reports and law. |
| Finland | https://valtioneuvosto.fi/en/frontpage | Multilingual navigation, dated releases and current-issue sections. |
| Denmark | https://www.borger.dk/ | Life situations, shortcuts and topic-based information architecture. |
| South Korea | https://www.korea.kr/ | Policy briefings organised by topic, department and content format. |
| Spain | https://www.lamoncloa.gob.es/ | Clear institutional sections and differentiated government publications. |
| South Africa | https://www.gov.za/ | Separate service, document and statement directories. |
| Brazil | https://www.gov.br/pt-br | Audience-specific navigation and prominent access-to-information links. |
| Poland | https://www.gov.pl/web/gov | Search-led access, topic categories and audience-specific service grouping. |

## Design synthesis
Topic-first navigation; content-status labels; publication metadata; persistent seven-language selector; national-symbol page; high-contrast typography; keyboard-accessible disclosure controls. The flag is copied byte-for-byte, never drawn in CSS or SVG. Visual source review used extracted page structures, not screenshot-based pixel analysis.

## Open-source research
- https://github.com/alphagov/govuk-frontend — reviewed navigation and accessibility approach.
- https://github.com/uswds/uswds/blob/develop/packages/usa-accordion/src/index.js — source read directly before implementation; adopted the linked aria-controls/aria-expanded, single-open disclosure behaviour, independently implemented without vendoring its CommonJS dependency graph.
- https://github.com/motiondivision/motion/blob/main/packages/motion/README.md — reviewed animation and view-transition examples. Native CSS/WAAPI chosen for this static site; Motion is not shipped.

## Content provenance
User-confirmed: Senzovia name, supplied flag, post-war state, national goals not yet confirmed achieved. User educational proposals: five upper-secondary subjects, at least two languages, voluntary extracurricular research or fifth research subject, nationality-neutral admissions, low-income activity support, academics before activities for university selection. Other programme text is explicitly proposed policy based on user interests and values, not enacted national law. No biography, personal school records, financial details or private conversations are published. Historical Chinese state name not asserted as current. No invented flag symbolism, capital, population, leaders, constitution, budgets, geographical claims or diplomatic recognition.

## Editions
English, Simplified Chinese, Traditional Chinese, Japanese, Korean, French and Spanish. Traditional Chinese converted using OpenCC s2twp and retained as a checked-in editable source file; remaining editions independently authored.
