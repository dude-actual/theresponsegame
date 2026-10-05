import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {checkRange} from '../scripts/check-change.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'trg-diff-probe-'));
const git=(...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8'}).trim();
try{
 git('init','-q');fs.writeFileSync(path.join(dir,'probe.txt'),'clean\n');git('add','.');git('-c','user.name=QA','-c','user.email=qa@example.test','commit','-qm','baseline');const base=git('rev-parse','HEAD');
 fs.writeFileSync(path.join(dir,'probe.txt'),'bad whitespace \n');git('add','.');git('-c','user.name=QA','-c','user.email=qa@example.test','commit','-qm','intentional defect');const bad=git('rev-parse','HEAD');
 assert.equal(git('status','--porcelain'),'');assert.throws(()=>checkRange(dir,base,bad));
 fs.writeFileSync(path.join(dir,'probe.txt'),'corrected\n');git('add','.');git('-c','user.name=QA','-c','user.email=qa@example.test','commit','-qm','repair');checkRange(dir,base,git('rev-parse','HEAD'));
 console.log('CI range gate rejects a committed whitespace defect in a clean checkout and accepts the repaired range.');
}finally{if(path.dirname(dir)===path.resolve(os.tmpdir())&&path.basename(dir).startsWith('trg-diff-probe-'))fs.rmSync(dir,{recursive:true,force:true});}
