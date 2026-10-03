/* Resource Run v17: one view controller over the serializable incident state. */
(() => {
  'use strict';
  const E = window.RR17, $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => '$' + Math.round(Number(value) || 0).toLocaleString('en-US');
  const clock = minute => { const n = 420 + Math.round(Number(minute) || 0); return `${String(Math.floor(n / 60)).padStart(2,'0')}:${String(n % 60).padStart(2,'0')}`; };
  const titleCase = value => String(value ?? '').replace(/[_-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  let storageWarning = '', notice = '', audioOn = false, audioContext;
  const SESSION_KEY='trg-v17-session', storageRecords=new Map(), storageErrors=new Map(), dirtyStores=new Set();
  let checkpointConflict=false;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  function storageStatus() {
    storageWarning=[...storageErrors.values()].join(' ');
    const target=$('save-status');if(target){target.textContent=storageWarning;target.hidden=!storageWarning;}
    const controls=$('save-recovery');if(controls)controls.hidden=!storageWarning;
    const status=$('checkpoint-status');if(status)status.textContent=storageWarning?'Latest changes may not be saved. Keep this tab open.':'Checkpoint saved in this browser.';
    if(storageWarning)$('announcement').textContent=storageWarning;
  }
  function readStorage(key) {
    let raw;
    try {
      raw=localStorage.getItem(key);
      const record=raw===null?{kind:'absent',raw:null}:{kind:'loaded',raw,value:JSON.parse(raw)};
      storageRecords.set(key,record);return record;
    } catch(error) {
      let record;
      if(typeof raw==='string')record={kind:'malformed',raw};
      else record={kind:'denied',raw:null};
      storageRecords.set(key,record);return record;
    }
  }
  function read(key, fallback) { const r=readStorage(key);return r.kind==='loaded'?r.value??fallback:fallback; }
  function write(key,value) {
    const known=storageRecords.get(key);
    try {
      const current=localStorage.getItem(key);
      if(known?.kind==='malformed'||known?.kind==='denied'||current!==known?.raw) {
        if(key===SESSION_KEY&&current!==known?.raw)checkpointConflict=true;
        storageErrors.set(key,'Saving is paused: stored data could not be read or changed in another tab. Retry before replacing it.');storageStatus();return false;
      }
      const raw=JSON.stringify(value);localStorage.setItem(key,raw);
      storageRecords.set(key,{kind:'loaded',raw,value});dirtyStores.delete(key);storageErrors.delete(key);storageStatus();return true;
    } catch(error) {
      dirtyStores.add(key);
      storageErrors.set(key,error?.name==='QuotaExceededError'?'Browser storage is full. Your latest changes are not saved. Export the checkpoint or free space, then retry.':'Saving is unavailable in this browser. Your latest changes are not saved. Keep this tab open and export the checkpoint.');
      storageStatus();return false;
    }
  }
  const SCENES=['orientation','play','review','period-briefing','aar','archive'];
  function defaultRuntime(s,selected=null) {
    selected=s.tasks.some(t=>t.id===selected)?selected:s.queue[0]||null;
    const task=s.tasks.find(t=>t.id===selected),index=task?.status==='done'?s.events.findIndex(e=>e.type==='decision'&&e.minute===task.completedAt):-1;
    return {scene:s.finished?'aar':'play',resumeScene:s.finished?'aar':'play',selected,focus:null,view:'work',draft:null,
      result:index>=0?{id:`${s.id}:${index}`,eventIndex:index,acknowledged:false}:null,archiveId:null};
  }
  function validDraft(d,s) {
    if(d===null)return true;
    if(!object(d)||!s.tasks.some(t=>t.id===d.taskId&&t.status==='pending')||!object(d.values))return false;
    if(Object.keys(d.values).length>20||!Object.entries(d.values).every(([k,v])=>/^[a-z][a-z0-9-]{0,39}$/i.test(k)&&Array.isArray(v)&&v.length<=12&&v.every(x=>typeof x==='string'&&x.length<=1000)))return false;
    return Array.isArray(d.handoverOrder)&&d.handoverOrder.length===3&&new Set(d.handoverOrder).size===3&&d.handoverOrder.every(x=>['monitoring','waste','containment'].includes(x));
  }
  function validRuntime(r,s) {
    if(!object(r)||!SCENES.includes(r.scene)||!SCENES.includes(r.resumeScene)||!['work','picture','resources'].includes(r.view))return false;
    if(r.selected!==null&&!s.tasks.some(t=>t.id===r.selected))return false;
    if(r.focus!==null&&(!object(r.focus)||typeof r.focus.name!=='string'||r.focus.name.length>40||typeof r.focus.value!=='string'||r.focus.value.length>1000))return false;
    if(!validDraft(r.draft,s)||(r.draft&&r.draft.taskId!==r.selected))return false;
    if(r.archiveId!==null&&(typeof r.archiveId!=='string'||r.archiveId.length>200))return false;
    if(r.resumeScene==='archive'||(r.scene==='archive'&&!r.archiveId))return false;
    if(s.finished?!['aar','archive'].includes(r.scene):r.scene==='aar')return false;
    const a=r.result;
    return a===null||(object(a)&&Number.isInteger(a.eventIndex)&&a.eventIndex>=0&&a.eventIndex<s.events.length&&a.id===`${s.id}:${a.eventIndex}`&&typeof a.acknowledged==='boolean');
  }
  function validMeta(m,s) { return object(m)&&[null,'schema-17-state','state-selected'].includes(m.migratedFrom)&&m.recovery==='ready'&&(m.savedAt===null||(typeof m.savedAt==='string'&&m.savedAt.length<=30&&Number.isFinite(Date.parse(m.savedAt))))&&Number.isInteger(m.forwardedCount)&&m.forwardedCount>=0&&m.forwardedCount<=s.events.length; }
  function classifyCheckpoint(record) {
    if(record.kind!=='loaded')return {kind:record.kind,raw:record.raw};
    const v=record.value;
    if(object(v)&&v.schema==='trg.checkpoint') {
      if(v.version!==1)return {kind:'unsupported',raw:record.raw};
      if(!E?.validateState(v.state).ok||!validRuntime(v.runtime,v.state)||!validMeta(v.meta,v.state))return {kind:'malformed',raw:record.raw};
      return {kind:'current',envelope:clone(v),raw:record.raw};
    }
    // Only the two known schema-17 shapes migrate; never replay their history.
    const s=v?.schema===17?v:object(v)&&v.schema===undefined?v.state:null;
    if(!E?.validateState(s).ok)return {kind:'malformed',raw:record.raw};
    return {kind:s.finished?'legacy-completed':'legacy-unfinished',raw:record.raw,envelope:{schema:'trg.checkpoint',version:1,state:clone(s),runtime:defaultRuntime(s,v?.selected),meta:{migratedFrom:v?.schema===17?'schema-17-state':'state-selected',recovery:'ready',savedAt:null,forwardedCount:Number.isInteger(s.forwardedCount)?Math.max(0,Math.min(s.forwardedCount,s.events.length)):0}}};
  }
  const legacy = read('trgProfileV12', {});
  const number = (value, max = Number.MAX_SAFE_INTEGER) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(0, Math.round(value))) : 0;
  const savedCareer = read('trg-v17-career', null);
  const sourceCareer = savedCareer && typeof savedCareer === 'object' && !Array.isArray(savedCareer) ? savedCareer : {xp:number(legacy?.xp)};
  function normalizeCareer(sourceCareer) { return {
    xp:number(sourceCareer.xp), sessions:number(sourceCareer.sessions), best:number(sourceCareer.best,100),
    completed:[...new Set((Array.isArray(sourceCareer.completed)?sourceCareer.completed:[]).filter(id=>typeof id==='string'))].slice(-500),
    mastery:Object.fromEntries(Object.entries(sourceCareer.mastery && typeof sourceCareer.mastery==='object' && !Array.isArray(sourceCareer.mastery)?sourceCareer.mastery:{}).filter(([,value])=>typeof value==='number'&&Number.isFinite(value)).map(([key,value])=>[key,number(value,100)])),
    motion:sourceCareer.motion===true
  }; }
  let career=normalizeCareer(sourceCareer);
  const validReport = r => r && typeof r==='object' && r.schema==='trg.session-report.v17' && typeof r.sessionId==='string' && typeof r.incidentName==='string' && typeof r.difficulty==='string' && Number.isFinite(r.score) && Number.isFinite(r.cost) && Array.isArray(r.history) && r.history.every(h=>h&&Number.isFinite(h.minute)&&['action','change','consequence','constraint','category'].every(k=>typeof h[k]==='string')) && Array.isArray(r.objectives) && r.objectives.every(o=>o&&typeof o.status==='string'&&typeof o.text==='string') && r.competencies && typeof r.competencies==='object' && !Array.isArray(r.competencies) && Object.values(r.competencies).every(Number.isFinite);
  let reports = read('trg-v17-reports', []);
  if(!Array.isArray(reports)||!reports.every(validReport))storageRecords.set('trg-v17-reports',{...storageRecords.get('trg-v17-reports'),kind:'malformed'});
  reports=Array.isArray(reports)?reports.filter(validReport).slice(0,30):[];
  for(const key of ['trg-v17-career','trg-v17-reports'])if(['malformed','denied'].includes(storageRecords.get(key)?.kind))storageErrors.set(key,'Some career or archive data could not be read. Its stored value is preserved; readable AARs remain available.');
  let checkpoint=classifyCheckpoint(readStorage(SESSION_KEY));
  let state=checkpoint.envelope?.state||null;
  let runtime=checkpoint.envelope?.runtime||null;
  let checkpointMeta=checkpoint.envelope?.meta||null;
  let selected=runtime?.selected||null,view=runtime?.view||'work',screen='home',displayedReport=null,replacement=null;
  let checkpointBlocked=['malformed','unsupported','denied'].includes(checkpoint.kind);
  if(checkpointBlocked)storageErrors.set(SESSION_KEY,checkpoint.kind==='unsupported'?'This save uses an unsupported version. It has been preserved.':checkpoint.kind==='denied'?'Browser storage cannot be read. Retry access before replacing any saved response.':'The saved response could not be loaded. Its original data has been preserved.');
  storageStatus();
  let handoverOrder = ['monitoring','waste','containment'];
  let returnFocus = null, lastForwarded=checkpointMeta?.forwardedCount||0;
  document.documentElement.dataset.motion = career.motion ? 'reduce' : 'system';
  function persist() {
    if(!state||checkpointBlocked)return false;
    runtime.selected=selected;runtime.view=view;
    const envelope={schema:'trg.checkpoint',version:1,state,runtime,meta:{...checkpointMeta,savedAt:new Date().toISOString(),forwardedCount:lastForwarded}};
    if(!validRuntime(runtime,state)){storageErrors.set(SESSION_KEY,'The current screen could not be saved. Export your checkpoint before leaving.');storageStatus();return false;}
    return write(SESSION_KEY,envelope);
  }
  function boundary(scene) { if(runtime){runtime.scene=scene;if(scene!=='archive'){runtime.resumeScene=scene;runtime.archiveId=null;}} }
  function captureDraft(form) {
    if(!state||!form||!state.tasks.some(t=>t.id===form.dataset.task&&t.status==='pending'))return;
    const values=Object.create(null);
    for(const [name,value] of new FormData(form).entries())if(typeof value==='string')(values[name]||=[]).push(value);
    selected=form.dataset.task;runtime.selected=selected;
    runtime.draft={taskId:selected,values,handoverOrder:[...handoverOrder]};
    persist();
  }
  function restoreDraft() {
    const d=runtime?.draft,form=document.querySelector('.task-form');if(!d||d.taskId!==selected||!form)return;
    for(const control of form.elements){if(!control.name)continue;const values=d.values[control.name]||[];
      if(['checkbox','radio'].includes(control.type))control.checked=values.includes(control.value);
      else control.value=values[0]??'';
    }
    handoverOrder=[...d.handoverOrder];if($('handover-list'))$('handover-list').innerHTML=handoverRows();
    if(selected==='boom')allocationTotal();
  }
  function resultText() { const e=state?.events[runtime?.result?.eventIndex];return e?.consequence||e?.change||'The incident state has been updated.'; }
  function acknowledge() { if(runtime?.result){runtime.result.acknowledged=true;notice='';} }
  function resumeBoundary() {
    if(!state)return;
    selected=runtime.selected;view=runtime.view;handoverOrder=runtime.draft?.handoverOrder||['monitoring','waste','containment'];
    notice=runtime.result&&!runtime.result.acknowledged?resultText():'';
    if(runtime.scene==='archive') { const r=reports.find(r=>r.sessionId===runtime.archiveId);if(r){aar(r,true);return;}runtime.scene=runtime.resumeScene; }
    if(state.finished){complete();return;}
    if(runtime.scene==='orientation')orientation();else if(runtime.scene==='period-briefing')periodBriefing();else if(runtime.scene==='review')review();else play();
    const focus=runtime.focus,form=document.querySelector('.task-form');
    if(focus&&form)Array.from(form.elements).find(c=>c.name===focus.name&&(!['radio','checkbox'].includes(c.type)||c.value===focus.value))?.focus();
  }
  function downloadCheckpoint() {
    const content=checkpointBlocked?checkpoint.raw:JSON.stringify({schema:'trg.checkpoint',version:1,state,runtime,meta:{...checkpointMeta,forwardedCount:lastForwarded}},null,2);
    if(content==null){announce('No readable checkpoint is available to export.');return;}
    const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Response-Game-checkpoint.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function retryStorage() {
    if(checkpointConflict){modal('Another tab changed the checkpoint',`<p>Your current response is still in this tab. Export it before loading the stored checkpoint if you need both. Loading discards this tab's unsaved changes.</p><button data-action='export-checkpoint'>Export this response</button><button data-action='load-stored'>Discard unsaved changes and load stored checkpoint</button><button data-close>Keep this tab</button>`);return;}
    // Re-read denied historical stores before attempting completion recovery. Never
    // replace a previously unread profile/archive with the temporary empty view.
    for(const key of ['trg-v17-career','trg-v17-reports'])if(storageRecords.get(key)?.kind==='denied') {
      const r=readStorage(key);if(!['loaded','absent'].includes(r.kind))continue;
      if(key==='trg-v17-career')career=normalizeCareer(object(r.value)?r.value:{});
      else {const values=r.kind==='absent'?[]:r.value;if(!Array.isArray(values)||!values.every(validReport)){storageRecords.set(key,{...r,kind:'malformed'});continue;}reports=values.slice(0,30);}
      storageErrors.delete(key);
    }
    // Failed writes retain their live value. Retry each store even while the
    // incident is unfinished; the raw-value guard still protects external edits.
    if(!state?.finished)for(const key of ['trg-v17-career','trg-v17-reports'])if(dirtyStores.has(key))write(key,key==='trg-v17-career'?career:reports);
    if(checkpointBlocked||!state) {
      checkpoint=classifyCheckpoint(readStorage(SESSION_KEY));
      if(checkpoint.envelope){state=checkpoint.envelope.state;runtime=checkpoint.envelope.runtime;checkpointMeta=checkpoint.envelope.meta;selected=runtime.selected;view=runtime.view;lastForwarded=checkpointMeta.forwardedCount;checkpointBlocked=false;storageErrors.delete(SESSION_KEY);storageStatus();resumeBoundary();}
      else if(checkpoint.kind==='absent'){checkpointBlocked=false;storageErrors.delete(SESSION_KEY);storageStatus();home();}
      else {storageStatus();home();}
    } else {if(state.finished)complete();else persist();storageStatus();}
  }
  function announce(text) { $('announcement').textContent = text; }
  function sound() { if (!audioOn) return; try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); audioContext.resume(); const o=audioContext.createOscillator(),g=audioContext.createGain(); o.type='sine';o.frequency.setValueAtTime(520,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(360,audioContext.currentTime+.1);g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.15);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.16); } catch { audioOn=false; } }
  function forwardEvents() { const endpoint = window.TRG_CONFIG?.analyticsEndpoint; if (!endpoint || !state) return; const events=state.events.slice(lastForwarded); for (const event of events) { try { navigator.sendBeacon?.(endpoint,new Blob([JSON.stringify({...event,sessionId:state.id,schema:'trg.event.v17',incidentType:'oil-spill',roleId:'resources-unit'})],{type:'application/json'})); } catch {} } lastForwarded=state.events.length; }
  function modal(title, body) { returnFocus=document.activeElement; $('dialog-content').innerHTML=`<div class='dialog-copy'><h2 id='dialog-title'>${esc(title)}</h2>${body}</div>`; if (!$('overlay').open) $('overlay').showModal(); }
  function closeModal() { $('overlay').close(); returnFocus?.isConnected && returnFocus.focus(); }
  $('overlay').addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeModal(); });
  const branding = `<div class='brand'><div class='brand-mark' aria-label='TRG'>TRG</div><div class='brand-name'>The Response Game<span>Incident-management simulations</span></div></div>`;
  function topbar(game=false) { return `<header class='topbar ${game?'game-topbar':''}'>${branding}${game?`<div class='session-label'><span class='display'>BLACKWATER REACH</span><span class='sim-clock' aria-label='Incident time'>${clock(state.minute)}</span></div>`:''}<nav aria-label='Session tools'>${game?`<button data-action='screen-guide'>Screen guide</button><button data-action='traffic'>Shift log</button>`:''}<button data-action='guide'>How to play</button><button data-action='settings'>Settings</button><button data-action='reports'>${game?'AAR archive':'Career & AARs'}</button>${game?`<button data-action='home'>Save & leave</button>`:''}</nav></header><p id='save-status' class='save-notice' role='status' ${storageWarning?'':'hidden'}>${esc(storageWarning)}</p><div id='save-recovery' ${storageWarning?'':'hidden'}><div class='button-row'><button data-action='retry-save'>Retry saving / loading</button><button data-action='export-checkpoint'>Export preserved checkpoint</button></div></div>`; }
  function focusPage() { window.scrollTo({top:0,behavior:'instant'}); $('page-title')?.focus(); }
  function home() {
    screen='home'; document.body.className='';
    $('app').innerHTML=`${topbar()}<main class='welcome-page'>
      <section class='welcome-hero'><p class='eyebrow'>Welcome to The Response Game</p>
        <h1 id='page-title' tabindex='-1'>An incident is unfolding.<br><span>Your decisions shape the response.</span></h1>
        <p class='welcome-lead'>Play an incident-management simulation. Coordinate people and equipment, work through competing requests, and see how your decisions affect the crews doing the work.</p>
        <p>You will receive a scenario briefing, learn your role, and get a tour of the controls before you begin.</p>
      </section>
      <section class='scenario-entry' aria-labelledby='scenario-title'><div><p class='eyebrow'>Resource Run / Oil spill scenario</p><h2 id='scenario-title'>Blackwater Reach</h2>
        <p>An oil spill threatens a working harbor and a nearby salt marsh. Join the incident team as the Resources Unit and help get the right resources to the right place in time.</p>
        <p class='scenario-meta'>Fictional Gulf Coast location · One player · About 10–15 minutes · No timer while you read</p>
      </div><div class='scenario-actions'><button class='primary' data-action='briefing'>Start oil spill scenario →</button><small>First: your scenario and role briefing.</small>
        ${state&&!state.finished?`<button data-action='resume'>Resume saved scenario · ${clock(state.minute)}</button>`:''}
        ${state?.finished?`<button data-action='view-report' data-id='${esc(state.id)}'>View last after-action review</button>`:''}
      </div></section>
      <section class='welcome-explainer'><h2>What are you trying to achieve?</h2><p>Support safe work at the spill, protect the most exposed area, keep resources accounted for, and prepare the next shift. You cannot meet every demand at once. Your after-action review explains the effects of the choices you made.</p><p>New to incident management? Start with <b>Guided shift</b>. Terms and local procedures are explained as you need them.</p></section>
      ${storageWarning?`<p class='save-notice' role='status'>${esc(storageWarning)}</p>`:''}
    </main>`;
  }
  function briefing() {
    screen='briefing'; document.body.className='';
    $('app').innerHTML=`${topbar()}<main class='scenario-briefing'>
      <button class='text-button' data-action='home'>← Back to game home</button><p class='eyebrow'>Before you play / Scenario briefing</p>
      <h1 id='page-title' tabindex='-1'>Oil spill at Blackwater Reach</h1><p class='brief-deck'>07:00. An industrial waterfront, a working channel, and a marsh in the path of the oil.</p>
      <div class='briefing-columns'><section class='story-copy'><h2>What happened</h2>
        <p>A transfer line has ruptured at a berth in Blackwater Reach, a fictional Gulf Coast estuary. Oil has entered the water. The outgoing tide is carrying it away from the terminal toward the channel and the salt-marsh inlet.</p>
        <p>Operations has an Entry Group preparing to work at the damaged line. That crew cannot enter until an atmospheric monitoring team is present to check the air for hazardous vapor and oxygen conditions. Their request is waiting for review, and the team is needed by <b>07:55</b>.</p>
        <p>At the same time, crews need floating barriers called <b>boom</b> to contain and redirect the oil. Six 100-metre sections are in staging. Operations wants four at the marsh and three in the channel, so there is not enough to meet both requests. Keeping a spare means protecting less water now.</p>
        <p>One <b>skimmer</b>—a vessel that collects oil from the water—is working the channel with a monitoring team. A second skimmer is listed at staging. That resource picture will need checking as new reports arrive.</p>
        <div class='brief-location'><img src='assets/v17/harbor.svg' alt='Blackwater Reach: source berth southwest, working channel centrally, North Marsh northeast and East Staging at the terminal.'><p><b>Know the places:</b> Source berth is where the line failed. Channel is the recovery corridor. North Marsh is the sensitive shoreline. East Staging is the holding and check-in area for resources.</p></div>
      </section><aside class='role-brief'><p class='eyebrow'>Your place in the response</p><h2>You are the Resources Unit.</h2>
        <p>You are working in the incident command post, in the Planning Section. Your job is to maintain a reliable picture of people and equipment and coordinate resource needs.</p>
        <p><b>Operations</b> directs field assignments. <b>Logistics</b> arranges support and external sourcing. <b>Safety</b> advises on safe work. You record and coordinate their decisions through the incident interface.</p>
        <h3>Your mission</h3><ol class='mission-objectives'><li>Help establish safe source work with the right monitoring capability.</li><li>Recommend containment within the resources actually available.</li><li>Track arrivals, assignments and equipment limitations accurately.</li><li>Prepare relief and waste support, then hand over the remaining constraints.</li></ol>
        <h3>How the story unfolds</h3><p><b>07:00 · Establish control.</b> Review the requests, source monitoring and allocate boom.</p><p><b>08:00 · Hold the line.</b> Respond to field reports and equipment problems. Prepare the next period.</p><p><b>09:30 · Make the handover.</b> Assign relief and give the incoming team a verified picture.</p>
        <p class='form-note'>An operational period is a planned block of incident work. Your decisions and resources carry forward when it changes.</p>
      </aside></div>
      <section class='begin-panel'><h2>Choose your level of support</h2><fieldset class='run-options'><legend>Working conditions</legend><div class='mode-options'><label><input type='radio' name='difficulty' value='guided' checked><strong>Guided shift · recommended first</strong><small>Clearer reports and optional explanations of the process.</small></label><label><input type='radio' name='difficulty' value='advanced'><strong>Under pressure</strong><small>Less guidance, conflicting information and changing arrival times.</small></label></div></fieldset>
        <p>Reading, reviewing and exploring the controls do not advance time. Submitting an operational action does. At the end, the after-action review connects your choices to their consequences.</p><button class='primary' data-action='start'>Continue to controls →</button><small>The scenario starts after the short controls introduction.</small></section>
    </main>`; focusPage();
  }
  function orientation() {
    screen='orientation';boundary('orientation'); document.body.className='';
    const started=state.history.some(h=>h.source==='player')||state.period>0;
    $('app').innerHTML=`${topbar()}<main class='orientation-page'><p class='eyebrow'>Before you play / Your incident screen</p><h1 id='page-title' tabindex='-1'>Know where to look. Then make your first decision.</h1>
      <p class='brief-deck'>You will work from one incident screen. These four areas explain what is happening, what you can do, and what changed.</p>
      <div class='desk-preview' aria-label='Guide to the four areas of the incident screen'>
        <section><span class='area-number'>1</span><h2>Incoming work</h2><p>Requests from the incident team. Select one to read its background and act. A waiting label explains any prerequisite.</p><small>You choose the work order. Queue arrows change its position.</small></section>
        <section class='preview-map'><span class='area-number'>2</span><h2>Incident picture</h2><p>The map shows where resources are assigned. Incident traffic is the radio and message log from the teams.</p><small>Select a map location for details. Open the shift log for earlier reports.</small></section>
        <section><span class='area-number'>3</span><h2>Your action</h2><p>Read why this request matters, then use the supplied reports, form or resource choices. Submit when ready.</p><small>You will see the result before choosing the next work item.</small></section>
        <section class='preview-status'><span class='area-number'>4</span><div><h2>Incident status & resources</h2><p><b>Source entry:</b> whether monitoring and relief allow work. <b>Recovery:</b> higher means stronger oil-recovery capability. <b>Shoreline impact:</b> lower is better. <b>Resource-picture reliability:</b> how accurately resources are tracked. <b>Cost:</b> money committed from a $12,000 planning allowance.</p><p>The resource ledger shows what is assigned, available, en route or out of service. An order is not an arrival; an arrival is not a verified assignment.</p></div></section>
      </div><div class='first-action-brief'><p class='eyebrow'>${started?'Return to your incident':'Your first action'} / ${clock(state.minute)}</p><h2>${started?'Return to your response.':'Review the Entry Group’s monitoring request.'}</h2><p>${started?esc(periodStory().goal):'The crew at the damaged line is waiting for a monitoring team. Read request RR-041, decide which details the requester needs to clarify, then submit your review. The supporting context will be beside the form.'}</p>${state.variant===1?`<p>${esc(state.intel.current)} Revised boom targets: marsh ${state.intel.marshDemand}, channel ${state.intel.channelDemand}.</p>`:''}<p><b>On a phone:</b> use Work queue, Incident picture and Resources at the bottom of the screen. Use <b>Screen guide</b> whenever you need this orientation again.</p><button class='primary' data-action='enter-incident'>${started?'Return to incident':'Begin playing'} →</button></div>
    </main>`;persist();focusPage();
  }
  function screenGuide() {
    modal('Your incident screen',`<ol class='screen-guide-list'><li><h3>Incoming work</h3><p>Select a request to read its background and act. Ready means its prerequisites are met. Waiting explains what must happen first. Reordering is free.</p></li><li><h3>Incident picture</h3><p>Use the map to see assignments and select a location for details. Read Incident traffic for recent messages, or Shift log for the full record.</p></li><li><h3>Your action</h3><p>Read the context and the supplied evidence, then submit your decision. The result stays visible until you choose what to do next. Reading this guide does not change your selections or advance incident time.</p></li><li><h3>Incident status & resources</h3><p>Source entry tells you whether work can proceed. Higher recovery and resource-picture reliability are better; lower shoreline impact is better. Cost is your total commitment against a $12,000 planning allowance.</p><p>The resource ledger shows availability, assignments and arrival times. On a phone, use the three view buttons at the bottom.</p></li></ol>`);
  }
  function periodStory() {
    if(state.period===0)return {title:'The response is waiting on resources',text:`You have joined the command post at 07:00. The Entry Group needs monitoring before it can work at the damaged line. Oil is moving toward the ${state.intel.priorityArea==='marsh'?'North Marsh inlet':'working channel'}, and the boom requests exceed available stock.`,goal:'Review the requests, arrange monitoring, and recommend where the six boom sections should go.'};
    if(state.period===1){const condition=state.history.find(h=>h.source==='condition'&&['Reserve deployed','Coupling failure'].includes(h.action));return {title:'The field picture has changed',text:`${condition?'Operations reports a boom coupling failure. '+condition.change+' '+condition.consequence+' '+condition.constraint:'No boom was deployed in the opening period, so the requested containment areas remain uncovered.'} Maintenance now reports that SK-02 cannot operate. The work ordered earlier must be checked against what is actually arriving.`,goal:'Verify monitoring arrival, reconcile SK-02, resolve the skimmer conflict, and order support for the next shift.'};}
    const relief=state.resources.filter(r=>r.kind==='relief').length,waste=state.resources.filter(r=>r.kind==='waste').length;
    return {title:'Prepare the team that takes over',text:`Your earlier forecast produced ${relief} relief crew order(s) and ${waste} waste package order(s). The source crew reaches its duty limit at 10:00. ${state.safetyHold?'Source work remains on hold.':'Monitoring is supporting source work.'} The incoming team needs to know what can continue and what is still missing.`,goal:'Record relief, publish verified information, coordinate unresolved gaps, and leave an ordered watch list.'};
  }
  function periodBriefing() {
    screen='period-briefing';boundary('period-briefing');document.body.className='';const story=periodStory();
    $('app').innerHTML=`${topbar(true)}<main class='period-review'><p class='eyebrow'>New operational period / ${clock(state.minute)}</p><h1 id='page-title' tabindex='-1'>${esc(story.title)}</h1><p class='review-lead'>${esc(story.text)}</p><section class='period-mission'><h2>Your objective for period ${state.period+1}</h2><p>${esc(story.goal)}</p></section><h2>What carries forward from your decisions</h2><ul class='carry-list'>${state.intel.currentGaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul><p>Resource assignments, orders and committed cost (${money(state.cost)}) remain in effect. Review the new reports before deciding how to respond.</p><button class='primary' data-action='enter-incident'>Continue to period ${state.period+1} →</button></main>`;persist();focusPage();
  }
  function waitingReason(task) {
    if(task.status==='done'||task.available)return '';
    if(task.id==='monitor')return 'First review RR-041 and route the two requests. Logistics needs a reviewed request and a responsible owner before you can commit a source.';
    if(task.id==='arrival')return `The monitoring resource is ${monitorETA()}. It cannot be checked in before arrival. Handle another work item or advance incident time while waiting.`;
    if(task.id==='handover')return 'Complete relief, the resource-picture update and coordination first. The incoming watch list needs those decisions.';
    return 'This work is not yet available.';
  }
  function nextTask() { return pending().find(t=>t.available)||pending()[0]; }
  function taskContext(task) {
    const contexts={
      validate:['Why this request is here','The Entry Group is preparing to work at the ruptured transfer line. Before that crew can enter, it needs a team to monitor the air. Their resource request has reached your desk so Logistics can find the right people and equipment.','Read the request below. Select only details that need clarification for someone to fulfill it. ICS 213RR is the resource-request form; RR-041 is this request’s tracking number.'],
      route:['Two requests, different responsibilities','The Entry Group needs a monitoring team for its field assignment. A second request, RR-042, asks for intrinsically safe radios for incident communications. The requests need owners so neither is lost between sections.','Use the local routing process shown below. You are forwarding each request for processing, not assigning crews or placing a purchase yourself.'],
      source:['The crew is still waiting at the berth',`${task.available?'The reviewed request is now ready for sourcing.':'Logistics needs the request reviewed and routed before committing a source.'} One monitoring team, MON-01, is already supporting Channel Recovery. Logistics has three external offers as well. The source team is needed by 07:55; it is now ${clock(state.minute)}.`,`Compare the capability, travel time and commitment of each option. An internal transfer releases one assignment to support another. External costs are for one operational period.`],
      allocation:['Oil is moving beyond the terminal',`${state.intel.current} Floating boom sections help contain and redirect oil. Operations requests ${state.intel.marshDemand} sections at the marsh and ${state.intel.channelDemand} in the channel, but only six are available.`,`Enter a recommendation for each location. Sections left over stay in reserve. Operations has authorized placements within this limit; a reserve provides no protection until it is deployed.`],
      checkin:['An order must become a working resource','The monitoring source you chose in the first period is now part of your resource picture. The Entry Group can use it only if the team has arrived, its actual capability fits the work, and its assignment is recorded.','Review the receiving report below and record the checks and authorized destination. ICS 211 is the check-in record; checking a box does not change the equipment a team brought.'],
      reconcile:['Two reports describe the same skimmer differently','Operations is looking for another skimmer—a vessel that recovers oil from the water. SK-02 appears available on an earlier staging board, but a later maintenance inspection reports a failed pump.','Choose the status supported by the evidence and identify your source. This updates the resource status record, using ICS 210 concepts; it does not repair equipment.'],
      reassign:['Recovery is needed in two places','SK-01 is collecting oil in the channel. Operations also needs recovery at the marsh edge, and SK-02 cannot run because of its failed pump. Moving SK-01 will leave the channel without that skimmer.','Recommend a posture and record Operations authorization if changing an assignment. A contracted skimmer costs $4,600 and takes 35 incident minutes to arrive.'],
      forecast:['The next shift depends on orders placed now','The crew working at the source reaches its duty limit at 10:00. Oil collected by the skimmers also needs waste storage and removal capacity. Those needs have lead times, so waiting until the shortage appears may interrupt work.','Order relief crews and waste packages for the next period. One of each meets the stated need; additional packages create contingency at additional cost.'],
      relief:['It is time to use the support you ordered',`Your resource picture contains ${state.resources.filter(r=>r.kind==='relief').length} relief crew(s). The source crew must stand down at 10:00; the marsh crew can continue through handover. Orders that have not arrived cannot relieve anyone.`,`Use the ledger to check arrival before recording a handover. If you did not order relief, no assignment here can create it; that limitation must carry into the incoming shift.`],
      cop:['The next shift needs one shared picture','The Situation Unit maintains the common operating picture: the incident team’s shared account of conditions and resources. It needs your verified facts, including limitations. A report of a second offshore sheen is still unconfirmed.','Select the facts to send and optionally add a short note. The current status below is your evidence; uncertainty should stay visible.'],
      escalation:['Some remaining gaps need another function’s authority','Your resource decisions have left costs and operational limitations for the incident team to manage. The Planning Section Chief needs the right decision-makers informed before handover.','Review the live gaps below. Address the message to the functions able to act and identify the decision they need to make. Sending a message alone will not remove the gap.'],
      handover:['Your shift ends; the incident continues','The incoming Resources Unit will inherit your orders, assignments and unresolved constraints. Give them an ordered watch list so they know what needs attention first.','Move the three watch items into priority order using the arrows. Base the order on the current state below, then complete the handover.']
    };
    const [title,story,instruction]=contexts[task.kind];
    return `<div class='task-context'><h3>${esc(title)}</h3><p>${esc(story)}</p><p class='action-instruction'><b>What you do:</b> ${esc(instruction)}</p></div>`;
  }
  function liveEvidence() { return `<div class='evidence'><h3>Current resource picture · ${clock(state.minute)}</h3><p>Source entry: <b>${state.safetyHold?'on hold':'monitoring in place'}</b>. Boom: <b>${state.flags.boom.marsh} marsh / ${state.flags.boom.channel} channel / ${state.flags.boom.reserve} reserve</b>. Committed cost: <b>${money(state.cost)}</b>.</p><ul>${state.intel.currentGaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div>`; }
  function tasks() { return state.queue.map(id=>state.tasks.find(t=>t.id===id)).filter(t=>t&&t.period===state.period); }
  function pending() { return tasks().filter(t=>t.status!=='done'); }
  function taskById(id) { return state.tasks.find(t=>t.id===id); }
  function getTask() { return taskById(selected) || pending()[0]; }
  function hint(copy) { return state.difficulty==='guided'?`<details class='hint'><summary>Process note</summary><p>${copy}</p></details>`:''; }
  const check = (name,value,label,detail='')=>`<label class='choice-row'><input type='checkbox' name='${name}' value='${value}'><span>${label}${detail?`<small>${detail}</small>`:''}</span></label>`;
  const radio = (name,value,label,detail='',checked=false)=>`<label class='choice-row'><input type='radio' name='${name}' value='${value}' ${checked?'checked':''} required><span>${label}${detail?`<small>${detail}</small>`:''}</span></label>`;
  const select = (name,label,options)=>`<label for='${name}'>${label}</label><select id='${name}' name='${name}'>${options.map(([value,text])=>`<option value='${value}'>${text}</option>`).join('')}</select>`;
  function taskFields(task) {
    switch(task.kind) {
      case 'validate': return `<div class='request-sheet'><h3>Resource request <small>ICS 213RR · RR-041</small></h3><dl><dt>Requester</dt><dd>Entry Group / tactical channel 3</dd><dt>Resource</dt><dd>Monitoring package</dd><dt>Quantity</dt><dd>1 team</dd><dt>Deliver to</dt><dd>Waterfront</dd><dt>Needed by</dt><dd>07:55</dd><dt>Task</dt><dd>Support source-control entry</dd></dl></div><fieldset><legend>Mark the fields you need the requester to clarify</legend>${check('fields','capability','Required capability','What must this monitoring package measure?')}${check('fields','location','Delivery / reporting location','Which access point and supervisor?')}${check('fields','quantity','Quantity','Reconfirm the requested number of teams.')}${check('fields','neededBy','Required time','Reconfirm when the team must be ready.')}${check('fields','contact','Requester contact','Reconfirm the radio contact.')}</fieldset><p class='form-note'>A clarification takes incident time. You can also release the request as written.</p>${hint('Clarify information that changes safe fulfillment. Do not delay a complete field simply to make the form look better. Air monitoring and water sampling are different capabilities.')}`;
      case 'route': return `<div class='evidence'><p><b>Local request process</b><br>Tactical → Resources Unit review. Support → Logistics review. Logistics handles external sourcing after the need is validated.</p></div>${select('tactical','RR-041 · Air monitoring team',[['resources','Resources Unit'],['logistics','Logistics']])}${select('support','RR-042 · Intrinsically safe radios',[['resources','Resources Unit'],['logistics','Logistics']])}<p class='form-note'>Forward both requests with their original task, location and required time.</p>${hint('These routes preserve this game’s local process. Resources Unit is in Planning; it does not command field tactics or independently authorize procurement.')}`;
      case 'source': { const offers=Array.isArray(E.VENDORS)?E.VENDORS:Object.values(E.VENDORS); return `<div class='evidence'><p><b>Safety / 07:00</b><br>Source-control entry stays on hold until a qualified air monitoring team is on site, checked in and assigned. Needed by 07:55.</p></div><fieldset><legend>Recommend a source to Logistics</legend>${offers.map(v=>`<label class='offer'><input type='radio' name='vendor' value='${esc(v.id)}' required><strong>${esc(v.name)}</strong><div class='offer-figures'><span>${money(v.cost)}</span><span>${v.eta} min to arrival</span></div><small>${esc(v.capability)} · ${esc(v.detail||v.risk||'')}</small></label>`).join('')}</fieldset><p class='form-note'>Quoted ETAs are from order time. Prices are fictional exercise values. The lowest price may buy a different capability.</p>${hint('Compare required capability, arrival time, cost and the work left uncovered. Arrival alone is not authorization for entry.')}`; }
      case 'allocation': return `<div class='evidence'><p><b>Operations allocation window</b><br>Recommend how to distribute six 100 m boom sections. Operations has preauthorized placements within these two protection areas.</p><p>Marsh target: <b>${state.variant===1?3:4} sections</b>. Channel target: <b>${state.variant===1?4:3} sections</b>. ${state.variant===1?'The revised current forecast increases channel exposure.':'The marsh is the more sensitive receptor.'}</p><p>Staging recommends a spare section for coupling failure. A spare has no protective effect until deployed.</p></div><div class='allocation-inputs'><div><label for='marsh'>Marsh sections</label><input id='marsh' name='marsh' type='number' min='0' max='6' value='3' required></div><div><label for='channel'>Channel sections</label><input id='channel' name='channel' type='number' min='0' max='6' value='2' required></div></div><p id='allocation-total' class='allocation-total'>1 section held at staging</p>${hint('You cannot fully meet both targets with six sections. Weigh the exposed area against keeping a replacement available for the next period.')}`;
      case 'checkin': return `<div class='evidence'><p><b>Staging report</b><br>Selected monitoring resource: ${monitorETA()}. ${receivingReport()}</p><p>Source entry needs air / vapor monitoring. A water-quality package cannot clear the entry hold. Report to the Entry Group supervisor, tactical channel 3.</p></div><fieldset><legend>Record the check-in checks you performed</legend>${check('verified','id','Resource identification')}${check('verified','leader','Leader and contact')}${check('verified','capability','Actual monitoring capability')}${check('verified','comms','Communications / reporting channel')}</fieldset>${select('assignment','Record the authorized destination',[['staging','Hold at East Staging'],['source','Source berth / Entry Group']])}<p class='form-note'>The engine tracks actual arrival and capability. Paperwork cannot make an absent or unsuitable team ready.</p>${hint('ICS 211 concepts establish who arrived, who leads them and how to contact them. Operations controls assignment; Resources records the authorized status.')}`;
      case 'reconcile': return `<div class='evidence'><p><b>East Staging / 07:45</b><br>SK-02 available on the staging board.</p><p><b>Operations / assignment request</b><br>SK-02 requested for marsh recovery; assignment not confirmed.</p><p><b>Maintenance / 08:00 signed inspection</b><br>SK-02 pump seal failed. Vessel cannot operate until repaired.</p></div>${select('skimmer','Update SK-02 recorded status',[['available','Available'],['assigned','Assigned'],['out_of_service','Out of service']])}${select('evidence','Cite the report used',[['staging','East Staging board'],['ops','Operations request'],['maintenance','Maintenance inspection']])}${hint('An assignment request is not proof of deployment. A newer direct equipment inspection can explain a stale staging record. Changing the board does not repair a pump.')}`;
      case 'reassign': return `<div class='evidence'><p><b>Operations</b><br>SK-01 is working the channel. Product is also reaching the marsh edge. SK-02’s pump is unavailable. A contracted skimmer can cover the marsh after mobilization.</p></div><fieldset><legend>Recommend a recovery posture</legend>${radio('strategy','hold','Keep SK-01 in the channel','Protect current recovery; accept lower marsh capacity.')}${radio('strategy','move','Reassign SK-01 to the marsh','Improve marsh recovery; open a channel gap.')}${radio('strategy','contract','Request a contracted skimmer','Maintain both fronts after arrival; add cost and lead time.')}</fieldset>${check('approval','yes','Record Operations authorization','Required before changing a tactical assignment.')}${hint('Resources Unit records and coordinates this decision. A reassignment closes one gap by opening another; an external order carries a delay and a bill.')}`;
      case 'forecast': return `<div class='evidence'><p><b>Next period / 10:00</b><br>Source crew requires relief. Marsh crew remains within its shift. One waste package supports recovery through handover.</p><p>Relief crew: <b>${money(1400)} / 55 min</b>.<br>Waste package: <b>${money(1000)} / 40 min</b>.<br>Additional packages provide contingency at additional cost.</p></div><div class='allocation-inputs'><div><label for='relief'>Relief crews to order</label><input id='relief' name='relief' type='number' min='0' max='2' value='0' required></div><div><label for='waste'>Waste packages to order</label><input id='waste' name='waste' type='number' min='0' max='2' value='0' required></div></div><p class='form-note'>These are real orders in the simulation. Their lead times and arrival state carry into the next period.</p>${hint('Compare the current clock with 10:00. Forecasting is useful when the order arrives before the capacity runs out.')}`;
      case 'relief': return `<div class='evidence'><p><b>Shift handoff</b><br>Source crew reaches its planned duty limit at 10:00. Marsh staffing remains within its shift. Check the resource ledger for relief orders and arrival ETAs.</p></div>${select('assign','Record Operations relief assignment',[['reserve','Keep at staging / reserve'],['source','Relieve source-control crew'],['marsh','Reinforce marsh recovery']])}${check('verified','yes','Confirm arrival, leader and handover','Only arrived and verified personnel count as relief.')}${hint('The forecast created or failed to create this option. Recording an assignment cannot substitute for an actual crew.')}`;
      case 'cop': return `${liveEvidence()}<fieldset><legend>Include in Situation Unit update</legend>${check('items','monitor','Monitoring / entry status')}${check('items','boom','Boom placement and coverage gaps')}${check('items','eta','Confirmed orders and ETAs')}${check('items','skimmer','Verified skimmer status')}${check('items','rumor','Unverified report: second offshore sheen','Social-media report; incident extent has not been confirmed.')}</fieldset><label for='cop-note'>Handoff note (optional)</label><textarea id='cop-note' name='note' maxlength='240' placeholder='State the condition, source and uncertainty.'></textarea>${hint('Give Situation Unit operationally useful facts and known gaps. Do not turn an unverified report into a confirmed condition. Free text is retained for AAR review, not graded by keyword.')}`;
      case 'escalation': return `${liveEvidence()}<div class='evidence'><p><b>Planning / decision point</b><br>Use the actual resource picture and cost. Escalate unresolved operational gaps and material tradeoffs to the functions that can act.</p><p>Current source entry: <b>${state.safetyHold?'ON HOLD':'monitoring in place'}</b>.<br>Current commitments: <b>${money(state.cost)}</b>.</p></div><fieldset><legend>Address the coordination message</legend>${check('recipients','operations','Operations','Assignment and operational gaps')}${check('recipients','safety','Safety','Entry controls and responder exposure')}${check('recipients','logistics','Logistics','Sourcing, waste and relief support')}${check('recipients','command','Command','Incident priorities and cost / resource tradeoffs')}</fieldset>${select('concern','Main issue for decision',[['gap','Unresolved operational coverage'],['cost','Cost / resource commitment'],['both','Coverage and cost tradeoff']])}<label for='escalation-note'>Requested decision (optional)</label><textarea id='escalation-note' name='note' maxlength='240' placeholder='Identify the gap and the decision needed.'></textarea>${hint('Escalation does not conjure another resource. It makes an unresolved constraint visible to the people with authority to act.')}`;
      case 'handover': return `${liveEvidence()}<div class='evidence'><p><b>Incoming Resources Unit</b><br>Leave an ordered watch list with the resource picture and outstanding constraints. Your choices and every open issue will remain in the AAR.</p></div><fieldset><legend>Order the incoming shift’s watch list</legend><div id='handover-list'>${handoverRows()}</div></fieldset>${hint('Put unresolved safety dependencies before sustained recovery and environmental protection. Where safety is established, the live constraint may require a different emphasis.')}`;
      default: return `<p>Review the incoming request and record your decision.</p>`;
    }
  }
  function handoverRows() { const labels={monitoring:'Monitoring / entry controls',waste:'Waste and recovery capacity',containment:'Containment / exposed receptors'};return handoverOrder.map((v,i)=>`<div class='order-item'><span>${i+1}. ${labels[v]}</span><div><button type='button' data-action='handover-move' data-id='${v}' data-direction='-1' aria-label='Move ${labels[v]} up' ${i===0?'disabled':''}>↑</button><button type='button' data-action='handover-move' data-id='${v}' data-direction='1' aria-label='Move ${labels[v]} down' ${i===2?'disabled':''}>↓</button></div></div>`).join(''); }
  function monitorETA() { const r=state.resources.find(r=>r.id===state.flags.monitorId);return r?.eta!=null?(r.status==='en_route'?'expected ':'arrival recorded ')+clock(r.eta):'see ledger'; }
  function receivingReport() {
    const r=state.resources.find(r=>r.id===state.flags.monitorId);
    if(!r)return 'No monitoring source is recorded yet.';
    if(r.status==='en_route')return 'Staging has not reported arrival. Identity, leader contact and equipment cannot be checked in yet.';
    return `Receiving report: ${esc(r.id)} / ${esc(r.name)} is on site. The leader has reported to staging with a resource identification and contact record. Equipment reported: <b>${r.capable?'atmospheric vapor / oxygen monitoring':'water sampling only; no atmospheric monitoring'}</b>. The authorized source assignment reports to Entry Group on tactical channel 3.`;
  }
  const submitLabels={validate:'Send clarification / release request',route:'Route both requests',source:'Send sourcing recommendation',allocation:'Record boom allocation',checkin:'Record check-in and assignment',reconcile:'Reconcile resource status',reassign:'Record recovery recommendation',forecast:'Send next-period orders',relief:'Record relief handover',cop:'Publish internal COP update',escalation:'Send coordination message',handover:'Complete shift handover'};
  function workDesk() {
    const t=getTask();
    if(!t)return `<section id='active-work' class='desk' tabindex='-1'><p class='eyebrow'>Period ${state.period+1} / Work complete</p><h2>Review what your decisions changed.</h2><p>All work for this period has been recorded. Review the remaining constraints before moving the incident forward.</p><button class='primary' data-action='review'>Review operational period →</button></section>`;
    if(t.status==='done') {
      const h=state.history.find(h=>h.minute===t.completedAt&&h.source==='player'); const next=nextTask(); const replies=state.traffic.filter(m=>m.minute===t.completedAt&&m.from!=='Incident clock'&&m.text!==h?.change).slice(-2);
      return `<section id='active-work' class='desk action-result' tabindex='-1'><p class='eyebrow'>Action recorded / ${clock(t.completedAt)}</p><h2>${esc(t.title)}</h2>${h?`<h3>What happened</h3><p>${esc(h.change)}</p><h3>What it means for the response</h3><p>${esc(h.consequence)}</p><div class='evidence'><b>Carry forward</b><p>${esc(h.constraint)}</p></div>`:`<p>${esc(notice)}</p>`}${replies.length?`<div class='incident-reply'><h3>From the incident team</h3>${replies.map(m=>`<p><b>${esc(m.from)} / ${clock(m.minute)}</b><br>${esc(m.text)}</p>`).join('')}</div>`:''}<p>Your action is recorded in this response. You can review the map or resources before continuing.</p>${next?`<button class='primary' data-action='next-task'>Continue: ${esc(next.title)} →</button><p class='form-note'>Or choose another item in Incoming work.</p>`:`<button class='primary' data-action='review'>Review operational period →</button>`}</section>`;
    }
    const waiting=waitingReason(t);
    return `<section id='active-work' class='desk' tabindex='-1'><p class='eyebrow'>3 / Your action · ${esc(t.from)}</p><h2>${esc(t.title)}</h2>${taskContext(t)}<p class='form-note'><b>Desk-action target: ${clock(t.neededBy)}.</b> This is when Planning needs this action completed. Resource arrival deadlines are shown separately in the request.</p>${waiting?`<div class='waiting-notice' role='status'><h3>Waiting before you can act</h3><p>${esc(waiting)}</p></div>`:''}<form class='task-form' data-task='${esc(t.id)}'>${taskFields(t)}<div id='form-error' role='alert'></div><button class='primary form-submit' type='submit' ${waiting?'disabled':''}>${submitLabels[t.kind]||'Record action'}</button></form></section>`;
  }
  function map() { const assigned=state.resources.filter(r=>/assigned|deployed/.test(r.status));const at=zone=>assigned.filter(r=>String(r.location).toLowerCase().includes(zone));const source=state.safetyHold?'Entry on hold':'Monitoring established';const marsh=at('marsh').length,channel=at('channel').length;return `<section class='theater' aria-label='Incident picture'><div class='incident-map'><img src='assets/v17/harbor.svg' alt='Fictional Blackwater Reach estuary: industrial source southwest, channel in the center, sensitive marsh northeast and staging southeast of the terminal.'><div class='map-heading'><p class='eyebrow'>2 / Incident picture · Fictional chart</p><h2>Blackwater Reach</h2><small>${state.variant===1?'Current setting toward channel':'Ebb current toward North Marsh'}</small></div><svg class='map-lines' viewBox='0 0 600 460' preserveAspectRatio='none' aria-hidden='true'><defs><radialGradient id='spill'><stop stop-color='#101b1df0'/><stop offset='.7' stop-color='#74684988'/><stop offset='1' stop-color='#cca96800'/></radialGradient></defs><ellipse class='motion-drift' cx='250' cy='242' rx='${65+state.shoreline*.4}' ry='${30+state.shoreline*.22}' transform='rotate(-37 250 242)' fill='url(#spill)'/><path d='M110 368 Q130 320 192 299 M192 299 Q230 258 288 216 M288 216 Q365 159 456 143' fill='none' stroke='#a4daca66' stroke-width='1.5' stroke-dasharray='5 7'/><path d='M412 146 L449 131 L480 134' fill='none' stroke='${marsh?'#b8dfb1':'#c79868'}' stroke-width='4'/><path d='M260 228 L286 217 L311 200' fill='none' stroke='${channel?'#b8dfb1':'#c79868'}' stroke-width='4'/></svg><button class='map-point ${state.safetyHold?'warn':''}' data-zone='source' data-action='zone'><strong>01 / SOURCE</strong><span>${source}</span></button><button class='map-point ${channel?'':'warn'}' data-zone='channel' data-action='zone'><strong>02 / CHANNEL</strong><span>${channel} assigned assets</span></button><button class='map-point ${marsh?'':'warn'}' data-zone='marsh' data-action='zone'><strong>03 / NORTH MARSH</strong><span>${marsh} assigned assets</span></button><button class='map-point' data-zone='staging' data-action='zone'><strong>04 / EAST STAGING</strong><span>Check-in / reserve</span></button><div class='map-time'>SITSTAT ${clock(state.minute)} · NOT FOR NAVIGATION</div><div class='map-legend'><span>Assigned</span><span>Watch</span></div></div><div class='traffic'><div class='panel-label'><h2>2 / Incident traffic</h2><span class='count'>${state.traffic.length} messages</span></div><ol>${state.traffic.slice(-3).map(m=>`<li><time>${clock(m.minute)}</time><div><b>${esc(m.from)}</b><p>${esc(m.text)}</p></div></li>`).join('')}</ol></div></section>`; }
  function resourceLedger() { return `<section class='ledger' aria-label='Resource ledger'><div class='ledger-head'><div><h2>4 / Resource ledger</h2><p>Available = ready to assign · Assigned = already committed · En route = travelling · Out of service = cannot work.</p></div><span class='eyebrow'>${state.resources.length} tracked assets</span></div><div class='ledger-grid'>${state.resources.map(r=>`<article class='resource'><span class='resource-symbol' aria-hidden='true'>${/boom/i.test(r.name)?'▰':/skimmer|boat/i.test(r.name)?'◈':'◇'}</span><small>${esc(r.id)}</small><strong>${esc(r.name)}</strong><p>${esc(r.location)}</p><p class='resource-status'>${esc(titleCase(r.status))}${r.eta!=null?` · ${r.status==="en_route"?"ETA":"Arrived"} ${clock(r.eta)}`:''}</p></article>`).join('')}</div></section>`; }
  function play() { screen='play';boundary('play');document.body.className=`view-${view}`;if(!getTask())selected=pending()[0]?.id||null;const list=tasks(),open=pending(); const period=E.PERIODS[state.period];$('app').innerHTML=`${topbar(true)}<div class='operation-bar'><div class='periods'>${E.PERIODS.map((p,i)=>`<div class='period-step ${i===state.period?'current':''}' ${i===state.period?`aria-current='step'`:''}><b>0${i+1}</b><span>${esc(p.title)}</span></div>`).join('')}</div><p class='conditions'>${esc(period.condition||period.subtitle)}</p></div>${notice?`<div class='outcome-banner'><strong>State updated</strong><span>${esc(notice)}${state.history.length?`<small class='next-constraint'>Carry forward: ${esc(state.history.at(-1).constraint)}</small>`:''}</span>${runtime.result&&!runtime.result.acknowledged?`<button data-action='ack-result'>Continue</button>`:''}</div>`:''}<section class='mission-heading'><div><p class='eyebrow'>Your objective / Period ${state.period+1}</p><p>${esc(periodStory().goal)}</p></div><button data-action='screen-guide'>Show me how this screen works</button></section><main class='command-layout'><aside class='queue-panel' aria-label='Work queue'><div class='panel-label'><h2>1 / Incoming work</h2><span class='count'>${open.length} open</span></div><p class='queue-help'>Select a request to read its context and act. Reading and reordering do not advance time.</p><ol class='queue-list'>${list.map((t,i)=>`<li class='queue-item ${t.id===selected?'active':''} ${t.status==='done'?'done':''}' draggable='${t.status!=='done'}' data-task-id='${esc(t.id)}'><button class='task-select' data-action='select-task' data-id='${esc(t.id)}' ${t.id===selected?`aria-current='true'`:''}><small>${esc(t.from)}</small><strong>${t.status==='done'?'✓ ':''}${esc(t.title)}</strong><small class='due'>${t.status==='done'?'Recorded':`${t.available?'Ready to act':'Waiting'} · Target ${clock(t.neededBy)}`}</small></button>${t.status!=='done'?`<div class='queue-controls'><button data-action='queue-move' data-id='${esc(t.id)}' data-direction='-1' aria-label='Move ${esc(t.title)} up' ${i===0?'disabled':''}>↑</button><button data-action='queue-move' data-id='${esc(t.id)}' data-direction='1' aria-label='Move ${esc(t.title)} down' ${i===list.length-1?'disabled':''}>↓</button></div>`:''}</li>`).join('')}</ol><div class='queue-footer'>${open.length?`<button data-action='wait'>Advance 10 incident minutes</button><small>Use while waiting on arrivals. Three optional waits per period; outstanding arrivals allow additional waits.</small>`:`<button class='primary' data-action='review'>Review period →</button>`}</div></aside>${map()}${workDesk()}</main><section class='state-strip' aria-label='4 / Incident status'><div><small>Source entry</small><b class='${state.safetyHold?'bad':''}'>${state.safetyHold?'ON HOLD':'MONITORED'}</b></div><div><small>Recovery · higher is better</small><b>${Math.round(state.recovery)}<small style='display:inline'> /100</small></b></div><div><small>Shoreline impact · lower is better</small><b class='${state.shoreline>25?'bad':''}'>${Math.round(state.shoreline)}<small style='display:inline'> /100</small></b></div><div><small>Resource-picture reliability</small><b>${Math.round(state.accountability)}<small style='display:inline'> /100</small></b></div><div><small>Committed cost · $12,000 allowance</small><b>${money(state.cost)}</b></div></section>${resourceLedger()}<footer class='bottom-note'><span id='checkpoint-status'>${storageWarning?esc(storageWarning):'Checkpoint saved in this browser. Time moves only when you act.'}</span><span>Resources Unit / Planning · Fictional exercise economics</span></footer><nav class='mobile-tabs' aria-label='Incident views'>${[['work','Work queue'],['picture','Incident picture'],['resources','Resources']].map(([id,label])=>`<button data-action='view' data-id='${id}' aria-pressed='${view===id}'>${label}</button>`).join('')}</nav>`;restoreDraft();persist(); }
  function perform(action,taskId=null) {
    const outcome=E.act(state,action);
    if(!outcome.ok){const target=$('form-error');if(target){target.className='form-error';target.textContent=outcome.error||'This action could not be recorded.';target.scrollIntoView({block:'nearest'});}else modal('Action not recorded',`<p>${esc(outcome.error)}</p>`);persist();announce(outcome.error);return false;}
    if(taskId){selected=taskId;runtime.draft=null;runtime.focus=null;}
    if(action.type!=='reorder') {
      const index=state.events.length-1;
      runtime.result={id:`${state.id}:${index}`,eventIndex:index,acknowledged:false};
      notice=resultText();
      boundary(action.type==='advance'?(state.finished?'aar':'period-briefing'):'play');
    }
    sound();forwardEvents();persist();announce(notice);return true;
  }
  function review() { screen='review';boundary('review');document.body.className='';const period=E.PERIODS[state.period];const recent=state.history.slice(-4);$('app').innerHTML=`${topbar(true)}<main class='period-review'><p class='eyebrow'>Operational period ${state.period+1} / Shift review</p><h1>${esc(period.title)} recorded.</h1><p class='review-lead'>Before handing over, read what your decisions changed and what the next shift inherits.</p><div class='scoreboard'><div><small>Incident time</small><b>${clock(state.minute)}</b></div><div><small>Committed cost · $12,000 allowance</small><b>${money(state.cost)}</b></div><div><small>Source entry</small><b>${state.safetyHold?'On hold':'Monitoring in place'}</b></div></div><div class='review-grid'><section><h2>Changes this period</h2><ul>${recent.map(h=>`<li><b>${esc(h.action)}</b>${esc(h.consequence)}</li>`).join('')}</ul></section><section><h2>Carry forward</h2><ul>${recent.map(h=>`<li>${esc(h.constraint)}</li>`).join('')}</ul>${state.period<2?`<div class='evidence'><b>Next / ${esc(E.PERIODS[state.period+1].title)}</b><p>${esc(E.PERIODS[state.period+1].condition||E.PERIODS[state.period+1].subtitle)}</p></div>`:''}</section></div><div class='review-actions'><button data-action='return-play'>Inspect resource picture</button><button class='primary' data-action='advance'>${state.period<2?'Begin next operational period →':'Open after-action review →'}</button></div></main>`;persist(); }
  function makeReport() { const r=E.report(state);return {...r,schema:'trg.session-report.v17',sessionId:state.id,incidentType:'oil-spill',incidentName:'Blackwater Reach',roleId:'resources-unit',roleName:'Resources Unit',difficulty:state.difficulty,variant:state.variant,createdAt:new Date().toISOString(),score:number(r.score,100),finalState:JSON.parse(JSON.stringify(state))}; }
  function complete() {
    const existing=reports.find(report=>report.sessionId===state.id),r=existing||makeReport(),archived=!!existing;
    if(!career.completed.includes(state.id)) {
      career.completed.push(state.id);career.completed=career.completed.slice(-500);
      // An archived report also guards against replaying a reward after a partial write.
      if(!archived){career.sessions++;career.xp+=150+r.score;}
      career.best=Math.max(career.best,r.score);career.mastery={...state.competencies};
    }
    // Keep report recovery independent of the reward marker. An interrupted or failed
    // archive write must not permanently hide an otherwise completed session.
    if(!archived){reports.unshift(r);reports=reports.slice(0,30);}
    write('trg-v17-career',career);
    if(!archived||storageErrors.has('trg-v17-reports'))write('trg-v17-reports',reports);
    persist();aar(r);
  }
  function aar(r,archivedView=false) { displayedReport=r;screen='aar';if(runtime){if(archivedView){runtime.scene='archive';runtime.archiveId=r.sessionId;}else boundary('aar');}document.body.className='';$('app').innerHTML=`${topbar()}<main class='period-review'><div class='aar-hero'><div><p class='eyebrow'>After-action review / Blackwater Reach</p><h1>The picture you leave.</h1></div><div class='aar-score'>${Math.round(r.score||0)}<small>INCIDENT EFFECTIVENESS</small></div></div><p class='review-lead'>${esc(r.summary||'Review the connection between your actions, resource state and operational outcomes.')}</p><div class='scoreboard'><div><small>Committed cost · $12,000 allowance</small><b>${money(r.cost)}</b></div><div><small>Action & condition records</small><b>${(r.history||[]).length}</b></div><div><small>Working conditions</small><b>${r.difficulty==='advanced'?'Under pressure':'Guided shift'}</b></div></div><div class='review-grid'><section><h2>Incident objectives</h2>${(r.objectives||[]).map(o=>`<div class='objective'><b>${esc(o.status)}</b>${esc(o.text||o.objective)}</div>`).join('')}</section><section><h2>Competency evidence</h2>${Object.entries(r.competencies||{}).map(([k,v])=>`<div class='competency'><div><span>${esc(titleCase(k))}</span><b>${Math.round(v)}</b></div><meter min='0' max='100' value='${Number(v)}' aria-label='${esc(titleCase(k))}'></meter></div>`).join('')}<p class='form-note'>Based on recorded operational actions. These are game practice indicators, not professional qualifications.</p></section></div><h2>Decision → state → consequence</h2><ol class='timeline'>${(r.history||[]).map(h=>`<li><p class='eyebrow'>${clock(h.minute)} / ${h.source === 'condition' ? 'INCIDENT CONDITION' : esc(h.category)}</p><h3>${esc(h.action)}</h3><p><b>State:</b> ${esc(h.change)}</p><p><b>Consequence:</b> ${esc(h.consequence)}</p><p class='constraint'><b>Future constraint:</b> ${esc(h.constraint)}</p></li>`).join('')}</ol><div class='review-actions'><button class='primary' data-action='replay'>Run changed conditions ↗</button><button data-action='export-json' data-id='${esc(r.sessionId)}'>Download session JSON</button><button data-action='export-html' data-id='${esc(r.sessionId)}'>Download printable AAR</button><button data-action='home'>Return to game home</button></div><p class='form-note'>Replay reverses the current pressure and changes the boom demand. The same sequence will not create the same operational result.</p>${state&&!state.finished?`<button data-action='resume'>Return to saved response</button>`:''}${storageWarning?`<p class='save-notice'>${esc(storageWarning)}</p>`:''}</main>`;persist(); }
  function download(r, format) { const content=format==='json'?JSON.stringify(r,null,2):`<!doctype html><html lang='en'><meta charset='utf-8'><title>Blackwater Reach AAR</title><style>body{font:15px Arial,sans-serif;color:#173039;max-width:850px;margin:40px auto;padding:20px}h1{font-size:38px}li{margin:20px 0;break-inside:avoid}p{line-height:1.6}.muted{color:#476068}@media print{body{margin:0}}</style><h1>Blackwater Reach</h1><p>Resource Run · Resources Unit · After-action review</p><p>Effectiveness: ${number(r.score,100)}/100 · Cost: ${money(r.cost)} · ${esc(r.difficulty)}</p><p>${esc(r.summary||'')}</p><h2>Objectives</h2><ul>${(r.objectives||[]).map(o=>`<li><b>${esc(o.status)}</b>: ${esc(o.text||o.objective)}</li>`).join('')}</ul><h2>Decision and outcome ledger</h2><ol>${r.history.map(h=>`<li><b>${clock(h.minute)} — ${esc(h.action)}</b><p>State: ${esc(h.change)}<br>Consequence: ${esc(h.consequence)}<br>Future constraint: ${esc(h.constraint)}</p></li>`).join('')}</ol><p class='muted'>Fictional exercise. This report is training evidence, not a qualification.</p></html>`;const url=URL.createObjectURL(new Blob([content],{type:format==='json'?'application/json':'text/html'}));const a=document.createElement('a');a.href=url;a.download=`Blackwater_Reach_${r.sessionId}.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('AAR download started.'); }
  function requestStart(difficulty,variant=0) {
    const record=readStorage(SESSION_KEY);
    if(record.kind==='denied') {checkpointBlocked=true;storageErrors.set(SESSION_KEY,'Browser storage cannot be read. Retry access before replacing any saved response.');storageStatus();home();return;}
    if(record.raw!==null||state) {
      replacement={difficulty,variant,raw:record.raw};
      modal('Replace current checkpoint?',`<p>Starting a new response replaces the saved checkpoint, including any uncommitted choices. Completed AARs stay separate. Export the existing checkpoint first if you need to keep it.</p><div class='button-row'><button data-action='export-checkpoint'>Export checkpoint</button><button class='primary' data-action='confirm-start'>Replace checkpoint and start</button><button data-action='cancel-start'>Keep current checkpoint</button></div>`);
    } else startRun(difficulty,variant);
  }
  function confirmStart() {
    if(!replacement)return;
    let raw;try{raw=localStorage.getItem(SESSION_KEY);}catch{storageErrors.set(SESSION_KEY,'Browser storage cannot be read. The saved response has not been replaced.');storageStatus();return;}
    if(raw!==replacement.raw){replacement=null;checkpointConflict=true;storageErrors.set(SESSION_KEY,'The checkpoint changed in another tab. Retry loading before choosing to replace it.');storageStatus();closeModal();home();return;}
    const choice=replacement;replacement=null;
    // Only this explicit, raw-value-checked choice unlocks replacement of bad data.
    storageRecords.set(SESSION_KEY,{kind:'loaded',raw});
    checkpointConflict=false;
    closeModal();startRun(choice.difficulty,choice.variant);
  }
  function startRun(difficulty,variant=0) { state=E.createState({difficulty,variant});runtime=defaultRuntime(state);checkpointMeta={migratedFrom:null,recovery:'ready',savedAt:null,forwardedCount:0};checkpointBlocked=false;selected=state.queue.find(id=>taskById(id)?.period===0)||null;notice='Your first traffic is in. Choose a work item; incident time advances when you submit an action.';lastForwarded=0;view='work';handoverOrder=['monitoring','waste','containment'];forwardEvents();orientation(); }
  function guide() { modal('Resources Unit field guide',`<p>You maintain an accountable picture of resources for Planning. Operations directs tactical assignments. Logistics arranges external sourcing. You are coordinating resources from the incident command post. Your mission is to support safe source work, containment, recovery and the next shift. Follow the local request process below.</p><h3>Working the desk</h3><ol><li>Read incoming traffic and select the work with the greatest consequence of delay.</li><li>Use the request, source offers, map and ledger to decide. Reordering the queue is free; operational actions consume simulated time.</li><li>Read the resulting state change. Orders, assignments, missing capabilities and exposed areas carry into later periods.</li><li>Complete the period, review its constraints and prepare the next shift.</li></ol><h3>Local resource-request process</h3><p>ICS 213RR request → Tactical through Resources Unit / Support through Logistics → validate need and check availability → reserve internal resource or send shortfall to Logistics → retain supplier, price, quantity and ETA → designated check-in using ICS 211 concepts → authorized assignment and status tracking using ICS 210 concepts.</p><h3>Reading this exercise</h3><p>Life safety, stabilization and environmental protection remain the priorities. Air monitoring is a prerequisite for source-control entry. A requested, ordered or arriving resource is not automatically ready to work.</p><p>Blackwater Reach, vendors, times, costs and capacity thresholds are authored training assumptions. They are not field deployment guidance. Organization-specific procedures remain authoritative.</p><h3>Controls</h3><p>All actions work with keyboard and touch. Queue arrows replace dragging. On a phone use Work queue, Incident picture and Resources. Settings include reduced motion and optional sound. Reading speed never advances the incident clock.</p>`); }
  function moveQueue(id,direction,dropId) { const current=tasks().map(t=>t.id),at=current.indexOf(id),to=dropId?current.indexOf(dropId):at+direction;if(at<0||to<0||to>=current.length)return;current.splice(at,1);current.splice(to,0,id);if(perform({type:'reorder',ids:current})){play();const b=document.querySelector(`[data-action='select-task'][data-id='${id}']`);b?.focus();} }
  document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action,id=button.dataset.id;switch(action){
    case 'briefing':briefing();break;
    case 'screen-guide':screenGuide();break;
    case 'enter-incident':acknowledge();view='work';play();$('active-work')?.focus();break;
    case 'start':requestStart(document.querySelector('input[name=difficulty]:checked')?.value||'guided');break;
    case 'confirm-start':confirmStart();break;
    case 'cancel-start':replacement=null;closeModal();break;
    case 'retry-save':retryStorage();break;
    case 'load-stored':checkpointConflict=false;checkpointBlocked=true;state=null;runtime=null;selected=null;closeModal();retryStorage();break;
    case 'export-checkpoint':downloadCheckpoint();break;
    case 'resume':if(runtime?.scene==='archive')runtime.scene=runtime.resumeScene;resumeBoundary();break;
    case 'select-task':if(runtime.draft&&runtime.draft.taskId!==id){modal('Keep your unfinished choice?',`<p>Switching requests discards the current uncommitted draft. Incident time will not change.</p><button data-action='confirm-select' data-id='${esc(id)}'>Discard draft and switch</button><button data-close>Keep editing</button>`);}else{acknowledge();selected=id;play();$('active-work')?.focus();}break;
    case 'confirm-select':runtime.draft=null;runtime.focus=null;acknowledge();selected=id;closeModal();play();break;
    case 'ack-result':acknowledge();persist();if(screen==='play')play();break;
    case 'next-task':acknowledge();selected=nextTask()?.id||null;play();$('active-work')?.focus();break;
    case 'queue-move':moveQueue(id,Number(button.dataset.direction));break;
    case 'handover-move':{const i=handoverOrder.indexOf(id),j=i+Number(button.dataset.direction);[handoverOrder[i],handoverOrder[j]]=[handoverOrder[j],handoverOrder[i]];$('handover-list').innerHTML=handoverRows();document.querySelector(`[data-action='handover-move'][data-id='${id}']:not(:disabled)`)?.focus();runtime.draft={taskId:selected,values:runtime.draft?.values||{},handoverOrder:[...handoverOrder]};persist();announce('Watch list reordered.');break;}
    case 'view':view=id;document.body.className=`view-${view}`;document.querySelectorAll('.mobile-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===view)));persist();break;
    case 'wait':if(perform({type:'wait'}))play();break;
    case 'review':acknowledge();review();break;
    case 'return-play':if(!runtime.draft)selected=null;view='resources';play();break;
    case 'advance':if(perform({type:'advance'})){selected=null;view='work';state.finished?complete():periodBriefing();window.scrollTo({top:0,behavior:'instant'});}break;
    case 'home':persist();home();window.scrollTo({top:0,behavior:'instant'});break;
    case 'guide':guide();break;
    case 'traffic':modal('Incident shift log',`<ol class='event-list'>${state.traffic.map(m=>`<li><b>${clock(m.minute)} / ${esc(m.from)}</b><p>${esc(m.text)}</p></li>`).join('')}</ol>`);break;
    case 'zone':{const zone=button.dataset.zone;const matching=state.resources.filter(r=>String(r.location).toLowerCase().includes(zone));modal(titleCase(zone),`<p>${zone==='source'?(state.safetyHold?'Source-control entry remains on hold. Check monitoring capability, arrival and assignment.':'Monitoring prerequisite established for source-control work.'):zone==='marsh'?'Sensitive receptor. Compare assigned boom with the demand and inspect recovery coverage.':zone==='channel'?'Navigation and recovery corridor. Reassignment can open a recovery or monitoring gap here.':'Staging holds reserves, arrivals and resources awaiting verification.'}</p><ul>${matching.length?matching.map(r=>`<li><b>${esc(r.id)} / ${esc(r.name)}</b> · ${esc(titleCase(r.status))}</li>`).join(''):'<li>No resource is currently recorded at this location.</li>'}</ul>`);break;}
    case 'settings':modal('Session settings',`<p>Changes affect presentation only. Incident time always advances through actions.</p><div class='button-row'><button data-action='motion' aria-pressed='${!!career.motion}'>Reduced motion: ${career.motion?'on':'follow system'}</button><button data-action='sound' aria-pressed='${audioOn}'>Sound: ${audioOn?'on':'off'}</button></div><p>Browser storage: ${storageWarning?'unavailable':'checkpoint saving enabled'}. No analytics leave this browser unless an organization configures an endpoint.</p>`);break;
    case 'motion':career.motion=!career.motion;document.documentElement.dataset.motion=career.motion?'reduce':'system';write('trg-v17-career',career);button.textContent=`Reduced motion: ${career.motion?'on':'follow system'}`;button.setAttribute('aria-pressed',String(career.motion));break;
    case 'sound':audioOn=!audioOn;sound();button.textContent=`Sound: ${audioOn?'on':'off'}`;button.setAttribute('aria-pressed',String(audioOn));break;
    case 'reports':modal('Career & after-action archive',`<p><b>${career.xp.toLocaleString()} XP</b> · ${career.sessions} v17 shifts · Best effectiveness ${career.best||'—'}</p><p>Existing career XP is carried into this separate v17 profile. Historical profiles and reports are preserved in browser storage.</p>${reports.length?`<ul class='event-list'>${reports.map(r=>`<li><b>${esc(r.incidentName)} · ${Math.round(r.score||0)}/100</b><p>${esc(r.difficulty)} · ${money(r.cost)}</p><div class='button-row'><button data-action='view-report' data-id='${esc(r.sessionId)}'>Read AAR</button><button data-action='export-json' data-id='${esc(r.sessionId)}'>JSON</button></div></li>`).join('')}</ul>`:'<p>Your completed shifts will appear here with their decision and consequence records.</p>'}`);break;
    case 'view-report':{const r=reports.find(r=>r.sessionId===id);if(r){closeModal();aar(r,true);}break;}
    case 'export-json':case 'export-html':{const r=reports.find(r=>r.sessionId===id)||(state?.finished?makeReport():null);if(r)download(r,action==='export-json'?'json':'html');break;}
    case 'replay':requestStart(displayedReport?.difficulty||state?.difficulty||'guided',(displayedReport?.variant??state?.variant)===1?0:1);window.scrollTo({top:0,behavior:'instant'});break;
  }});
  function allocationTotal(){const reserve=6-Number($('marsh').value)-Number($('channel').value);$('allocation-total').textContent=reserve>=0?`${reserve} section${reserve===1?'':'s'} held at staging`:`Over allocation by ${-reserve} section${reserve===-1?'':'s'}`;}
  function draftInput(e){const form=e.target.closest?.('.task-form');if(!form)return;captureDraft(form);if(e.target.id==='marsh'||e.target.id==='channel')allocationTotal();}
  document.addEventListener('input',draftInput);document.addEventListener('change',draftInput);
  document.addEventListener('focusin',e=>{if(!runtime||!e.target.name||!e.target.closest?.('.task-form'))return;runtime.focus={name:e.target.name,value:String(e.target.value||'')};persist();});
  document.addEventListener('submit',e=>{if(!e.target.matches('.task-form'))return;e.preventDefault();const task=taskById(e.target.dataset.task);if(!task||task.status!=='pending')return;captureDraft(e.target);const f=new FormData(e.target),all=name=>f.getAll(name),num=name=>Number(f.get(name));let action;switch(task.kind){case 'validate':action={type:'validate',fields:all('fields')};break;case 'route':action={type:'route',tactical:f.get('tactical'),support:f.get('support')};break;case 'source':action={type:'source',vendor:f.get('vendor')};break;case 'allocation':action={type:'allocate',marsh:num('marsh'),channel:num('channel')};break;case 'checkin':action={type:'checkin',verified:all('verified'),assignment:f.get('assignment')};break;case 'reconcile':action={type:'reconcile',skimmer:f.get('skimmer'),evidence:f.get('evidence')};break;case 'reassign':action={type:'reassign',strategy:f.get('strategy'),approval:f.has('approval')};break;case 'forecast':action={type:'forecast',relief:num('relief'),waste:num('waste')};break;case 'relief':action={type:'relief',assign:f.get('assign'),verified:f.has('verified')};break;case 'cop':action={type:'cop',items:all('items'),note:String(f.get('note')||'')};break;case 'escalation':action={type:'escalate',recipients:all('recipients'),concern:f.get('concern'),note:String(f.get('note')||'')};break;case 'handover':action={type:'handover',priorities:[...handoverOrder]};break;}if(action&&perform(action,task.id)){selected=task.id;play();$('active-work')?.focus();}});
  let dragged=null;document.addEventListener('dragstart',e=>{const li=e.target.closest('[data-task-id]');if(li){dragged=li.dataset.taskId;e.dataTransfer.setData('text/plain',dragged);e.dataTransfer.effectAllowed='move';}});document.addEventListener('dragover',e=>{if(e.target.closest('[data-task-id]'))e.preventDefault();});document.addEventListener('drop',e=>{const li=e.target.closest('[data-task-id]');if(li&&dragged){e.preventDefault();moveQueue(dragged,0,li.dataset.taskId);dragged=null;}});
  window.addEventListener('pagehide',persist);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !['localhost','127.0.0.1'].includes(location.hostname)) navigator.serviceWorker.register('./trg-sw.js').catch(()=>{});
  if(!E){$('app').innerHTML='<main class="period-review"><h1>The incident could not load.</h1><p>Reload the page to retrieve the simulation files.</p></main>';return;}
  if(state)resumeBoundary();else home();
})();
