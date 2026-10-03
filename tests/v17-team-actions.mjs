import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({Date});
vm.runInContext(fs.readFileSync(new URL('../v17-engine.js',import.meta.url),'utf8'),context);
const E=context.RR17,clone=s=>JSON.parse(JSON.stringify(s));
function act(s,a){const r=E.act(s,a);assert.equal(r.ok,true,r.error);assert.equal(E.validateState(s).ok,true);}
function setup(vendor='harbor',difficulty='guided'){
 const s=E.createState({difficulty});act(s,{type:'team-work'});
 assert.equal(s.minute,0);assert.equal(s.events.filter(e=>e.type==='decision').length,0);
 assert.equal(Object.values(s.evidence).reduce((n,e)=>n+e.count,0),0);
 act(s,{type:'source',vendor});return s;
}
let cases=0;
for(const vendor of ['harbor','regional','internal'])for(const difficulty of ['guided','advanced']){
 const s=setup(vendor,difficulty),r=s.resources.find(r=>r.id===s.flags.monitorId);
 assert.equal(r.status,'en_route');assert.equal(s.safetyHold,true);
 const before=clone(s.evidence),cost=s.cost;
 while(s.resources.find(x=>x.id===r.id).status==='en_route')act(s,{type:'wait'});
 assert.equal(s.resources.find(x=>x.id===r.id).status,'assigned');assert.equal(s.resources.find(x=>x.id===r.id).verified,true);assert.equal(s.safetyHold,false);
 assert.deepEqual(clone(s.evidence),before);assert.equal(s.cost,cost);
 const received=s.history.find(h=>h.teamKey===`receive:${r.id}`);
 assert.equal(received.authorization,'operations');assert.equal(received.causes.length,1);
 assert.equal(s.events.find(e=>e.id===received.causes[0]).type,'resource_arrival');
 const snapshot=clone(s),restored=E.restoreState(snapshot);assert.equal(restored.ok,true);
 assert.deepEqual(clone(restored.state),snapshot,'restore must not replay team work');
 act(restored.state,{type:'allocate',marsh:4,channel:1});
 assert.equal(restored.state.history.filter(h=>h.teamKey===received.teamKey).length,1);
 cases++;
}
for(const mutate of [p=>p.authorization=null,p=>p.verified.pop(),p=>p.kind='water',p=>p.requestId='wrong']){
 const s=setup(),r=s.resources.find(r=>r.id===s.flags.monitorId);mutate(s.orders[0].receiptPlan);
 while(s.resources.find(x=>x.id===r.id).status==='en_route')act(s,{type:'wait'});
 assert.equal(s.resources.find(x=>x.id===r.id).status,'awaiting_checkin');assert.equal(s.resources.find(x=>x.id===r.id).verified,false);assert.equal(s.safetyHold,true);
 assert.equal(s.tasks.find(t=>t.id==='arrival').status,'pending');
 act(s,{type:'checkin',verified:['id','leader','capability','comms'],assignment:'source'});
 assert.equal(s.resources.find(r=>r.id===s.flags.monitorId).status,'assigned');cases++;
}
const mismatch=setup('industrial');while(mismatch.resources.find(r=>r.id===mismatch.flags.monitorId).status==='en_route')act(mismatch,{type:'wait'});
assert.equal(mismatch.safetyHold,true);assert.equal(mismatch.tasks.find(t=>t.id==='arrival').status,'pending');cases++;
for(const variant of [0,1]){
 const s=E.createState({variant});act(s,{type:'team-work'});act(s,{type:'source',vendor:'harbor'});act(s,{type:'allocate',marsh:4,channel:1});act(s,{type:'advance'});
 act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
 act(s,{type:'reassign',strategy:'move',approval:false});act(s,{type:'forecast',relief:1,waste:1});act(s,{type:'advance'});
 assert.equal(s.flags.unauthorizedMove,true,'distribution cannot grant Operations approval');
 assert.equal(s.flags.cop.includes('rumor'),false);assert.equal(s.flags.cop.includes('skimmer'),true);
 assert.equal(s.tasks.find(t=>t.id==='relief').status,'done');
 assert.equal(s.tasks.find(t=>t.id==='cop').status,'done');assert.equal(s.tasks.find(t=>t.id==='escalation').status,'done');
 act(s,{type:'handover',priorities:['containment','monitoring','waste']});act(s,{type:'advance'});
 const report=E.report(s);assert.equal(report.finished,true);
 assert.equal(report.events.filter(e=>e.type==='decision').length,6);
 assert.equal(Object.values(s.evidence).reduce((n,e)=>n+e.count,0),6);
 assert.deepEqual(clone(report.history),clone(s.history));cases++;
}
const legacy=E.createState();for(const e of legacy.events)delete e.id;
assert.equal(E.restoreState(legacy).ok,true);act(legacy,{type:'validate',fields:['capability','location']});
const bad=clone(setup());bad.history[0].causes=['missing'];assert.equal(E.validateState(bad).ok,false);
const badId=clone(setup());badId.events[0].id='duplicate';assert.equal(E.validateState(badId).ok,false);
console.log(`v17 team work: ${cases} arrival/manifest/complete-run cases; provenance, no credit, authorization, conservation and reload checks passed.`);
const late=setup();act(late,{type:'allocate',marsh:4,channel:1});act(late,{type:'advance'});
act(late,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});act(late,{type:'reassign',strategy:'hold',approval:false});act(late,{type:'forecast',relief:0,waste:0});act(late,{type:'advance'});
act(late,{type:'order-support',kind:'relief'});const eta=late.orders.at(-1).eta;
while(late.minute<eta)act(late,{type:'wait'});
assert.equal(late.resources.find(r=>r.id==='RLF-REC1').status,'assigned');
assert.equal(late.history.filter(h=>h.teamKey==='receive:RLF-REC1').length,1);
assert.equal(late.safetyHold,false);
const duplicate=clone(late);const outcome=E.act(late,{type:'team-work'});assert.equal(outcome.ok,false);assert.deepEqual(clone(late),duplicate);
const spoof=clone(late);spoof.evidence.accountability.count++;assert.equal(E.validateState(spoof).ok,false);
const corrupt=clone(late);const received=corrupt.history.find(h=>h.teamKey==='receive:RLF-REC1');received.authorization='resources';assert.equal(E.validateState(corrupt).ok,false);
console.log('Late support receipt, duplicate enable, fabricated credit and authorization corruption checks passed.');
