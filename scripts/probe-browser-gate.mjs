import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const r=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','-g','intentional browser assertion failure','--reporter=json'],{encoding:'utf8',env:{...process.env,RUN_GATE_PROBE:'1'}});
fs.mkdirSync('browser-evidence',{recursive:true});fs.writeFileSync('browser-evidence/intentional-failure.json',r.stdout||r.stderr);
assert.equal(r.status,1,'The intentional browser assertion must fail');const report=JSON.parse(r.stdout);assert.equal(report.stats.unexpected,1);assert.ok(r.stdout.includes('INTENTIONAL_GATE_PROBE'),'Must fail the known assertion, not browser setup');
console.log('Browser assertion gate rejected the intentionally incorrect visible heading.');
