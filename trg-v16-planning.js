window.TRG = window.TRG || {};
(() => {
'use strict';
const T=window.TRG,$=id=>document.getElementById(id);
T.RELEASE='16.0.0-rc1';
const plans=new Map();
let currentEngine=null,lastPlanningSig='',planningReturnFocus=null;
const ESC={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>ESC[m]);
const fmtCost=n=>'$'+Math.round(Number(n)||0).toLocaleString();
const fmtTime=m=>{m=Math.round(Number(m)||0);return String(Math.floor((m%1440)/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const statusRank={critical:3,watch:2,ready:1};
const FUTURE_REQUIREMENTS={
  hurricane:['Evacuation / transport capacity','Shelter sustainment','Debris and access capability','Power / communications continuity','Responder relief and sustainment'],
  'oil-spill':['Containment and recovery capacity','Air monitoring and PPE','Waste / recovery throughput','Shoreline or access support','Responder sustainment'],
  wildfire:['Relief crews and responder rehab','Water-support capacity','Evacuation / traffic control','Medical support','Access and line-support resources'],
  pipeline:['Air monitoring and hazard-area control','Specialized contractor / vendor lead times','Recovery capability','Remote-access travel time','Responder sustainment'],
  refinery:['Suppression-support capacity','Air monitoring and PPE','Mutual-aid / relief resources','Process-area access','Responder sustainment'],
  chemical:['Air monitoring and clearance capability','PPE and entry support','Medical support','Protective-action support','Technical specialist availability'],
  transportation:['Medical and rescue support','Traffic-control capacity','Heavy recovery / tow availability','Scene access','Public-information coordination'],
  'severe-weather':['Power continuity','Shelter support','Debris / access resources','Communications support','Dispersed-area situational awareness'],
  'public-event':['Medical surge capacity','Traffic / egress support','Communications capacity','Crowd-management coordination','Relief and sustainment'],
  maritime:['Marine response vessels','Tow / recovery capability','Containment / recovery resources','Navigation coordination','Shoreline / responder support']
};

function ensurePlan(engine){
  if(!engine?.state)return null;
  currentEngine=engine;
  const id=engine.state.sessionId;
  if(!plans.has(id))plans.set(id,{sessionId:id,incidentId:engine.pack.id,incidentName:engine.pack.name,roleId:engine.role.id,periods:{},objectiveDispositions:{},briefings:[],openedAt:new Date().toISOString()});
  const plan=plans.get(id);
  engine.objectiveStatus().forEach(o=>{if(!plan.objectiveDispositions[o.id])plan.objectiveDispositions[o.id]={disposition:suggestDisposition(o),updatedAt:null}});
  return plan;
}
function suggestDisposition(o){return o.status==='Not Met'?'Revise':o.status==='At Risk'?'Review':'Carry Forward'}
function objectiveManagement(engine){
  const plan=ensurePlan(engine),objectives=engine.objectiveStatus();
  return objectives.map(o=>({id:o.id,text:o.text,status:o.status,progress:o.progress,suggested:suggestDisposition(o),disposition:plan.objectiveDispositions[o.id]?.disposition||suggestDisposition(o)}));
}
function setObjectiveDisposition(engine,id,disposition){
  const plan=ensurePlan(engine),allowed=['Carry Forward','Review','Revise'];
  if(!allowed.includes(disposition))return;
  plan.objectiveDispositions[id]={disposition,updatedAt:new Date().toISOString()};
  engine.analytics?.record({type:'planning_objective_disposition',sessionId:engine.state.sessionId,period:engine.state.op,objectiveId:id,disposition});
  renderPlanning(engine);
}
function resourceForecast(engine){
  const S=engine.state,nextCount=S.op<4?(engine.diff.requests[S.op]||0):0,pending={};
  engine.pending().filter(x=>x.kind==='request').forEach(x=>{pending[x.resourceId]=(pending[x.resourceId]||0)+Number(x.qty||1)});
  const rows=Object.values(S.inventory).map(r=>{
    const total=r.available+r.committed+r.deployed+(r.outOfService||0),pendingQty=pending[r.id]||0,reserve=Math.max(1,Math.ceil(total*.22)),net=r.available-pendingQty,util=total?Math.round((r.committed+r.deployed+(r.outOfService||0))/total*100):0;
    let risk='ready',reason='Current capacity is adequate against visible demand.';
    if(net<0||(pendingQty>0&&r.available===0)){risk='critical';reason='Visible demand exceeds current available capacity.'}
    else if(net<=reserve||r.outOfService>0||util>=75){risk='watch';reason=r.outOfService>0?'Out-of-service resources reduce planning margin.':'Available reserve is narrow relative to current commitments.'}
    return{id:r.id,name:r.name,available:r.available,committed:r.committed,deployed:r.deployed,oos:r.outOfService||0,pending:pendingQty,total,reserve,util,risk,reason};
  }).sort((a,b)=>(statusRank[b.risk]-statusRank[a.risk])||(b.pending-a.pending)||(b.util-a.util));
  const critical=rows.filter(r=>r.risk==='critical').length,watch=rows.filter(r=>r.risk==='watch').length;
  return{rows,critical,watch,nextRequestCount:nextCount,summary:critical?critical+' capacity gap'+(critical===1?'':'s')+' require planning attention':watch?watch+' resource categor'+(watch===1?'y':'ies')+' with reduced margin':'Current resource posture has planning margin',basis:nextCount?'Next OP is configured to introduce approximately '+nextCount+' new resource request'+(nextCount===1?'':'s')+'; exact resource types remain incident-driven and are not predicted.':'Final operational period: focus shifts to sustainment, transition, and demobilization planning.'};
}
function criticalNeed(engine){
  const items=[...engine.pending()].sort((a,b)=>engine.priorityScore(b)-engine.priorityScore(a)),x=items[0],S=engine.state;
  if(!x)return{label:'No pending critical need',detail:'No active work currently exceeds the incident queue.'};
  const late=S.time>x.due,mins=Math.abs(Math.round(x.due-S.time));
  return{label:x.kind==='request'?x.resource:x.title,detail:x.priority+' · '+(late?'late '+mins+' min':'needed in '+mins+' min')+(x.dest?' · '+x.dest:'')};
}
function planningRecommendations(engine){
  const S=engine.state,s=engine.scores(),objs=engine.objectiveStatus(),forecast=resourceForecast(engine),rec=[];
  const atRisk=objs.filter(o=>o.status!=='Met / On Track');
  if(atRisk.length)rec.push('Review '+atRisk.length+' objective'+(atRisk.length===1?'':'s')+' before the next planning checkpoint; confirm whether each should be carried forward, revised, or replaced.');
  if(S.unmetNeeds)rec.push('Resolve or explicitly carry forward '+S.unmetNeeds+' unmet operational need'+(S.unmetNeeds===1?'':'s')+' with owner and required time visible.');
  const urgent=engine.pending().filter(x=>x.priority==='Urgent').length;
  if(urgent)rec.push('Confirm ownership, status, and required-by times for '+urgent+' urgent work item'+(urgent===1?'':'s')+'.');
  if(S.system.situationalAwareness<80)rec.push('Reconcile Situation and Resources status before the next planning product is finalized.');
  if(s.accountability<80)rec.push('Reconcile check-in, assignment, and status data so the next operational period begins with an accountable resource picture.');
  if(S.system.tempo<78)rec.push('Protect operational tempo by forecasting travel, vendor lead time, relief, and support requirements before they become urgent.');
  const risks=forecast.rows.filter(r=>r.risk==='critical').slice(0,2);
  risks.forEach(r=>rec.push('Develop a sourcing / substitution plan for '+r.name+'; visible demand is consuming current available capacity.'));
  if(!risks.length)forecast.rows.filter(r=>r.risk==='watch').slice(0,1).forEach(r=>rec.push('Monitor '+r.name+' capacity; current commitments leave limited planning margin.'));
  if(S.op<4){const next=engine.pack.periods[S.op];rec.push('Prepare for OP '+(S.op+1)+' — '+next[0]+': '+next[1])}
  else rec.push('Prepare transition / demobilization decisions: identify resources to retain, release, document, and transfer.');
  return [...new Set(rec)].slice(0,6);
}
function operationalOutlook(engine){
  const S=engine.state,periods=engine.pack.periods,current=periods[S.op-1],next=S.op<4?periods[S.op]:null,beyond=S.op<3?periods[S.op+1]:null,forecast=resourceForecast(engine),obj=engine.objectiveStatus(),pressure=(S.unmetNeeds*2)+engine.pending().filter(x=>x.priority==='Urgent').length+obj.filter(o=>o.status!=='Met / On Track').length+(S.system.tempo<75?2:0)+(S.system.responderEffectiveness<75?2:0)+(S.system.situationalAwareness<75?1:0);
  const posture=S.op===4?'Transition Planning':pressure>=5?'Priority Planning Attention':pressure>=2?'Active Forecasting':'Maintain Planning Rhythm';
  return{posture,current:{label:'OP '+S.op+' · '+current[0],text:current[1]},next:next?{label:'OP '+(S.op+1)+' · '+next[0],text:next[1]}:{label:'Transition / Demobilization',text:'Prepare continuity, transfer, release, documentation, and demobilization decisions.'},beyond:beyond?{label:'OP '+(S.op+2)+' · '+beyond[0],text:beyond[1]}:{label:'Longer Horizon',text:S.op<4?'Sustainment and transition implications should be identified before commitment decisions narrow options.':'Preserve continuity and close out resource accountability.'},pressure,forecast};
}
function commandBriefing(engine){
  const S=engine.state,outlook=operationalOutlook(engine),forecast=outlook.forecast,objs=objectiveManagement(engine),crit=criticalNeed(engine),recommendations=planningRecommendations(engine);
  return{title:engine.pack.name+' · Operational Period '+S.op,condition:engine.pack.periods[S.op-1][1],priorities:[...engine.pack.priorities],objectives:objs,critical:crit,resourceForecast:forecast,next:outlook.next,posture:outlook.posture,recommendations};
}
function periodSummary(engine){
  const plan=ensurePlan(engine),S=engine.state,s=engine.scores(),objs=objectiveManagement(engine),outlook=operationalOutlook(engine),forecast=outlook.forecast,prev=plan.periods[S.op-1],costDelta=Math.max(0,Math.round(S.cost-(prev?.cost||0))),summary={period:S.op,label:engine.pack.periods[S.op-1][0],condition:engine.pack.periods[S.op-1][1],closedAt:new Date().toISOString(),scores:{ier:s.ier,mission:s.mission,impact:s.impact,accountability:s.accountability,documentation:s.documentation},objectives:objs,impacts:S.periodImpacts.length,unmetNeeds:S.unmetNeeds,cost:Math.round(S.cost),costDelta,pending:engine.pending().length,resourceForecast:forecast,recommendations:planningRecommendations(engine),outlook:{posture:outlook.posture,next:outlook.next,beyond:outlook.beyond}};
  plan.periods[S.op]=summary;return summary;
}
function finalPlanningAnalysis(engine){
  const plan=ensurePlan(engine),forecast=resourceForecast(engine),objectives=objectiveManagement(engine),recommendations=planningRecommendations(engine),outlook=operationalOutlook(engine);
  return{objectiveManagement:objectives,periodSummaries:Object.values(plan.periods),finalForecast:forecast,finalRecommendations:recommendations,finalOutlook:outlook,planningEvents:{objectiveDispositions:{...plan.objectiveDispositions}}};
}

function patchNarrative(){
  const N=T.experience?.NarrativeDirector;if(!N||N.__v16Planning)return;N.__v16Planning=true;
  const briefing=N.briefing.bind(N);N.briefing=function(pack,role,difficulty,challenge){const b=briefing(pack,role,difficulty,challenge),next=pack.periods[1];b.directive=b.directive+' Planning horizon: OP 2 — '+next[0]+': '+next[1];return b};
  const period=N.period.bind(N);N.period=function(pack,op,state){const b=period(pack,op,state),next=op<4?pack.periods[op]:null;b.text+=next?' Planning outlook: OP '+(op+1)+' — '+next[0]+': '+next[1]:' Planning outlook: begin transition, continuity, and demobilization planning.';return b};
}
function patchEngine(){
  const P=T.SimulationEngine?.prototype;if(!P||P.__v16Planning)return;P.__v16Planning=true;
  const start=P.start;P.start=function(...args){const out=start.apply(this,args);currentEngine=this;ensurePlan(this);this.analytics?.record({type:'planning_cycle_start',sessionId:this.state.sessionId,period:this.state.op});queueMicrotask(()=>renderPlanning(this));return out};
  const begin=P.beginPeriod;P.beginPeriod=function(...args){const out=begin.apply(this,args);currentEngine=this;ensurePlan(this);const plan=plans.get(this.state.sessionId),key='op-'+this.state.op;if(!plan.briefings.some(x=>x.key===key)){plan.briefings.push({key,period:this.state.op,openedAt:new Date().toISOString(),briefing:commandBriefing(this)});this.analytics?.record({type:'planning_period_open',sessionId:this.state.sessionId,period:this.state.op})}queueMicrotask(()=>renderPlanning(this));return out};
  const close=P.closePeriod;P.closePeriod=function(...args){const out=close.apply(this,args);currentEngine=this;periodSummary(this);this.analytics?.record({type:'planning_period_summary',sessionId:this.state.sessionId,period:this.state.op});setTimeout(()=>enhancePeriodReview(this),0);queueMicrotask(()=>renderPlanning(this));return out};
  const finish=P.finish;P.finish=function(...args){const out=finish.apply(this,args);currentEngine=this;const plan=ensurePlan(this);plan.finalAnalysis=finalPlanningAnalysis(this);plan.finishedAt=new Date().toISOString();setTimeout(()=>enhanceResults(this),0);return out};
}
function patchReports(){
  const A=T.services?.AARBuilder;if(!A||A.__v16Planning)return;A.__v16Planning=true;
  const build=A.build.bind(A);A.build=function(args){const report=build(args),plan=plans.get(args?.state?.sessionId);if(plan)report.planningAnalysis=plan.finalAnalysis||{objectiveManagement:Object.values(plan.objectiveDispositions),periodSummaries:Object.values(plan.periods)};return report};
  const html=A.html.bind(A);A.html=function(r){let out=html(r),p=r.planningAnalysis;if(!p)return out;const periods=(p.periodSummaries||[]).map(x=>'<tr><td>OP '+x.period+'<br>'+esc(x.label)+'</td><td>'+x.objectives.filter(o=>o.status==='Met / On Track').length+'/'+x.objectives.length+' on track<br>'+x.unmetNeeds+' unmet needs</td><td>'+esc(x.resourceForecast.summary)+'</td><td>'+esc(x.outlook.next.label)+'<br>'+esc(x.outlook.next.text)+'</td></tr>').join('');const objectives=(p.objectiveManagement||[]).map(o=>'<tr><td>'+esc(o.id)+'</td><td>'+esc(o.text)+'</td><td>'+esc(o.status)+' · '+o.progress+'%</td><td>'+esc(o.disposition)+'</td></tr>').join('');const risks=(p.finalForecast?.rows||[]).filter(x=>x.risk!=='ready').slice(0,8).map(x=>'<li><b>'+esc(x.name)+'</b> — '+esc(x.risk)+': '+esc(x.reason)+'</li>').join('')||'<li>No significant current capacity risk identified.</li>';const rec=(p.finalRecommendations||[]).map(x=>'<li>'+esc(x)+'</li>').join('')||'<li>No additional planning recommendation.</li>';const section='<section class="section"><h2>Planning Cycle Analysis</h2><p><b>Final planning posture:</b> '+esc(p.finalOutlook?.posture||'—')+'</p><h3>Operational Period Planning Summary</h3><table><thead><tr><th>Period</th><th>Objective / Need Posture</th><th>Resource Forecast</th><th>Next Planning Horizon</th></tr></thead><tbody>'+periods+'</tbody></table><h3>Objective Management</h3><table><thead><tr><th>ID</th><th>Objective</th><th>Status</th><th>Planning Disposition</th></tr></thead><tbody>'+objectives+'</tbody></table><h3>Resource Forecast / Future Requirements</h3><ul>'+risks+'</ul><h3>Planning Recommendations</h3><ul>'+rec+'</ul><p><small>Planning recommendations are derived from existing simulation state and do not alter scoring or incident mechanics.</small></p></section>';return out.replace('<div class="foot">',section+'<div class="foot">')};
}

function ensureUI(){
  if(!$('game'))return;
  const cop=$('copSummary');if(cop&&!$('planningOutlookCell')){cop.classList.add('v16-planning');const cell=document.createElement('div');cell.id='planningOutlookCell';cell.className='cop-cell planning-outlook-cell';cell.innerHTML='<span>Planning Outlook</span><b id="planningNextOp">—</b><small id="planningRisk">—</small><button id="planningBriefBtn" type="button">Open Planning Brief</button>';cop.appendChild(cell);$('planningBriefBtn').onclick=openPlanningDialog}
  const tools=document.querySelector('.tools');if(tools&&!$('planningToolBtn')){const b=document.createElement('button');b.id='planningToolBtn';b.type='button';b.className='tool planning-tool';b.textContent='Planning';b.onclick=openPlanningDialog;tools.appendChild(b)}
  if(!$('planningDialog')){const d=document.createElement('dialog');d.id='planningDialog';d.className='planning-dialog';d.setAttribute('aria-labelledby','planningDialogTitle');d.innerHTML='<div class="planning-dialog-head"><div><span class="kicker">Planning Cycle</span><h2 id="planningDialogTitle">Planning Outlook</h2></div><button id="planningDialogClose" class="planning-dialog-close" type="button" aria-label="Close planning outlook">×</button></div><div id="planningDialogBody"></div>';document.body.appendChild(d);$('planningDialogClose').onclick=closePlanningDialog;d.addEventListener('cancel',e=>{e.preventDefault();closePlanningDialog()});d.addEventListener('change',e=>{const sel=e.target.closest('[data-objective-disposition]');if(sel&&currentEngine)setObjectiveDisposition(currentEngine,sel.dataset.objectiveDisposition,sel.value)});d.addEventListener('close',()=>{planningReturnFocus?.focus?.();planningReturnFocus=null})}
  const resultsGrid=document.querySelector('#results .result-grid');if(resultsGrid&&!$('planningAnalysisCard')){const card=document.createElement('section');card.id='planningAnalysisCard';card.className='glass result-card planning-analysis-card';card.innerHTML='<span class="kicker">Planning Cycle Analysis</span><div id="planningAnalysis"></div>';resultsGrid.appendChild(card)}
}
function openPlanningDialog(){if(!currentEngine)return;ensureUI();const d=$('planningDialog');planningReturnFocus=document.activeElement;renderPlanningDialog(currentEngine);currentEngine.analytics?.record({type:'planning_brief_open',sessionId:currentEngine.state.sessionId,period:currentEngine.state.op});if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');setTimeout(()=>$('planningDialogClose')?.focus(),0)}
function closePlanningDialog(){const d=$('planningDialog');if(!d)return;if(typeof d.close==='function'&&d.open)d.close();else{d.removeAttribute('open');planningReturnFocus?.focus?.();planningReturnFocus=null}}
function renderPlanningDialog(engine){
  const body=$('planningDialogBody');if(!body)return;const b=commandBriefing(engine),outlook=operationalOutlook(engine),forecast=b.resourceForecast,requirements=FUTURE_REQUIREMENTS[engine.pack.id]||['Resource continuity','Responder sustainment','Situational awareness','Transition requirements'];
  body.innerHTML='<div class="planning-cycle-strip"><span class="done">Assess Situation</span><span class="active">Validate Objectives</span><span>Forecast Resources</span><span>Build Next OP</span><span>Brief / Execute</span></div>'+
  '<section class="planning-command-brief"><div><span>Command Brief</span><b>'+esc(b.title)+'</b><p>'+esc(b.condition)+'</p></div><div><span>Planning Posture</span><b>'+esc(b.posture)+'</b><p>Critical need: '+esc(b.critical.label)+' — '+esc(b.critical.detail)+'</p></div></section>'+
  '<section class="planning-section"><header><span>Objective Management</span><small>Planning disposition does not change scoring.</small></header><div class="objective-manager">'+b.objectives.map(o=>'<div class="objective-row"><div><b>'+esc(o.id)+' · '+esc(o.status)+'</b><p>'+esc(o.text)+'</p></div><div class="objective-progress"><i><em style="width:'+o.progress+'%"></em></i><strong>'+o.progress+'%</strong></div><label><span>Disposition</span><select data-objective-disposition="'+esc(o.id)+'"><option '+(o.disposition==='Carry Forward'?'selected':'')+'>Carry Forward</option><option '+(o.disposition==='Review'?'selected':'')+'>Review</option><option '+(o.disposition==='Revise'?'selected':'')+'>Revise</option></select></label></div>').join('')+'</div></section>'+
  '<section class="planning-section"><header><span>Operational Outlook</span><small>Current → next → future planning horizon</small></header><div class="outlook-grid"><div><span>Current</span><b>'+esc(outlook.current.label)+'</b><p>'+esc(outlook.current.text)+'</p></div><div><span>Next</span><b>'+esc(outlook.next.label)+'</b><p>'+esc(outlook.next.text)+'</p></div><div><span>Future</span><b>'+esc(outlook.beyond.label)+'</b><p>'+esc(outlook.beyond.text)+'</p></div></div></section>'+
  '<section class="planning-section"><header><span>Resource Forecast</span><small>'+esc(forecast.basis)+'</small></header><div class="forecast-summary '+(forecast.critical?'critical':forecast.watch?'watch':'ready')+'"><b>'+esc(forecast.summary)+'</b></div><div class="forecast-grid">'+forecast.rows.slice(0,6).map(r=>'<div class="forecast-row '+r.risk+'"><div><b>'+esc(r.name)+'</b><span>'+r.available+' avail · '+r.committed+' committed · '+r.deployed+' deployed</span></div><strong>'+(r.risk==='critical'?'GAP':r.risk==='watch'?'WATCH':'READY')+'</strong><p>'+esc(r.reason)+'</p></div>').join('')+'</div></section>'+
  '<section class="planning-section"><header><span>Future Operational Requirements</span><small>Capability considerations from the incident planning horizon</small></header><div class="future-requirements">'+requirements.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></section>'+
  '<section class="planning-section"><header><span>Planning Recommendations</span><small>Derived from current objectives, needs, resources, and system state</small></header><ol class="planning-recommendations">'+b.recommendations.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>';
}
function renderPlanning(engine=currentEngine){
  if(!engine?.state)return;currentEngine=engine;ensureUI();const outlook=operationalOutlook(engine),forecast=outlook.forecast,plan=ensurePlan(engine),sig=[engine.state.op,engine.state.time,engine.state.unmetNeeds,engine.state.impacts.length,forecast.critical,forecast.watch,engine.pending().length,Object.values(plan.objectiveDispositions).map(x=>x.disposition).join('|')].join(':');if(sig===lastPlanningSig)return;lastPlanningSig=sig;
  if($('planningNextOp'))$('planningNextOp').textContent=outlook.next.label;
  if($('planningRisk'))$('planningRisk').textContent=outlook.posture+' · '+forecast.summary;
  const cell=$('planningOutlookCell');if(cell){cell.classList.toggle('critical',forecast.critical>0);cell.classList.toggle('watch',!forecast.critical&&forecast.watch>0)}
  if($('planningDialog')?.open)renderPlanningDialog(engine)
}
function enhancePeriodReview(engine=currentEngine){
  if(!engine?.state||!document.getElementById('period'))return;const summary=plans.get(engine.state.sessionId)?.periods?.[engine.state.op]||periodSummary(engine),impact=$('periodImpacts');let el=$('periodPlanningSummary');if(!el){el=document.createElement('section');el.id='periodPlanningSummary';el.className='period-planning-summary';impact?.insertAdjacentElement('afterend',el)}
  const risk=summary.resourceForecast.rows.filter(x=>x.risk!=='ready').slice(0,3);
  el.innerHTML='<div class="period-planning-head"><div><span class="kicker">Planning Cycle Transition</span><h3>Prepare '+esc(summary.outlook.next.label)+'</h3></div><button type="button" id="periodPlanningOpen">Open Planning Brief</button></div><div class="period-planning-grid"><div><span>Objectives</span><b>'+summary.objectives.filter(o=>o.status==='Met / On Track').length+'/'+summary.objectives.length+' on track</b><p>'+summary.objectives.filter(o=>o.status!=='Met / On Track').length+' require review.</p></div><div><span>Planning Implication</span><b>'+esc(summary.outlook.posture)+'</b><p>'+esc(summary.recommendations[0]||'Maintain current planning rhythm.')+'</p></div><div><span>Resource Forecast</span><b>'+esc(summary.resourceForecast.summary)+'</b><p>'+(risk.map(x=>esc(x.name)).join(' · ')||'No immediate capacity gap identified.')+'</p></div><div><span>Next OP</span><b>'+esc(summary.outlook.next.label)+'</b><p>'+esc(summary.outlook.next.text)+'</p></div></div>';$('periodPlanningOpen').onclick=openPlanningDialog
}
function enhanceResults(engine=currentEngine){
  if(!engine?.state)return;ensureUI();const el=$('planningAnalysis');if(!el)return;const p=plans.get(engine.state.sessionId)?.finalAnalysis||finalPlanningAnalysis(engine),periods=p.periodSummaries||[],risks=p.finalForecast.rows.filter(x=>x.risk!=='ready').slice(0,4),review=p.objectiveManagement.filter(o=>o.disposition!=='Carry Forward');
  el.innerHTML='<div class="planning-result-overview"><div><span>Planning Posture</span><b>'+esc(p.finalOutlook.posture)+'</b></div><div><span>Objectives Requiring Review</span><b>'+review.length+'</b></div><div><span>Final Resource Risks</span><b>'+p.finalForecast.critical+' critical · '+p.finalForecast.watch+' watch</b></div><div><span>Period Summaries</span><b>'+periods.length+'/4</b></div></div><div class="planning-result-columns"><div><span>Objective Dispositions</span>'+p.objectiveManagement.map(o=>'<p><b>'+esc(o.id)+' · '+esc(o.disposition)+'</b><br>'+esc(o.status)+' · '+o.progress+'%</p>').join('')+'</div><div><span>Resource Forecast</span>'+(risks.map(r=>'<p><b>'+esc(r.name)+' · '+esc(r.risk)+'</b><br>'+esc(r.reason)+'</p>').join('')||'<p>No significant remaining capacity risk identified.</p>')+'</div><div><span>Recommended Planning Actions</span><ol>'+p.finalRecommendations.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div></div>';
}

patchNarrative();patchEngine();patchReports();ensureUI();
document.addEventListener('trg:v15-state',()=>renderPlanning(currentEngine));
const observer=new MutationObserver(()=>{if(document.getElementById('period')?.classList.contains('active'))enhancePeriodReview(currentEngine);if(document.getElementById('results')?.classList.contains('active'))enhanceResults(currentEngine)});
observer.observe(document.getElementById('app')||document.body,{subtree:true,attributes:true,attributeFilter:['class']});
T.planning={ensurePlan,objectiveManagement,setObjectiveDisposition,resourceForecast,planningRecommendations,operationalOutlook,commandBriefing,periodSummary,finalPlanningAnalysis,openPlanningDialog};
})();