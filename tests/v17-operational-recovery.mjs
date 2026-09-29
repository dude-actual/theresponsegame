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
function waitFor(s,id){let waits=0;while(s.resources.find(r=>r.id===id).status==='en_route'){assert.ok(waits++<20,'finite arrival');act(s,{type:'wait'});}}
const receive=(assignment,resourceId)=>({type:'receive-monitor',assignment,resourceId,verified,approval:true});
for(const difficulty of ['guided','advanced'])for(const variant of [0,1])for(const vendor of ['harbor','regional'])test(`Wrong vendor replacement: ${difficulty}, variant ${variant}, ${vendor}`,()=>{
  const s=second('industrial',{difficulty,variant});act(s,{type:'checkin',verified,assignment:'source'});
  const wrong=clone(s.resources.find(r=>r.id==='MON-EXT')),originalOrder=clone(s.orders[0]),cost=s.cost,start=s.minute;
  const order={type:'order-monitor',assignment:'source',vendor},receipt=receive('source','MON-R1');
  reject(s,{...order,vendor:'industrial'});reject(s,{...order,vendor:'internal'});reject(s,receipt);
  sameAfterRestore(s,order);
  const offer=E.VENDORS.find(v=>v.id===vendor),ordered=s.orders.find(o=>o.id==='ORD-MON-R1');
  assert.equal(s.cost,cost+offer.cost);assert.equal(ordered.quotedEta,start+offer.eta);
  assert.equal(ordered.eta,start+offer.eta+(difficulty==='advanced'&&vendor==='regional'?12:0));
  assert.ok(ordered.eta>s.intel.monitoringNeededBy,'late replacement stays late');
  assert.equal(s.flags.monitorVendor,'industrial','original sourcing choice retained');
  assert.deepEqual(clone(s.orders[0]),originalOrder);
  reject(s,order);reject(s,receipt);
  sameAfterRestore(s,{type:'wait'});
  waitFor(s,'MON-R1');assert.equal(s.safetyHold,true,'arrival is not readiness');
  reject(s,{...receipt,verified:['id']});reject(s,{...receipt,approval:false});reject(s,{...receipt,assignment:'channel'});
  sameAfterRestore(s,receipt);assert.equal(s.safetyHold,false);assert.equal(s.flags.monitorId,'MON-R1');
  assert.deepEqual(clone(s.resources.find(r=>r.id==='MON-EXT')),wrong,'original incompatible asset still exists unchanged');
  assert.equal(s.resources.find(r=>r.id==='MON-R1').location,'Source berth');
  reject(s,receipt);reject(s,order);reject(s,{type:'correct-checkin',verified,assignment:'source'});
  act(s,{type:'forecast',relief:1,waste:1});act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
  act(s,{type:'reassign',strategy:'hold',approval:true});act(s,{type:'advance'});
  waitFor(s,'RLF-1');act(s,{type:'relief',assign:'source',verified:true});finish(s);
  reject(s,receipt);reject(s,order);
  const report=E.report(s);assert.equal(report.schema,'trg.session-report.v17');assert.equal(report.cost,s.cost);
  assert.deepEqual(clone(report.history),clone(s.history));
});
for(const vendor of ['harbor','regional'])test(`Channel gap requires real ${vendor} order, arrival, reception and assignment`,()=>{
  const s=second('internal');act(s,{type:'checkin',verified,assignment:'source'});
  const source=clone(s.resources.find(r=>r.id==='MON-01')),initialOrder=clone(s.orders[0]);
  const order={type:'order-monitor',assignment:'channel',vendor},receipt=receive('channel','MON-C1');
  sameAfterRestore(s,order);assert.equal(s.flags.channelMonitoringGap,true);
  reject(s,order);reject(s,receipt);waitFor(s,'MON-C1');assert.equal(s.flags.channelMonitoringGap,true);
  const waiting=clone(s);sameAfterRestore(s,receipt);assert.equal(s.flags.channelMonitoringGap,false);
  assert.deepEqual(clone(s.resources.find(r=>r.id==='MON-01')),source);assert.deepEqual(clone(s.orders[0]),initialOrder);
  assert.equal(s.resources.find(r=>r.id==='MON-C1').location,'Channel');reject(s,receipt);reject(s,order);
  const beforeWaiting=waiting.recovery,beforeAssigned=s.recovery;
  act(waiting,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
  act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
  assert.ok(s.recovery-beforeAssigned>waiting.recovery-beforeWaiting,'restored channel monitoring supports actual recovery work');
});
test('Omitted relief and waste can be ordered late without rewriting forecast or claiming early availability',()=>{
  const s=third({relief:0,waste:0});act(s,{type:'relief',assign:'source',verified:true});
  const forecast=clone(s.flags.forecast),cost=s.cost,oldRelief=clone(s.tasks.find(t=>t.id==='relief'));
  const reliefOrder={type:'order-support',kind:'relief'},wasteOrder={type:'order-support',kind:'waste'};
  const correction={type:'correct-relief',resourceId:'RLF-REC1',verified:true,assign:'source',approval:true};
  reject(s,correction);sameAfterRestore(s,reliefOrder);sameAfterRestore(s,wasteOrder);
  assert.equal(s.cost,cost+1400+1000);assert.deepEqual(clone(s.flags.forecast),forecast);
  assert.ok(s.resources.find(r=>r.id==='RLF-REC1').eta>s.intel.reliefNeededBy);
  reject(s,reliefOrder);reject(s,wasteOrder);reject(s,correction);waitFor(s,'RLF-REC1');
  assert.equal(s.safetyHold,true,'arrival alone does not fill the duty gap');
  assert.equal(s.intel.wasteAvailable,1,'waste received through existing actual-arrival path');
  sameAfterRestore(s,correction);assert.equal(s.safetyHold,false);assert.equal(s.intel.sourceReliefAssigned,true);
  assert.deepEqual(clone(s.tasks.find(t=>t.id==='relief')),oldRelief);reject(s,correction);
  assert.ok(s.events.some(e=>e.condition==='source_relief_gap'),'elapsed duty-limit consequence remains');
  finish(s);reject(s,reliefOrder);reject(s,wasteOrder);reject(s,correction);
});
test('Late en-route relief can recover even when its first assignment recorded no arrived crew',()=>{
  const s=second();act(s,{type:'checkin',verified,assignment:'source'});act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
  act(s,{type:'reassign',strategy:'hold',approval:true});act(s,{type:'wait'});act(s,{type:'wait'});act(s,{type:'wait'});
  act(s,{type:'forecast',relief:1,waste:1});act(s,{type:'advance'});act(s,{type:'relief',assign:'source',verified:true});
  const a={type:'correct-relief',resourceId:'RLF-1',verified:true,assign:'source',approval:true};
  reject(s,a);reject(s,{type:'order-support',kind:'relief'});waitFor(s,'RLF-1');sameAfterRestore(s,a);
  assert.equal(s.intel.sourceReliefAssigned,true);reject(s,a);
});
test('An omitted support order can arrive before the original relief assignment',()=>{
  const s=second();act(s,{type:'forecast',relief:0,waste:1});
  sameAfterRestore(s,{type:'order-support',kind:'relief'});
  act(s,{type:'checkin',verified,assignment:'source'});
  act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});
  act(s,{type:'reassign',strategy:'hold',approval:true});act(s,{type:'advance'});
  act(s,{type:'relief',assign:'source',verified:true});
  assert.equal(s.resources.find(r=>r.id==='RLF-REC1').location,'Source berth');
  assert.equal(s.intel.sourceReliefAssigned,true);
  reject(s,{type:'correct-relief',resourceId:'RLF-REC1',verified:true,assign:'source',approval:true});
  finish(s);
});
test('Every recovery command rejects after completion with no extra cost, reward or history',()=>{
  const s=third();act(s,{type:'relief',assign:'source',verified:true});finish(s);
  for(const a of [
    {type:'correct-checkin',verified,assignment:'source'},
    {type:'correct-status',skimmer:'out_of_service',evidence:'maintenance'},
    {type:'correct-relief',resourceId:'RLF-1',verified:true,assign:'source',approval:true},
    ...['source','channel'].flatMap(assignment=>[
      {type:'order-monitor',assignment,vendor:'harbor'},receive(assignment,assignment==='source'?'MON-R1':'MON-C1')]),
    ...['relief','waste'].map(kind=>({type:'order-support',kind}))
  ])reject(s,a);
});
test('Recovery query is read-only, names physical limits, and exposes only legal bounded actions',()=>{
  const s=second('industrial');act(s,{type:'checkin',verified,assignment:'source'});
  const before=JSON.stringify(s),options=E.recoveryOptions(s);assert.equal(JSON.stringify(s),before);
  assert.ok(options.limits.some(x=>x.includes('failed pump')));assert.ok(options.limits.some(x=>x.includes('qualified replacement')));
  assert.equal(options.actions.filter(a=>a.type==='order-monitor').length,2);
  for(const a of options.actions)act(restore(s),a);
  const fresh=E.createState();reject(fresh,{type:'order-monitor',assignment:'source',vendor:'harbor'});
  reject(fresh,{type:'order-support',kind:'relief'});reject(fresh,{type:'order-support',kind:'invented'});
  const supported=third();reject(supported,{type:'order-monitor',assignment:'source',vendor:'harbor'});
  reject(supported,{type:'order-monitor',assignment:'channel',vendor:'harbor'});reject(supported,{type:'order-monitor',assignment:'invented',vendor:'harbor'});
  reject(supported,{type:'order-support',kind:'waste'});reject(supported,{type:'order-support',kind:'relief'});
  act(supported,{type:'relief',assign:'source',verified:true});finish(supported);
  assert.equal(E.recoveryOptions(supported).actions.length,0);assert.equal(E.recoveryOptions(null).ok,false);
});
test('Reserved resource/order identity and correction-reference corruption reject without mutation',()=>{
  const s=second('industrial');act(s,{type:'checkin',verified,assignment:'source'});
  act(s,{type:'order-monitor',assignment:'source',vendor:'harbor'});
  const duplicate=clone(s);duplicate.resources.push(clone(duplicate.resources.find(r=>r.id==='MON-R1')));
  reject(duplicate,{type:'wait'});assert.equal(E.restoreState(duplicate).ok,false);
  const missing=clone(s);missing.orders=missing.orders.filter(o=>o.id!=='ORD-MON-R1');missing.cost=1200;
  reject(missing,{type:'wait'});assert.equal(E.restoreState(missing).ok,false);
  const badLink=clone(s);badLink.history.at(-1).correctsHistoryIndex=badLink.history.length;
  reject(badLink,{type:'wait'});assert.equal(E.restoreState(badLink).ok,false);
  const badDestination=clone(s);badDestination.orders.at(-1).recoveryPurpose='invented';
  reject(badDestination,{type:'wait'});assert.equal(E.restoreState(badDestination).ok,false);
});
console.log(`Operational recovery: ${cases} cases; ${accepted} accepted commands; ${rejected} atomic rejections; ${restores} restore comparisons.`);
