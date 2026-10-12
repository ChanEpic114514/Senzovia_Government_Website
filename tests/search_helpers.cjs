'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('dist/assets/site.js', 'utf8');
const start = code.indexOf(' const normalise =');
const end = code.indexOf(' function render()', start);
const scope = {};
vm.runInNewContext(code.slice(start, end) + '\nthis.helpers = {normalise, matchRanges, excerpt, bestSection};', scope);
const {normalise, matchRanges, excerpt, bestSection} = scope.helpers;
assert.equal(normalise('ÉGALITÉ'), 'egalite');
for (const [source, query] of [['Égalité', 'egalite'], ['科研机会', '科研'], ['과학 연구', '과학'], ['ＡＩ policy', 'ai']]) {
 const ranges = matchRanges(source, [normalise(query)]);
 assert.equal(ranges.length, 1);
 assert.equal(normalise(source.slice(...ranges[0])), normalise(query));
}
assert.equal(matchRanges('education', ['edu', 'education']).length, 1);
assert.equal(excerpt('A'.repeat(400) + 'endowment', ['endowment']).includes('endowment'), true);
const records = JSON.parse(fs.readFileSync('dist/assets/search-en.json', 'utf8'));
const education = records.find(d => d.code === 'P-01-FULL');
assert.equal(bestSection(education, ['global', 'education', 'endowment']).anchor, 'policy-section-2-20');
assert.equal(bestSection(education, []), null);
const funding = bestSection(education, ['global', 'education', 'endowment']);
assert.ok(excerpt(funding.text, ['global', 'education', 'endowment']).includes('Global Education Endowment'));
console.log('Search helpers passed: Latin accents, CJK, Korean, full-width text, excerpts and real section target.');
