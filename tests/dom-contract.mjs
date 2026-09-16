import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('trg-v14-ui.js','utf8');
const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));
const dynamic=new Set(['globalAudioBtn','missionBoard','coachCard','toastRail','gameAudioBtn']);
const refs=[...ui.matchAll(/(?<!\$)\$\('([^']+)'\)/g)].map(m=>m[1]);
const selectorMisuse=refs.filter(x=>x.startsWith('.')||x.startsWith('#')||x.includes(' '));
assert.deepEqual(selectorMisuse,[],'$() is getElementById and must not receive CSS selectors');
const missing=[...new Set(refs.filter(x=>!ids.has(x)&&!dynamic.has(x)))];
assert.deepEqual(missing,[],'Every static $() ID reference must exist in index.html or be a documented dynamic node');
assert.match(html,/trg-v14-ui\.js\?v=14\.0\.0-rc1/,'production loads v14 UI');
assert.match(html,/trg-v14\.css\?v=14\.0\.0-rc1/,'production loads v14 visual system');
assert.doesNotMatch(html,/trg-v13-ui(?:-fixed)?\.js/,'production must not load a legacy v13 UI controller');
for(const id of ['commandStatus','cmdIncident','cmdRole','cmdOp','cmdMission','cmdStabilization','cmdResponder','cmdTempo','cmdCritical','cmdCost','cmdIer','resourceFlow','scenarioIcon','scenarioHeadline'])assert.ok(ids.has(id),`v14 command-system node ${id} must exist`);
console.log(`DOM contract passed: ${ids.size} document IDs, ${new Set(refs).size} UI ID references.`);
