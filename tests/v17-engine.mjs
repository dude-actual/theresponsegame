import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({Date, console});
vm.runInContext(fs.readFileSync(new URL('../v17-engine.js', import.meta.url), 'utf8'), context);
const E = context.RR17;
const clone = value => JSON.parse(JSON.stringify(value));
const find = (s, id) => s.resources.find(r => r.id === id);
let submissions = 0, completedRuns = 0;

function invariants(s) {
  assert.equal(E.validateState(s).ok, true, E.validateState(s).error);
  for (const metric of ['shoreline','recovery','accountability']) {
    assert.ok(Number.isFinite(s[metric]) && s[metric] >= 0 && s[metric] <= 100, metric);
  }
  assert.equal(s.resources.length, new Set(s.resources.map(r => r.id)).size, 'resource IDs unique');
  assert.equal(s.resources.filter(r => r.kind === 'boom').length, 6, 'physical boom inventory conserved');
  assert.equal(find(s,'SK-02').capable, false, 'a status edit cannot repair equipment');
  assert.equal(s.cost, s.orders.reduce((sum, order) => sum + order.costBasis, 0), 'cost reconciles to orders');
  for (const order of s.orders) {
    assert.ok(order.resourceIds.every(id => find(s,id)), 'every ordered asset exists in resource state');
  }
  assert.equal(s.queue.length, new Set(s.queue).size, 'queue has no duplicate work');
  assert.equal(s.events.filter(event => event.type === 'decision').length,
    s.history.filter(item => item.source === 'player').length, 'player decisions and scored history match');
  const assessed = Object.values(s.evidence).reduce((sum,item) => sum + item.count, 0);
  assert.equal(assessed, s.history.filter(item => item.source === 'player').length, 'conditions do not add competency evidence');
  assert.doesNotThrow(() => JSON.stringify(s), 'state remains serializable');
}
function doAction(s, action) {
  const result = E.act(s, action);
  assert.equal(result.ok, true, `${action.type}: ${result.error}`);
  submissions++;
  invariants(s);
  return result;
}
function invalid(s, action) {
  const before = JSON.stringify(s);
  assert.equal(E.act(s, action).ok, false, `expected invalid ${action?.type || 'missing action'}`);
  assert.equal(JSON.stringify(s), before, 'invalid actions leave the entire state unchanged');
}
const good = {
  fields:['capability','location'],tactical:'resources',support:'logistics',vendor:'harbor',
  verified:['id','leader','capability','comms'],assignment:'source',skimmer:'out_of_service',evidence:'maintenance',
  strategy:'contract',approval:true,relief:1,waste:1,assign:'source',reliefVerified:true,
  items:['monitor','boom','eta','skimmer'],recipients:['operations','safety','logistics','command'],concern:'both'
};
function op1(s, options = {}) {
  const o = {...good,...options};
  doAction(s,{type:'validate',fields:o.fields});
  doAction(s,{type:'route',tactical:o.tactical,support:o.support});
  doAction(s,{type:'source',vendor:o.vendor});
  doAction(s,{type:'allocate',marsh:o.marsh ?? (s.variant ? 1 : 4),channel:o.channel ?? (s.variant ? 4 : 1)});
}
function finish(s, options = {}) {
  const o = {...good,...options};
  if(s.period === 0) doAction(s,{type:'advance'});
  if(s.period === 1) {
    doAction(s,{type:'forecast',relief:o.relief,waste:o.waste});
    doAction(s,{type:'reconcile',skimmer:o.skimmer,evidence:o.evidence});
    doAction(s,{type:'reassign',strategy:o.strategy,approval:o.approval});
    let n=0;
    while(!s.tasks.find(t=>t.id==='arrival').available) {
      assert.ok(n++<30,'monitoring arrival must not deadlock');
      doAction(s,{type:'wait'});
    }
    doAction(s,{type:'checkin',verified:o.verified,assignment:o.assignment});
    doAction(s,{type:'advance'});
  }
  doAction(s,{type:'relief',assign:o.assign,verified:o.reliefVerified});
  doAction(s,{type:'cop',items:o.items,note:'Recorded limitations carry into the incoming shift.'});
  doAction(s,{type:'escalate',recipients:o.recipients,concern:o.concern,note:'Resource constraints remain visible.'});
  const first=s.safetyHold||s.flags.channelMonitoringGap?'monitoring':!s.intel.wasteAvailable?'waste':'containment';
  doAction(s,{type:'handover',priorities:o.priorities || [first,...['monitoring','waste','containment'].filter(x=>x!==first)]});
  doAction(s,{type:'advance'});
  assert.equal(s.finished,true);
  assert.equal(s.tasks.filter(t=>t.status==='done').length,12);
  assert.equal(s.events.filter(e=>e.type==='decision').length,12,'12 substantive operational submissions');
  completedRuns++;
  return s;
}
function play(options = {}) {
  const s=E.createState(options);
  op1(s,options);return finish(s,options);
}

// Initial contracts, input handling and queue actions.
const initial=E.createState({difficulty:'guided',variant:0});
invariants(initial);
assert.equal(E.VENDORS.length,4);
assert.equal(E.PERIODS.length,3);
assert.equal(initial.tasks.length,12);
assert.equal(E.SCENARIOS[0].marshDemand + E.SCENARIOS[0].channelDemand,7,'demand exceeds inventory');
invalid(initial,{type:'source',vendor:'harbor'});
invalid(initial,{type:'allocate',marsh:4,channel:3});
invalid(initial,{type:'allocate',marsh:-1,channel:2});
invalid(initial,{type:'allocate',marsh:1.5,channel:2});
invalid(initial,{type:'validate',fields:['capability','capability']});
invalid(initial,{type:'validate',fields:['invented']});
invalid(initial,{type:'advance'});
invalid(initial,{type:'handover',priorities:['monitoring','waste','containment']});
invalid(initial,{type:'reorder',ids:['validate']});
invalid(initial,{type:'unknown'});
invalid(initial,null);
const oldMinute=initial.minute;
doAction(initial,{type:'reorder',ids:[...initial.queue].reverse()});
assert.equal(initial.minute,oldMinute,'queue organization does not consume incident time');
assert.equal(initial.history.length,0,'queue organization is not a scored guess');
doAction(initial,{type:'validate',fields:['capability','location']});
invalid(initial,{type:'validate',fields:['capability','location']});

// Complete trajectories: good, defensible tradeoff, and damaging choices all finish.
const strong=play();
const mixed=play({vendor:'regional',strategy:'hold',marsh:3,channel:3});
const damaging=play({fields:[],tactical:'logistics',support:'resources',vendor:'industrial',marsh:6,channel:0,
  verified:[],skimmer:'available',evidence:'staging',strategy:'move',approval:false,relief:0,waste:0,
  reliefVerified:false,items:['rumor','skimmer'],recipients:[],concern:'cost',priorities:['waste','containment','monitoring']});
assert.ok(E.report(strong).score > E.report(damaging).score);
assert.ok(strong.recovery > damaging.recovery,'safe monitoring and sustainment materially change recovery');
assert.ok(strong.accountability > damaging.accountability);
assert.equal(damaging.safetyHold,true,'wrong-capability sourcing cannot become safe by checking boxes');
assert.equal(damaging.resources.find(r=>r.id==='MON-EXT').capable,false);
assert.ok(strong.orders.some(o=>o.id==='ORD-RELIEF'));
assert.ok(find(strong,'RLF-1').verified && find(strong,'RLF-1').location==='Source berth');
assert.equal(find(strong,'WST-1').status,'available');
assert.ok(E.report(strong).objectives.every(o=>typeof o.text==='string'&&typeof o.status==='string'));
assert.equal(E.report(strong).history.length,strong.history.length);
invalid(strong,{type:'advance'});
invalid(strong,{type:'wait'});

// All source choices in both difficulty/variant combinations remain playable.
for(const difficulty of ['guided','advanced'])for(const variant of [0,1])for(const vendor of E.VENDORS.map(v=>v.id)) {
  const s=play({difficulty,variant,vendor});
  if(vendor==='industrial')assert.equal(s.safetyHold,true);
  if(vendor==='internal')assert.equal(s.flags.channelMonitoringGap,true);
  assert.ok(E.report(s).score>=0&&E.report(s).score<=100);
}
const guidedRegional=E.createState({difficulty:'guided'}),advancedRegional=E.createState({difficulty:'advanced'});
op1(guidedRegional,{vendor:'regional'});op1(advancedRegional,{vendor:'regional'});
assert.equal(find(advancedRegional,'MON-EXT').eta-find(guidedRegional,'MON-EXT').eta,12);
assert.equal(advancedRegional.orders[0].eta-advancedRegional.orders[0].quotedEta,12);
assert.ok(advancedRegional.traffic.some(t=>t.from==='Logistics'&&t.text.includes('12 minutes')));
assert.equal(advancedRegional.evidence.sourcing.count,1,'vendor disruption is not another scored player decision');

// JSON save/resume preserves state, pending arrivals and subsequent causal outcomes.
const uninterrupted=E.createState({difficulty:'advanced',variant:1});
op1(uninterrupted,{vendor:'regional'});
const restored=clone(uninterrupted);
assert.equal(E.validateState(restored).ok,true);
finish(uninterrupted,{vendor:'regional'});finish(restored,{vendor:'regional'});
assert.deepEqual(clone(uninterrupted),clone(restored));
const detachedReport=E.report(restored);
detachedReport.resources[0].location='Changed report only';
assert.notEqual(restored.resources[0].location,detachedReport.resources[0].location,'reports do not mutate live state');

// Waiting for a late arrival is bounded by outstanding physical resources, never a deadlock.
const late=E.createState({difficulty:'advanced'});
for(let n=0;n<3;n++)doAction(late,{type:'wait'});
invalid(late,{type:'wait'});
op1(late,{vendor:'regional',fields:[]});
doAction(late,{type:'advance'});
for(let n=0;!late.tasks.find(t=>t.id==='arrival').available;n++) {
  assert.ok(n<30);doAction(late,{type:'wait'});
}
assert.ok(late.waits>3,'waiting remains possible when an ordered asset is still en route');
doAction(late,{type:'checkin',verified:['id','leader','capability','comms'],assignment:'source'});

// No spare loses physical coverage; retaining one absorbs the same authored failure.
const spare=E.createState(),noSpare=E.createState();
op1(spare,{marsh:4,channel:1});op1(noSpare,{marsh:4,channel:2});
doAction(spare,{type:'advance'});doAction(noSpare,{type:'advance'});
assert.equal(spare.flags.boom.marsh,4);
assert.equal(noSpare.flags.boom.marsh,3);
assert.equal(spare.flags.boom.reserve,0);
assert.equal(spare.resources.filter(r=>r.kind==='boom'&&r.status==='out_of_service').length,1);
assert.equal(spare.evidence.allocation.count,1);
assert.equal(noSpare.evidence.allocation.count,1);

// Geographic reassignment changes actual outcomes and approval changes accountability.
const hold=play({strategy:'hold'}),move=play({strategy:'move',approval:true}),unauthorized=play({strategy:'move',approval:false});
assert.notEqual(hold.recovery,move.recovery,'channel and marsh assignments have different recovery effects');
assert.notEqual(hold.shoreline,move.shoreline,'marsh work changes shoreline protection');
assert.ok(move.accountability>unauthorized.accountability);
assert.equal(find(move,'SK-01').location,'Marsh inlet');
assert.equal(find(hold,'SK-01').location,'Channel');

// Malformed restores reject without throwing; malformed actions cannot partially mutate.
for(const corrupt of [null,{}, {...clone(initial),tasks:[null]}, {...clone(initial),resources:[null]},
  {...clone(initial),traffic:[null]}, {...clone(initial),history:[null]}, {...clone(initial),orders:[{resourceIds:null}]},
  {...clone(initial),flags:null}, {...clone(initial),evidence:{}}]) {
  assert.equal(E.validateState(corrupt).ok,false);
  assert.doesNotThrow(()=>E.act(corrupt,{type:'wait'}));
}
const missing=clone(initial);missing.resources=missing.resources.filter(r=>r.id!=='SK-01');
assert.equal(E.validateState(missing).ok,false);
const badQueue=clone(initial);badQueue.queue.push('unknown');
assert.equal(E.validateState(badQueue).ok,false);
const fresh=E.createState(),cyclic={type:'validate',fields:[]};cyclic.self=cyclic;
invalid(fresh,cyclic);

console.log(`v17 engine: ${submissions} valid actions; ${completedRuns} complete good/tradeoff/damaging trajectories; causality, conservation, deadlines, difficulty, save/resume and rejection checks passed.`);
console.log(JSON.stringify({strong:E.report(strong).score,mixed:E.report(mixed).score,damaging:E.report(damaging).score}));
