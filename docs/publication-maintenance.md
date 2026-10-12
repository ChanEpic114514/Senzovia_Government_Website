# Publication versions and search

`policy_versions.json` records versions of the complete education, research and rights policies. Dates reflect recorded source publication, not legislative adoption. The initial records were reconstructed from the substantive seven-language publication commits; earlier placeholder templates are excluded. Versions 1.0 and 1.1 are assigned retrospectively to these recorded text editions.

When publishing a substantive policy revision:

1. Update the relevant language files under `policies/` and review translation consistency.
2. Add an entry to the policy's `history` in `policy_versions.json`, using the actual date, version, change label (`initial` or `revised`), and the commit containing the text revision.
3. Update `updated` and `version` to match the latest entry. Keep `published` unchanged.
4. Run `python3 -X utf8 build.py`, `python3 -X utf8 verify.py`, and `python3 -X utf8 prepare_pages.py`.

The records currently describe coordinated seven-language editions. If translations are released separately in future, introduce per-language version records before assigning a shared update date.

`publication_tools.py` contains the seven-language labels, metadata rendering and search section extraction. Search indexes are generated automatically from existing policy sections. Do not edit generated search JSON files by hand. Search URLs retain query, topic and document-format filters. Section anchors match the existing policy renderer.

The overall website-edition date is separate from policy publication dates and is unchanged by these additions.
