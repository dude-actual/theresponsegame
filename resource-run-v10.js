(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    briefingIndex: 0,
    step: 0,
    score: 0,
    streak: 0,
    lives: 3,
    soundOn: true,
    locked: false,
    scenario: null,
    flow: [],
    feedbackTimer: null,
    lastFocus: null
  };

  const scenarios = [
    {
      id:'vac-truck', resource:'Vacuum Truck', qty:'1', dest:'Division Alpha', time:'1600', priority:'Urgent', route:'Tactical', available:false, tag:'VAC TRUCK', final:'Division Alpha',
      failTitle:'Vac Truck MIA',
      fail:[
        'Division Alpha is still waiting. The vacuum truck never made it from request to accountable assignment.',
        'The truck exists. The assignment trail does not. Division Alpha is still waiting.',
        'A vacuum truck without a clean handoff is just an expensive vehicle in the wrong place.'
      ],
      complication:[
        'The vacuum truck vendor pushes ETA back 90 minutes. Update the request, confirm who needs the new ETA, and decide whether the priority changes.',
        'The vacuum truck arrives with the wrong hose configuration. Decide whether the resource is still capable of the assignment before it is accepted.'
      ]
    },
    {
      id:'light-towers', resource:'Portable Light Towers', qty:'2', dest:'Division Bravo', time:'1800', priority:'High', route:'Tactical', available:true, tag:'LIGHT TOWER', final:'Division Bravo',
      failTitle:'Lights Out',
      fail:[
        'Division Bravo is ready to work, but the light towers never completed the route to assignment.',
        'Two light towers were available. Neither one became an accountable field resource.',
        'The towers were in the system, but not where Division Bravo needed them.'
      ],
      complication:[
        'One light tower fails its function check at Staging. Decide whether to substitute, re-source, or revise the quantity before deployment.',
        'Division Bravo now needs the towers 45 minutes earlier. Update the assignment and confirm whether the current resource path can still meet the need.'
      ]
    },
    {
      id:'radios', resource:'Intrinsically Safe Radios', qty:'12', dest:'Operations', time:'1500', priority:'High', route:'Support', available:false, tag:'RADIOS', final:'Operations',
      failTitle:'Radio Silence',
      fail:[
        'Operations asked for 12 intrinsically safe radios. The request stalled before the comms gap was closed.',
        'The radios are somewhere between need and assignment. Operations still does not have them.',
        'The request lost accountability before Operations gained communications capability.'
      ],
      complication:[
        'The supplier can only provide eight intrinsically safe radios by 1500. Decide how to document the partial fill and remaining need.',
        'The delivered radios use the wrong programmed channels. Decide what must happen before Operations accepts them.'
      ]
    },
    {
      id:'ppe', resource:'Level B PPE Sets', qty:'8', dest:'Entry Team', time:'1400', priority:'Urgent', route:'Support', available:true, tag:'PPE', final:'Entry Team',
      failTitle:'Entry Team Waiting',
      fail:[
        'The Entry Team is ready. Its PPE request is not. The gear never completed the accountable handoff.',
        'Eight PPE sets were available, but availability never became deployment.',
        'The Entry Team cannot use gear that the resource process never actually assigned.'
      ],
      complication:[
        'Two PPE sets fail inspection before issue. Decide whether the request quantity changes or replacement resources must be sourced.',
        'The Entry Team changes location after the PPE has been staged. Update the assignment without losing accountability.'
      ]
    },
    {
      id:'generator', resource:'Portable Generator', qty:'1', dest:'Staging Area', time:'1700', priority:'Normal', route:'Support', available:false, tag:'GENERATOR', final:'Staging Area',
      failTitle:'No Power at Staging',
      fail:[
        'Staging has the requirement, but the generator never made it through the request process.',
        'The generator is still an order instead of an accountable asset at Staging.',
        'Staging planned for power that the resource system never actually delivered.'
      ],
      complication:[
        'The supplier can deliver the generator, but no fuel package is included. Decide whether the request is complete enough to accept.',
        'The generator ETA slips beyond 1700. Update the request and identify who needs the revised status.'
      ]
    },
    {
      id:'air-tech', resource:'Air Monitoring Technician', qty:'1', dest:'HazMat Group', time:'1330', priority:'Urgent', route:'Tactical', available:false, tag:'TECHNICIAN', final:'HazMat Group',
      failTitle:'Monitoring Delayed',
      fail:[
        'HazMat is waiting on the air monitoring technician while the request remains unresolved.',
        'The technician never reached HazMat because the request never reached a clean assignment.',
        'The technical capability exists, but the incident never completed the resource handoff.'
      ],
      complication:[
        'The technician can arrive on time but is missing one required instrument. Decide whether the resource still meets the request.',
        'HazMat changes the technician reporting location after mobilization. Update the assignment and status.'
      ]
    },
    {
      id:'boom-trailer', resource:'Boom Trailer', qty:'1', dest:'Division Delta', time:'1630', priority:'High', route:'Tactical', available:true, tag:'BOOM TRAILER', final:'Division Delta',
      failTitle:'Boom Still Parked',
      fail:[
        'Division Delta needs boom. The trailer remained available instead of becoming deployed.',
        'The boom trailer was in the incident system, but the request never turned availability into assignment.',
        'A parked boom trailer does not protect Division Delta.'
      ],
      complication:[
        'Division Delta increases the requested boom length after the trailer is assigned. Decide whether the existing resource still satisfies the need.',
        'The boom trailer is ready, but the tow vehicle is reassigned. Decide how the resource status should change.'
      ]
    },
    {
      id:'restrooms', resource:'Portable Restroom Units', qty:'6', dest:'Base', time:'1900', priority:'Normal', route:'Support', available:false, tag:'RESTROOMS', final:'Base',
      failTitle:'Base Still Waiting',
      fail:[
        'Base requested six restroom units. The support request never completed the route to delivery.',
        'Support resources still require accountability. Base is still waiting on all six units.',
        'The requirement is simple. The resource process still has to work.'
      ],
      complication:[
        'The vendor can deliver only four units tonight and two tomorrow morning. Decide how to document the partial fill.',
        'Base relocates before delivery. Update the destination before the vendor arrives.'
      ]
    }
  ];

  function resourceText(s){ return `${s.qty} ${s.resource}`; }

  function makeFlow(s){
    return [
      {
        marker:'Request', zone:'ICP', state:'Request created', mover:'review', impact:'positive',
        prompt:`A need for ${resourceText(s)} is identified. What happens first?`,
        context:'Document the need before the rest of the resource system acts on it.',
        choices:[
          ['Complete the ICS 213-RR with resource, quantity, destination, and required time', true],
          ['Call Staging before documenting the request', false],
          ['Wait until the end of the operational period to document it', false]
        ],
        imh:'Requisitioner: identify the resource need and type, then complete the ICS 213-RR Resource Request in the IAP.'
      },
      {
        marker:'Review', zone:'ICP', state:'Routing decision', mover:'review', impact:'positive',
        prompt:`This is a ${s.route.toUpperCase()} request. Where does it go?`,
        context:`Route the ${s.route.toLowerCase()} request to the correct ICS function.`,
        choices:s.route === 'Tactical'
          ? [['Resource Unit',true],['Finance',false],['Vendor directly',false]]
          : [['Logistics',true],['Field Operations',false],['Staging only',false]],
        imh:'At the Tactical vs Support decision point, tactical requests route through Resource Unit and support requests route to Logistics.'
      },
      {
        marker:'Review', zone:'ICP', state:'Request under review', mover:'review', impact:'positive',
        prompt:s.route === 'Tactical' ? 'Resource Unit has the request. What happens next?' : 'Logistics has the support request. What happens next?',
        context:'Review first. Source or assign only after the request is clear.',
        choices:s.route === 'Tactical'
          ? [['Review for clarity; check ordered resources and staging',true],['Immediately order from an outside supplier',false],['Send it directly to Finance',false]]
          : [['Review for clarity before sourcing',true],['Send it directly to the field',false],['Close it because support resources are not tracked',false]],
        imh:s.route === 'Tactical'
          ? 'Resource Unit reviews the ICS 213-RR for clarity and checks ordered resources and staging availability.'
          : 'Logistics reviews support requests for clarity before sourcing or ordering.'
      },
      {
        marker:'Source', zone:s.available ? 'Staging' : 'Supplier', state:s.available ? 'Available internally' : 'External sourcing required', mover:'source', impact:'positive',
        prompt:s.available ? `${s.resource} is available internally. Next move?` : `${s.resource} is not available internally. Next move?`,
        context:s.available ? 'Commit the available resource and keep its status visible.' : 'Move the request into sourcing and ordering.',
        choices:s.available
          ? [['Earmark it for the assignment and update status',true],['Order another one anyway',false],['Send it directly without updating status',false]]
          : [['Route to Logistics to source / order it',true],['Close the request as unavailable',false],['Send an unverified substitute',false]],
        imh:s.available
          ? 'If equipment is available, earmark it for the specific use and update resource status.'
          : 'If the resource is not available internally, Logistics sources and orders it and captures supplier, price, UOM, ETA, and status.'
      },
      {
        marker:'Source', zone:s.available ? 'Staging' : 'Supplier', state:s.available ? 'Resource being readied' : 'Vendor contacted', mover:'source', impact:'positive',
        prompt:s.available ? 'The resource is committed. What still needs to stay visible?' : 'A supplier is found. What belongs with the order?',
        context:s.available ? 'Availability still requires accountability.' : 'Keep the order traceable.',
        choices:s.available
          ? [['Assignment, location, status, and accountability',true],['Only the resource name',false],['Nothing else; it is already available',false]]
          : [['Price, UOM, ETA, supplier details, and completed 213-RR',true],['Only the supplier phone number',false],['Only the ETA',false]],
        imh:s.available
          ? 'Availability does not replace accountability. Maintain assignment and status visibility as the resource is activated.'
          : 'Logistics captures price, UOM, ETA and vendor details and completes the request record. Finance may be involved when required.'
      },
      {
        marker:'Staging', zone:'Staging', state:'Resource arriving', mover:'staging', impact:'positive',
        prompt:`${s.resource} arrives. What happens before final assignment?`,
        context:'Check in before deployment.',
        choices:[['Check it in and document accountability',true],['Send it directly to the end user with no check-in',false],['Document it only at demobilization',false]],
        imh:'Staging or the designated check-in location receives resources and records check-in/accountability before deployment. Use the applicable check-in/status tools such as ICS 211.'
      },
      {
        marker:'Field', zone:'Field', state:'Resource deployed', mover:'field', impact:'positive',
        prompt:`${s.resource} is ready for ${s.final}. What completes the process?`,
        context:'Issue the resource and keep its status current.',
        choices:[['Assign it, update status, and keep the record current',true],['Let the vendor decide where it goes',false],['Leave status unchanged until the incident ends',false]],
        imh:'Operations / Staging / Resource Unit maintain assignment and status visibility as the resource is issued.'
      }
    ];
  }

  function shuffle(items){
    const out = [...items];
    for(let i = out.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function setScreen(id){
    $$('.screen').forEach(el => el.classList.toggle('is-active', el.id === id));
    window.scrollTo(0,0);
  }

  function updateBriefing(){
    $$('.brief-card').forEach((card, i) => card.classList.toggle('is-active', i === state.briefingIndex));
    $$('.briefing-dots span').forEach((dot, i) => dot.classList.toggle('is-on', i === state.briefingIndex));
    $('briefingCounter').textContent = `${state.briefingIndex + 1} / 3`;
    $('briefNextBtn').textContent = state.briefingIndex === 2 ? 'Begin Assignment' : 'Next';
  }

  function startBriefing(){
    state.briefingIndex = 0;
    setScreen('briefing');
    updateBriefing();
    tone(520,.05);
  }

  function nextBriefing(){
    if(state.briefingIndex < 2){
      state.briefingIndex += 1;
      updateBriefing();
      tone(650,.04);
    }else{
      newAssignment();
    }
  }

  function prevBriefing(){
    if(state.briefingIndex > 0){
      state.briefingIndex -= 1;
      updateBriefing();
    }else{
      setScreen('landing');
    }
  }

  function openDialog(id, trigger){
    const overlay = $(id);
    if(!overlay) return;
    state.lastFocus = trigger || document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden','false');
    const first = overlay.querySelector('button,[href],[tabindex]:not([tabindex="-1"])');
    if(first) setTimeout(() => first.focus(), 0);
  }

  function closeDialog(id){
    const overlay = $(id);
    if(!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden','true');
    if(state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus();
  }

  function newAssignment(){
    state.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    state.flow = makeFlow(state.scenario);
    state.step = 0;
    state.score = 0;
    state.streak = 0;
    state.lives = 3;
    state.locked = false;
    setScreen('game');
    populateAssignment();
    renderStep();
    setMover('review', true);
    announce(`New assignment: ${resourceText(state.scenario)} to ${state.scenario.dest}.`);
  }

  function populateAssignment(){
    const s = state.scenario;
    $('assignmentLabel').textContent = s.resource;
    $('assignmentSub').textContent = `${s.qty} needed · ${s.dest} · ${s.priority} priority · required by ${s.time}`;
    $('resourceBadge').textContent = s.tag;
    $('routePill').textContent = s.route;
    $('reqResource').textContent = s.resource;
    $('reqQty').textContent = s.qty;
    $('reqDest').textContent = s.dest;
    $('reqTime').textContent = s.time;
    $('reqPriority').textContent = s.priority;
  }

  function updateHud(){
    const lives = '♥'.repeat(Math.max(state.lives,0)) + '♡'.repeat(Math.max(3-state.lives,0));
    $('scoreTop').textContent = state.score;
    $('streakTop').textContent = `${state.streak}x`;
    $('livesTop').textContent = lives;
    $('scoreDock').textContent = state.score;
    $('streakDock').textContent = `${state.streak}x`;
    $('livesDock').textContent = lives;
    $('decisionStep').textContent = `${state.step + 1} / ${state.flow.length}`;
    $('sideStep').textContent = `${state.step + 1} / ${state.flow.length}`;
  }

  function renderStep(){
    const step = state.flow[state.step];
    $('decisionHeading').textContent = step.prompt;
    $('routeLine').textContent = step.context;
    $('worldState').textContent = step.state;
    $('reqStatus').textContent = step.state;
    $('imhInline').textContent = step.imh;
    $('imhModalText').textContent = step.imh;
    clearFeedback();
    updateHud();
    renderProgress(step.marker);
    renderChoices(step.choices);
  }

  function renderProgress(marker){
    const markers = ['Request','Review','Source','Staging','Field'];
    const currentIndex = markers.indexOf(marker);
    $$('.route-stop').forEach(stop => {
      const idx = markers.indexOf(stop.dataset.stop);
      stop.classList.toggle('is-done', idx < currentIndex);
      stop.classList.toggle('is-current', idx === currentIndex);
    });
    const track = $('progressTrack');
    track.innerHTML = '';
    state.flow.forEach((_, i) => {
      const seg = document.createElement('span');
      seg.className = 'progress-segment';
      if(i < state.step) seg.classList.add('is-done');
      if(i === state.step) seg.classList.add('is-current');
      track.appendChild(seg);
    });
  }

  function renderChoices(choices){
    const container = $('choices');
    container.innerHTML = '';
    shuffle(choices).forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-card';
      button.dataset.correct = choice[1] ? 'true' : 'false';
      button.setAttribute('aria-label', `${String.fromCharCode(65 + index)}. ${choice[0]}`);
      button.innerHTML = `<span class="choice-key">${String.fromCharCode(65 + index)}</span><span class="choice-text"></span>`;
      button.querySelector('.choice-text').textContent = choice[0];
      button.addEventListener('click', () => choose(button, choice[1]));
      container.appendChild(button);
    });
  }

  function choose(button, correct){
    if(state.locked) return;
    state.locked = true;
    $$('.choice-card').forEach(btn => btn.disabled = true);

    if(correct){
      const points = 100 + state.streak * 25;
      state.score += points;
      state.streak += 1;
      button.classList.add('is-correct');
      showFeedback(`Correct route · +${points}`, 'good');
      triggerImpact('positive');
      setMover(state.flow[state.step].mover);
      updateHud();
      positiveTone();
      announce(`Correct. ${points} points. ${state.flow[state.step].state}.`);
      setTimeout(() => {
        state.step += 1;
        state.locked = false;
        if(state.step >= state.flow.length) finishAssignment();
        else renderStep();
      }, reduceMotion ? 60 : 650);
    }else{
      state.lives -= 1;
      state.streak = 0;
      button.classList.add('is-wrong');
      showFeedback('Route failure · check the IMH and try again', 'bad');
      triggerImpact('negative');
      $('resourceMover').classList.add('is-failure');
      updateHud();
      negativeTone();
      announce(`Incorrect route. ${state.lives} lives remaining.`);
      setTimeout(() => $('resourceMover').classList.remove('is-failure'), 420);
      if(state.lives <= 0){
        setTimeout(() => gameOver(), reduceMotion ? 80 : 500);
      }else{
        setTimeout(() => {
          button.classList.remove('is-wrong');
          $$('.choice-card').forEach(btn => btn.disabled = false);
          state.locked = false;
        }, reduceMotion ? 80 : 650);
      }
    }
  }

  function showFeedback(message, type){
    clearTimeout(state.feedbackTimer);
    const el = $('feedbackLine');
    el.textContent = message;
    el.className = `feedback-line is-visible ${type === 'good' ? 'is-good' : 'is-bad'}`;
    state.feedbackTimer = setTimeout(clearFeedback, type === 'good' ? 900 : 2200);
  }

  function clearFeedback(){
    const el = $('feedbackLine');
    el.textContent = '';
    el.className = 'feedback-line';
  }

  function setMover(position, instant = false){
    const mover = $('resourceMover');
    const positions = { review:'28%', source:'49%', staging:'70%', field:'88%' };
    if(instant){
      mover.style.transition = 'none';
      mover.style.left = positions[position] || positions.review;
      void mover.offsetWidth;
      mover.style.transition = '';
    }else{
      mover.style.left = positions[position] || positions.review;
      mover.classList.add('is-success');
      setTimeout(() => mover.classList.remove('is-success'), 420);
    }
  }

  function triggerImpact(type){
    const signal = $('impactSignal');
    signal.className = `impact-signal ${type === 'positive' ? 'is-positive' : 'is-negative'}`;
    setTimeout(() => signal.className = 'impact-signal', 650);
  }

  function finishAssignment(){
    setMover('field');
    $('finalScore').textContent = `${state.score.toLocaleString()} points · best streak ${state.streak}x`;
    $('winText').textContent = `${resourceText(state.scenario)} successfully routed to ${state.scenario.final}. The request is complete and the resource is accounted for.`;
    setScreen('results');
    fanfare();
    announce('Assignment complete. Resource deployed and accounted for.');
  }

  function gameOver(){
    const s = state.scenario;
    $('gameOverTitle').textContent = s.failTitle;
    $('gameOverText').textContent = s.fail[Math.floor(Math.random() * s.fail.length)];
    openDialog('gameOverDialog');
    failureSequence();
  }

  function retryCurrent(){
    closeDialog('gameOverDialog');
    state.lives = 3;
    state.streak = 0;
    state.locked = false;
    renderStep();
    announce('Request reopened. Three lives restored.');
  }

  function showComplication(){
    const injects = state.scenario.complication;
    $('bonusText').textContent = injects[Math.floor(Math.random() * injects.length)];
    openDialog('complicationDialog', $('complicationBtn'));
    complicationTone();
  }

  function returnToIcp(){
    $$('.dialog-backdrop.is-open').forEach(d => {
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden','true');
    });
    state.locked = false;
    setScreen('landing');
    announce('Returned to Incident Command Post.');
  }

  function toggleSound(){
    state.soundOn = !state.soundOn;
    $('soundBtn').setAttribute('aria-pressed', String(state.soundOn));
    $('soundIcon').innerHTML = `<use href="#${state.soundOn ? 'i-volume' : 'i-volume-off'}"/>`;
    announce(state.soundOn ? 'Sound on' : 'Sound off');
  }

  function announce(message){
    $('announcer').textContent = '';
    requestAnimationFrame(() => $('announcer').textContent = message);
  }

  function tone(freq, duration, volume = .035){
    if(!state.soundOn) return;
    try{
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + duration);
      osc.onended = () => ctx.close();
    }catch(_e){}
  }
  function positiveTone(){ [640,820].forEach((f,i)=>setTimeout(()=>tone(f,.09,.032),i*80)); }
  function negativeTone(){ [220,170].forEach((f,i)=>setTimeout(()=>tone(f,.11,.04),i*90)); }
  function fanfare(){ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.15,.04),i*100)); }
  function complicationTone(){ [660,880,720].forEach((f,i)=>setTimeout(()=>tone(f,.08,.028),i*75)); }
  function failureSequence(){ [420,360,290,220].forEach((f,i)=>setTimeout(()=>tone(f,.14,.038),i*105)); }

  function trapDialogKeys(e){
    const open = document.querySelector('.dialog-backdrop.is-open');
    if(!open) return;
    if(e.key === 'Escape'){
      if(open.id !== 'gameOverDialog') closeDialog(open.id);
      return;
    }
    if(e.key !== 'Tab') return;
    const focusable = $$('button,[href],[tabindex]:not([tabindex="-1"])', open).filter(el => !el.disabled);
    if(!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  function handleChoiceKeys(e){
    if(!$('game').classList.contains('is-active') || document.querySelector('.dialog-backdrop.is-open')) return;
    const keys = {a:0,b:1,c:2,'1':0,'2':1,'3':2};
    const idx = keys[e.key.toLowerCase()];
    if(idx === undefined) return;
    const choices = $$('.choice-card');
    if(choices[idx] && !choices[idx].disabled){ e.preventDefault(); choices[idx].click(); }
  }

  function init(){
    $('receiveAssignmentBtn').addEventListener('click', startBriefing);
    $('howToPlayBtn').addEventListener('click', (e)=>openDialog('howDialog', e.currentTarget));
    $('briefBackBtn').addEventListener('click', prevBriefing);
    $('briefNextBtn').addEventListener('click', nextBriefing);
    $('backToIcpBtn').addEventListener('click', (e)=>openDialog('icpDialog', e.currentTarget));
    $('openImhBtn').addEventListener('click', (e)=>openDialog('imhDialog', e.currentTarget));
    $('openImhRailBtn').addEventListener('click', (e)=>openDialog('imhDialog', e.currentTarget));
    $('soundBtn').addEventListener('click', toggleSound);
    $('newAssignmentBtn').addEventListener('click', newAssignment);
    $('complicationBtn').addEventListener('click', showComplication);
    $('resultsIcpBtn').addEventListener('click', returnToIcp);
    $('confirmIcpBtn').addEventListener('click', returnToIcp);
    $('retryBtn').addEventListener('click', retryCurrent);
    $('gameOverIcpBtn').addEventListener('click', returnToIcp);
    $('complicationNewBtn').addEventListener('click', ()=>{ closeDialog('complicationDialog'); newAssignment(); });
    $$('[data-close-dialog]').forEach(btn => btn.addEventListener('click', ()=>closeDialog(btn.dataset.closeDialog)));
    $$('.dialog-backdrop').forEach(backdrop => backdrop.addEventListener('mousedown', (e)=>{ if(e.target === backdrop && backdrop.id !== 'gameOverDialog') closeDialog(backdrop.id); }));
    document.addEventListener('keydown', trapDialogKeys);
    document.addEventListener('keydown', handleChoiceKeys);

    const params = new URLSearchParams(location.search);
    if(params.get('qa') === 'game') newAssignment();
    if(params.get('qa') === 'results'){
      newAssignment();
      state.score = 825; state.streak = 3;
      finishAssignment();
    }
  }

  init();
})();