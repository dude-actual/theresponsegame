import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {boot} from './helpers/ui-harness.mjs';
const c=vm.createContext({Date});for(const f of ['v17-engine.js','v17-scenes.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const E=c.RR17,S=c.RR17Scenes,copy=s=>JSON.parse(JSON.stringify(s));
let runs=0;
function act(s,a){const r=E.act(s,a);assert.equal(r.ok,true,r.error);assert.equal(E.validateState(s).ok,true);const restored=E.restoreState(copy(s));assert.equal(restored.ok,true,restored.error);assert.deepEqual(copy(restored.state),copy(s));}
for(const variant of [0,1])for(const difficulty of ['guided','advanced'])for(const vendor of ['harbor','regional','internal'])for(const count of [0,1,2]){
 const s=E.createState({variant,difficulty});act(s,{type:'team-work'});act(s,{type:'source',vendor});act(s,{type:'allocate',marsh:count?3:4,channel:2});act(s,{type:'advance'});
 act(s,{type:'reconcile',skimmer:count?'out_of_service':'available',evidence:count?'maintenance':'staging'});act(s,{type:'reassign',strategy:['hold','move','contract'][count],approval:true});
 for(const kind of ['relief','waste']){
   act(s,{type:'support-plan',kind,count});const before=copy(s);assert.equal(E.act(s,{type:'support-plan',kind,count}).ok,false);assert.deepEqual(copy(s),before);
 }
 act(s,{type:'advance'});if(!count)act(s,{type:'relief',assign:'reserve',verified:false});
 act(s,{type:'handover',priorities:['containment','monitoring','waste']});
 const final=s.history.find(h=>h.teamKey==='final-picture');assert.equal(final.picture.minute,s.minute);assert.deepEqual(copy(final.picture.resources),copy(s.resources));
 act(s,{type:'advance'});assert.equal(s.finished,true);assert.equal(s.events.filter(e=>e.type==='decision').length,count?7:8);
 const report={...E.report(s),finalState:s},end=S.ending(report);assert.equal(end.callbacks.length,2);assert.equal(end.ready,!!count);assert.equal(end.areas.reduce((n,a)=>n+a.boom.length,0),s.flags.boom.marsh+s.flags.boom.channel);runs++;
}
const late=E.createState();act(late,{type:'team-work'});act(late,{type:'source',vendor:'harbor'});act(late,{type:'allocate',marsh:4,channel:1});act(late,{type:'advance'});act(late,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});act(late,{type:'reassign',strategy:'hold',approval:true});for(const kind of ['relief','waste'])act(late,{type:'support-plan',kind,count:0});act(late,{type:'advance'});
for(const kind of ['relief','waste']){act(late,{type:'order-support',kind});const correction=late.history.at(-1);assert.equal(late.history[correction.correctsHistoryIndex].supportKind,kind);}
while(late.resources.some(r=>r.status==='en_route'))act(late,{type:'wait-arrival'});assert.equal(late.safetyHold,false);act(late,{type:'handover',priorities:['containment','monitoring','waste']});act(late,{type:'advance'});
// Exercise the actual controller at every focused boundary, retaining drafts and results.
const key='trg-v17-session',options={scenes:true};let b=boot({},false,null,options);b.click('start');b.submit('monitor',{vendor:'harbor'});b.click('focused-continue');
const before=copy(b.state());b.submit('boom',{marsh:4,channel:1});assert.deepEqual(b.state(),before,'review must be inert');assert.match(b.html(),/Review your placement/);
b=boot({[key]:b.json(key)},false,null,options);assert.match(b.html(),/Review your placement/);b.click('edit-allocation');assert.equal(b.form().elements.find(e=>e.name==='marsh').value,'4');b.submit('boom',{marsh:4,channel:1});b.submit('boom',{marsh:4,channel:1,stage:'review'});b.click('focused-continue');b.click('advance');b.click('focused-continue');
for(const [task,values] of [['status',{skimmer:'out_of_service',evidence:'maintenance'}],['reassign',{strategy:'contract',approval:'yes'}],['forecast',{supportKind:'relief',count:1}],['forecast',{supportKind:'waste',count:1}]]){
 assert.equal(b.form()?.dataset.task,task);b.submit(task,values);const snapshot=b.state();b=boot({[key]:b.json(key)},false,null,options);assert.deepEqual(b.state(),snapshot);assert.match(b.html(),/Continue response/);b.click('focused-continue');
}
b.click('advance');b.click('focused-continue');assert.equal(b.form().dataset.task,'handover');b.submit('handover',{});b.click('focused-continue');b.click('advance');assert.equal(b.state().finished,true);assert.match(b.html(),/Try another approach/);assert.doesNotMatch(b.html(),/INCIDENT EFFECTIVENESS/);
const archive=b.json('trg-v17-reports');assert.equal(archive.length,1);b.click('detailed-aar');assert.match(b.html(),/INCIDENT EFFECTIVENESS/);b.click('export-json',{id:archive[0].sessionId});assert.ok(b.blobs.length);b.click('replay-same');b.click('confirm-start');assert.equal(b.state().variant,0);assert.equal(b.state().minute,0);assert.equal(b.json('trg-v17-reports').length,1);
b.click('view-report',{id:archive[0].sessionId});b.click('replay');b.click('confirm-start');assert.equal(b.state().variant,1);assert.equal(b.json('trg-v17-reports').length,1);
console.log(`Complete mission: ${runs} variant/difficulty/strategy trajectories; seven normal commitments, independent support recovery, reload at each boundary, inert allocation review, ending and archive-bound replay.`);
