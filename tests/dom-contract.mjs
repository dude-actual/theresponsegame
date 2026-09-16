import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('trg-v13-ui-fixed.js','utf8');
const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));
const dynamic=new Set(['globalAudioBtn','missionBoard','intelFeed','coachCard','toastRail','gameAudioBtn']);
const refs=[...ui.matchAll(/(?<!\$)\$\('([^']+)'\)/g)].map(m=>m[1]);
const selectorMisuse=refs.filter(x=>x.startsWith('.')||x.startsWith('#')||x.includes(' '));
assert.deepEqual(selectorMisuse,[],'$() is getElementById and must not receive CSS selectors');
const missing=[...new Set(refs.filter(x=>!ids.has(x)&&!dynamic.has(x)))];
assert.deepEqual(missing,[],'Every static $() ID reference must exist in index.html or be a documented dynamic node');
assert.match(html,/trg-v13-ui-fixed\.js\?v=13\.0\.0-rc1\.1/,'production loads corrected v13 UI');
assert.doesNotMatch(html,/trg-v12-ui\.js/,'production must not load legacy v12 UI controller');
console.log(`DOM contract passed: ${ids.size} document IDs, ${new Set(refs).size} UI ID references.`);
