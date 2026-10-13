/* Pure command model for fictional, single-device rehearsal. Role checks are NOT authentication. */
(function(root){'use strict';
const V=2,copy=x=>JSON.parse(JSON.stringify(x));
const stable=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(stable).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}';
function fail(code,msg){const e=new Error(msg);e.code=code;throw e;}
function need(ok,msg,code='INVALID'){if(!ok)fail(code,msg);}
function text(s,label,min=1,max=2000){need(typeof s==='string'&&s.trim().length>=min&&s.length<=max,label+' must contain '+min+'–'+max+' characters.');return s.trim();}
const ROSTER=[{id:'admin',name:'Demo administrator',role:'admin',active:true},{id:'p1',name:'Morgan · fictional participant',role:'participant',active:true,group:'Coordination team'},{id:'p2',name:'Jordan · fictional participant',role:'participant',active:true,group:'Coordination team'},{id:'p3',name:'Casey · inactive fictional participant',role:'participant',active:false,group:'Coordination team'},{id:'evaluator',name:'Demo evaluator',role:'evaluator',active:true},{id:'owner',name:'Demo improvement owner',role:'owner',active:true},{id:'verifier',name:'Demo verifier',role:'verifier',active:true},{id:'executive',name:'Demo program owner',role:'executive',active:true},{id:'system',name:'Local interruption recovery',role:'system',active:true}];
const ROLES={create_campaign:['admin'],start:['participant'],draft:['participant'],tick:['participant'],submit_task:['participant'],pause:['participant'],resume:['participant'],stop:['participant','admin'],expire:['admin'],interrupt:['system'],review:['evaluator'],finding:['evaluator'],action:['evaluator','admin'],complete_action:['owner'],retest:['admin'],verify:['verifier'],appeal:['participant'],resolve_appeal:['evaluator'],invalidate:['admin']};
const CAUSES=['Knowledge/skill','Plan ambiguity','Authority gap','Staffing/capacity','System/tool','Communication','Dependency','Undetermined'];
function initial(org='internal-demo'){need(/^[a-z0-9-]{1,50}$/.test(org),'Invalid workspace key.');return {schema:V,org,revision:0,roster:copy(ROSTER),campaigns:[],assignments:[],sessions:[],reviews:[],findings:[],actions:[],verifications:[],appeals:[],invalidations:[],events:[],keys:{}};}
function get(s,collection,id){const v=s[collection].find(x=>x.id===id&&x.org===s.org);need(v,'Record does not belong to this workspace.','NOT_FOUND');return v;}
function lastReview(s,id){return s.reviews.filter(r=>r.sessionId===id).at(-1)||null;}
function validScenario(t){
 need(t&&typeof t==='object'&&/^PILOT-[A-Z-]+$/.test(t.id),'A supported pilot scenario is required.');
 for(const k of ['title','version','capability','role','objective','requirementId','authorityBoundary','maturity'])text(t[k],k,1,2000);
 need(t.source&&t.rubric&&t.configuration&&t.retest,'Missing source, rubric, configuration or retest relationship.');
 text(t.source.quote,'Source excerpt',20,8000);text(t.source.version,'Source version');text(t.source.section,'Source section');text(t.source.sha256,'Source digest',64,64);
 need(Array.isArray(t.rubric.criteria)&&t.rubric.criteria.length>0,'Rubric required.');need(new Set(t.rubric.criteria.map(x=>x.id)).size===t.rubric.criteria.length,'Duplicate criterion.');
 need(Array.isArray(t.steps)&&t.steps.length>0&&t.steps.length<=8,'Invalid step set.');
 for(const step of t.steps){need(Array.isArray(step.fields)&&step.fields.length>0,'Step needs fields.');need(new Set(step.fields.map(f=>f.id)).size===step.fields.length,'Duplicate field.');need(Number.isFinite(step.advanceMinutes)&&step.advanceMinutes>=0,'Invalid scenario clock.');for(const f of step.fields)need(['text','select','rank'].includes(f.type),'Unsupported interaction.');}
 return t;
}
function config(t,c){need(c&&Object.keys(c).every(k=>['site','mode'].includes(k)),'Only site and mode may be configured.');text(c.site,'Fictional site',1,80);need(['Observed','Coached'].includes(c.mode),'Unsupported mode.');}
function answers(step,a,complete){
 need(a&&typeof a==='object'&&!Array.isArray(a),'A structured work product is required.');
 need(Object.keys(a).every(k=>step.fields.some(f=>f.id===k)),'Unexpected work-product field.');
 for(const f of step.fields){const v=a[f.id];if(!complete&&(v===undefined||v===''))continue;
 if(f.type==='text'){text(v,f.label,complete?f.minLength:0,f.maxLength);}
 else if(f.type==='select'){need(typeof v==='string'&&f.options.some(o=>o.id===v),'Select a valid value for '+f.label);}
 else need(['1','2','3'].includes(String(v)),'Ranks must be 1, 2 or 3.');}
 const ranks=step.fields.filter(f=>f.type==='rank').map(f=>a[f.id]);if(complete&&ranks.length)need(new Set(ranks).size===ranks.length,'Each item needs a different priority rank.');
}
function eligible(s,ids){need(Array.isArray(ids)&&ids.length>0&&ids.length<=50,'Select at least one fictional participant.');need(new Set(ids).size===ids.length,'Duplicate participant selection.');const included=[],excluded=[];for(const id of ids){const p=s.roster.find(x=>x.id===id);need(p?.role==='participant','Only fictional participant records can be assigned.');(p.active?included:excluded).push(p.active?copy(p):{...copy(p),reason:'Inactive fictional participant'});}return {selected:copy(ids),included,excluded};}
function active(s,p,actor){const r=get(s,'sessions',p.sessionId);need(actor.id===r.participantId,'This participant is not the assigned actor.','ROLE');need(r.status==='active','The session must be active.','STATE');need(!s.invalidations.some(i=>i.sessionId===r.id),'Invalidated session cannot accept more participant work.','STATE');need(p.lease===r.lease,'Session is active in a different view.','LEASE');return r;}
function dueDate(d){need(typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d),'Use an ISO due date.');const x=new Date(d+'T00:00:00Z');need(Number.isFinite(x.getTime())&&x.toISOString().slice(0,10)===d,'Invalid calendar date.');return d;}
function transferCandidates(s,action,pack){const original=get(s,'sessions',action.sessionId);return pack.filter(t=>t.retest.transferFrom===original.snapshot.id&&t.capability===original.snapshot.capability&&t.id!==original.snapshot.id);}
function verificationBlockers(s,action,retestId,policy){
 const reasons=[];const r=s.sessions.find(x=>x.id===retestId&&x.org===s.org),f=s.findings.find(x=>x.id===action.findingId),original=s.sessions.find(x=>x.id===action.sessionId);
 if(!['ready','verified'].includes(action.status))reasons.push('Completion evidence must be submitted by the assigned owner.');
 if(!action.completion?.evidence)reasons.push('Completion evidence is missing.');
 if(!r||r.actionId!==action.id||r.originalSessionId!==action.sessionId||r.participantId!==original?.participantId)reasons.push('Retest must belong to this action, original session and participant.');
 if(r?.status!=='completed')reasons.push('Retest is not completed.');
 if(r&&s.invalidations.some(i=>i.sessionId===r.id))reasons.push('Retest has been invalidated.');
 const review=r?lastReview(s,r.id):null;
 if(!review)reasons.push('An evaluator must review the retest.');
 if(review&&r.snapshot.rubric.criteria.filter(c=>c.required).some(c=>review.decisions.find(x=>x.criterionId===c.id)?.status!=='met'))reasons.push('Required retest criteria are not all met in the latest review.');
 if(review&&s.appeals.some(a=>a.sessionId===r.id&&!a.resolution))reasons.push('An unresolved retest appeal blocks verification.');
 if(policy!==REPLAY_ONLY&&original&&s.appeals.some(a=>a.sessionId===original.id&&!a.resolution))reasons.push('An unresolved original-session appeal blocks verification.');
 if(!f||!original)reasons.push('Original finding or evidence missing.');
 if(original&&s.invalidations.some(i=>i.sessionId===original.id))reasons.push('Original session has been invalidated; retain history and reassess this finding.');
 return reasons;
}
const REPLAY_ONLY=Symbol('internal-replay');
function apply(input,command,mode){
 need(input?.schema===V,'Unsupported state schema.','SCHEMA');
 const c=copy(command),s=mode===REPLAY_ONLY?input:copy(input);need(c&&c.org===s.org,'Workspace mismatch.','ORG');text(c.key,'Idempotency key',1,160);text(c.actorId,'Actor');
 need(ROLES[c.type],'Unsupported command.');
 const signature=stable({type:c.type,org:c.org,actorId:c.actorId,payload:c.payload});
 need(!['__proto__','constructor','prototype'].includes(c.key),'Unsafe command key.');
 if(Object.hasOwn(s.keys,c.key)){need(s.keys[c.key].signature===signature,'Idempotency key was reused with a different command.','IDEMPOTENCY');return s;}
 need(s.events.length<12000,'Event limit reached; export this rehearsal and start a fresh workspace.','LIMIT');
 need(Number.isInteger(c.expectedRevision)&&c.expectedRevision===s.revision,'This record changed in another view. Reload the latest state before submitting.','CONFLICT');
 need(typeof c.at==='string'&&/^\d{4}-\d{2}-\d{2}T.*Z$/.test(c.at)&&Number.isFinite(Date.parse(c.at)),'UTC event timestamp required.');
 need(!s.events.length||Date.parse(c.at)>=Date.parse(s.events.at(-1).at),'Late command cannot move the recorded clock backward.','LATE');
 const actor=s.roster.find(a=>a.id===c.actorId&&a.active);need(actor&&ROLES[c.type].includes(actor.role),'This rehearsal persona cannot perform that action. This is not authentication.','ROLE');
 const p=c.payload||{},n=s.revision+1,id=k=>`${s.org}-${k}-${n}`,now=c.at;
 let resultId=null;
 const owned=(collection,recordId)=>get(s,collection,recordId);
 if(c.type==='create_campaign'){
  validScenario(p.scenario);config(p.scenario,p.config);need(p.boundaryAccepted===true&&p.sourceReviewed===true,'Review the source and fictional-data boundary first.');
  text(p.name,'Campaign name',3,120);const audience=eligible(s,p.participantIds);need(audience.included.length>0,'No eligible participants.');
  const campaign={org:s.org,id:id('campaign'),name:p.name,createdAt:now,createdBy:actor.id,audience,sourceAcknowledgment:{actor:actor.id,at:now,scope:'Fictional internal rehearsal only; not professional or organizational content approval'},snapshot:copy(p.scenario),config:copy(p.config),configurationVersion:id('configuration'),channel:'In-app only; no external delivery'};
  s.campaigns.push(campaign);audience.included.forEach((person,i)=>s.assignments.push({org:s.org,id:id('assignment')+'-'+i,campaignId:campaign.id,participantId:person.id,status:'assigned',createdAt:now,sessionId:null}));resultId=campaign.id;
 }else if(c.type==='start'){
  const a=owned('assignments',p.assignmentId),campaign=owned('campaigns',a.campaignId);
  need(a.participantId===actor.id,'Launch your own fictional assignment.','ROLE');need(a.status==='assigned','Assignment already launched.','STATE');need(s.roster.find(x=>x.id===a.participantId)?.active,'Participant is no longer eligible.');
  text(p.lease,'View token',5,100);
  const r={org:s.org,id:id('session'),assignmentId:a.id,campaignId:campaign.id,participantId:actor.id,status:'active',lease:p.lease,lastActiveAt:now,step:0,activeMs:0,scenarioMinutes:0,startedAt:now,acknowledgedAt:now,snapshot:copy(campaign.snapshot),config:copy(campaign.config),configurationVersion:campaign.configurationVersion,drafts:{},evidence:[],ruleChecks:[],consequences:[],originalSessionId:a.originalSessionId||null,actionId:a.actionId||null};
  s.sessions.push(r);a.sessionId=r.id;a.status='launched';resultId=r.id;
 }else if(['draft','tick','submit_task'].includes(c.type)){
  const r=active(s,p,actor);r.lastActiveAt=now;resultId=r.id;
  if(c.type==='tick'){need(Number.isInteger(p.ms)&&p.ms>=0&&p.ms<=15000,'Active-time checkpoint must be 0–15000 ms.');r.activeMs+=p.ms;}
  else{
   need(p.step===r.step,'The submitted task is no longer current.','STATE');const step=r.snapshot.steps[r.step];answers(step,p.answers,c.type==='submit_task');
   r.drafts[step.id]=copy(p.answers);
   if(c.type==='submit_task'){
    const eid=id('evidence');r.evidence.push({org:s.org,id:eid,sessionId:r.id,stepId:step.id,eventSequence:n,submittedAt:now,actorId:actor.id,evidenceClass:'participant-produced / not yet assessed',answers:copy(p.answers),artifactIds:step.artifacts.map(a=>a.id)});
    for(const f of step.fields.filter(f=>f.expected!==undefined))r.ruleChecks.push({evidenceId:eid,fieldId:f.id,criterion:'Synthetic condition only: '+f.label,expected:f.expected,observed:p.answers[f.id],met:p.answers[f.id]===f.expected,evidenceClass:'rule-checked / not judgment assessment'});
    r.consequences.push({stepId:step.id,text:(step.branches.find(b=>p.answers[b.field]===b.equals)||{}).text||step.defaultConsequence});r.scenarioMinutes+=step.advanceMinutes;r.step++;
    if(r.step===r.snapshot.steps.length){r.status='completed';r.completedAt=now;r.reviewStatus='Awaiting evaluator';owned('assignments',r.assignmentId).status='completed';}
   }
  }
 }else if(['pause','resume','stop','expire','interrupt'].includes(c.type)){
  const r=owned('sessions',p.sessionId);resultId=r.id;
  if(actor.role==='participant')need(actor.id===r.participantId,'Only the assigned participant may control this session.','ROLE');
  if(c.type==='resume'){need(r.status==='paused','Only paused sessions can resume.','STATE');text(p.lease,'View token',5,100);r.lease=p.lease;r.lastActiveAt=now;r.status='active';}
  else if(c.type==='pause'||c.type==='interrupt'){need(p.lease===r.lease||(c.type==='interrupt'&&Date.parse(now)-Date.parse(r.lastActiveAt)>=30000),'An active second view must first pause or become stale.','LEASE');need(r.status==='active','Only active sessions can pause.','STATE');r.status='paused';}
  else {need(['active','paused'].includes(r.status),'Completed or terminal history cannot be rewritten.','STATE');text(p.reason,'Reason',3,800);r.status=c.type==='stop'?'stopped':'expired';r.endedAt=now;owned('assignments',r.assignmentId).status=r.status;}
 }else if(c.type==='review'){
  const r=owned('sessions',p.sessionId);need(r.status==='completed','Review requires completed evidence.','STATE');need(actor.id!==r.participantId,'Do not review your own evidence.');
  need(!s.invalidations.some(i=>i.sessionId===r.id),'This session has been invalidated.');
  const prior=lastReview(s,r.id);need((p.amends||null)===(prior?.id||null),'Review changed: reference its latest revision.','CONFLICT');
  need(Array.isArray(p.decisions)&&p.decisions.length===r.snapshot.rubric.criteria.length,'Every rubric criterion needs a decision.');need(new Set(p.decisions.map(d=>d.criterionId)).size===p.decisions.length,'Duplicate criterion decision.');
  for(const d of p.decisions){need(r.snapshot.rubric.criteria.some(x=>x.id===d.criterionId),'Unknown criterion.');need(['met','partially_met','unmet','not_observed'].includes(d.status),'Invalid criterion status.');text(d.rationale,'Criterion rationale',12,2000);need(Array.isArray(d.evidenceIds)&&d.evidenceIds.length>0&&d.evidenceIds.every(e=>r.evidence.some(x=>x.id===e)),'Cite evidence belonging to this session.');}
  const review={org:s.org,id:id('review'),sessionId:r.id,rubricVersion:r.snapshot.rubric.version,actorId:actor.id,at:now,amends:prior?.id||null,decisions:copy(p.decisions),evidenceClass:'evaluator-entered / demo identity unverified'};s.reviews.push(review);resultId=review.id;
 }else if(c.type==='finding'){
  const review=owned('reviews',p.reviewId),r=owned('sessions',review.sessionId);need(review.id===lastReview(s,r.id)?.id,'Use the latest review.');
  need(Array.isArray(p.criterionIds)&&p.criterionIds.length>0&&p.criterionIds.every(k=>review.decisions.some(d=>d.criterionId===k&&d.status!=='met')),'A gap finding must cite a criterion not met in that review.');
  text(p.observation,'Finding',12);text(p.impact,'Impact',12);text(p.causeRationale,'Cause basis / uncertainty',12);need(CAUSES.includes(p.cause),'Select a supported cause; undetermined is valid.');
  const f={org:s.org,id:id('finding'),sessionId:r.id,reviewId:review.id,criterionIds:copy(p.criterionIds),observation:p.observation,impact:p.impact,cause:p.cause,causeRationale:p.causeRationale,at:now,actorId:actor.id};s.findings.push(f);resultId=f.id;
 }else if(c.type==='action'){
  const f=owned('findings',p.findingId);need(!s.actions.some(a=>a.findingId===f.id),'This finding already has an action.');
  text(p.title,'Corrective action',12);text(p.completionCriteria,'Measurable completion criteria',12);dueDate(p.due);
  need(s.roster.some(x=>x.id===p.ownerId&&x.active&&x.role==='owner'),'Assign the fictional improvement owner.');need(s.roster.some(x=>x.id===p.verifierId&&x.active&&x.role==='verifier'),'Assign a different fictional verifier.');need(p.ownerId!==p.verifierId,'Owner and verifier must differ.');
  const a={org:s.org,id:id('action'),findingId:f.id,sessionId:f.sessionId,title:p.title,completionCriteria:p.completionCriteria,ownerId:p.ownerId,verifierId:p.verifierId,due:p.due,status:'open',createdAt:now,completion:null,retestAssignmentIds:[]};s.actions.push(a);resultId=a.id;
 }else if(c.type==='complete_action'){
  const a=owned('actions',p.actionId);need(actor.id===a.ownerId,'Only the assigned improvement owner may submit completion.','ROLE');need(a.status==='open','Completion already submitted; history is preserved.','STATE');text(p.evidence,'Completion evidence',12,4000);
  a.completion={at:now,actorId:actor.id,evidence:p.evidence,evidenceClass:'self-reported / awaiting verification'};a.status='ready';resultId=a.id;
 }else if(c.type==='retest'){
  const a=owned('actions',p.actionId),original=owned('sessions',a.sessionId);need(a.status==='ready','Completion evidence must precede the retest.','STATE');
  validScenario(p.scenario);need(p.scenario.id!==original.snapshot.id&&p.scenario.retest.transferFrom===original.snapshot.id&&p.scenario.capability===original.snapshot.capability,'A different, explicitly linked transfer condition is required.');
  need(stable(p.scenario.steps)!==stable(original.snapshot.steps),'Retest must have different decisions and evidence.');
  need(!a.retestAssignmentIds.some(id=>{const x=owned('assignments',id);return ['assigned','launched'].includes(x.status);}), 'A retest assignment is already active.');
  const campaign={org:s.org,id:id('campaign'),name:'Retest: '+a.title,createdAt:now,createdBy:actor.id,sourceAcknowledgment:{actor:actor.id,at:now,scope:'Fictional retest; no professional approval'},audience:eligible(s,[original.participantId]),snapshot:copy(p.scenario),config:copy(original.config),configurationVersion:id('configuration'),channel:'In-app only; no external delivery'};
  const assignment={org:s.org,id:id('assignment'),campaignId:campaign.id,participantId:original.participantId,status:'assigned',createdAt:now,sessionId:null,originalSessionId:original.id,actionId:a.id};s.campaigns.push(campaign);s.assignments.push(assignment);a.retestAssignmentIds.push(assignment.id);resultId=assignment.id;
 }else if(c.type==='verify'){
  const a=owned('actions',p.actionId);need(actor.id===a.verifierId&&actor.id!==a.ownerId,'Verification requires the assigned distinct verifier.','ROLE');
  // Preserve accepted pre-fix history. Only internal replay may use the old policy.
  const legacy=mode===REPLAY_ONLY&&c.verificationPolicy===undefined;
  if(mode===REPLAY_ONLY)need(legacy||c.verificationPolicy==='original-appeal-v1','Unknown verification policy.','CORRUPT');
  const blocks=verificationBlockers(s,a,p.retestId,legacy?REPLAY_ONLY:undefined);need(blocks.length===0,blocks.join(' '),'VERIFY');text(p.rationale,'Verification rationale',12,3000);
  need(a.status==='ready','Verification already recorded.','STATE');const review=lastReview(s,p.retestId);const v={org:s.org,id:id('verification'),actionId:a.id,findingId:a.findingId,originalSessionId:a.sessionId,retestSessionId:p.retestId,retestReviewId:review.id,rationale:p.rationale,verifierId:actor.id,at:now,evidenceClass:'verifier-entered / demo identity unverified'};s.verifications.push(v);a.status='verified';a.verificationId=v.id;resultId=v.id;
 }else if(c.type==='appeal'){
  const r=owned('sessions',p.sessionId),review=lastReview(s,r.id);need(r.participantId===actor.id&&review,'Only the participant can question an existing review.','ROLE');text(p.reason,'Review question',12);
  const a={org:s.org,id:id('appeal'),sessionId:r.id,reviewId:review.id,reason:p.reason,actorId:actor.id,at:now,resolution:null};s.appeals.push(a);resultId=a.id;
 }else if(c.type==='resolve_appeal'){
  const a=owned('appeals',p.appealId);need(!a.resolution,'Appeal is already resolved.');text(p.rationale,'Resolution',12);a.resolution={actorId:actor.id,at:now,rationale:p.rationale};resultId=a.id;
 }else if(c.type==='invalidate'){
  const r=owned('sessions',p.sessionId);text(p.reason,'Invalidation reason',12);need(!s.invalidations.some(i=>i.sessionId===r.id),'Already invalidated.');const v={org:s.org,id:id('invalidation'),sessionId:r.id,at:now,actorId:actor.id,reason:p.reason};s.invalidations.push(v);resultId=v.id;
 }
 s.revision=n;s.keys[c.key]={signature,resultId,sequence:n};s.events.push({org:s.org,id:id('event'),sequence:n,at:now,actorId:actor.id,type:c.type,key:c.key,resultId,payload:copy(p),...(c.type==='verify'&&(mode!==REPLAY_ONLY||c.verificationPolicy!==undefined)?{verificationPolicy:'original-appeal-v1'}:{})});return s;
}
function validate(s){
 need(s&&s.schema===V&&Array.isArray(s.events)&&s.events.length<=12000,'Unrecognized or over-limit state. Recovery export is available.','CORRUPT');
 let rebuilt=initial(s.org);for(const e of s.events){need(e.org===s.org&&e.sequence===rebuilt.revision+1,'Event sequence or workspace is corrupt.','CORRUPT');rebuilt=apply(rebuilt,{org:s.org,type:e.type,key:e.key,actorId:e.actorId,at:e.at,expectedRevision:rebuilt.revision,payload:e.payload,verificationPolicy:e.verificationPolicy},REPLAY_ONLY);}
 need(stable(rebuilt)===stable(s),'Stored projection does not match its event history. Preserve it for recovery.','CORRUPT');return s;
}
function metrics(s){
 const a=s.assignments,r=s.sessions,completed=r.filter(x=>x.status==='completed'),reviewed=completed.filter(x=>lastReview(s,x.id));
 const m=(id,title,n,d)=>({id,title,numerator:n.map(x=>x.id),denominator:d.map(x=>x.id),period:'All records in this fictional workspace',unit:'records'});
 return [m('launch','Assignments launched',a.filter(x=>x.sessionId),a),m('complete','Sessions completed',completed,r),m('review','Completed sessions reviewed',reviewed,completed),m('verify','Actions with a verification record',s.actions.filter(x=>x.status==='verified'),s.actions)];
}
function exportTrace(s){validate(s);return {exportSchema:'trg-pilot-trace/2',environment:'fictional-browser-rehearsal',identity:'Rehearsal persona, not authenticated identity',integrations:'No live delivery or external callbacks',immutability:'Append-only through application commands; browser storage is not tamper-resistant',metrics:metrics(s),state:copy(s)};}
const api={version:'2.0.0',initial,apply,validate,stable,copy,ROSTER,CAUSES,eligible,lastReview,transferCandidates,verificationBlockers,metrics,exportTrace,validScenario};root.TRG_PILOT_DOMAIN=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
