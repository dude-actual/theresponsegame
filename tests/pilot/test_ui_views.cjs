// Presentation unit checks with a minimal DOM shim; native browser checks are separate.
// This is not native browser, IndexedDB, layout, keyboard, or accessibility evidence.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const repo=path.resolve(__dirname,'../..');
const {harness,D,pack}=require(path.join(repo,'tests/pilot/fixture.cjs'));
const ui=fs.readFileSync(path.join(repo,'pilot/ui.js'),'utf8');
const host={innerHTML:''};
const context={console,Date,Map,Set,Promise,TextEncoder,performance:{now:()=>100},crypto:{randomUUID:()=> 'audit-view'},sessionStorage:{getItem:()=>null,setItem:()=>{}},setInterval:()=>{},clearTimeout:()=>{},setTimeout:()=>{},document:{querySelector:s=>s==='#pilot-root'?host:null,addEventListener:()=>{}},location:{hash:'#/pilot/home'},fetch:async()=>({ok:true,json:async()=>({})})};
context.window=context;context.addEventListener=()=>{};context.TRG_PILOT_DOMAIN=D;context.TRG_PILOT_PACK=pack;
vm.createContext(context);
vm.runInContext(ui.replace('root.TRG_PILOT={','root.AUDIT={set(s,a){state=s;actor=a;store={mode:"indexeddb"};},draw,home,roleNav,actionStatus};root.TRG_PILOT={'),context);
const checks=[],failures=[];
function check(name,fn){try{fn();checks.push(name);}catch(e){failures.push({name,error:e.message});}}
function render(s,actor,view,id=''){const before=D.stable(s);context.AUDIT.set(s,actor);context.location.hash='#/pilot/'+view+(id?'/'+id:'');context.AUDIT.draw();assert.equal(D.stable(s),before,'Rendering mutated input state');return host.innerHTML;}
const h=harness(),g=h.completeLoop(),s=h.state;
check('Participant assignments show only own records',()=>{const c=D.copy(s);c.assignments.push({...c.assignments[0],id:'foreign-assignment',participantId:'p2'});const html=render(c,'p1','assignments');assert(!html.includes('foreign-assignment'));assert.equal((html.match(/<article class="pilot-artifact">/g)||[]).length,c.assignments.filter(a=>a.participantId==='p1').length);});
for(const view of ['prepare','reviews','improve','trace','finding','newaction','unknown'])check('Participant direct route guard: '+view,()=>{const html=render(s,'p1',view,s.assignments[0].id);assert(html.includes('data-participant-boundary'));assert(!html.includes('pilot-review-form'));assert(!html.includes('Event ledger'));});
for(const [view,id] of [['session',g.id],['review',g.id],['reviewed',g.reviewId],['action',g.actionId]])check('Different participant direct route guard: '+view,()=>{const html=render(s,'p2',view,id);assert(html.includes('data-participant-boundary'));assert(!html.includes(s.sessions[0].evidence[0].answers.routing||'Synthetic acceptance-test work product'));});
check('Own review retains rationale and evidence without evaluator controls',()=>{const html=render(s,'p1','review',g.id),review=D.lastReview(s,g.id);assert(html.includes('data-participant-review'));for(const d of review.decisions){assert(html.includes(d.rationale));for(const id of d.evidenceIds)assert(html.includes(id));}assert(html.includes('Question the latest review'));assert(!html.includes('pilot-review-form'));assert(!html.includes('Inspect rule checks'));});
check('Own completed work excludes rule checks and administrative links',()=>{const html=render(s,'p1','session',g.id);assert(!html.includes('Inspect rule checks'));assert(!html.includes('href="#/pilot/trace'));assert(!html.includes('Review this evidence'));assert(html.includes('Source artifacts:'));assert(html.includes('Question the latest review'));});
check('Participant system status is honest and excludes aggregate exports/legacy',()=>{const html=render(s,'p1','release');assert(html.includes('no sign-in'));assert(html.includes('not privacy'));assert(!html.includes('href="#/overview'));assert(!html.includes('data-pilot="export"'));assert(!html.includes('data-pilot="raw"'));});
check('Verified action has historical recorded label',()=>{context.AUDIT.set(s,'admin');assert.equal(context.AUDIT.actionStatus(s.actions[0]),'Verification recorded');});
h.send('appeal',{sessionId:g.id,reason:'Synthetic post-verification question for independent UI review.'},'p1');
check('Post-verification question yields current reassessment without deleting history',()=>{const html=render(h.state,'admin','trace');assert(html.includes('Verification recorded; reassessment needed'));assert.equal(h.state.verifications.length,1);assert.equal(D.metrics(h.state).find(x=>x.id==='verify').numerator.length,1);});
check('Post-verification question visible to evaluator and participant',()=>{assert(render(h.state,'evaluator','reviews').includes('Open review question'));assert(render(h.state,'p1','review',g.id).includes('Synthetic post-verification question'));});
check('Home includes action needing reassessment',()=>{const html=render(h.state,'admin','home');assert(/Actions needing attention<\/span><strong>1<\/strong>/.test(html));});
check('Home evaluation queue includes unresolved review responses',()=>{const html=render(h.state,'admin','home');assert(/(?:evaluation|Evaluation|response)[^<]*<\/span><strong>1<\/strong>/.test(html));});
const result={scope:'Minimal-DOM render checks only; not native browser coverage',uiSha256:crypto.createHash('sha256').update(ui).digest('hex'),passed:checks.length,failed:failures.length,checks,failures};
console.log(JSON.stringify(result,null,2));process.exitCode=failures.length?1:0;
