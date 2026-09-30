import {boot} from './helpers/ui-harness.mjs';
import assert from 'node:assert/strict';

// Exercise the actual controller's event handlers and persistence. This is a
// lightweight DOM double, not a claim of browser layout or accessibility testing.
const sessionKey='trg-v17-session',careerKey='trg-v17-career',reportsKey='trg-v17-reports';
// Corrupt JSON and partial profiles must recover to a usable briefing.
for(const seed of [
  {[careerKey]:'{broken',[sessionKey]:'{broken',[reportsKey]:'{broken'},
  {[careerKey]:{completed:[],xp:null,sessions:{},best:'bad',mastery:null}},
  {[careerKey]:{completed:[null,'valid','valid'],xp:'<img>',mastery:{a:'bad',b:Infinity}},[reportsKey]:[null,{},[]]},
  {[sessionKey]:{state:{schema:17,tasks:[],resources:[],history:[],events:[],queue:[],traffic:[],period:0,minute:0}}}
]) {
  const app=boot(seed);assert.match(app.html(),/Start oil spill scenario/);assert.doesNotMatch(app.html(),/data-action='resume'/);
  const hadCheckpoint=app.memory.has(sessionKey);app.click('start');if(hadCheckpoint){assert.match(app.dialog(),/Replace current checkpoint/);app.click('confirm-start');}assert.equal(app.state().period,0);
}

const app=boot();
assert.match(app.html(),/Welcome to The Response Game/);
assert.equal(app.state(),undefined,'Landing page must not start an incident');
app.click('briefing');
assert.match(app.html(),/What happened/);
assert.match(app.html(),/incident command post/);
assert.equal(app.state(),undefined,'Reading the scenario is not an operational action');
app.click('start');
assert.match(app.html(),/Know where to look/);
const beforeOrientation=JSON.stringify(app.state());
app.click('enter-incident');
assert.equal(JSON.stringify(app.state()),beforeOrientation,'Entering the controls must not consume incident time');
app.click('select-task',{id:'monitor'});
assert.match(app.html(),/Waiting before you can act/);
assert.match(app.html(),/type='submit' disabled/);
app.click('select-task',{id:'validate'});
const guideTime=app.state().minute, deskBeforeGuide=app.html();
app.click('screen-guide');assert.match(app.dialog(),/Your incident screen/);assert.equal(app.html(),deskBeforeGuide);assert.equal(app.state().minute,guideTime);
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
assert.equal(app.json(sessionKey).runtime.selected,'validate','Submission keeps the completed action visible');
assert.match(app.html(),/What it means for the response/);
assert.match(app.html(),/Clarification returned/);
assert.match(app.html(),/Continue: Route the two requests/);
const heldResult=boot(Object.fromEntries(app.memory));heldResult.click('resume');
assert.match(heldResult.html(),/What it means for the response/,'Result survives save and resume');
app.click('next-task');assert.equal(app.json(sessionKey).runtime.selected,'route');
app.submit('route',{tactical:'resources',support:'logistics'});
app.submit('monitor',{vendor:'harbor'});
app.submit('boom',{marsh:3,channel:2});
assert.equal(app.state().tasks.filter(t=>t.period===0&&t.status==='done').length,4);
app.click('review');assert.match(app.html(),/Shift review/);
app.click('return-play');assert.equal(app.context.document.body.className,'view-resources');
app.click('review');app.click('advance');assert.equal(app.state().period,1);
assert.match(app.html(),/The field picture has changed/);assert.match(app.html(),/Operations reports a boom coupling failure/);
assert.match(app.html(),/coverage stayed in place/);
app.click('enter-incident');
app.submit('arrival',{verified:['id','leader','capability','comms'],assignment:'source'});
app.submit('status',{skimmer:'out_of_service',evidence:'maintenance'});
app.submit('reassign',{strategy:'contract',approval:'yes'});
app.submit('forecast',{relief:1,waste:1});
app.click('review');app.click('advance');assert.equal(app.state().period,2);
assert.match(app.html(),/Prepare the team that takes over/);
assert.match(app.html(),/1 relief crew order/);
app.click('enter-incident');
app.submit('relief',{assign:'source',verified:'yes'});
app.submit('cop',{items:['monitor','boom','eta','skimmer'],note:'Verified local record.'});
app.submit('escalation',{recipients:['operations','safety','logistics','command'],concern:'both',note:'Carry constraints forward.'});
app.click('select-task',{id:'handover'});app.click('handover-move',{id:'containment',direction:'-1'});
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
const reloaded=boot(Object.fromEntries(recovered.memory));assert.equal(reloaded.json(careerKey).sessions,1);assert.equal(reloaded.json(reportsKey).length,1);assert.match(reloaded.html(),/The picture you leave/);

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
app.click('replay');app.click('confirm-start');assert.equal(app.state().variant,1);assert.equal(app.state().finished,false);
console.log('v17 UI event/persistence contracts passed: complete playthrough, archive recovery, reward deduplication, corrupt saves, exports and presentation controls (mock DOM).');
