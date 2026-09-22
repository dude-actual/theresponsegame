import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('trg-v15-impact.js','utf8');
const css=fs.readFileSync('trg-v15.css','utf8');

assert.match(html,/data-release="v1[5-9]"/,'production shell retains v15 consequence layer in v15+ release');
assert.match(html,/trg-v15\.css\?v=15\.0\.0-rc1/,'production loads v15 CSS');
assert.match(html,/trg-v15-impact\.js\?v=15\.0\.0-rc1/,'production loads v15 impact controller');
for(const token of ['Incident Impact Feed','Resource Posture','Mission Objectives','Incident Trend','Critical Need','Incident Trajectory','Incident Outcome Chain'])assert.ok(js.includes(token),`v15 includes ${token}`);
for(const fn of ['patchEngine','impactEntry','positiveEntry','trajectory','resourcePosture','objectivePicture','criticalNeed','patchReports'])assert.ok(js.includes(`function ${fn}`),`v15 includes ${fn}`);
assert.match(js,/const start=P\.start/,'engine start is observed, not replaced at source');
assert.match(js,/const answer=P\.answer/,'engine answer path is observed');
assert.match(js,/const prioritize=P\.prioritize/,'engine prioritization path is observed');
assert.match(css,/\.impact-event\.negative/,'negative operational outcomes have a visible state');
assert.match(css,/\.impact-event\.positive/,'positive operational outcomes have a visible state');
console.log('v15 impact contract passed.');
