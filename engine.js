/* Deterministic practice engine. No remote scoring, messaging or AI grading. */
(function(root){
'use strict';
const E={version:'1.0.0'};
E.uid=(p='id')=>p+'-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
E.esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
E.validateConfig=c=>{
 let errors=[];
 for(const k of ['site','role','authority','planRef']) if(!String(c[k]||'').trim()||String(c[k]).length>180)errors.push(k+' must contain 1–180 characters.');
 if(!Number.isInteger(+c.window)||+c.window<3||+c.window>20)errors.push('Practice window must be 3–20 minutes.');
 if(!['Baseline','Primary unavailable','Conflicting reports'].includes(c.variant))errors.push('Unsupported variant.');
 if(!['Web','SMS preview','Voice preview','Email preview','External-task preview'].includes(c.channel))errors.push('Unsupported channel.');
 if(!['Coached','Observed'].includes(c.mode))errors.push('Unsupported practice mode.');
 return errors;
};
E.defaults=s=>({site:s.site,role:s.role,authority:s.authority,planRef:s.plan+' / '+s.planSection,window:s.minutes,variant:'Baseline',channel:'Web',mode:'Coached',version:1});
E.createRun=(s,c,previousId=null)=>{
 const errors=E.validateConfig(c);if(errors.length)throw Error(errors.join(' '));
 return {id:E.uid('run'),scenarioId:s.id,scenarioTitle:s.title,pattern:s.pattern,scenarioVersion:s.version,scenarioSnapshot:JSON.parse(JSON.stringify(s)),snapshotScope:'Frozen starter content at launch; legacy records without this field remain historical',config:JSON.parse(JSON.stringify(c)),previousId,startedAt:new Date().toISOString(),step:0,status:'running',events:[],observations:[],activeMs:0,elapsedSim:0,draft:{},schemaVersion:1};
};
E.record=(r,type,payload={})=>{const e={id:E.uid('event'),sequence:r.events.length+1,at:new Date().toISOString(),type,payload};r.events.push(e);return e;};
E.choose=(r,stage,id)=>{
 if(r.status!=='running'||r.paused)throw Error('Resume the active simulation first.');
 if(stage!==r.step)throw Error('This decision does not belong to the active step.');
 const allowed=[['ack','clarify','defer'],['current','old','rumor'],['authority','verified','bounded','unverified','review','open','assume','delay']][stage];
 if(!allowed?.includes(id))throw Error('Unsupported decision.');
 let met=false,criterion='',reason='';
 if(stage===0){met=id!=='defer';criterion='Acknowledged and established an active response path';reason=id==='ack'?'The initial report has an acknowledged owner.':id==='clarify'?'You acknowledged the report and requested the missing facts in parallel.':'The report remained unacknowledged while the clock advanced.';r.elapsedSim+=id==='defer'?4:1;}
 if(stage===1){met=id==='current';criterion='Used current attributable evidence';reason=met?'You retained the source, timestamp and unresolved limitations.':'A stale or unattributed report was treated as the controlling source.';r.elapsedSim+=2;}
 if(stage===2){const keys={escalate:'authority',verify:'verified',continuity:'bounded',resources:'unverified',communicate:'review',handover:'open'};met=id===keys[r.pattern];criterion={escalate:'Used the designated primary or alternate',verify:'Preserved verified and unverified distinctions',continuity:'Kept the action within authority and known dependencies',resources:'Did not assign readiness unsupported by evidence',communicate:'Followed the approved review path',handover:'Transferred unresolved work with a named owner'}[r.pattern];reason=met?'The selected action satisfies this starter scenario’s stated criterion.':id==='delay'?'The decision was deferred without an accountable interim action.':'The action exceeds the evidence or authority supplied in this scenario.';r.elapsedSim+=2;}
 E.record(r,'decision',{stage,id,criterion,met,reason,elapsedSim:r.elapsedSim});
 r.observations.push({id:E.uid('obs'),stage,criterion,met,reason,evidenceId:r.events.at(-1).id,reviewStatus:'Rule-based practice check'});r.step++;
 return reason;
};
E.complete=(r,draft)=>{
 if(r.status!=='running'||r.paused||r.step!==3)throw Error('Finish the active decisions before submitting the brief.');
 for(const k of ['known','unknown','next'])if(String(draft[k]||'').trim().length<10)throw Error('Each brief field needs at least 10 characters.');
 r.draft={known:String(draft.known).trim(),unknown:String(draft.unknown).trim(),next:String(draft.next).trim()};
 E.record(r,'brief_submitted',{...r.draft,reviewStatus:'Human review required'});r.status='completed';r.completedAt=new Date().toISOString();
 r.reviewStatus='Human review required';return r;
};
E.summary=r=>({met:r.observations.filter(o=>o.met).length,observed:r.observations.length,needsReview:r.status==='completed',elapsedSim:r.elapsedSim,activeSeconds:Math.round(r.activeMs/1000),windowMet:r.elapsedSim<=+r.config.window});
E.csv=rows=>rows.map(row=>row.map(v=>{let s=String(v??'');if(/^[\s\u0000-\u001f]*[=+@\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');
E.parseCSV=text=>{
 const rows=[];let row=[],v='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){v+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(v);v='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(v);if(row.some(x=>x.trim()))rows.push(row);row=[];v='';}else v+=c;}
 if(quoted)throw Error('Unclosed quoted CSV field.');row.push(v);if(row.some(x=>x.trim()))rows.push(row);return rows;
};
E.importPeople=(text,existing=[])=>{
 if(typeof text!=='string'||text.length>1_000_000)throw Error('CSV exceeds the 1 MB demo limit.');
 const rows=E.parseCSV(text.replace(/^\uFEFF/,''));if(rows.length<2)throw Error('Include a header and at least one record.');
 if(rows.length>5001)throw Error('Use at most 5,000 demo records.');
 const h=rows.shift().map(x=>x.trim().toLowerCase());if(h.length>40||new Set(h).size!==h.length||h.some(x=>['__proto__','constructor','prototype'].includes(x)))throw Error('Duplicate or unsupported CSV columns.');const required=['external_id','name','email','group','role'];for(const k of required)if(!h.includes(k))throw Error('Missing column: '+k);
 const accepted=[],exceptions=[];const ids=new Set(existing.map(p=>p.external_id)),emails=new Set(existing.map(p=>p.email.toLowerCase()));
 rows.forEach((row,i)=>{const p=Object.fromEntries(h.map((k,j)=>[k,(row[j]||'').trim()]));let reason=[];
 if(row.some(x=>x.length>500))reason.push('Field exceeds 500-character limit');if(p.email&&!p.email.toLowerCase().endsWith('@example.invalid'))reason.push('Use fictional @example.invalid contacts only');
 if(row.length!==h.length)reason.push('Column count does not match header');for(const k of required)if(!p[k])reason.push('Missing '+k);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))reason.push('Invalid email');if(ids.has(p.external_id))reason.push('Duplicate external_id; reconcile instead of overwriting');if(emails.has(p.email.toLowerCase()))reason.push('Duplicate email; reconcile instead of overwriting');
 if(reason.length)exceptions.push({row:i+2,external_id:p.external_id,reason:reason.join('; ')});else{ids.add(p.external_id);emails.add(p.email.toLowerCase());accepted.push({id:E.uid('person'),external_id:p.external_id,name:p.name,email:p.email,group:p.group,role:p.role,department:p.department||'Unassigned',site:p.site||'Unassigned',active:true,smsConsent:false,voiceConsent:false});}});
 return {accepted,exceptions};
};
E.audience=(people,group,channel,selectedIds=null)=>{const selected=people.filter(p=>Array.isArray(selectedIds)?selectedIds.includes(p.id):(group==='Everyone'||p.group===group));const eligible=[],excluded=[];for(const p of selected){let reason=!p.active?'Inactive personnel record':channel==='SMS preview'&&!p.smsConsent?'No recorded SMS consent':channel==='Voice preview'&&!p.voiceConsent?'No recorded voice consent':null;(reason?excluded:eligible).push(reason?{...p,reason}:p);}return {selected,eligible,excluded};};
// Legacy checks cannot authorize action closure. Use the linked pilot review/retest domain.
E.canVerify=()=>false;
root.TRG_ENGINE=E;if(typeof module!=='undefined')module.exports=E;
})(typeof window!=='undefined'?window:globalThis);
