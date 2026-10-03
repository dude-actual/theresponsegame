import assert from 'node:assert/strict';
import {boot} from './helpers/ui-harness.mjs';

const K='trg-v17-session',R='trg-v17-reports',C='trg-v17-career';
const copy=v=>JSON.parse(JSON.stringify(v)),seed=a=>Object.fromEntries(a.memory),saved=a=>a.json(K);
const E=boot().context.RR17,verified=['id','leader','capability','comms'];
let cases=0,restores=0;
async function test(name,fn){await fn();cases++;console.log(`PASS ${name}`);}
function act(s,a){const r=E.act(s,a);assert.equal(r.ok,true,r.error);assert.equal(E.validateState(s).ok,true);}
function first(vendor='harbor'){
  const s=E.createState();act(s,{type:'validate',fields:['capability','location']});
  act(s,{type:'route',tactical:'resources',support:'logistics'});act(s,{type:'source',vendor});
  act(s,{type:'allocate',marsh:4,channel:1});return s;
}
function second(vendor){const s=first(vendor);act(s,{type:'advance'});return s;}
function third(relief=1,waste=1){const s=second();act(s,{type:'checkin',verified,assignment:'source'});
  act(s,{type:'reconcile',skimmer:'out_of_service',evidence:'maintenance'});act(s,{type:'reassign',strategy:'hold',approval:true});
  act(s,{type:'forecast',relief,waste});act(s,{type:'advance'});return s;}
function finished(){const s=third();act(s,{type:'relief',assign:'source',verified:true});
  act(s,{type:'cop',items:['monitor','boom','eta','skimmer']});
  act(s,{type:'escalate',recipients:['operations','safety','logistics','command'],concern:'both'});
  act(s,{type:'handover',priorities:['monitoring','waste','containment']});act(s,{type:'advance'});return s;}
function arrived(s,id){let n=0;while(s.resources.find(r=>r.id===id).status==='en_route'){assert.ok(n++<20);act(s,{type:'wait'});}}
function reload(a){const before=saved(a),b=boot(seed(a));restores++;
  assert.equal(b.actions(),0,'restoring the controller invokes no engine commands');
  assert.deepEqual(b.state(),before.state,'all engine truth, history and events remain exact');
  assert.deepEqual(saved(b).runtime,before.runtime,'the complete runtime boundary remains exact');return b;}
function begin(){const a=boot();a.click('start');a.click('enter-incident');return a;}
function sourcing(){const a=begin();a.submit('validate',{fields:['capability','location']});a.submit('route',{tactical:'resources',support:'logistics'});a.click('select-task',{id:'monitor'});return a;}

await test('No checkpoint is distinct from a run: reading the introduction writes nothing',()=>{
  const a=boot();a.click('briefing');assert.equal(a.memory.has(K),false);assert.equal(a.actions(),0);
});
await test('Orientation, play, review and operational-period briefing restore their exact boundary',()=>{
  const a=boot();a.click('start');assert.equal(saved(a).runtime.scene,'orientation');reload(a);
  a.click('enter-incident');assert.equal(saved(a).runtime.scene,'play');reload(a);
  const b=boot({[K]:{state:first(),selected:'boom'}});b.click('review');assert.equal(saved(b).runtime.scene,'review');reload(b);
  b.click('advance');assert.equal(saved(b).runtime.scene,'period-briefing');reload(b);
});

const fixtures=new Map([['unfinished',E.createState()],['pending monitoring arrival',first()]]);
const waiting=first();arrived(waiting,'MON-EXT');fixtures.set('arrived awaiting receipt',copy(waiting));
act(waiting,{type:'checkin',verified,assignment:'staging'});fixtures.set('received without assignment',copy(waiting));
fixtures.set('correction available and uncommitted',copy(waiting));
act(waiting,{type:'correct-checkin',verified,assignment:'source'});fixtures.set('completed Item 01 check-in correction',copy(waiting));
const status=second();act(status,{type:'reconcile',skimmer:'available',evidence:'staging'});
act(status,{type:'correct-status',skimmer:'out_of_service',evidence:'maintenance'});fixtures.set('completed Item 02 status correction',status);
const relief=third();act(relief,{type:'relief',assign:'reserve',verified:true});
act(relief,{type:'correct-relief',resourceId:'RLF-1',verified:true,assign:'source',approval:true});fixtures.set('completed Item 02 relief correction',relief);
const replacement=second('industrial');act(replacement,{type:'checkin',verified,assignment:'source'});
act(replacement,{type:'order-monitor',assignment:'source',vendor:'harbor'});fixtures.set('replacement monitor ordered',copy(replacement));
arrived(replacement,'MON-R1');fixtures.set('replacement monitor arrived',copy(replacement));
act(replacement,{type:'receive-monitor',assignment:'source',resourceId:'MON-R1',verified,approval:true});fixtures.set('replacement monitor received',replacement);
const channel=second('internal');act(channel,{type:'checkin',verified,assignment:'source'});
act(channel,{type:'order-monitor',assignment:'channel',vendor:'regional'});fixtures.set('channel monitoring order',copy(channel));
arrived(channel,'MON-C1');act(channel,{type:'receive-monitor',assignment:'channel',resourceId:'MON-C1',verified,approval:true});fixtures.set('channel monitoring restored',channel);
const support=third(0,0);act(support,{type:'relief',assign:'source',verified:true});
act(support,{type:'order-support',kind:'relief'});act(support,{type:'order-support',kind:'waste'});fixtures.set('late support orders',support);
fixtures.set('completed session',finished());
for(const [name,s] of fixtures)for(const shape of ['state-selected','schema-17-state'])await test(`Legacy ${shape}: ${name}`,()=>{
  const before=copy(s),a=boot({[K]:shape==='state-selected'?{state:s,selected:s.queue[0]}:s});
  assert.equal(a.actions(),0);assert.deepEqual(a.state(),before);
  assert.equal(saved(a).schema,'trg.checkpoint');assert.equal(saved(a).version,1);assert.equal(saved(a).meta.migratedFrom,shape);
  assert.equal(saved(a).runtime.draft,null);reload(a);
});

await test('Sourcing draft and focus restore without ordering or spending; commitment happens once',()=>{
  const a=sourcing(),before=a.state(),calls=a.actions();a.edit({vendor:'regional'});
  const field=a.form().elements.find(c=>c.name==='vendor'&&c.value==='regional');a.emit('focusin',{target:field});
  assert.deepEqual(a.state(),before);assert.equal(a.actions(),calls);assert.equal(saved(a).runtime.focus.value,'regional');
  const b=reload(a);assert.equal(b.form().elements.find(c=>c.value==='regional').checked,true);
  assert.equal(b.context.document.activeElement.value,'regional');b.submit('monitor',{vendor:'regional'});
  assert.equal(b.actions(),1);assert.equal(b.state().orders.length,before.orders.length+1);assert.equal(saved(b).runtime.draft,null);
  const after=b.state();b.submit('monitor',{vendor:'regional'});assert.equal(b.actions(),1);assert.deepEqual(b.state(),after);reload(b);
});
await test('Allocation draft, rejected commit and correction remain inert until one valid commitment',()=>{
  const a=begin();a.click('select-task',{id:'boom'});const before=a.state(),calls=a.actions();a.edit({marsh:'7',channel:'0'});
  assert.deepEqual(a.state(),before);assert.equal(a.actions(),calls);const b=reload(a);
  assert.equal(b.form().elements.find(c=>c.name==='marsh').value,'7');b.submit('boom',{marsh:7,channel:0});
  assert.equal(b.actions(),1);assert.deepEqual(b.state(),before);assert.equal(saved(b).runtime.draft.values.marsh[0],'7');
  const c=reload(b);c.edit({marsh:'4',channel:'1'});assert.deepEqual(c.state(),before);c.submit('boom',{marsh:4,channel:1});
  assert.equal(c.actions(),1);assert.equal(c.state().tasks.find(t=>t.id==='boom').status,'done');reload(c);
});
await test('Only one draft exists; switching requires discard, while leaving and archives preserve it',()=>{
  const a=sourcing();a.edit({vendor:'regional'});const original=saved(a);a.click('select-task',{id:'boom'});
  assert.match(a.dialog(),/Discard draft/);assert.deepEqual(saved(a),original);
  a.click('home');a.pagehide();const b=reload(a);assert.equal(saved(b).runtime.draft.values.vendor[0],'regional');
  b.click('confirm-select',{id:'boom'});assert.equal(saved(b).runtime.draft,null);assert.equal(saved(b).runtime.selected,'boom');
});
await test('Free text, multiselect and handover ordering restore safely',()=>{
  const a=boot({[K]:{state:third(),selected:'cop'}}),before=a.state();
  a.edit({items:['monitor','eta'],note:'Only confirmed <facts> & quotes "here".'});const b=reload(a);
  assert.equal(b.form().elements.find(c=>c.name==='note').value,'Only confirmed <facts> & quotes "here".');
  assert.deepEqual(b.form().elements.filter(c=>c.name==='items'&&c.checked).map(c=>c.value),['monitor','eta']);assert.deepEqual(b.state(),before);
  b.click('confirm-select',{id:'handover'});b.click('handover-move',{id:'containment',direction:'-1'});
  b.click('handover-move',{id:'containment',direction:'-1'});const c=reload(b);
  assert.deepEqual(saved(c).runtime.draft.handoverOrder,['containment','monitoring','waste']);assert.deepEqual(c.state(),before);
});
await test('Pending result restores; acknowledgment persists and never repeats its consequence',()=>{
  const a=begin();a.submit('validate',{fields:['capability','location']});const before=a.state(),id=saved(a).runtime.result.id;
  assert.equal(saved(a).runtime.result.acknowledged,false);const b=reload(a);assert.match(b.html(),/data-action='ack-result'/);
  b.click('ack-result');assert.equal(b.actions(),0);assert.deepEqual(b.state(),before);assert.equal(saved(b).runtime.result.id,id);
  const c=reload(b);assert.equal(saved(c).runtime.result.acknowledged,true);assert.doesNotMatch(c.html(),/data-action='ack-result'/);
  c.click('ack-result');assert.deepEqual(c.state(),before);assert.equal(c.actions(),0);
});
const finishedApp=boot({[K]:{state:finished(),selected:'handover'}}),report=finishedApp.json(R)[0];
await test('Finished checkpoint reuses exact archived report and reward, including createdAt',()=>{
  const r=finishedApp.memory.get(R),c=finishedApp.memory.get(C);const a=reload(finishedApp),b=reload(a);
  assert.equal(b.memory.get(R),r);assert.equal(b.memory.get(C),c);b.click('ack-result');
  assert.equal(b.memory.get(R),r);assert.equal(b.memory.get(C),c);assert.equal(b.actions(),0);
});
await test('An archived report retains a different unfinished draft and selected scene',()=>{
  const a=sourcing();a.edit({vendor:'regional'});const data=seed(a);data[R]=[report];const b=boot(data),before=b.state();
  b.click('view-report',{id:report.sessionId});assert.equal(saved(b).runtime.scene,'archive');const c=reload(b);
  assert.equal(c.memory.get(R),JSON.stringify([report]));assert.deepEqual(c.state(),before);assert.equal(saved(c).runtime.draft.values.vendor[0],'regional');
  c.click('resume');assert.equal(saved(c).runtime.scene,'play');assert.equal(c.form().elements.find(x=>x.value==='regional').checked,true);
  c.click('view-report',{id:report.sessionId});c.click('replay');assert.match(c.dialog(),/Replace current checkpoint/);
  c.click('cancel-start');assert.deepEqual(c.state(),before);
});
await test('A missing archive falls back to the saved active scene without touching incident truth',()=>{
  const a=sourcing(),data=seed(a);data[R]=[report];const b=boot(data);b.click('view-report',{id:report.sessionId});
  const missing=seed(b);delete missing[R];const c=boot(missing);assert.equal(c.actions(),0);assert.deepEqual(c.state(),b.state());assert.equal(saved(c).runtime.scene,'play');
});

const valid=saved(begin());
const corrupts=[['invalid JSON','{broken'],['structurally invalid',{state:{schema:17}}],['unsupported',{schema:'trg.checkpoint',version:99,state:valid.state}],
  ['invalid engine',{...copy(valid),state:{...copy(valid.state),cost:999}}],['invalid scene',{...copy(valid),runtime:{...copy(valid.runtime),scene:'unknown'}}],
  ['invalid metadata',{...copy(valid),meta:{...valid.meta,forwardedCount:-1}}],['missing envelope fields',{schema:'trg.checkpoint',version:1,state:valid.state}]];
for(const [name,value] of corrupts)await test(`${name} preserves exact raw bytes, exports them, allows archives and requires explicit replacement`,async()=>{
  const raw=typeof value==='string'?value:JSON.stringify(value,null,2),a=boot({[K]:raw,[R]:[report]});
  a.pagehide();assert.equal(a.memory.get(K),raw);assert.equal(a.actions(),0);a.click('export-checkpoint');assert.equal(await a.blobs.at(-1).text(),raw);
  a.click('view-report',{id:report.sessionId});assert.match(a.html(),/The picture you leave/);assert.equal(a.memory.get(K),raw);
  a.click('start');assert.match(a.dialog(),/Replace current checkpoint/);assert.equal(a.memory.get(K),raw);
  a.click('cancel-start');a.pagehide();assert.equal(a.memory.get(K),raw);
  a.click('start');a.click('confirm-start');assert.equal(saved(a).version,1);assert.equal(a.state().minute,0);assert.equal(a.memory.get(R),JSON.stringify([report]));
});
await test('Denied reads cannot be mistaken for an empty save or authorize replacement',()=>{
  const raw=JSON.stringify(valid),options={denyReads:true},a=boot({[K]:raw},false,null,options);
  assert.match(a.html(),/cannot be read/);a.click('start');a.click('confirm-start');a.pagehide();assert.equal(a.memory.get(K),raw);assert.equal(a.actions(),0);
  options.denyReads=false;a.click('retry-save');assert.deepEqual(a.state(),valid.state);assert.equal(a.actions(),0);
});
for(const quota of [false,true])await test(`${quota?'Quota':'Write denial'} retains stored bytes, displays failure and can export/retry live draft`,async()=>{
  const a=sourcing(),data=seed(a),original=data[K];let fail=true;const options={quota,failWrite:k=>fail&&k===K};
  const b=boot(data,false,null,options);b.edit({vendor:'regional'});assert.equal(b.memory.get(K),original);
  assert.match(b.nodes.get('save-status').textContent,quota?/storage is full/:/Saving is unavailable/);assert.equal(b.nodes.get('save-recovery').hidden,false);
  assert.doesNotMatch(b.nodes.get('checkpoint-status').textContent,/Checkpoint saved/);b.click('export-checkpoint');
  assert.equal(JSON.parse(await b.blobs.at(-1).text()).runtime.draft.values.vendor[0],'regional');
  fail=false;b.click('retry-save');assert.equal(saved(b).runtime.draft.values.vendor[0],'regional');assert.equal(b.nodes.get('save-status').hidden,true);reload(b);
});
await test('Failed legacy migration write keeps original raw; a later retry saves conservative defaults',()=>{
  const raw=JSON.stringify({state:first(),selected:'boom'},null,2);let fail=true;
  const a=boot({[K]:raw},false,null,{failWrite:k=>k===K&&fail});assert.equal(a.memory.get(K),raw);assert.equal(a.actions(),0);
  fail=false;a.click('retry-save');assert.equal(saved(a).meta.migratedFrom,'state-selected');assert.deepEqual(a.state(),JSON.parse(raw).state);
});
await test('Replacement confirmation rechecks changed storage and never overwrites another tab',()=>{
  const a=begin();a.click('start');const other=JSON.stringify({schema:'trg.checkpoint',version:9});a.memory.set(K,other);
  a.click('confirm-start');a.pagehide();assert.equal(a.memory.get(K),other);assert.match(a.html(),/changed in another tab/);
});
await test('Autosave refuses an external storage change without replacing either incident',()=>{
  const a=sourcing(),other='{external}';a.memory.set(K,other);a.edit({vendor:'regional'});a.pagehide();
  assert.equal(a.memory.get(K),other);assert.match(a.nodes.get('save-status').textContent,/another tab/);assert.equal(a.actions(),2);
  a.click('retry-save');assert.match(a.dialog(),/Export this response/);assert.equal(a.memory.get(K),other);
  a.click('load-stored');assert.equal(a.memory.get(K),other);assert.match(a.html(),/saved response could not be loaded|stored data/);
});
await test('Denied career/archive reads recover their original values before completion resumes',()=>{
  const data=seed(finishedApp),options={denyReads:true},a=boot(data,false,null,options);
  options.denyReads=false;a.click('retry-save');assert.equal(a.memory.get(C),data[C]);assert.equal(a.memory.get(R),data[R]);
  assert.equal(a.nodes.get('save-status').hidden,true);assert.equal(a.actions(),0);
});
for(const quota of [false,true])for(const active of [false,true])await test(`Retry failed career setting: ${quota?'quota':'denied write'}, ${active?'unfinished run':'home'}`,()=>{
  let fail=false;const a=boot({[C]:finishedApp.json(C)},false,null,{quota,failWrite:k=>fail&&k===C});
  if(active){a.click('start');a.click('enter-incident');}
  const before=active?a.state():null,original=a.memory.get(C),calls=a.actions();fail=true;a.click('motion');
  assert.equal(a.memory.get(C),original);assert.equal(a.context.document.documentElement.dataset.motion,'reduce');
  assert.equal(a.nodes.get('save-status').hidden,false);fail=false;a.click('retry-save');
  assert.equal(a.json(C).motion,true);assert.equal(a.nodes.get('save-status').hidden,true);
  assert.equal(a.actions(),calls);if(active)assert.deepEqual(a.state(),before);
  const b=boot(seed(a));assert.equal(b.context.document.documentElement.dataset.motion,'reduce');assert.equal(b.actions(),0);
});
await test('An archive write still retries after starting an unfinished response',()=>{
  let fail=true;const a=boot({[K]:{state:finished()}},false,null,{failWrite:k=>fail&&k===R});
  const completedId=a.state().id,xp=a.json(C).xp;a.click('replay');a.click('confirm-start');const before=a.state();
  assert.equal(a.state().finished,false);assert.equal(a.memory.has(R),false);fail=false;a.click('retry-save');
  assert.equal(a.json(R).length,1);assert.equal(a.json(R)[0].sessionId,completedId);assert.equal(a.json(C).xp,xp);
  assert.deepEqual(a.state(),before);assert.equal(a.nodes.get('save-status').hidden,true);reload(a);
});
await test('Retry keeps a career warning when storage is still full and protects external profile changes',()=>{
  let fail=true;const a=boot({[C]:finishedApp.json(C)},false,null,{quota:true,failWrite:k=>fail&&k===C});
  a.click('start');const before=a.state();a.click('motion');a.click('retry-save');assert.equal(a.nodes.get('save-status').hidden,false);
  fail=false;const external=JSON.stringify({...finishedApp.json(C),xp:9999});a.memory.set(C,external);a.click('retry-save');
  assert.equal(a.memory.get(C),external);assert.equal(a.nodes.get('save-status').hidden,false);assert.deepEqual(a.state(),before);assert.equal(a.actions(),0);
});
for(const failedKey of [C,R])await test(`Partial completion failure at ${failedKey} remains deduplicated across retry and reload`,()=>{
  let fail=true;const a=boot({[K]:{state:finished()}},false,null,{failWrite:k=>fail&&k===failedKey});
  const before=a.state();assert.equal(a.actions(),0);fail=false;a.click('retry-save');const xp=a.json(C).xp;
  const b=reload(a);assert.equal(b.json(C).sessions,1);assert.equal(b.json(C).xp,xp);assert.equal(b.json(R).length,1);assert.deepEqual(b.state(),before);
});
for(const failedKey of [C,R])await test(`Closing immediately after partial ${failedKey} write never duplicates completion`,()=>{
  const a=boot({[K]:{state:finished()}},false,null,{failWrite:k=>k===failedKey}),b=boot(seed(a));
  const career=b.memory.get(C),reports=b.memory.get(R),c=reload(b);
  assert.equal(c.memory.get(C),career);assert.equal(c.memory.get(R),reports);assert.equal(c.json(R).length,1);assert.ok(c.json(C).sessions<=1);
});
await test('Legacy completed saves with existing report/reward markers neither rewrite reports nor add rewards',()=>{
  const data=seed(finishedApp);data[K]={state:finishedApp.state(),selected:'handover'};const a=boot(data);
  assert.equal(a.memory.get(C),finishedApp.memory.get(C));assert.equal(a.memory.get(R),finishedApp.memory.get(R));assert.equal(a.actions(),0);reload(a);
});
await test('Malformed archive entries remain stored while readable reports stay accessible',()=>{
  const raw=JSON.stringify([report,{bad:'preserve'}]);const a=boot({[K]:{state:finished()},[R]:raw});
  assert.equal(a.memory.get(R),raw);a.click('view-report',{id:report.sessionId});assert.match(a.html(),/The picture you leave/);assert.equal(a.memory.get(R),raw);
});
console.log(`v17 checkpoint contracts passed: ${cases} cases; ${restores} exact controller reload comparisons (mock DOM).`);
