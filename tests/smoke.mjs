import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

globalThis.window=globalThis;
globalThis.location={href:'https://theresponsegame.com/'};
globalThis.navigator={sendBeacon:()=>true};
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
for(const file of ['trg-v12-data.js','trg-v12-services.js','trg-v12-engine.js','trg-v13-experience.js'])vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});
const T=globalThis.TRG;
assert.equal(T.VERSION,'13.0.0-rc1');
assert.ok(T.INCIDENTS.length>=10,'ten incident families');
assert.ok(T.ROLES.length>=7,'role progression');
assert.equal(T.experience.daily(new Date(2026,8,16)).incidentId,T.experience.daily(new Date(2026,8,16)).incidentId,'daily deterministic');
for(const pack of T.INCIDENTS){
  for(const role of T.ROLES){
    const profile=JSON.parse(JSON.stringify(T.services.DEFAULT_PROFILE));
    const analytics={record:()=>{}};
    const e=new T.SimulationEngine({profile,analytics,incidentId:pack.id,roleId:role.id,difficulty:'Recruit'});
    e.start();assert.equal(e.state.op,1);assert.ok(e.pending().length>0,`${pack.id}/${role.id} creates work`);
    const first=e.expectedPriority();assert.ok(first,'expected priority');e.prioritize(first);assert.ok(e.state.active,'selected active work');
    const d=e.decisionFor(e.state.active);assert.ok(d.choices.some(c=>c[1]===true),'decision has correct route');
    const result=e.answer(true,d.category);assert.equal(result.correct,true);const s=e.scores();assert.ok(Number.isFinite(s.ier));assert.ok(s.ier>=0&&s.ier<=100);
  }
}
console.log(`Smoke test passed across ${T.INCIDENTS.length*T.ROLES.length} incident/role combinations.`);