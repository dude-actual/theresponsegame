let introIndex=0, step=0, score=0, streak=0, lives=3, soundOn=true, scenario=null, flow=[], locked=false, feedbackTimer=null;

const $=id=>document.getElementById(id);

const scenarios=[
 {
  resource:"Vacuum Truck",qty:"1",dest:"Division Alpha",time:"1600",priority:"Urgent",route:"Tactical",available:false,icon:"VAC TRUCK",final:"Division Alpha",
  failTitle:"Vac Truck MIA",failIcon:"🚛",fail:[
   "Division Alpha is still waiting while the vacuum truck sits unassigned. The request never made it cleanly through the system.",
   "The vacuum truck exists. The accountability trail does not. Division Alpha is still waiting."
  ]
 },
 {
  resource:"Portable Light Towers",qty:"2",dest:"Division Bravo",time:"1800",priority:"High",route:"Tactical",available:true,icon:"LIGHT TOWER",final:"Division Bravo",
  failTitle:"Lights Out",failIcon:"💡",fail:[
   "Division Bravo is ready to work. The light towers are not. The request went dark before the assignment did.",
   "Two light towers, zero assignment. Division Bravo is still working in the dark."
  ]
 },
 {
  resource:"Intrinsically Safe Radios",qty:"12",dest:"Operations",time:"1500",priority:"High",route:"Support",available:false,icon:"RADIOS",final:"Operations",
  failTitle:"Radio Silence",failIcon:"📻",fail:[
   "Operations asked for 12 radios. The request stalled, and the comms picture never got the equipment it needed.",
   "Twelve radios are somewhere between need and assignment. Operations calls that radio silence."
  ]
 },
 {
  resource:"Level B PPE Sets",qty:"8",dest:"Entry Team",time:"1400",priority:"Urgent",route:"Support",available:true,icon:"PPE",final:"Entry Team",
  failTitle:"Entry Team Waiting",failIcon:"🥽",fail:[
   "The Entry Team is ready. Its PPE request is not. The gear never completed the route to assignment.",
   "Eight PPE sets were requested, but the process lost the handoff before the Entry Team got them."
  ]
 },
 {
  resource:"Portable Generator",qty:"1",dest:"Staging Area",time:"1700",priority:"Normal",route:"Support",available:false,icon:"GENERATOR",final:"Staging Area",
  failTitle:"No Power at Staging",failIcon:"🔌",fail:[
   "Staging has a plan, just not the power. The generator request never completed the route.",
   "The generator is still an order instead of an asset. Staging is waiting."
  ]
 },
 {
  resource:"Air Monitoring Technician",qty:"1",dest:"HazMat Group",time:"1330",priority:"Urgent",route:"Tactical",available:false,icon:"TECHNICIAN",final:"HazMat Group",
  failTitle:"Monitor Delayed",failIcon:"🧪",fail:[
   "HazMat is waiting on the air monitoring technician while the request is still stuck in the process.",
   "The technician never reached HazMat because the request never reached a clean assignment."
  ]
 },
 {
  resource:"Boom Trailer",qty:"1",dest:"Division Delta",time:"1630",priority:"High",route:"Tactical",available:true,icon:"BOOM TRAILER",final:"Division Delta",
  failTitle:"Boom Still Parked",failIcon:"🛻",fail:[
   "Division Delta needs boom. The trailer is still parked in the process instead of at the assignment.",
   "The boom trailer was available, but the request never turned availability into deployment."
  ]
 },
 {
  resource:"Portable Restroom Units",qty:"6",dest:"Base",time:"1900",priority:"Normal",route:"Support",available:false,icon:"RESTROOMS",final:"Base",
  failTitle:"Base Is Waiting",failIcon:"🚻",fail:[
   "Base has six very practical reasons to wish this support request had been routed correctly.",
   "Support resources still count. Base is learning that lesson one restroom unit at a time."
  ]
 }
];

function resourceText(s){return `${s.qty} ${s.resource}`}

function makeFlow(s){
 return [
  {
   marker:"Request",zone:"ICP",state:"Request created",anim:"radio",
   prompt:`A need for ${resourceText(s)} is identified. What happens first?`,
   choices:[
    ["Complete the ICS 213-RR with resource, quantity, destination, and required time",1],
    ["Call Staging before documenting the request",0],
    ["Wait until the end of the operational period to document it",0]
   ],
   imh:"Requisitioner: identify the resource need and type, then complete the ICS 213-RR Resource Request in the IAP.",
   routeLine:"Document the request before the rest of the system acts on it."
  },
  {
   marker:"Review",zone:"ICP",state:"Routing decision",anim:"radio",
   prompt:`This is a ${s.route.toUpperCase()} request. Where does it go?`,
   choices:s.route==="Tactical"
    ? [["Resource Unit",1],["Finance",0],["Vendor directly",0]]
    : [["Logistics",1],["Field Operations",0],["Staging only",0]],
   imh:"At the Tactical vs Support decision point, tactical requests route through Resource Unit and support requests route to Logistics.",
   routeLine:`Route the ${s.route.toLowerCase()} request to the correct ICS function.`
  },
  {
   marker:"Review",zone:"ICP",state:"Request under review",anim:"radio",
   prompt:s.route==="Tactical" ? "Resource Unit has the request. What happens next?" : "Logistics has the support request. What happens next?",
   choices:s.route==="Tactical"
    ? [["Review for clarity; check ordered resources and staging",1],["Immediately order from an outside supplier",0],["Send it directly to Finance",0]]
    : [["Review for clarity before sourcing",1],["Send it directly to the field",0],["Close it because support resources are not tracked",0]],
   imh:s.route==="Tactical"
    ? "Resource Unit reviews the ICS 213-RR for clarity and checks ordered resources and staging availability."
    : "Logistics reviews support requests for clarity before sourcing or ordering.",
   routeLine:"Review first. Source or assign only after the request is clear."
  },
  {
   marker:"Source",zone:s.available?"Staging":"Supplier",state:s.available?"Available internally":"External sourcing required",anim:s.available?"clip":"phone",
   prompt:s.available ? `${s.resource} is available internally. Next move?` : `${s.resource} is not available internally. Next move?`,
   choices:s.available
    ? [["Earmark it for the assignment and update status",1],["Order another one anyway",0],["Send it directly without updating status",0]]
    : [["Route to Logistics to source / order it",1],["Close the request as unavailable",0],["Send an unverified substitute",0]],
   imh:s.available
    ? "If equipment is available, earmark it for the specific use and update resource status."
    : "If the resource is not available internally, Logistics sources and orders it and captures supplier, price, UOM, ETA, and status.",
   routeLine:s.available ? "Commit the available resource and keep its status visible." : "Move the request into sourcing and ordering."
  },
  {
   marker:"Source",zone:s.available?"Staging":"Supplier",state:s.available?"Resource being readied":"Vendor contacted",anim:s.available?"clip":"phone",
   prompt:s.available ? "The resource is committed. What still needs to stay visible?" : "A supplier is found. What belongs with the order?",
   choices:s.available
    ? [["Assignment, location, status, and accountability",1],["Only the resource name",0],["Nothing else; it is already available",0]]
    : [["Price, UOM, ETA, supplier details, and completed 213-RR",1],["Only the supplier phone number",0],["Only the ETA",0]],
   imh:s.available
    ? "Availability does not replace accountability. Maintain assignment and status visibility as the resource is activated."
    : "Logistics captures price, UOM, ETA and vendor details and completes the request record. Finance may be involved when required.",
   routeLine:s.available ? "Availability still requires accountability." : "Keep the order traceable."
  },
  {
   marker:"Staging",zone:"Staging",state:"Resource arriving",anim:"truck",
   prompt:`${s.resource} arrives. What happens before final assignment?`,
   choices:[["Check it in and document accountability",1],["Send it directly to the end user with no check-in",0],["Document it only at demobilization",0]],
   imh:"Staging or the designated check-in location receives resources and records check-in/accountability before deployment. Use the applicable check-in/status tools such as ICS 211.",
   routeLine:"Check in before deployment."
  },
  {
   marker:"Field",zone:"Field",state:"Resource deployed",anim:"truck",
   prompt:`${s.resource} is ready for ${s.final}. What completes the process?`,
   choices:[["Assign it, update status, and keep the record current",1],["Let the vendor decide where it goes",0],["Leave status unchanged until the incident ends",0]],
   imh:"Operations / Staging / Resource Unit maintain assignment and status visibility as the resource is issued.",
   routeLine:"Issue the resource and keep its status current."
  }
 ];
}

function setScreen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active')}
function openHowItWorks(){$('howModal').classList.add('show');beep(480,.05)}
function closeHowItWorks(){$('howModal').classList.remove('show')}
function startIntro(){introIndex=0;setScreen('intro');renderIntro();beep(520,.08)}
function renderIntro(){
 const cards=[...document.querySelectorAll('.introCard')],dots=[...document.querySelectorAll('.dot')];
 cards.forEach((x,i)=>x.classList.toggle('active',i===introIndex));
 dots.forEach((x,i)=>x.classList.toggle('on',i===introIndex));
 $('introNext').textContent=introIndex===2?'Begin →':'Next →';
}
function introNext(){beep(650,.05);if(introIndex<2){introIndex++;renderIntro()}else newAssignment()}
function introPrev(){if(introIndex>0){introIndex--;renderIntro()}else setScreen('title')}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}

function ensureFeedbackLine(){
 let f=$('feedbackLine');
 if(f) return f;
 f=document.createElement('div');
 f.id='feedbackLine';
 f.className='feedbackLine';
 const q=document.querySelector('.questionPanel');
 const label=q?.querySelector('.promptLabel');
 if(q&&label) label.insertAdjacentElement('afterend',f);
 return f;
}

function newAssignment(){
 scenario=scenarios[Math.floor(Math.random()*scenarios.length)];
 flow=makeFlow(scenario);step=0;score=0;streak=0;lives=3;locked=false;
 setScreen('game');
 populateScenario();
 renderGame();
 setVehicleZone('ICP',true);
}
function newAssignmentFromModal(){closeBonus();newAssignment()}
function populateScenario(){
 $('assignmentLabel').textContent=`Assignment · ${scenario.resource}`;
 $('assignmentSub').textContent=`${scenario.qty} · ${scenario.dest} · ${scenario.priority} · ${scenario.time}`;
 $('resourceBadge').textContent=scenario.icon;
 $('routePill').textContent=scenario.route;
 $('reqResource').textContent=scenario.resource;
 $('reqQty').textContent=scenario.qty;
 $('reqDest').textContent=scenario.dest;
 $('reqTime').textContent=scenario.time;
 $('reqPriority').textContent=scenario.priority;
}
function updateHud(){
 $('scoreTop').textContent=score;
 $('streakTop').textContent=streak+'x';
 $('scoreDock').textContent=score;
 $('streakDock').textContent=streak+'x';
 $('livesDock').textContent='♥'.repeat(Math.max(lives,0))+'♡'.repeat(Math.max(3-lives,0));
 $('sideStep').textContent=(step+1)+' / '+flow.length;
}
function renderGame(){
 const s=flow[step];
 $('prompt').textContent=s.prompt;
 $('routeLine').textContent=s.routeLine;
 $('worldState').textContent=s.state;
 $('reqStatus').textContent=s.state;
 $('imhInline').textContent=s.imh;
 $('imhModalText').textContent=s.imh;
 clearFeedback();
 updateHud();
 const p=$('progressTrack');p.innerHTML='';
 flow.forEach((_,i)=>{const d=document.createElement('div');d.className='progressDot '+(i<step?'done':i===step?'current':'');p.appendChild(d)});
 const cg=$('choices');cg.innerHTML='';
 shuffle(s.choices).forEach((c,i)=>{
  const b=document.createElement('button');
  b.className='choice';
  b.innerHTML=`<div class="key">${String.fromCharCode(65+i)}</div><div class="ct">${c[0]}</div>`;
  b.onclick=()=>choose(b,c[1]);
  cg.appendChild(b);
 });
 updateMarkers(s.marker);
}
function updateMarkers(marker){
 const ids=['Request','Review','Source','Staging','Field'],idx=ids.indexOf(marker);
 ids.forEach((name,i)=>{const e=$('m'+name);if(!e)return;e.classList.remove('active','done');if(i<idx)e.classList.add('done');if(i===idx)e.classList.add('active')});
}
function showFeedback(text,type,duration){
 const f=ensureFeedbackLine();
 clearTimeout(feedbackTimer);
 f.textContent=text;
 f.className='feedbackLine show '+type;
 feedbackTimer=setTimeout(clearFeedback,duration);
}
function clearFeedback(){
 const f=$('feedbackLine');
 if(!f)return;
 f.textContent='';
 f.className='feedbackLine';
}
function choose(btn,correct){
 if(locked)return;
 if(correct){
  locked=true;
  btn.classList.add('good');
  const pts=100+streak*25;
  score+=pts;streak++;
  updateHud();
  showFeedback(`Correct route +${pts}`,'ok',850);
  beep(820,.08);
  playTransition(flow[step]);
  setTimeout(()=>{step++;locked=false;if(step>=flow.length)win();else renderGame()},900);
 }else{
  locked=true;
  btn.classList.add('bad');
  streak=0;lives--;
  updateHud();
  showFeedback('Not this route. Check the IMH and try again.','no',2200);
  beep(170,.12);
  setTimeout(()=>{btn.classList.remove('bad');locked=false},500);
  if(lives<=0)setTimeout(gameOver,650);
 }
}
function setVehicleZone(zone,instant=false){
 const pos={Supplier:'17%',ICP:'40%',Staging:'64%',Field:'82%'},v=$('vehicle');
 if(instant){v.style.transition='none';v.style.left=pos[zone]||'40%';void v.offsetWidth;v.style.transition='left .9s cubic-bezier(.2,.8,.2,1)'}
 else v.style.left=pos[zone]||'40%';
}
function playTransition(s){
 if(s.anim==='phone'){pulse('phonePulse');dialTones();setVehicleZone('Supplier')}
 if(s.anim==='clip'){pulse('clipPulse');beep(620,.08);setVehicleZone('Staging')}
 if(s.anim==='radio'){pulse('radioPulse');radioChirp();setVehicleZone('ICP')}
 if(s.anim==='truck'){engineChug();setVehicleZone(s.zone==='Field'?'Field':'Staging');pulse('clipPulse')}
}
function pulse(id){const e=$(id);if(!e)return;e.classList.remove('go');void e.offsetWidth;e.classList.add('go')}
function win(){
 setVehicleZone('Field');
 setScreen('win');
 $('finalScore').textContent=`Final Score ${score.toLocaleString()} · Best Streak ${streak}x`;
 $('winText').textContent=`${resourceText(scenario)} successfully routed to ${scenario.final}.`;
 fanfare();
}
function openIMH(){beep(470,.04);$('imhModal').classList.add('show')}
function closeIMH(){$('imhModal').classList.remove('show')}
function showBonus(){
 const cards=[
  `The ETA for ${scenario.resource} slips by 90 minutes. What gets updated and who needs to know?`,
  `${scenario.resource} arrives at the field instead of Staging. What has to happen before it can be accounted for?`,
  `A duplicate 213-RR appears for ${scenario.resource}. Who reconciles the requests and how is status documented?`,
  `Operations cancels the need for ${scenario.resource} after it has already been ordered. What happens next?`
 ];
 $('bonusText').textContent=cards[Math.floor(Math.random()*cards.length)];
 $('bonusModal').classList.add('show');
 bonusChime();
}
function closeBonus(){$('bonusModal').classList.remove('show')}
function gameOver(){
 gameOverSound();
 const modal=$('gameOverModal');
 const h=modal.querySelector('h3');
 const icon=modal.querySelector('.modalIcon');
 if(h)h.textContent=scenario.failTitle;
 if(icon)icon.textContent=scenario.failIcon;
 $('gameOverText').textContent=scenario.fail[Math.floor(Math.random()*scenario.fail.length)];
 modal.classList.add('show');
}
function retryQuestion(){$('gameOverModal').classList.remove('show');lives=3;streak=0;locked=false;renderGame()}
function openICPConfirm(){$('icpModal').classList.add('show');beep(400,.05)}
function closeICPConfirm(){$('icpModal').classList.remove('show')}
function goICP(){document.querySelectorAll('.overlay').forEach(m=>m.classList.remove('show'));introIndex=0;locked=false;setScreen('title')}
function toggleSound(){soundOn=!soundOn;$('soundIcon').textContent=soundOn?'🔊':'🔇'}
function beep(freq,dur,vol=.055){if(!soundOn)return;try{const AC=window.AudioContext||window.webkitAudioContext,ctx=new AC(),o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(vol,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+dur)}catch(e){}}
function fanfare(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.14,.065),i*110))}
function bonusChime(){[740,880,1040].forEach((f,i)=>setTimeout(()=>beep(f,.11,.05),i*90))}
function dialTones(){[697,770,852].forEach((f,i)=>setTimeout(()=>beep(f,.07,.04),i*110))}
function engineChug(){[95,110,90,120].forEach((f,i)=>setTimeout(()=>beep(f,.06,.03),i*80))}
function radioChirp(){[930,1150,880].forEach((f,i)=>setTimeout(()=>beep(f,.04,.03),i*65))}
function gameOverSound(){[440,392,349,294,220].forEach((f,i)=>setTimeout(()=>beep(f,.2,.06),i*110))}
