import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the actual controller's event handlers and persistence. This is a
// lightweight DOM double, not a claim of browser layout or accessibility testing.
const engineSource=fs.readFileSync('v17-engine.js','utf8');
const uiSource=fs.readFileSync('v17-ui.js','utf8');
const sessionKey='trg-v17-session',careerKey='trg-v17-career',reportsKey='trg-v17-reports';
function boot(seed={}, failWrites=false, endpoint=null) {
  const memory=new Map(Object.entries(seed).map(([k,v])=>[k,typeof v==='string'?v:JSON.stringify(v)]));
  const handlers=new Map(),nodes=new Map(),blobs=[],beacons=[];
  function node(id='') {
    if(nodes.has(id))return nodes.get(id);
    const el={id,innerHTML:'',textContent:'',className:'',dataset:{},value:'',open:false,isConnected:true,disabled:false,
      setAttribute(key,value){this[key]=value;},hasAttribute(key){return key in this;},
      addEventListener(){},focus(){document.activeElement=this;},scrollIntoView(){},
      showModal(){this.open=true;},close(){this.open=false;},click(){},
      closest(){return null;},classList:{add(){},remove(){},toggle(){}}};
    nodes.set(id,el);return el;
  }
  const document={documentElement:{dataset:{}},body:{className:''},activeElement:node('initial-focus'),
    getElementById:id=>node(id),createElement:tag=>node(`created-${tag}-${nodes.size}`),
    addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);},
    querySelector(selector){return selector==='input[name=difficulty]:checked'?{value:'guided'}:null;},
    querySelectorAll(){return [];}};
  class FormDataDouble {
    constructor(form){this.entries=form.entries;}
    get(name){return this.entries.find(([key])=>key===name)?.[1]??null;}
    getAll(name){return this.entries.filter(([key])=>key===name).map(([,value])=>value);}
    has(name){return this.entries.some(([key])=>key===name);}
  }
  const context={document,console,Blob,FormData:FormDataDouble,Date,Math,JSON,Set,Map,
    TRG_CONFIG: endpoint ? {analyticsEndpoint:endpoint} : {},
    navigator:{sendBeacon(url,body){beacons.push({url,body});return true;}},location:{protocol:'http:',hostname:'localhost'},
    localStorage:{getItem:k=>memory.get(k)??null,setItem(k,v){if(failWrites)throw new Error('Storage denied');memory.set(k,String(v));}},
    URL:{createObjectURL(blob){blobs.push(blob);return `blob:test-${blobs.length}`;},revokeObjectURL(){}},
    setTimeout(fn){fn();return 0;},addEventListener(){},scrollTo(){}};
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(engineSource,context);vm.runInContext(uiSource,context);
  function emit(type,event){for(const fn of handlers.get(type)||[])fn(event);}
  function click(action,extra={}) {
    const target={dataset:{action,...extra},setAttribute(){},textContent:'',closest:selector=>selector==='[data-action]'?target:null};
    emit('click',{target});
  }
  function submit(task,values={}) {
    const entries=Object.entries(values).flatMap(([key,value])=>(Array.isArray(value)?value:[value]).map(v=>[key,String(v)]));
    emit('submit',{preventDefault(){},target:{dataset:{task},entries,matches:s=>s==='.task-form'}});
  }
  return {memory,nodes,blobs,beacons,click,submit,context,json:key=>JSON.parse(memory.get(key)||'null'),
    state:()=>JSON.parse(memory.get(sessionKey)||'null')?.state,
    html:()=>node('app').innerHTML,dialog:()=>node('dialog-content').innerHTML};
}

// Corrupt JSON and partial profiles must recover to a usable briefing.
for(const seed of [
  {[careerKey]:'{broken',[sessionKey]:'{broken',[reportsKey]:'{broken'},
  {[careerKey]:{completed:[],xp:null,sessions:{},best:'bad',mastery:null}},
  {[careerKey]:{completed:[null,'valid','valid'],xp:'<img>',mastery:{a:'bad',b:Infinity}},[reportsKey]:[null,{},[]]},
  {[sessionKey]:{state:{schema:17,tasks:[],resources:[],history:[],events:[],queue:[],traffic:[],period:0,minute:0}}}
]) {
  const app=boot(seed);assert.match(app.html(),/Take the desk/);assert.doesNotMatch(app.html(),/data-action='resume'/);
  app.click('start');assert.equal(app.state().period,0);
}

const app=boot();app.click('start');
assert.equal(app.state().tasks.length,12);assert.equal(app.state().minute,0);
assert.equal(app.beacons.length,0,'No analytics are sent without explicit configuration');
const instrumented=boot({},false,'https://analytics.example.test/ingest');
instrumented.click('start');
assert.equal(instrumented.beacons.length,instrumented.state().events.length);
const event=JSON.parse(await instrumented.beacons[0].body.text());
assert.equal(event.schema,'trg.event.v17');
assert.equal(event.sessionId,instrumented.state().id);
assert.equal(event.roleId,'resources-unit');
const forwardCount=instrumented.beacons.length;
const resumedAnalytics=boot(Object.fromEntries(instrumented.memory),false,'https://analytics.example.test/ingest');
resumedAnalytics.click('resume');
assert.equal(resumedAnalytics.beacons.length,0,'Resume must not re-forward prior events');
resumedAnalytics.click('wait');
assert.equal(resumedAnalytics.beacons.length,resumedAnalytics.state().events.length-forwardCount);
assert(resumedAnalytics.beacons.every(b=>b.url==='https://analytics.example.test/ingest'));
// Free inspection and keyboard-equivalent queue controls do not move incident time.
app.click('guide');assert.match(app.dialog(),/Resources Unit field guide/);
app.click('settings');assert.match(app.dialog(),/Session settings/);
app.click('motion');assert.equal(app.json(careerKey).motion,true);
app.click('sound');app.click('reports');assert.match(app.dialog(),/Career &amp; after-action archive/);
app.click('traffic');assert.match(app.dialog(),/Incident shift log/);
app.click('zone',{zone:'channel'});assert.match(app.dialog(),/SK-01/);
app.click('view',{id:'picture'});assert.equal(app.context.document.body.className,'view-picture');
app.click('queue-move',{id:'boom',direction:'-1'});assert.equal(app.state().queue[2],'boom');
app.click('select-task',{id:'validate'});assert.equal(app.state().minute,0);
app.click('home');assert.match(app.html(),/Resume/);app.click('resume');

app.submit('validate',{fields:['capability','location','neededBy']});
app.submit('route',{tactical:'resources',support:'logistics'});
app.submit('monitor',{vendor:'harbor'});
app.submit('boom',{marsh:3,channel:2});
assert.equal(app.state().tasks.filter(t=>t.period===0&&t.status==='done').length,4);
app.click('review');assert.match(app.html(),/Shift review/);
app.click('return-play');assert.equal(app.context.document.body.className,'view-resources');
app.click('review');app.click('advance');assert.equal(app.state().period,1);
app.submit('arrival',{verified:['id','leader','capability','comms'],assignment:'source'});
app.submit('status',{skimmer:'out_of_service',evidence:'maintenance'});
app.submit('reassign',{strategy:'contract',approval:'yes'});
app.submit('forecast',{relief:1,waste:1});
app.click('review');app.click('advance');assert.equal(app.state().period,2);
app.submit('relief',{assign:'source',verified:'yes'});
app.submit('cop',{items:['monitor','boom','eta','skimmer'],note:'Verified local record.'});
app.submit('escalation',{recipients:['operations','safety','logistics','command'],concern:'both',note:'Carry constraints forward.'});
app.click('handover-move',{id:'containment',direction:'-1'});
app.click('handover-move',{id:'containment',direction:'-1'});
app.submit('handover');app.click('review');app.click('advance');
assert.equal(app.state().finished,true);assert.equal(app.state().tasks.filter(t=>t.status==='done').length,12);
assert.equal(app.json(careerKey).sessions,1);assert.equal(app.json(reportsKey).length,1);
assert.equal(app.json(reportsKey)[0].history.length,app.state().history.length);
const originalXP=app.json(careerKey).xp;
app.click('resume');assert.equal(app.json(careerKey).xp,originalXP,'completion cannot reward twice');
app.click('export-json',{id:app.state().id});
const exported=JSON.parse(await app.blobs.at(-1).text());assert.equal(exported.sessionId,app.state().id);assert.equal(exported.finalState.finished,true);
app.click('export-html',{id:app.state().id});assert.match(await app.blobs.at(-1).text(),/Decision and outcome ledger/);

// Reopening a finished checkpoint repairs a missing archive independently of XP.
const recoverySeed=Object.fromEntries(app.memory);delete recoverySeed[reportsKey];
const recovered=boot(recoverySeed);assert.equal(recovered.json(careerKey).xp,originalXP);assert.equal(recovered.json(reportsKey).length,1);
const reloaded=boot(Object.fromEntries(recovered.memory));assert.equal(reloaded.json(careerKey).sessions,1);assert.equal(reloaded.json(reportsKey).length,1);

// AAR strings remain text when rendering and when downloaded as HTML.
const hostile=structuredClone(app.json(reportsKey)[0]);
hostile.history[0].change='<img src=x onerror=alert(1)>';hostile.summary='<script>alert(1)</script>';
const archive=boot({[reportsKey]:[hostile]});archive.click('view-report',{id:hostile.sessionId});
assert.ok(archive.html().includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(!archive.html().includes('<script>alert(1)</script>'));
archive.click('export-html',{id:hostile.sessionId});const safeHTML=await archive.blobs.at(-1).text();
assert.ok(safeHTML.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(safeHTML.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
const invalidArchive=boot({[reportsKey]:[{...hostile,score:'<script>alert(1)</script>'}]});invalidArchive.click('reports');assert.match(invalidArchive.dialog(),/Your completed shifts/);

// Storage refusal must leave a playable controller with an explicit warning.
const noStorage=boot({},true);noStorage.click('start');noStorage.submit('validate',{fields:['capability','location']});
assert.match(noStorage.html(),/Saving is unavailable/);
app.click('replay');assert.equal(app.state().variant,1);assert.equal(app.state().finished,false);
console.log('v17 UI event/persistence contracts passed: complete playthrough, archive recovery, reward deduplication, corrupt saves, exports and presentation controls (mock DOM).');
