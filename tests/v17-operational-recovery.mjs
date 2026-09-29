import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({Date});
vm.runInContext(fs.readFileSync('v17-engine.js','utf8'),context);
const E=context.RR17, clone=v=>JSON.parse(JSON.stringify(v));
const verified=['id','leader','capability','comms'];
let cases=0, accepted=0, rejected=0, restores=0;
function test(name,body){body();cases++;console.log(`PASS ${name}`);}
function invariants(s){
  assert.equal(E.validateState(s).ok,true,E.validateState(s).error);
  assert.equal(s.schema,17);
  assert.equal(s.resources.length,new Set(s.resources.map(r=>r.id)).size);
  assert.equal(s.orders.length,new Set(s.orders.map(o=>o.id)).size);
  assert.equal(s.cost,s.orders.reduce((sum,o)=>sum+o.costBasis,0));
  assert.equal(s.resources.find(r=>r.id==='SK-02').capable,false);
  assert.equal(s.resources.filter(r=>r.kind==='boom').length,6);
  assert.equal(s.history.filter(h=>h.source==='player').length,s.events.filter(e=>e.type==='decision').length);
  assert.equal(s.history.filter(h=>h.source==='player').length,Object.values(s.evidence).reduce((n,e)=>n+e.count,0));
}
function act(s,a){
  const history=clone(s.history), minute=s.minute, cost=s.cost;
  const result=E.act(s,a);assert.equal(result.ok,true,result.error);accepted++;
  assert.deepEqual(clone(s.history.slice(0,history.length)),history,'history is append-only');
  assert.ok(s.minute>=minute);assert.ok(s.cost>=cost);invariants(s);return result;
}
function reject(s,a){const before=JSON.stringify(s);const result=E.act(s,a);assert.equal(result.ok,false,JSON.stringify(a));assert.equal(JSON.stringify(s),before,'no time/cost/order/resource/history/evidence changes on rejection');rejected++;return result.error;}
function restore(s){const before=JSON.stringify(s),r=E.restoreState(clone(s));assert.equal(r.ok,true,r.error);assert.equal(JSON.stringify(s),before);restores++;return r.state;}
function sameAfterRestore(s,a){const copy=restore(s);act(s,a);act(copy,a);assert.deepEqual(clone(s),clone(copy));}
function first(vendor='harbor',options={}){
  const s=E.createState(options);
  act(s,{type:'validate',fields:['capability','location']});act(s,{type:'route',tactical:'resources',support:'logistics'});
  act(s,{type:'source',vendor});act(s,{type:'allocate',marsh:4,channel:1});return s;
}
function second(vendor='harbor',options={}){const s=first(vendor,options);act(s,{type:'advance'});return s;}
function third({relief=1,waste=1}={}){
  const s=second();act(s,{type:'forecast',relief,waste});act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
  act(s,{type:'reassign',strategy:'hold',approval:true});act(s,{type:'checkin',verified,assignment:'source'});act(s,{type:'advance'});return s;
}
function finish(s){
  act(s,{type:'cop',items:['monitor','boom','eta','skimmer']});
  act(s,{type:'escalate',recipients:['operations','safety','logistics','command'],concern:'both'});
  act(s,{type:'handover',priorities:['monitoring','waste','containment']});act(s,{type:'advance'});
}

test('Incorrect status can be corrected once without repairing SK-02 or removing the penalty',()=>{
  const s=second();reject(s,{type:'correct-status',skimmer:'out_of_service',evidence:'maintenance'});
  act(s,{type:'reconcile',skimmer:'available',evidence:'staging'});
  const loss=s.accountability,originalTask=clone(s.tasks.find(t=>t.id==='status')),cost=s.cost;
  reject(s,{type:'correct-status',skimmer:'available',evidence:'maintenance'});
  reject(s,{type:'correct-status',skimmer:'out_of_service',evidence:'staging'});
  const a={type:'correct-status',skimmer:'out_of_service',evidence:'maintenance'};
  sameAfterRestore(s,a);assert.equal(s.accountability,loss);assert.equal(s.cost,cost);
  assert.equal(s.flags.statusVerified,true);assert.equal(s.resources.find(r=>r.id==='SK-02').status,'out_of_service');
  assert.deepEqual(clone(s.tasks.find(t=>t.id==='status')),originalTask);
  assert.equal(s.history[s.history.at(-1).correctsHistoryIndex].action,'Status reconciliation');reject(s,a);
  reject(s,{type:'reconcile',skimmer:'available',evidence:'staging'});
});
for(const assignment of ['unverified','marsh','reserve'])test(`${assignment} relief can take its authorized source assignment once`,()=>{
  const s=third();const a={type:'correct-relief',resourceId:'RLF-1',verified:true,assign:'source',approval:true};
  reject(s,a);act(s,{type:'relief',assign:assignment==='unverified'?'source':assignment,verified:assignment!=='unverified'});
  const loss=s.accountability,cost=s.cost,minute=s.minute;
  reject(s,{...a,approval:false});reject(s,{...a,verified:false});reject(s,{...a,resourceId:'SK-02'});reject(s,{...a,assign:'marsh'});
  sameAfterRestore(s,a);assert.equal(s.accountability,loss);assert.equal(s.cost,cost);assert.equal(s.minute,minute+7);
  assert.equal(s.intel.sourceReliefAssigned,true);assert.equal(s.safetyHold,false);reject(s,a);
  assert.equal(s.history[s.history.at(-1).correctsHistoryIndex].action,'Relief assignment');
  finish(s);reject(s,a);reject(s,{type:'correct-status',skimmer:'out_of_service',evidence:'maintenance'});
});
test('Old history without correction metadata restores without rewriting records',()=>{
  const s=third();assert.ok(s.history.every(h=>h.correctsHistoryIndex===undefined));
  const result=restore(s);assert.deepEqual(clone(result),clone(s));
  result.resources[0].name='Detached';assert.notEqual(result.resources[0].name,s.resources[0].name);
  for(const corrupt of [null,{}, {...clone(s),cost:s.cost+1}, {...clone(s),orders:[...s.orders,s.orders[0]]}]){
    assert.equal(E.restoreState(corrupt).ok,false);reject(corrupt,{type:'wait'});
  }
  const wrongCapability=clone(s);wrongCapability.resources.find(r=>r.id==='SK-02').capable=true;
  assert.equal(E.restoreState(wrongCapability).ok,false);
});
console.log(`Operational recovery: ${cases} cases; ${accepted} accepted commands; ${rejected} atomic rejections; ${restores} restore comparisons.`);
