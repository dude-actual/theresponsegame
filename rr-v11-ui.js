window.RR = window.RR || {};
(() => {
  const RR=window.RR,U=RR.util,$=id=>document.getElementById(id),$$=s=>[...document.querySelectorAll(s)];
  let profile=loadProfile(),engine=null,briefingIndex=0,selectedDifficulty='Recruit',soundOn=true,locked=false,lastImpactCount=0;

  function loadProfile(){try{const r=JSON.parse(localStorage.getItem('rrProfile')||'null');return{...structuredClone(RR.defaultProfile),...r,mastery:{...RR.defaultProfile.mastery,...(r?.mastery||{})},mistakes:{...RR.defaultProfile.mistakes,...(r?.mistakes||{})}}}catch{return structuredClone(RR.defaultProfile)}}
  function saveProfile(){localStorage.setItem('rrProfile',JSON.stringify(profile))}
  function setScreen(id){$$('.screen').forEach(s=>s.classList.remove('is-active'));$(id).classList.add('is-active')}
  function tone(f,d=.05){if(!soundOn)return;try{const AC=window.AudioContext||window.webkitAudioContext,c=new AC(),o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=.04;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.stop(c.currentTime+d)}catch{}}

  function rankIndex(){return RR.RANKS.findIndex(r=>r.name===rankForXp(profile.xp).name)}
  function rankForXp(xp){return [...RR.RANKS].reverse().find(r=>xp>=r.xp)||RR.RANKS[0]}
  function masteryPercent(){const v=Object.values(profile.mastery);return Math.round(v.reduce((a,b)=>a+b,0)/(v.length||1))}
  function updateLanding(){
    $('landingRank').textContent=rankForXp(profile.xp).name;$('landingXp').textContent=profile.xp.toLocaleString();$('landingMastery').textContent=masteryPercent()+'%';
    $$('.difficulty-card').forEach(c=>{const need=RR.DIFFICULTY[c.dataset.difficulty].unlockRank,locked=rankIndex()<need;c.classList.toggle('is-locked',locked);c.setAttribute('aria-disabled',String(locked));
      const span=c.querySelector('span');if(!span.dataset.base)span.dataset.base=span.textContent;span.textContent=locked?`Unlocks at ${RR.RANKS[need].name}`:span.dataset.base;
      if(locked&&c.classList.contains('is-selected')){c.classList.remove('is-selected');document.querySelector('[data-difficulty="Recruit"]').classList.add('is-selected');selectedDifficulty='Recruit'}
    });
  }
  function renderBriefing(){
    $$('.brief-card').forEach((c,i)=>c.classList.toggle('is-active',i===briefingIndex));$$('.brief-dots i').forEach((d,i)=>d.classList.toggle('on',i===briefingIndex));
    $('briefingCounter').textContent=`${briefingIndex+1} / 3`;$('briefNextBtn').textContent=briefingIndex===2?'Begin Incident':'Next';
  }
  function startIncident(){engine=new RR.IncidentEngine(profile,selectedDifficulty);engine.createIncident();lastImpactCount=0;setScreen('game');renderAll()}
  function renderAll(){
    const S=engine.state;$('incidentName').textContent=S.incident.name;$('incidentTitle').textContent=S.incident.name;$('weatherText').textContent=S.weather;$('simTime').textContent=U.formatTime(S.timeMinutes);
    for(let i=1;i<=4;i++){const e=$('period'+i);e.classList.toggle('is-active',i===S.op);e.classList.toggle('is-done',i<S.op)}
    renderQueue();renderInventory();renderDecision();renderMetrics();renderMapResources();
    $('mobileQueueCount').textContent=S.queue.filter(r=>r.status!=='Complete').length;
    if(S.impacts.length>lastImpactCount){const impact=S.impacts[S.impacts.length-1];showImpact(impact);lastImpactCount=S.impacts.length}
  }
  function renderQueue(){
    const S=engine.state,open=[...S.queue].filter(r=>r.status!=='Complete').sort((a,b)=>engine.priorityScore(b)-engine.priorityScore(a));$('queueCount').textContent=open.length;
    $('requestQueue').innerHTML=open.map(r=>`<button class="queue-item ${S.active?.id===r.id?'is-active':''}" data-id="${r.id}"><div class="queue-top"><strong>${U.escapeHtml(r.qty===1?r.resource:RR.RESOURCE_TYPES.find(t=>t.id===r.typeId).plural)}</strong><span>${r.priority}</span></div><p>${r.qty} · ${U.escapeHtml(r.dest)} · due ${U.formatTime(r.due)}</p><div class="queue-flags"><b>${r.route}</b>${r.overdue?'<b style="color:#ff9aa5">OVERDUE</b>':''}${r.external?'<b>External</b>':''}</div></button>`).join('');
    $$('#requestQueue .queue-item').forEach(b=>b.onclick=()=>{engine.selectRequest(b.dataset.id);renderAll()});
  }
  function renderInventory(){
    const E=Object.values(engine.state.inventory).sort((a,b)=>a.name.localeCompare(b.name));$('resourceCount').textContent=E.reduce((s,r)=>s+r.available,0);
    $('resourceInventory').innerHTML=E.map(r=>`<div class="inventory-row"><div><strong>${U.escapeHtml(r.name)}</strong><br><span>${r.committed} committed · ${r.deployed} deployed</span></div><span class="inventory-count">${r.available}</span></div>`).join('');
  }
  function renderDecision(){
    const S=engine.state,r=S.active;$('feedbackLine').textContent='';$('feedbackLine').className='feedback-line';
    if(!r){
      $('decisionTitle').textContent='Select the next request';$('requestBrief').textContent='Choose from the queue. Urgency and required time matter.';$('requestPriority').textContent='Queue';$('requestPriority').className='priority-tag';$('decisionPrompt').textContent='Which request should the incident process next?';
      const O=[...S.queue].filter(x=>x.status!=='Complete').sort((a,b)=>engine.priorityScore(b)-engine.priorityScore(a)).slice(0,3);
      $('choiceGrid').innerHTML=O.map((x,i)=>`<button class="choice-btn" data-id="${x.id}"><span class="key">${String.fromCharCode(65+i)}</span><span class="txt">${U.escapeHtml(x.resource)} · ${U.escapeHtml(x.dest)} · ${x.priority}</span></button>`).join('');
      $$('#choiceGrid .choice-btn').forEach(b=>b.onclick=()=>{const x=O.find(q=>q.id===b.dataset.id),ok=engine.prioritize(x);tone(ok?720:170,ok?.05:.1);renderAll();if(!ok){$('feedbackLine').textContent='Lower-priority work was selected first. Time-sensitive work is now at greater risk.';$('feedbackLine').className='feedback-line bad'}});
      return;
    }
    $('decisionTitle').textContent=r.resource;$('requestBrief').textContent=`${r.qty} requested · ${r.dest} · due ${U.formatTime(r.due)} · ${r.route}`;$('requestPriority').textContent=r.priority;$('requestPriority').className='priority-tag '+r.priority.toLowerCase();
    const d=engine.decisionFor(r),choices=[...d.choices].sort(()=>Math.random()-.5);$('decisionPrompt').textContent=d.prompt;
    $('choiceGrid').innerHTML=choices.map((c,i)=>`<button class="choice-btn"><span class="key">${String.fromCharCode(65+i)}</span><span class="txt">${U.escapeHtml(c[0])}</span></button>`).join('');
    $$('#choiceGrid .choice-btn').forEach((b,i)=>b.onclick=()=>answerChoice(b,choices[i][1],d.category));
  }
  function answerChoice(btn,correct,category){
    if(locked)return;locked=true;$$('#choiceGrid .choice-btn').forEach(x=>x.disabled=true);const result=engine.answer(correct,category);btn.classList.add(correct?'good':'bad');
    $('feedbackLine').textContent=correct?'Correct. Incident picture updated.':'Incorrect. Operational impact recorded. Use the IMH and recover.';$('feedbackLine').className='feedback-line '+(correct?'ok':'bad');tone(correct?720:170,correct?.05:.1);
    if(correct)setTimeout(()=>{locked=false;const S=engine.state;if(!S.active&&engine.periodComplete())showPeriodReview();else renderAll()},520);
    else setTimeout(()=>{locked=false;renderMetrics();$$('#choiceGrid .choice-btn').forEach(x=>x.disabled=false);btn.classList.remove('bad')},650);
  }
  function renderMetrics(){
    const S=engine.state,s=engine.scores();$('impactScore').textContent=s.impact;$('impactMeter').style.transform=`scaleX(${s.impact/100})`;$('impactSummary').textContent=S.impacts.length?S.impacts[S.impacts.length-1].text:'No unresolved operational impacts.';
    $('ierLive').textContent=s.ier;$('mobileIer').textContent=s.ier;$('accuracyLive').textContent=s.accuracy;$('accountabilityLive').textContent=s.accountability;$('documentationLive').textContent=s.documentation;
    $('mAccuracy').style.width=s.accuracy+'%';$('mAccountability').style.width=s.accountability+'%';$('mDocumentation').style.width=s.documentation+'%';
  }
  function renderMapResources(){
    const c=$('resourceIcons');c.innerHTML='';const all=[...engine.state.completed,...engine.state.queue.filter(r=>r.status!=='Complete'&&r.stage!=='document')],positions={vac:[28,56],light:[65,30],radio:[52,72],ppe:[74,66],gen:[35,26],tech:[46,42],boom:[18,34],rest:[81,42],bus:[18,70],shelter:[72,18]};
    const seen=new Set();all.forEach(r=>{if(seen.has(r.typeId))return;seen.add(r.typeId);const t=document.createElement('div'),p=positions[r.typeId]||[50,50];t.className='resource-token '+(r.status==='Complete'?'is-deployed':r.overdue?'is-delayed':'is-committed');t.style.left=p[0]+'%';t.style.top=p[1]+'%';t.innerHTML='<svg viewBox="0 0 28 20"><use href="#i-truck"/></svg>';c.appendChild(t)});
  }
  function showImpact(i){const l=$('impactLayer'),x=20+Math.random()*60,y=22+Math.random()*56,f=document.createElement('div'),m=document.createElement('div');f.className='impact-flash';f.style.setProperty('--x',x+'%');f.style.setProperty('--y',y+'%');m.className='impact-marker';m.style.left=x+'%';m.style.top=y+'%';m.textContent=i.resource;l.append(f,m);setTimeout(()=>m.remove(),5000);setTimeout(()=>f.remove(),2200)}
  function showPeriodReview(){
    const S=engine.state;setScreen('periodReview');$('periodReviewTitle').textContent=`Operational Period ${S.op} Complete`;$('periodReviewText').textContent=S.periodImpacts.length?`${S.periodImpacts.length} operational impact${S.periodImpacts.length===1?'':'s'} carried into the incident picture.`:'No new preventable operational impacts were generated this period.';
    const s=engine.scores(),V=[['Accuracy',s.accuracy],['Speed',s.speed],['Accountability',s.accountability],['Documentation',s.documentation],['Impact',s.impact]];$('periodMetrics').innerHTML=V.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
    $('periodImpacts').innerHTML=S.periodImpacts.length?S.periodImpacts.map(i=>`<div class="period-impact">${U.escapeHtml(i.text)}</div>`).join(''):'<div class="period-impact positive">No preventable operational impacts.</div>';
  }
  function continuePeriod(){
    if(engine.state.op>=4){finishIncident();return}const card=engine.nextPeriod();setScreen('game');renderAll();if(card)openDialog(card.label,`<p>${U.escapeHtml(card.text)}</p>`,[{label:'Acknowledge',primary:true,action:closeDialog}],'Operational Period Update');
  }
  function finishIncident(){
    const result=engine.finish();saveProfile();const s=result.scores,S=engine.state;setScreen('results');$('finalIer').textContent=s.ier;$('finalGrade').textContent=s.ier>=92?'Exceptional Command Performance':s.ier>=82?'Strong Incident Performance':s.ier>=70?'Qualified Performance':'Development Needed';
    $('resultsSummary').textContent=`${S.incident.name} closed after four operational periods. ${S.completed.length} requests completed with ${S.impacts.length} recorded operational impacts.`;
    const B=[['Accuracy',s.accuracy],['Speed',s.speed],['Accountability',s.accountability],['Documentation',s.documentation],['Operational Impact',s.impact],['Mission Success',s.mission]];$('scoreBreakdown').innerHTML=B.map(([n,v])=>`<div class="score-row"><span>${n}</span><i><b style="width:${v}%"></b></i><strong>${v}</strong></div>`).join('');
    renderCoaching();renderCareerResult(result);renderAchievements(result);updateLanding();
  }
  function renderCoaching(){
    const S=engine.state,C=[['routing','Routing','Use the Tactical vs Support decision point before assigning ownership.'],['documentation','Documentation','Capture the full request and order details before the incident acts on them.'],['accountability','Accountability','Protect check-in, status, and assignment visibility at every handoff.'],['prioritization','Prioritization','Work urgent and time-sensitive requests before lower-consequence requests.'],['sourcing','Sourcing','Check internal availability before external sourcing and keep supplier details traceable.']];
    const top=C.map(([id,name,tip])=>({id,name,tip,count:S.weak[id]||0})).sort((a,b)=>b.count-a.count).filter(x=>x.count>0).slice(0,3);$('coachingList').innerHTML=(top.length?top:[{name:'Strength Maintained',tip:'No recurring weak area dominated this incident. Increase difficulty to add complexity.',count:0}]).map(x=>`<div class="coach-item"><strong>${x.name}</strong>${x.count?` · ${x.count} error${x.count===1?'':'s'}`:''}<br>${x.tip}</div>`).join('');
  }
  function renderCareerResult(result){
    const rank=engine.rankForXp(profile.xp),next=engine.nextRank(),trend=(profile.history||[]).slice(-5),trendText=trend.length>1?`${trend[0].ier} → ${trend[trend.length-1].ier} over last ${trend.length} incidents`:'Trend begins after your next incident.';
    $('careerResults').innerHTML=`<div class="career-item"><strong>${rank.name}</strong><br>${profile.xp.toLocaleString()} career XP${next?` · ${Math.max(0,next.xp-profile.xp).toLocaleString()} XP to ${next.name}`:' · Top role achieved'}</div><div class="career-item">+${result.xpGain} XP · ${profile.incidentStreak} incident streak</div><div class="career-item"><strong>Performance trend</strong><br>${trendText}</div>`;
  }
  function renderAchievements(result){
    const achievementIds=result.unlocked.filter(id=>!id.startsWith('cert:')),base=(achievementIds.length?achievementIds:profile.achievements.slice(-3)).map(id=>{const a=RR.ACHIEVEMENTS.find(x=>x.id===id);return a?`<div class="achievement-item unlocked"><strong>${a.name}</strong><br>${a.desc}</div>`:''}).join('');
    const certs=profile.certifications.slice(-2).map(id=>`<div class="achievement-item unlocked"><strong>In-game Certification: ${RR.CERTIFICATIONS[id]||id}</strong><br>Earned through Resource Run progression; not an external professional credential.</div>`).join('');$('achievementResults').innerHTML=(base+certs)||'<div class="achievement-item">No new achievements this run.</div>';
  }
  function openImh(){const r=engine?.state?.active,b=r?`<p>${U.escapeHtml(engine.decisionFor(r).imh)}</p><div class="dialog-list"><div><strong>Current request</strong><br>${U.escapeHtml(r.resource)} · ${U.escapeHtml(r.dest)} · ${r.route}</div></div>`:'<p>Select a request first. The focused IMH view will show the guidance tied to that decision.</p>';openDialog('Incident Management Handbook',b,[{label:'Return to Incident',primary:true,action:closeDialog}],'Job Aid')}
  function showCareer(){const e=new RR.IncidentEngine(profile,selectedDifficulty),rank=e.rankForXp(profile.xp),next=e.nextRank(),unlocked=Object.entries(RR.DIFFICULTY).filter(([,d])=>e.rankIndex()>=d.unlockRank).map(([n])=>n).join(' · '),certs=profile.certifications.length?profile.certifications.map(id=>RR.CERTIFICATIONS[id]||id).join(' · '):'No in-game certifications yet',rows=Object.entries(profile.mastery).map(([k,v])=>`<div><strong>${U.capitalize(k)}</strong><br>${v}% mastery</div>`).join('');
    openDialog('Career & Mastery',`<p><strong>${rank.name}</strong><br>${profile.xp.toLocaleString()} career XP${next?` · ${Math.max(0,next.xp-profile.xp).toLocaleString()} XP to ${next.name}`:' · Highest role achieved'}<br>${profile.incidentStreak} current incident streak · ${profile.bestIncidentStreak} best</p><div class="dialog-list"><div><strong>Unlocked difficulties</strong><br>${unlocked}</div><div><strong>In-game certifications</strong><br>${certs}</div>${rows}</div>`,[{label:'Close',primary:true,action:closeDialog}],'Player Progression')}
  function showQueueDialog(){const S=engine.state,open=S.queue.filter(r=>r.status!=='Complete');openDialog('Request Queue',`<div class="dialog-list">${open.map(r=>`<div><strong>${U.escapeHtml(r.resource)}</strong><br>${r.priority} · ${U.escapeHtml(r.dest)} · due ${U.formatTime(r.due)}</div>`).join('')}</div>`,[{label:'Close',primary:true,action:closeDialog}],'Mobile Command')}
  function showInventoryDialog(){openDialog('Resource Availability',`<div class="dialog-list">${Object.values(engine.state.inventory).map(r=>`<div><strong>${U.escapeHtml(r.name)}</strong><br>${r.available} available · ${r.committed} committed · ${r.deployed} deployed</div>`).join('')}</div>`,[{label:'Close',primary:true,action:closeDialog}],'Mobile Command')}
  function showMetricsDialog(){const s=engine.scores();openDialog('Incident Effectiveness',`<div class="dialog-list">${[['Accuracy',s.accuracy],['Speed',s.speed],['Accountability',s.accountability],['Documentation',s.documentation],['Operational Impact',s.impact],['Mission Success',s.mission]].map(([n,v])=>`<div><strong>${n}</strong><br>${v}</div>`).join('')}</div>`,[{label:'Close',primary:true,action:closeDialog}],'Live Performance')}
  function openDialog(title,body,actions=[],eyebrow='Incident Update'){$('dialogEyebrow').textContent=eyebrow;$('dialogTitle').textContent=title;$('dialogBody').innerHTML=body;const a=$('dialogActions');a.innerHTML='';actions.forEach(x=>{const b=document.createElement('button');b.className='btn '+(x.primary?'btn-primary':'btn-secondary');b.textContent=x.label;b.onclick=x.action;a.appendChild(b)});$('dialogBackdrop').classList.add('is-open');$('dialogBackdrop').setAttribute('aria-hidden','false');setTimeout(()=>a.querySelector('button')?.focus(),0)}
  function closeDialog(){$('dialogBackdrop').classList.remove('is-open');$('dialogBackdrop').setAttribute('aria-hidden','true')}
  function confirmBack(){openDialog('Return to the ICP?','<p>Your current incident progress will end. Career progression from completed incidents is preserved.</p>',[{label:'Return to Incident',action:closeDialog},{label:'End Incident',primary:true,action:()=>{closeDialog();setScreen('landing');updateLanding()}}],'Confirm Navigation')}
  function toggleSound(){soundOn=!soundOn;$('soundBtn').setAttribute('aria-pressed',String(soundOn));$('soundIcon').innerHTML=`<use href="#${soundOn?'i-volume':'i-volume-off'}"/>`}

  function setup(){
    $$('.difficulty-card').forEach(b=>b.onclick=()=>{const need=RR.DIFFICULTY[b.dataset.difficulty].unlockRank;if(rankIndex()<need){openDialog('Difficulty Locked',`<p>${b.dataset.difficulty} unlocks at <strong>${RR.RANKS[need].name}</strong>. Build career XP and mastery first.</p>`,[{label:'Close',primary:true,action:closeDialog}],'Career Progression');return}$$('.difficulty-card').forEach(x=>x.classList.remove('is-selected'));b.classList.add('is-selected');selectedDifficulty=b.dataset.difficulty});
    $('startMissionBtn').onclick=()=>{briefingIndex=0;setScreen('briefing');renderBriefing()};$('openCareerBtn').onclick=showCareer;$('resultsCareerBtn').onclick=showCareer;
    $('briefBackBtn').onclick=()=>{if(briefingIndex>0){briefingIndex--;renderBriefing()}else setScreen('landing')};$('briefNextBtn').onclick=()=>{if(briefingIndex<2){briefingIndex++;renderBriefing()}else startIncident()};
    $('backToIcpBtn').onclick=confirmBack;$('resultsIcpBtn').onclick=()=>{setScreen('landing');updateLanding()};$('openImhBtn').onclick=openImh;$('mobileImhBtn').onclick=openImh;$('soundBtn').onclick=toggleSound;
    $('continuePeriodBtn').onclick=()=>{if(engine.state.op>=4)finishIncident();else continuePeriod()};$('newIncidentBtn').onclick=()=>{setScreen('landing');updateLanding()};
    $('mobileQueueBtn').onclick=showQueueDialog;$('mobileInventoryBtn').onclick=showInventoryDialog;$('mobileMetricsBtn').onclick=showMetricsDialog;$('dialogBackdrop').onclick=e=>{if(e.target===$('dialogBackdrop'))closeDialog()};
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('dialogBackdrop').classList.contains('is-open')){closeDialog();return}if(!$('game').classList.contains('is-active'))return;const keys={a:0,b:1,c:2,'1':0,'2':1,'3':2},i=keys[e.key.toLowerCase()];if(i!==undefined){const b=$$('#choiceGrid .choice-btn')[i];if(b&&!b.disabled)b.click()}});
    updateLanding();
  }
  setup();
})();