let introIndex=0, step=0, score=0, streak=0, lives=3, soundOn=true, scenario=null, flow=[];

const scenarios=[
 {resource:"Vacuum Truck",qty:"1",dest:"Division Alpha",time:"1600",priority:"Urgent",route:"Tactical",available:false,icon:"VAC TRUCK",final:"Division Alpha"},
 {resource:"Portable Light Tower",qty:"2",dest:"Division Bravo",time:"1800",priority:"High",route:"Tactical",available:true,icon:"LIGHT TOWER",final:"Division Bravo"},
 {resource:"Intrinsically Safe Radios",qty:"12",dest:"Operations",time:"1500",priority:"High",route:"Support",available:false,icon:"RADIOS",final:"Operations"},
 {resource:"Level B PPE Sets",qty:"8",dest:"Entry Team",time:"1400",priority:"Urgent",route:"Support",available:true,icon:"PPE",final:"Entry Team"},
 {resource:"Portable Generator",qty:"1",dest:"Staging Area",time:"1700",priority:"Normal",route:"Support",available:false,icon:"GENERATOR",final:"Staging Area"},
 {resource:"Air Monitoring Technician",qty:"1",dest:"HazMat Group",time:"1330",priority:"Urgent",route:"Tactical",available:false,icon:"TECHNICIAN",final:"HazMat Group"},
 {resource:"Boom Trailer",qty:"1",dest:"Division Delta",time:"1630",priority:"High",route:"Tactical",available:true,icon:"BOOM TRAILER",final:"Division Delta"},
 {resource:"Portable Restroom Units",qty:"6",dest:"Base",time:"1900",priority:"Normal",route:"Support",available:false,icon:"RESTROOMS",final:"Base"}
];

const complications=[
 "The supplier calls back: ETA slipped by 90 minutes. What gets updated, who needs to know, and does the request priority change?",
 "The resource arrives at the field instead of Staging. What must happen before the incident can accurately account for it?",
 "Finance flags the vendor cost as exceeding delegated purchasing authority. What happens before the commitment is approved?",
 "A duplicate 213-RR is discovered for the same scarce resource. Who reconciles the requests and how should status be documented?",
 "Operations cancels the need after the resource has already been ordered. What actions should Logistics, Resource Unit, and Finance take?",
 "The wrong model of equipment arrives. It is close—but does not meet the requested capability. Accept it, reject it, or clarify first?"
];

function resourceText(s){
  const q=Number(s.qty);
  if(q===1) return `${s.qty} ${s.resource}`;
  return `${s.qty} ${s.resource}`;
}

function makeFlow(s){
 return [
  {
   title:"Request",zone:"ICP",marker:"Request",state:"Request created",anim:"radio",
   prompt:`A need for ${resourceText(s)} is identified. What happens first?`,
   choices:[
    ["Complete an ICS 213-RR with the resource need, quantity, destination, and required time",1],
    ["Call Staging and tell them something is coming",0],
    ["Wait until the end of the operational period to document it",0]
   ],
   imh:"Requisitioner: identify the resource need and type, then complete the ICS 213-RR Resource Request in the IAP. Capture the resource, quantity, destination, and required time.",
   routeLine:"Start at the point of need. The request must be documented before the rest of the system can act on it."
  },
  {
   title:"Review",zone:"ICP",marker:"Review",state:"Routing decision",anim:"radio",
   prompt:`This request is classified as ${s.route.toUpperCase()}. Which route should it follow?`,
   choices:s.route==="Tactical" ? [
    ["Resource Unit",1],["Finance",0],["Vendor directly",0]
   ] : [
    ["Logistics",1],["Field Operations",0],["Staging only",0]
   ],
   imh:"Use the Tactical vs Support decision point. Tactical requests route through Resource Unit. Support requests route to Logistics.",
   routeLine:`This assignment is a ${s.route.toLowerCase()} request. Route it to the correct ICS function before anything else.`
  },
  {
   title:"Review",zone:"ICP",marker:"Review",state:"Request under review",anim:"radio",
   prompt:s.route==="Tactical" ? 
    "The Resource Unit receives the request. What should happen next?" :
    "Logistics receives the support request. What should happen next?",
   choices:s.route==="Tactical" ? [
    ["Review for clarity and check ordered resources / staging availability",1],
    ["Immediately order from an outside supplier",0],
    ["Send it directly to Finance without review",0]
   ] : [
    ["Review for clarity and verify exactly what is needed before sourcing",1],
    ["Send the request directly to the field",0],
    ["Close it because support resources are not tracked",0]
   ],
   imh:s.route==="Tactical" ?
    "Resource Unit reviews the ICS 213-RR for clarity, checks ordered resources and staging availability, and returns it for clarification when needed." :
    "Logistics reviews support requests for clarity before sourcing or ordering. Clarify incomplete requests before committing resources.",
   routeLine:"Before sourcing or assigning anything, the receiving function should review the request for clarity and completeness."
  },
  {
   title:"Source",zone:s.available?"Staging":"Supplier",marker:"Source",state:s.available?"Resource available internally":"External sourcing required",anim:s.available?"clip":"phone",
   prompt:s.available ?
    `The requested ${s.resource} is available internally. What is the best next move?` :
    `The requested ${s.resource} is NOT available internally. What is the best next move?`,
   choices:s.available ? [
    ["Reserve / earmark the available resource for the specific assignment and update status",1],
    ["Order another one anyway",0],
    ["Send it directly without updating anyone",0]
   ] : [
    ["Route to Logistics to source / order the resource",1],
    ["Close the request as unavailable",0],
    ["Send an unverified substitute without clarification",0]
   ],
   imh:s.available ?
    "If equipment is available, earmark it for the specific use and update resource status so the incident knows it is committed." :
    "If the needed resource is not available internally, Logistics sources and orders it. Capture supplier, price, unit of measure, ETA, and request status.",
   routeLine:s.available ? "The resource exists inside the incident system, but it still has to be committed and tracked." : "The resource is not available internally, so the request must move into sourcing and ordering."
  },
  {
   title:"Source",zone:s.available?"Staging":"Supplier",marker:"Source",state:s.available?"Resource being readied":"Vendor contacted",anim:s.available?"clip":"phone",
   prompt:s.available ?
    "The resource is committed. What information still needs to remain visible before deployment?" :
    "A qualified supplier is found. What belongs with the order?",
   choices:s.available ? [
    ["Assignment, location, status, and accountability information",1],
    ["Only the resource name",0],
    ["Nothing else—the resource is already available",0]
   ] : [
    ["Price, unit of measure, ETA, supplier details, and the completed ICS 213-RR",1],
    ["Only the supplier phone number",0],
    ["Only the ETA",0]
   ],
   imh:s.available ?
    "Availability does not replace accountability. Maintain assignment and status visibility as the resource is activated." :
    "Logistics contacts suppliers, captures price, UOM, ETA and vendor details, and completes the request record. Finance may be involved for purchasing authority or long-term commitments.",
   routeLine:s.available ? "Readying the resource is still part of accountability." : "Ordering is not just making a phone call. The order needs the details that keep the request traceable."
  },
  {
   title:"Staging",zone:"Staging",marker:"Staging",state:"Resource arriving",anim:"truck",
   prompt:`The ${s.resource} arrives or is activated for incident use. What should happen before final assignment?`,
   choices:[
    ["Receive / check in the resource and document accountability before deployment",1],
    ["Send it directly to the end user with no check-in",0],
    ["Document it only when it demobilizes",0]
   ],
   imh:"Staging or the designated check-in location receives resources and records check-in and accountability before deployment. Use the applicable check-in/status tools such as ICS 211.",
   routeLine:"Before the field gets it, the incident needs a reliable handoff and check-in point."
  },
  {
   title:"Field",zone:"Field",marker:"Field",state:"Resource deployed",anim:"truck",
   prompt:`The ${s.resource} is ready for ${s.final}. What keeps the process complete?`,
   choices:[
    ["Issue / assign it, update resource status, and keep the incident record current",1],
    ["Let the vendor or user decide where it goes",0],
    ["Leave the status unchanged until the incident ends",0]
   ],
   imh:"Operations / Staging / Resource Unit maintain assignment and status visibility as the resource is issued. Update status changes so the incident can account for where the resource is and what it is doing.",
   routeLine:"The assignment is not finished until the resource is issued and its status is kept current."
  }
 ];
}

function setScreen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active')}
function openHowItWorks(){document.getElementById('howModal').classList.add('show');beep(480,.05)}
function closeHowItWorks(){document.getElementById('howModal').classList.remove('show')}
function startIntro(){beep(520,.08);setScreen('intro');renderIntro()}
function renderIntro(){
 const cards=[...document.querySelectorAll('.introCard')], dots=[...document.querySelectorAll('.dot')];
 cards.forEach((x,i)=>x.classList.toggle('active',i===introIndex)); dots.forEach((x,i)=>x.classList.toggle('on',i===introIndex));
 document.getElementById('introNext').textContent=introIndex===2?'Begin →':'Next →';
}
function introNext(){beep(650,.06); if(introIndex<2){introIndex++;renderIntro()} else newAssignment()}
function introPrev(){ if(introIndex>0){introIndex--;renderIntro()} else setScreen('title') }

function newAssignment(){
 scenario=scenarios[Math.floor(Math.random()*scenarios.length)];
 flow=makeFlow(scenario);step=0;score=0;streak=0;lives=3;
 setScreen('game');
 populateScenario();
 renderGame();
 setVehicleZone('ICP',true);
}
function newAssignmentFromModal(){closeBonus();newAssignment()}
function populateScenario(){
 document.getElementById('assignmentLabel').textContent=`Assignment · ${scenario.resource.toUpperCase()}`;
 document.getElementById('assignmentSub').textContent=`${scenario.qty} needed · ${scenario.dest} · ${scenario.priority} priority · required by ${scenario.time}`;
 document.getElementById('resourceBadge').textContent=scenario.icon;
 document.getElementById('routePill').textContent=scenario.route;
 document.getElementById('reqResource').textContent=scenario.resource;
 document.getElementById('reqQty').textContent=scenario.qty;
 document.getElementById('reqDest').textContent=scenario.dest;
 document.getElementById('reqTime').textContent=scenario.time;
 document.getElementById('reqPriority').textContent=scenario.priority;
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function updateHud(){
 document.getElementById('scoreTop').textContent=score;
 document.getElementById('streakTop').textContent=streak+'x';
 document.getElementById('scoreDock').textContent=score;
 document.getElementById('streakDock').textContent=streak+'x';
 document.getElementById('livesDock').textContent='♥'.repeat(Math.max(lives,0))+'♡'.repeat(Math.max(3-lives,0));
 document.getElementById('sideStep').textContent=(step+1)+' / '+flow.length;
}
function renderGame(){
 const s=flow[step];
 document.getElementById('prompt').textContent=s.prompt;
 document.getElementById('routeLine').textContent=s.routeLine;
 document.getElementById('worldState').textContent=s.state;
 document.getElementById('reqStatus').textContent=s.state;
 document.getElementById('imhInline').textContent=s.imh;
 document.getElementById('imhModalText').textContent=s.imh;
 updateHud();
 const p=document.getElementById('progressTrack'); p.innerHTML='';
 flow.forEach((_,i)=>{const d=document.createElement('div'); d.className='progressDot '+(i<step?'done':i===step?'current':''); p.appendChild(d)});
 const cg=document.getElementById('choices'); cg.innerHTML='';
 shuffle(s.choices).forEach((c,i)=>{ const b=document.createElement('button'); b.className='choice'; b.innerHTML=`<div class="key">${String.fromCharCode(65+i)}</div><div class="ct">${c[0]}</div>`; b.onclick=()=>choose(b,c[1]); cg.appendChild(b); });
 updateMarkers(s.marker);
}
function updateMarkers(marker){
 const ids=['Request','Review','Source','Staging','Field'];
 ids.forEach(name=>{const el=document.getElementById('m'+name); if(!el) return; el.classList.remove('active','done')});
 const idx=ids.indexOf(marker);
 ids.forEach((name,i)=>{const el=document.getElementById('m'+name); if(i<idx) el.classList.add('done'); if(i===idx) el.classList.add('active');});
}
function choose(btn,correct){
 if(correct){
  btn.classList.add('good'); const pts=100+streak*25; score+=pts; streak++; beep(820,.08); toast('Correct route +'+pts,'ok',1700);
  playTransition(flow[step]); setTimeout(()=>{step++; if(step>=flow.length) win(); else renderGame();},1100);
 }else{
  btn.classList.add('bad'); streak=0; lives--; beep(170,.12); toast('Not this route — open the IMH, verify the next step, then try again.','no',3600);
  updateHud(); setTimeout(()=>btn.classList.remove('bad'),600); if(lives<=0) setTimeout(gameOver,700);
 }
}
function setVehicleZone(zone,instant=false){
 const pos={Supplier:'13%',ICP:'38%',Staging:'64%',Field:'82%'}; const v=document.getElementById('vehicle');
 if(instant){v.style.transition='none';v.style.left=pos[zone]||'38%'; void v.offsetWidth; v.style.transition='left 1s cubic-bezier(.2,.8,.2,1)';}
 else v.style.left=pos[zone]||'38%';
}
function playTransition(s){
 if(s.anim==='phone'){pulse('phonePulse');dialTones();setVehicleZone('Supplier')}
 if(s.anim==='clip'){pulse('clipPulse');beep(620,.08);setVehicleZone('Staging')}
 if(s.anim==='radio'){pulse('radioPulse');radioChirp();setVehicleZone('ICP')}
 if(s.anim==='truck'){engineChug();setVehicleZone(s.zone==='Field'?'Field':'Staging');pulse('clipPulse')}
}
function pulse(id){const e=document.getElementById(id);e.classList.remove('go');void e.offsetWidth;e.classList.add('go')}
function win(){
 setVehicleZone('Field'); setScreen('win'); document.getElementById('finalScore').textContent=`Final Score ${score.toLocaleString()} · Best Streak ${streak}x`;
 document.getElementById('winText').textContent=`${resourceText(scenario)} successfully routed to ${scenario.final}. Start another assignment and the scenario will change.`;
 fanfare();
}
function openIMH(){beep(470,.04);document.getElementById('imhModal').classList.add('show')}
function closeIMH(){document.getElementById('imhModal').classList.remove('show')}
function showBonus(){document.getElementById('bonusText').textContent=complications[Math.floor(Math.random()*complications.length)];document.getElementById('bonusModal').classList.add('show');bonusChime()}
function closeBonus(){document.getElementById('bonusModal').classList.remove('show')}
function gameOver(){gameOverSound(); document.getElementById('gameOverText').textContent=`Three lives gone. Somewhere, ${scenario.resource.toLowerCase()} is probably asking, “Who actually owns this request?”`; document.getElementById('gameOverModal').classList.add('show')}
function retryQuestion(){document.getElementById('gameOverModal').classList.remove('show'); lives=3; streak=0; renderGame()}
function openICPConfirm(){document.getElementById('icpModal').classList.add('show'); beep(400,.05)}
function closeICPConfirm(){document.getElementById('icpModal').classList.remove('show')}
function goICP(){document.querySelectorAll('.overlay').forEach(m=>m.classList.remove('show')); introIndex=0; setScreen('title')}
function toast(msg,type,duration=2200){const t=document.getElementById('toast'); t.textContent=msg; t.className='toast show '+type; clearTimeout(window._tt); window._tt=setTimeout(()=>t.classList.remove('show'),duration)}
function toggleSound(){soundOn=!soundOn; document.getElementById('soundIcon').textContent=soundOn?'🔊':'🔇'}
function beep(freq,dur,vol=.06){ if(!soundOn)return; try{const AC=window.AudioContext||window.webkitAudioContext,ctx=new AC(),o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur)}catch(e){} }
function fanfare(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.16,.07),i*120))}
function bonusChime(){[740,880,1040].forEach((f,i)=>setTimeout(()=>beep(f,.12,.055),i*95))}
function dialTones(){[697,770,852].forEach((f,i)=>setTimeout(()=>beep(f,.08,.045),i*120))}
function engineChug(){[95,110,90,120].forEach((f,i)=>setTimeout(()=>beep(f,.07,.035),i*90))}
function radioChirp(){[930,1150,880].forEach((f,i)=>setTimeout(()=>beep(f,.045,.035),i*70))}
function gameOverSound(){[440,392,349,294,220].forEach((f,i)=>setTimeout(()=>beep(f,.22,.07),i*120))}