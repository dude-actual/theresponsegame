/* Resource Run v17. Fictional incident, resource quantities, times and costs.
 * No DOM, storage, network or real-time game clock. All consequences follow actions.
 */
(function (root) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const clamp = (value, low = 0, high = 100) => Math.max(low, Math.min(high, value));
  const round = value => Math.round(value * 10) / 10;
  const VENDORS = [
    {id:'harbor', name:'Harbor Response', eta:24, cost:3200, capability:'Marine vapor monitoring: VOC / oxygen / LEL', capable:true, risk:'Low mobilization risk; premium price', detail:'Qualified atmospheric team and marine access package. Logistics quote includes equipment, crew and one operational period.'},
    {id:'regional', name:'Regional HazMat Cooperative', eta:55, cost:1850, capability:'Atmospheric monitoring: VOC / oxygen / LEL', capable:true, risk:'Later arrival; source entry stays on hold', detail:'Qualified team; longer road mobilization. Lower price preserves contingency funding.'},
    {id:'industrial', name:'Industrial Water Services', eta:16, cost:1200, capability:'Water sampling and dissolved-product screening', capable:false, risk:'No atmospheric clearance capability', detail:'Useful for water-quality assessment, but its equipment cannot establish safe atmospheric conditions for the Entry Group.'},
    {id:'internal', name:'Reassign MON-01', eta:8, cost:0, capability:'Atmospheric monitoring: VOC / oxygen / LEL', capable:true, risk:'Channel monitoring gap until another team arrives', detail:'Existing team is assigned to Channel Recovery. Operations has authorized a transfer if Resources records the gap and briefs Operations / Safety.'}
  ];
  const PERIODS = [
    {title:'Establish control', subtitle:'OP 1 · 07:00–08:00', condition:'An incomplete monitoring request and competing containment demands arrive together.'},
    {title:'Hold the line', subtitle:'OP 2 · 08:00–09:30', condition:'A boom coupling fails. Check arrivals, reconcile the resource picture and forecast sustainment.'},
    {title:'Make the handover', subtitle:'OP 3 · 09:30–10:30', condition:'Relief and waste capacity determine what can continue. Publish a verified picture and brief the remaining constraints.'}
  ];
  const SCENARIOS = [
    {marshDemand:4, channelDemand:3, priorityArea:'marsh', current:'The current is carrying product toward the salt-marsh inlet. The marsh has the higher immediate environmental consequence.'},
    {marshDemand:3, channelDemand:4, priorityArea:'channel', current:'An ebb current is carrying product through the working channel. Channel interception has the higher immediate consequence.'}
  ];
  const TASKS = [
    ['validate','validate',0,'Complete the monitoring request','Entry Group','Review incoming RR-041 against the Entry Group’s assignment. Required by 07:55. Decide which details need clarification before the request can be acted on.',28],
    ['route','route',0,'Route the two requests','Planning / Logistics','The monitoring team supports tactical work. The radio request supports incident communications. Keep each request with its responsible function.',35],
    ['monitor','source',0,'Secure monitoring capability','Logistics','Choose a sourced team or an authorized internal transfer. Arrival time, capability, cost and the assignment left behind all matter.',55],
    ['boom','allocation',0,'Build the containment recommendation','Operations','Operations has delegated allocation within this six-module envelope. Demand exceeds supply; decide what to protect and whether to retain a spare.',50],
    ['arrival','checkin',1,'Receive the monitoring resource','East Staging','Verify the arriving resource against its request and assignment. Arrival alone is not check-in or proof of atmospheric capability.',105],
    ['status','reconcile',1,'Reconcile SK-02 status','Resources Unit','The board says available. Staging saw SK-02 parked; Maintenance reports a failed pump seal. Decide which status and source to carry forward.',100],
    ['reassign','reassign',1,'Resolve the recovery conflict','Operations','SK-01 is working the channel. The marsh needs recovery support. Hold its assignment, coordinate a move, or source another skimmer.',115],
    ['forecast','forecast',1,'Order the next period’s support','Logistics','Source crews need one relief crew by 10:00. One waste package sustains recovery to handover. Additional packages protect contingency at added cost.',120],
    ['relief','relief',2,'Put relief where it is needed','Staging','Check in the ordered relief crew and record an assignment. Source crews reach their duty limit at 10:00; the marsh crew can continue through handover.',180],
    ['cop','cop',2,'Publish the resource picture','Situation Unit','Select verified operational facts for the common operating picture. A social-media sheen report is unconfirmed. Include unresolved limitations.',180],
    ['escalation','escalation',2,'Coordinate the remaining exposure','Planning Section Chief','Brief the functions that can resolve the actual gap. Operations controls tactics, Safety addresses safe work, Logistics sources support and Command resolves cross-objective priorities.',190],
    ['handover','handover',2,'Set the incoming shift’s priorities','Incoming Resources Unit','Order monitoring, waste and containment priorities using the current incident state. The handover must carry forward resources, assignments and remaining constraints.',200]
  ];
  const ACTION_TASK = {validate:'validate',route:'route',source:'monitor',allocate:'boom',checkin:'arrival',reconcile:'status',reassign:'reassign',forecast:'forecast',relief:'relief',cop:'cop',escalate:'escalation',handover:'handover'};
  const CATEGORIES = ['documentation','routing','sourcing','allocation','accountability','forecasting','situational-awareness','coordination'];
  let sequence = 0;

  function traffic(s, from, text) { s.traffic.push({minute:s.minute,from,text}); }
  function resource(s, id) { return s.resources.find(item => item.id === id); }
  function event(s, type, data = {}) { s.events.push({sessionId:s.id,minute:s.minute,period:s.period,type,...copy(data)}); }
  function record(s, action, change, consequence, constraint, category, quality = 'mixed', source = 'player') {
    s.history.push({minute:s.minute,action,change,consequence,constraint,category,quality,source});
    if (source === 'player' && CATEGORIES.includes(category)) {
      const n = s.evidence[category];
      n.count++; n.total += quality === 'strong' ? 100 : quality === 'mixed' ? 70 : 35;
      s.competencies[category] = Math.round(n.total / n.count);
    }
    event(s,source === 'player' ? 'decision' : 'condition_change',{action,category,quality,change,consequence,constraint,source});
  }
  function taskDone(s, id) { const task = s.tasks.find(item => item.id === id); task.status = 'done'; task.completedAt = s.minute; }
  function hasSourceRelief(s) { return s.resources.some(r => r.kind === 'relief' && r.status === 'assigned' && r.location === 'Source berth' && r.verified); }
  function wasteReady(s) { return s.resources.filter(r => r.kind === 'waste' && r.status === 'available').length; }
  function monitoringReady(s) {
    const monitor = resource(s,s.flags.monitorId);
    return !!(monitor && monitor.capable && monitor.verified && monitor.status === 'assigned' && monitor.location === 'Source berth');
  }
  function updateSafety(s) {
    s.safetyHold = !monitoringReady(s) || (s.minute >= 180 && !hasSourceRelief(s));
  }
  function refresh(s) {
    updateSafety(s);
    s.tasks.forEach(task => {
      task.available = task.period === s.period && task.status === 'pending' && !s.finished;
      if (task.id === 'monitor') task.available = task.available && ['validate','route'].every(id => s.tasks.find(t => t.id === id).status === 'done');
      if (task.id === 'arrival') {
        const monitor = resource(s,s.flags.monitorId);
        task.available = task.available && !!monitor && monitor.status !== 'en_route';
      }
      if (task.id === 'handover') task.available = task.available && s.tasks.filter(t => t.period === 2 && t.id !== 'handover').every(t => t.status === 'done');
    });
    s.intel.currentGaps = gaps(s);
    s.intel.monitoringConfirmed = monitoringReady(s);
    s.intel.wasteAvailable = wasteReady(s);
    s.intel.sourceReliefAssigned = hasSourceRelief(s);
    s.intel.nextArrival = s.resources.filter(r => r.status === 'en_route').reduce((n,r) => Math.min(n,r.eta),Infinity);
    if (!Number.isFinite(s.intel.nextArrival)) s.intel.nextArrival = null;
  }
  function gaps(s) {
    const out = [];
    if (!monitoringReady(s)) out.push('Source entry remains on hold: verified atmospheric monitoring is not assigned.');
    if (s.flags.channelMonitoringGap) out.push('Channel Recovery has no dedicated monitoring team after the internal transfer.');
    if (s.flags.boom.marsh < s.intel.marshDemand) out.push(`Marsh containment is ${s.intel.marshDemand-s.flags.boom.marsh} module(s) below the requested coverage.`);
    if (s.flags.boom.channel < s.intel.channelDemand) out.push(`Channel containment is ${s.intel.channelDemand-s.flags.boom.channel} module(s) below the requested coverage.`);
    if (s.period >= 1 && !s.flags.statusVerified) out.push('SK-02 status has not been reconciled against the maintenance report.');
    if (s.flags.unauthorizedMove) out.push('SK-01 changed assignment without recorded Operations approval.');
    if (s.period >= 2 && !hasSourceRelief(s)) out.push('Source relief is not checked in and assigned; source work pauses at 10:00.');
    if (s.period >= 2 && !wasteReady(s)) out.push('No additional waste package has arrived; sustained recovery is constrained.');
    return out;
  }
  function processArrivals(s) {
    s.resources.filter(r => r.status === 'en_route' && r.eta <= s.minute).forEach(r => {
      r.status = r.kind === 'waste' ? 'available' : r.kind === 'contract-skimmer' ? 'assigned' : 'awaiting_checkin';
      if (r.kind === 'waste') { r.location = 'Waste transfer'; r.verified = true; }
      else if (r.kind === 'contract-skimmer') { r.location = 'Marsh inlet'; r.verified = true; }
      else r.location = 'East Staging';
      traffic(s, r.kind === 'waste' || r.kind === 'contract-skimmer' ? 'Logistics' : 'Staging',`${r.name} arrived at ${r.location}.${r.status === 'awaiting_checkin' ? ' Check-in and assignment are still required.' : ' Receipt and capability confirmed.'}`);
      event(s,'resource_arrival',{resourceId:r.id,status:r.status,location:r.location});
      s.orders.filter(o => o.resourceIds.includes(r.id)).forEach(o => { o.status = o.resourceIds.every(id => resource(s,id)?.status !== 'en_route') ? 'arrived' : 'partially_arrived'; });
    });
  }
  function tick(s, minutes) {
    for (let n = 0; n < minutes; n++) {
      s.minute++;
      processArrivals(s);
      updateSafety(s);
      const boom = s.flags.boom;
      const marshGap = Math.max(0,s.intel.marshDemand-boom.marsh);
      const channelGap = Math.max(0,s.intel.channelDemand-boom.channel);
      const priorityGap = s.intel.priorityArea === 'marsh' ? marshGap : channelGap;
      const marshRecovery = s.resources.some(r => r.capable && r.status === 'assigned' && /Marsh/i.test(r.location) && /skimmer/.test(r.kind));
      const channelRecovery = !s.flags.channelMonitoringGap && s.resources.some(r => r.capable && r.status === 'assigned' && r.location === 'Channel' && /skimmer/.test(r.kind));
      const damage = Math.max(.005,(s.flags.allocated ? .018 : .07) + marshGap*.025 + channelGap*.019 + priorityGap*.012 - (marshRecovery ? .04 : 0) - (channelRecovery ? .014 : 0));
      s.shoreline = clamp(s.shoreline + damage);
      const activeSkimmers = (channelRecovery ? 1 : 0) + (marshRecovery ? .65 : 0);
      const wasteFactor = s.minute < 150 || wasteReady(s) > 0 ? 1 : .18;
      const operatingFactor = s.safetyHold ? .15 : 1;
      s.recovery = clamp(s.recovery + (.13 + activeSkimmers*.035) * wasteFactor * operatingFactor);
      if (s.minute === 180 && !hasSourceRelief(s)) {
        traffic(s,'Safety','Source crews reached their duty limit. Source work is paused until checked-in relief is assigned.');
        event(s,'condition_change',{condition:'source_relief_gap'});
      }
    }
    s.shoreline = round(s.shoreline); s.recovery = round(s.recovery);
    refresh(s);
  }
  function order(s, id, supplier, price, eta, resourceIds, requestId, uom = 'package / operational period') {
    s.orders.push({id,supplier,costBasis:price,uom,eta,resourceIds,requestId,status:'ordered'});
    s.cost += price;
    event(s,'order_placed',{orderId:id,supplier,cost:price,eta,resourceIds,requestId});
  }
  function beginPeriod(s, index) {
    s.period = index; s.waits = 0;
    s.queue = s.tasks.filter(t => t.period === index && t.status === 'pending').map(t => t.id);
    traffic(s,'Planning',PERIODS[index].condition);
    if (index === 1) {
      const boom = s.flags.boom;
      const failed = s.resources.find(r => r.kind === 'boom' && r.status === 'assigned' && r.location === (s.intel.priorityArea === 'marsh' ? 'Marsh inlet' : 'Channel')) || s.resources.find(r => r.kind === 'boom' && r.status === 'assigned');
      if (failed) {
        const area = failed.location === 'Marsh inlet' ? 'marsh' : 'channel';
        failed.status = 'out_of_service'; failed.location = 'East Staging'; boom[area]--;
        const spare = s.resources.find(r => r.kind === 'boom' && r.status === 'available');
        if (spare) {
          spare.status = 'assigned'; spare.location = area === 'marsh' ? 'Marsh inlet' : 'Channel'; boom[area]++; boom.reserve--;
          traffic(s,'Operations','A boom coupling failed. The retained spare replaced it; coverage is unchanged and the spare is now committed.');
          record(s,'Reserve deployed',`${spare.id} replaced ${failed.id}.`,'Containment coverage stayed in place.','No spare remains for another equipment failure.','allocation','strong','condition');
        } else {
          traffic(s,'Operations',`A coupling failed in the ${area} line. No spare was retained; ${area} coverage dropped by one module.`);
          record(s,'Coupling failure',`${failed.id} is out of service; ${area} coverage fell by one.`,'Product has a larger unprotected path.','The reduced coverage carries into the next operational period.','allocation','mixed','condition');
        }
      }
      traffic(s,'Maintenance','08:00 signed inspection: SK-02 has a failed pump seal. OUT OF SERVICE. Earliest repair is after this exercise handover.');
      traffic(s,'Staging','SK-02 was parked here at 07:45. The staging count lists it as available; no functional check was recorded.');
      traffic(s,'Operations','SK-01 remains assigned to Channel Recovery. Any move to the marsh needs Operations coordination; the channel assignment then loses its skimmer.');
    }
    if (index === 2) {
      traffic(s,'Safety','Source crew duty limit is 10:00 (minute 180). One verified relief crew must be assigned to Source berth. Marsh crew duty limit is beyond this handover.');
      traffic(s,'Logistics',`${wasteReady(s)} additional waste package(s) available. Each ordered package has a 40-minute lead time; absent capacity slows recovery after 09:30.`);
      traffic(s,'Situation Unit','A social-media report of a second offshore sheen is unconfirmed. Do not publish it as verified incident extent.');
    }
    event(s,'period_start',{period:index,condition:PERIODS[index].condition}); refresh(s);
  }
  function createState(options = {}) {
    const difficulty = options.difficulty === 'advanced' ? 'advanced' : 'guided';
    const variant = options.variant === 1 ? 1 : 0;
    const scenario = SCENARIOS[variant];
    const s = {
      schema:17,id:`RR17-${Date.now().toString(36)}-${++sequence}`,difficulty,variant,period:0,minute:0,finished:false,cost:0,shoreline:12,recovery:5,accountability:100,safetyHold:true,
      resources:[
        {id:'MON-01',name:'Channel atmospheric monitoring team',kind:'monitor',status:'assigned',location:'Channel',capable:true,verified:true},
        {id:'SK-01',name:'Skimmer 01',kind:'skimmer',status:'assigned',location:'Channel',capable:true,verified:true},
        {id:'SK-02',name:'Skimmer 02',kind:'skimmer',status:'available',location:'East Staging',capable:false,verified:false},
        ...Array.from({length:6},(_,n)=>({id:`BOOM-0${n+1}`,name:`Boom module ${n+1}`,kind:'boom',status:'available',location:'East Staging',capable:true,verified:true}))
      ],
      tasks:TASKS.map(([id,kind,period,title,from,summary,neededBy])=>({id,kind,period,title,from,summary,neededBy,status:'pending',available:period===0&&id!=='monitor'})),
      queue:[],traffic:[],history:[],events:[],orders:[],competencies:Object.fromEntries(CATEGORIES.map(k=>[k,0])),evidence:Object.fromEntries(CATEGORIES.map(k=>[k,{count:0,total:0}])),waits:0,
      intel:{...copy(scenario),monitoringNeededBy:55,reliefNeededBy:180,reliefDemand:1,wasteDemand:1,reliefLead:55,wasteLead:40,reliefCost:1400,wasteCost:1000,budget:12000,skimmerTruth:'out_of_service',skimmerEvidence:'maintenance',skimmerRepairAfterHandover:true,sourceLocation:'Source berth',requestCapability:'Atmospheric VOC / oxygen / LEL monitoring for Entry Group',contact:'Entry Group supervisor · tactical channel 3',quantity:1,sourceCrewDutyLimit:180,marshCrewDutyLimit:240,vendorDelay:0},
      flags:{clarified:[],routeTactical:null,routeSupport:null,monitorId:null,monitorVendor:null,channelMonitoringGap:false,allocated:false,boom:{marsh:0,channel:0,reserve:6},statusVerified:false,unauthorizedMove:false,reassignment:null,forecast:null,cop:[],copNote:'',escalation:null,handover:[]}
    };
    traffic(s,'Command','Blackwater Reach is a fictional oil-spill exercise. Protect life, stabilize the release, and protect property and the environment. All quantities, ETAs and costs are simulated.');
    traffic(s,'Operations',scenario.current);
    traffic(s,'Entry Group','RR-041: one “monitoring team,” required by 07:55. Contact: Entry Group supervisor, tactical channel 3. Quantity: 1. Reporting point: “at the release.” Entry remains on hold.');
    traffic(s,'Operations',`Requested boom coverage: marsh ${scenario.marshDemand}, channel ${scenario.channelDemand}. Six modules are available. A spare can replace one coupling failure; Operations authorizes your recommended distribution within this limit.`);
    traffic(s,'Logistics','Planning allowance: $12,000. Higher spending may be justified by the operational consequence; maintain a traceable record.');
    beginPeriod(s,0); event(s,'session_start',{difficulty,variant}); return s;
  }
  function arrayChoice(value, allowed, full = false) {
    return Array.isArray(value) && value.length === new Set(value).size && value.every(item=>allowed.includes(item)) && (!full || value.length === allowed.length);
  }
  function int(value, high) { return Number.isInteger(value) && value >= 0 && value <= high; }
  function validateState(s) {
    const fail=error=>({ok:false,error});
    try {
    if(!s||s.schema!==17||typeof s.id!=='string')return fail('This save is not a v17 incident.');
    if(!['guided','advanced'].includes(s.difficulty)||!int(s.variant,1)||!int(s.period,2)||typeof s.finished!=='boolean')return fail('The incident settings are invalid.');
    if(!Number.isInteger(s.minute)||s.minute<0||!Number.isFinite(s.cost)||s.cost<0||!int(s.waits,1000000))return fail('The incident clock or cost is invalid.');
    if(!['shoreline','recovery','accountability'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100)||typeof s.safetyHold!=='boolean')return fail('The incident outcome state is invalid.');
    if(!['resources','tasks','queue','traffic','history','events','orders'].every(k=>Array.isArray(s[k])))return fail('The incident save is missing its working records.');
    if(s.tasks.length!==TASKS.length||s.tasks.some(t=>!TASKS.some(([id,kind,period])=>id===t.id&&kind===t.kind&&period===t.period)||!['pending','done'].includes(t.status))||new Set(s.tasks.map(t=>t.id)).size!==TASKS.length)return fail('The incident task record is invalid.');
    if(s.tasks.some(t=>t.period<s.period&&t.status!=='done')||(s.finished&&s.tasks.some(t=>t.status!=='done')))return fail('The incident period is inconsistent with completed work.');
    if(!arrayChoice(s.queue,s.tasks.filter(t=>t.period===s.period&&t.status==='pending').map(t=>t.id),true))return fail('The saved queue does not match pending work.');
    if(new Set(s.resources.map(r=>r?.id)).size!==s.resources.length||s.resources.some(r=>!r||typeof r.id!=='string'||typeof r.name!=='string'||typeof r.kind!=='string'||typeof r.location!=='string'||!['available','assigned','out_of_service','en_route','awaiting_checkin','staging'].includes(r.status)||(r.status==='en_route'&&(!Number.isFinite(r.eta)||r.eta<s.minute))))return fail('The saved resource record is invalid.');
    if(!s.flags||!s.intel||!s.competencies||!s.evidence||!s.flags.boom)return fail('The incident save is missing simulation state.');
    if(!CATEGORIES.every(k=>s.evidence[k]&&Number.isFinite(s.evidence[k].count)&&s.evidence[k].count>=0&&Number.isFinite(s.evidence[k].total)&&Number.isFinite(s.competencies[k])))return fail('The saved competency evidence is invalid.');
    if(!['marsh','channel','reserve'].every(k=>int(s.flags.boom[k],6))||Object.values(s.flags.boom).reduce((n,v)=>n+v,0)>6)return fail('The boom allocation exceeds its inventory.');
    if(!Array.isArray(s.flags.clarified)||!Array.isArray(s.flags.cop)||!Array.isArray(s.flags.handover)||!int(s.intel.marshDemand,6)||!int(s.intel.channelDemand,6)||!Number.isFinite(s.intel.budget))return fail('The incident planning record is invalid.');
    if(!['MON-01','SK-01','SK-02',...Array.from({length:6},(_,i)=>`BOOM-0${i+1}`)].every(id=>resource(s,id)))return fail('The incident is missing an original resource.');
    if(s.resources.some(r=>typeof r.capable!=='boolean'||typeof r.verified!=='boolean'))return fail('The saved resource capability or verification is invalid.');
    if(s.tasks.some(t=>!['title','from','summary'].every(k=>typeof t[k]==='string')||!Number.isFinite(t.neededBy)))return fail('The saved work description is invalid.');
    if(s.traffic.some(t=>!t||!Number.isFinite(t.minute)||typeof t.from!=='string'||typeof t.text!=='string'))return fail('The saved incident traffic is invalid.');
    if(s.history.some(h=>!h||!Number.isFinite(h.minute)||!['action','change','consequence','constraint','category'].every(k=>typeof h[k]==='string')||!['strong','mixed','damaging'].includes(h.quality)))return fail('The saved decision history is invalid.');
    if(s.events.some(e=>!e||typeof e.type!=='string'||!Number.isFinite(e.minute)))return fail('The saved analytics are invalid.');
    if(s.orders.some(o=>!o||typeof o.id!=='string'||typeof o.supplier!=='string'||!Number.isFinite(o.costBasis)||o.costBasis<0||!Number.isFinite(o.eta)||!Array.isArray(o.resourceIds)||o.resourceIds.some(id=>!resource(s,id))))return fail('The saved order references are invalid.');
    if(s.flags.monitorId!==null&&typeof s.flags.monitorId!=='string')return fail('The monitoring assignment is invalid.');
    if(s.flags.monitorId&&!resource(s,s.flags.monitorId))return fail('The monitoring assignment references a missing resource.');
    if(s.tasks.find(t=>t.id==='monitor').status==='done'&&!s.flags.monitorId)return fail('The completed source order has no resource.');
    if(!['channelMonitoringGap','allocated','statusVerified','unauthorizedMove'].every(k=>typeof s.flags[k]==='boolean')||typeof s.flags.copNote!=='string')return fail('The incident verification flags are invalid.');
    if(s.flags.escalation!==null&&(!Array.isArray(s.flags.escalation.recipients)||!Array.isArray(s.flags.escalation.required)||!Array.isArray(s.flags.escalation.gaps)||typeof s.flags.escalation.covered!=='boolean'))return fail('The saved escalation record is invalid.');
    if(s.flags.forecast!==null&&(!int(s.flags.forecast.relief,2)||!int(s.flags.forecast.waste,2)||!Number.isFinite(s.flags.forecast.orderedAt)))return fail('The saved forecast is invalid.');
    if(!['reliefNeededBy','reliefDemand','wasteDemand','reliefLead','wasteLead','reliefCost','wasteCost','budget','sourceCrewDutyLimit','marshCrewDutyLimit'].every(k=>Number.isFinite(s.intel[k])&&s.intel[k]>=0)||!['marsh','channel'].includes(s.intel.priorityArea)||!Array.isArray(s.intel.currentGaps))return fail('The saved operational information is invalid.');
    return {ok:true};
    } catch { return fail('The incident save contains malformed records.'); }
  }
  function validateAction(s, a) {
    const integrity=validateState(s);if(!integrity.ok)return integrity.error;
    if (!a || typeof a.type !== 'string') return 'An operational action is required.';
    if (s.finished) return 'This incident is complete. Start another run to make new decisions.';
    const id = ACTION_TASK[a.type];
    if (id) {
        const task = s.tasks.find(t=>t.id===id);
      if (task.period !== s.period || task.status !== 'pending') return 'This work is not pending in the current operational period.';
      if (a.type === 'source' && !['validate','route'].every(i=>s.tasks.find(t=>t.id===i).status==='done')) return 'Review and route the request before committing a source.';
      if (a.type === 'checkin' && (!resource(s,s.flags.monitorId) || resource(s,s.flags.monitorId).status === 'en_route')) return 'The monitoring resource has not arrived. Work another item or advance incident time.';
      if (a.type === 'handover' && s.tasks.some(t=>t.period===2&&t.id!=='handover'&&t.status!=='done')) return 'Resolve the other handover work before setting final priorities.';
    }
    switch(a.type) {
      case 'validate': return arrayChoice(a.fields,['capability','location','contact','quantity','neededBy']) ? null : 'Choose valid request fields once each.';
      case 'route': return ['resources','logistics'].includes(a.tactical)&&['resources','logistics'].includes(a.support) ? null : 'Choose a responsible function for each request.';
      case 'source': return VENDORS.some(v=>v.id===a.vendor) ? null : 'Choose an available source.';
      case 'allocate': return int(a.marsh,6)&&int(a.channel,6)&&a.marsh+a.channel<=6 ? null : 'Allocate whole modules within the six-module inventory.';
      case 'checkin': return arrayChoice(a.verified,['id','leader','capability','comms'])&&['staging','source'].includes(a.assignment) ? null : 'Use valid check-in fields and an assignment.';
      case 'reconcile': return ['available','assigned','out_of_service'].includes(a.skimmer)&&['staging','maintenance','ops'].includes(a.evidence) ? null : 'Choose a resource status and evidence source.';
      case 'reassign': return ['hold','move','contract'].includes(a.strategy)&&typeof a.approval==='boolean' ? null : 'Choose a reassignment strategy and record its authorization.';
      case 'forecast': return int(a.relief,2)&&int(a.waste,2) ? null : 'Order zero, one or two packages of each support resource.';
      case 'relief': return ['source','marsh','reserve'].includes(a.assign)&&typeof a.verified==='boolean' ? null : 'Choose a relief assignment and verification status.';
      case 'cop': return arrayChoice(a.items,['monitor','boom','eta','rumor','skimmer'])&&(a.note===undefined||(typeof a.note==='string'&&a.note.length<=240)) ? null : 'Use valid picture items and a note of no more than 240 characters.';
      case 'escalate': return arrayChoice(a.recipients,['operations','safety','logistics','command'])&&['gap','cost','both'].includes(a.concern)&&(a.note===undefined||(typeof a.note==='string'&&a.note.length<=240)) ? null : 'Choose valid recipients, concern and a note of no more than 240 characters.';
      case 'handover': return arrayChoice(a.priorities,['monitoring','waste','containment'],true) ? null : 'Order all three handover priorities once each.';
      case 'reorder': return arrayChoice(a.ids,s.tasks.filter(t=>t.period===s.period&&t.status==='pending').map(t=>t.id),true) ? null : 'Reorder every currently pending work item once.';
      case 'wait': return s.waits<3 || s.resources.some(r=>r.status==='en_route') ? null : 'No outstanding arrivals remain. Continue the remaining work.';
      case 'advance': return s.tasks.some(t=>t.period===s.period&&t.status==='pending') ? 'Complete the current period’s work before handing over.' : null;
      default:return 'Unknown operational action.';
    }
  }

  function apply(s,a) {
    let notice = '';
    switch(a.type) {
      case 'validate': {
        s.flags.clarified = [...a.fields];
        const critical = ['capability','location'].filter(k=>a.fields.includes(k)).length;
        const extras = a.fields.filter(k=>!['capability','location','neededBy'].includes(k)).length;
        tick(s,6+extras*3);
        traffic(s,'Entry Group',`Clarification returned: ${a.fields.includes('capability')?s.intel.requestCapability:'capability not confirmed'}; ${a.fields.includes('location')?'report to Source berth':'reporting location not confirmed'}. Required by 07:55. Quantity and radio contact were already supplied.`);
        notice = critical===2 ? 'The request now identifies the required capability and reporting point.' : 'The request was processed with an unresolved capability or location gap.';
        record(s,'Request clarification',`${a.fields.length} field(s) checked; ${critical}/2 critical gaps resolved.`,notice,critical===2?(extras?'Repeated checks used time without adding new information.':'A qualified team can now be matched to the assignment.'):'Sourcing and dispatch must carry the unresolved limitation.', 'documentation',critical===2?(extras?'mixed':'strong'):'damaging');
        break;
      }
      case 'route': {
        s.flags.routeTactical=a.tactical; s.flags.routeSupport=a.support;
        const correct = a.tactical==='resources'&&a.support==='logistics';
        tick(s,correct?4:12);
        if (!correct) traffic(s,'Planning','The requests reached the wrong functional owner and were redirected. Tactical request to Resources Unit; radio support request to Logistics. Eight minutes were lost at the handoff.');
        notice = correct ? 'Resources Unit owns the tactical request; Logistics owns radio support.' : 'The receiving function redirected the request, adding eight minutes.';
        record(s,'Functional routing',notice,correct?'Both functions can process their owned work.':'Monitoring commitment started later.','Requests retain their owners and request identifiers.','routing',correct?'strong':'damaging'); break;
      }
      case 'source': {
        const v=VENDORS.find(x=>x.id===a.vendor),locationDelay=s.flags.clarified.includes('location')?0:20;
        const slip=s.difficulty==='advanced'&&v.id==='regional'?12:0;
        const quotedEta=s.minute+v.eta+locationDelay,eta=quotedEta+slip;
        s.flags.monitorVendor=v.id; s.flags.monitorId=v.id==='internal'?'MON-01':'MON-EXT';
        if (v.id==='internal') {
          const r=resource(s,'MON-01'); r.status='en_route'; r.location='To East Staging'; r.eta=eta; r.verified=false;
          s.flags.channelMonitoringGap=true;
        } else s.resources.push({id:'MON-EXT',name:v.name,kind:'monitor',status:'en_route',location:'To East Staging',eta,capable:v.capable,verified:false});
        order(s,'ORD-MON',v.name,v.cost,eta,[s.flags.monitorId],'RR-041','team / operational period');
        s.orders.at(-1).quotedEta=quotedEta;
        if(slip){
          s.intel.vendorDelay=slip;
          traffic(s,'Logistics','Regional dispatch update after commitment: transfer at the road closure adds 12 minutes. The accepted quote remains $1,850; the current order and arrival ETA have been revised.');
          record(s,'Vendor ETA revised',`Regional arrival moved from minute ${quotedEta} to ${eta}.`,'Source entry remains on hold for the additional travel time.','The next period must use the revised ETA, not the original quote.','sourcing','mixed','condition');
        }
        if(locationDelay) traffic(s,'Dispatch','No exact reporting point was confirmed. The team initially reported to the north gate; redirection adds 20 minutes to arrival.');
        tick(s,6);
        notice=`${v.name} committed; ETA ${String(7+Math.floor(eta/60)).padStart(2,'0')}:${String(eta%60).padStart(2,'0')}, cost $${v.cost.toLocaleString('en-US')}.`;
        traffic(s,'Logistics',notice+' '+v.risk+'.');
        record(s,'Monitoring source',notice,v.capable?'Atmospheric capability is reserved; source entry still waits for arrival and verified assignment.':'The water-quality package cannot clear the Entry Group’s atmosphere.',v.id==='internal'?'Channel Recovery lost its monitoring assignment.':eta>55?'The monitoring ETA is beyond the requested time. Source work stays on hold.':'Keep check-in and assignment ready for arrival.','sourcing',v.capable&&!locationDelay?(v.id==='harbor'?'strong':'mixed'):'damaging'); break;
      }
      case 'allocate': {
        s.flags.boom={marsh:a.marsh,channel:a.channel,reserve:6-a.marsh-a.channel}; s.flags.allocated=true;
        s.resources.filter(r=>r.kind==='boom').forEach((r,n)=>{r.status=n<a.marsh+a.channel?'assigned':'available';r.location=n<a.marsh?'Marsh inlet':n<a.marsh+a.channel?'Channel':'East Staging';});
        tick(s,10);
        const priorityCovered=s.flags.boom[s.intel.priorityArea]>=s.intel[s.intel.priorityArea==='marsh'?'marshDemand':'channelDemand'];
        notice=`Operations accepts the delegated recommendation: marsh ${a.marsh}, channel ${a.channel}, reserve ${6-a.marsh-a.channel}.`;
        traffic(s,'Operations',notice);
        record(s,'Containment allocation',notice,`Uncovered demand remains: marsh ${Math.max(0,s.intel.marshDemand-a.marsh)}, channel ${Math.max(0,s.intel.channelDemand-a.channel)}.`,s.flags.boom.reserve?'A reserve is available for an equipment failure; current line coverage is lower.':'All six modules are committed; an equipment failure will reduce coverage.','allocation',a.marsh+a.channel<4?'damaging':priorityCovered?'strong':'mixed'); break;
      }
      case 'checkin': {
        const r=resource(s,s.flags.monitorId),complete=a.verified.length===4;
        r.verified=complete&&r.capable;
        if(a.assignment==='source'&&r.verified) {r.status='assigned';r.location='Source berth';}
        else {r.status='staging';r.location='East Staging';}
        if(!complete) s.accountability=clamp(s.accountability-(4-a.verified.length)*6);
        tick(s,8);
        notice=!r.capable?'The delivered water-quality equipment cannot provide atmospheric clearance. Entry remains on hold.':!complete?'The resource is held at staging until identity, leader, capability and communications are verified.':a.assignment==='source'?'The verified atmospheric team is assigned to Source berth. Entry monitoring is available.':'The verified team remains at staging; source entry still has no assigned monitoring.';
        traffic(s,'Staging',notice);
        record(s,'Resource check-in',`${r.name}: ${r.status.replaceAll('_',' ')} at ${r.location}.`,notice,s.safetyHold?'Safe source work cannot start from a status label alone.':'Source work can proceed while monitoring and crew coverage remain available.','accountability',complete&&r.capable?(a.assignment==='source'?'strong':'mixed'):'damaging'); break;
      }
      case 'reconcile': {
        const r=resource(s,'SK-02'); r.status=a.skimmer; r.verified=a.skimmer==='out_of_service'&&a.evidence==='maintenance';
        s.flags.statusVerified=r.verified;
        if(!r.verified)s.accountability=clamp(s.accountability-15);
        tick(s,6);
        notice=r.verified?'SK-02 is marked out of service against the signed maintenance report.':'The recorded resource picture is not supported by the maintenance inspection.';
        record(s,'Status reconciliation',`SK-02 recorded ${a.skimmer.replaceAll('_',' ')} using ${a.evidence}.`,notice,'The failed pump seal remains a physical constraint; changing the board does not repair the skimmer.','accountability',r.verified?'strong':'damaging'); break;
      }
      case 'reassign': {
        s.flags.reassignment=a.strategy;
        if(a.strategy==='move') {
          resource(s,'SK-01').location='Marsh inlet'; s.flags.unauthorizedMove=!a.approval;
          if(!a.approval)s.accountability=clamp(s.accountability-20);
          notice='SK-01 moves from Channel Recovery to the marsh; the channel loses skimming capability.';
        } else if(a.strategy==='contract') {
          const eta=s.minute+35;
          s.resources.push({id:'SK-C1',name:'Contracted recovery skimmer',kind:'contract-skimmer',status:'en_route',location:'To marsh',eta,capable:true,verified:false});
          order(s,'ORD-SK','Harbor Recovery Cooperative',4600,eta,['SK-C1'],'RR-052');
          notice='A contracted skimmer is ordered for the marsh. SK-01 continues Channel Recovery; the additional unit has a 35-minute ETA.';
        } else notice='SK-01 remains in Channel Recovery; the marsh request remains unfilled.';
        tick(s,8); traffic(s,'Operations',notice);
        record(s,'Recovery reassignment',notice,a.strategy==='move'?(a.approval?'Operations approval and the new assignment are recorded.':'The move is not authorized in the record; accountability is degraded.'):a.strategy==='contract'?'A second recovery assignment becomes possible after arrival.':'Channel recovery continues without interruption.',a.strategy==='contract'?'The additional package costs $4,600 and cannot work before arrival.':a.strategy==='move'?'The channel now has no assigned skimmer.':'Marsh recovery waits; containment remains especially important.','coordination',a.strategy==='move'&&!a.approval?'damaging':'mixed'); break;
      }
      case 'forecast': {
        s.flags.forecast={relief:a.relief,waste:a.waste,orderedAt:s.minute};
        for(const [kind,count,lead,price] of [['relief',a.relief,55,1400],['waste',a.waste,40,1000]]) {
          if(!count)continue;
          const ids=[];
          for(let n=0;n<count;n++) {
            const id=`${kind==='relief'?'RLF':'WST'}-${n+1}`;ids.push(id);
            s.resources.push({id,name:`${kind==='relief'?'Relief crew':'Waste package'} ${n+1}`,kind,status:'en_route',location:'To East Staging',eta:s.minute+lead,capable:true,verified:false});
          }
          order(s,`ORD-${kind.toUpperCase()}`,'Logistics support order',count*price,s.minute+lead,ids,kind==='relief'?'RR-061':'RR-062');
        }
        tick(s,8);
        notice=`Ordered ${a.relief} relief crew(s) and ${a.waste} waste package(s); cost $${(a.relief*1400+a.waste*1000).toLocaleString('en-US')}.`;
        traffic(s,'Logistics',notice+' Relief lead: 55 minutes. Waste lead: 40 minutes.');
        record(s,'Next-period forecast',notice,a.relief&&a.waste?'Both sustainment needs have orders and traceable ETAs.':'An identified sustainment need has no order.',a.relief>1||a.waste>1?'Additional packages provide reserve capacity at added cost.':'Arrivals still require accountability; source relief must be assigned.','forecasting',a.relief&&a.waste?'strong':'damaging'); break;
      }
      case 'relief': {
        const ready=s.resources.filter(r=>r.kind==='relief'&&r.status!=='en_route');
        const r=ready[0];
        if(r) {
          r.verified=a.verified;
          r.status=a.verified&&a.assign!=='reserve'?'assigned':'staging';
          r.location=a.verified&&a.assign==='source'?'Source berth':a.verified&&a.assign==='marsh'?'Marsh inlet':'East Staging';
          ready.slice(1).forEach(spare=>{spare.verified=a.verified;spare.status='staging';spare.location='East Staging';});
        }
        if(r&&!a.verified)s.accountability=clamp(s.accountability-12);
        tick(s,7);
        notice=!r?'No relief crew has arrived. The recorded assignment cannot supply an absent resource.':!a.verified?'Relief remains at staging with incomplete check-in.':a.assign==='source'?'Verified relief is assigned to Source berth; the source duty-limit gap is covered.':a.assign==='marsh'?'Verified relief strengthens Marsh inlet; source crews still have no relief.':'Relief is held in reserve; source crews still have no relief assignment.';
        traffic(s,'Staging',notice);
        record(s,'Relief assignment',notice,hasSourceRelief(s)?'Source work can continue past 10:00.':'Source work pauses at 10:00 without verified relief.',s.resources.some(r=>r.kind==='relief'&&r.status==='en_route')?'Outstanding relief remains on order and cannot be treated as assigned.':'Any reserve remains visible in the resource picture.','accountability',hasSourceRelief(s)?'strong':r&&a.verified?'mixed':'damaging'); break;
      }
      case 'cop': {
        s.flags.cop=[...a.items];s.flags.copNote=(a.note||'').trim();
        const verified=a.items.filter(i=>i!=='rumor'&&(i!=='skimmer'||s.flags.statusVerified)).length;
        const unverified=a.items.includes('rumor')||(a.items.includes('skimmer')&&!s.flags.statusVerified);
        if(unverified)s.accountability=clamp(s.accountability-8);
        tick(s,6);
        notice=`Published ${a.items.length} selected item(s); ${verified} supported by current records.`;
        traffic(s,'Situation Unit',notice+(unverified?' Unverified or unreconciled information entered the common picture.':' Unconfirmed sheen reporting remains separate.'));
        record(s,'Common operating picture',notice,unverified?'The incoming picture mixes verified and unverified information.':'Current capability, coverage and order limitations can inform the next shift.',a.items.includes('eta')?'Outstanding orders remain visible as future availability.':'Omitted ETAs can make incoming staff overestimate immediate availability.','situational-awareness',!unverified&&verified>=3?'strong':unverified?'damaging':'mixed');break;
      }
      case 'escalate': {
        const currentGaps=gaps(s),safetyGap=!monitoringReady(s)||s.flags.channelMonitoringGap||!hasSourceRelief(s),logisticsGap=!wasteReady(s)||!hasSourceRelief(s)||!monitoringReady(s);
        const required=['operations'];if(safetyGap)required.push('safety');if(logisticsGap)required.push('logistics');
        if(s.cost>s.intel.budget||s.flags.boom[s.intel.priorityArea]<s.intel[s.intel.priorityArea==='marsh'?'marshDemand':'channelDemand'])required.push('command');
        const covered=required.every(r=>a.recipients.includes(r));
        const concernCovers=currentGaps.length?(a.concern==='gap'||a.concern==='both'):true;
        s.flags.escalation={recipients:[...a.recipients],concern:a.concern,note:(a.note||'').trim(),required,covered:covered&&concernCovers,gaps:[...currentGaps]};
        if(covered&&concernCovers&&s.flags.unauthorizedMove){s.flags.unauthorizedMove=false;traffic(s,'Operations','Operations reconciles and acknowledges the current SK-01 assignment. The earlier unauthorized move remains in the AAR.');}
        tick(s,7);
        notice=`Brief sent to ${a.recipients.length?a.recipients.join(', '):'no functional owner'} with ${a.concern} as its concern.`;
        record(s,'Escalation and coordination',notice,covered&&concernCovers?'The functions responsible for the remaining constraints have the information.':'At least one unresolved constraint lacks its responsible recipient or was omitted from the concern.','A briefing does not create resources, repair equipment or clear an unsafe assignment.','coordination',covered&&concernCovers?'strong':'damaging'); break;
      }
      case 'handover': {
        const expected=s.safetyHold||s.flags.channelMonitoringGap?'monitoring':!wasteReady(s)?'waste':'containment';
        s.flags.handover=[...a.priorities];
        tick(s,8);
        notice=`Incoming priority order: ${a.priorities.join(' → ')}.`;
        record(s,'Incoming-shift priorities',notice,a.priorities[0]===expected?'The first priority addresses the current limiting condition.':'The first priority leaves the current limiting condition for later in the handover.',`Resources, orders and unresolved ${expected} limitations carry forward.`, 'coordination',a.priorities[0]===expected?'strong':'mixed');break;
      }
      case 'reorder': s.queue=[...a.ids];event(s,'queue_reordered',{ids:a.ids});return 'Work queue reordered. Incident time is unchanged.';
      case 'wait': s.waits++;tick(s,10);traffic(s,'Incident clock','Ten simulated minutes passed. Arrivals and operational consequences continued.');event(s,'time_advanced',{minutes:10});return 'Incident time advanced ten minutes.';
      case 'advance': {
        event(s,'period_end',{cost:s.cost,shoreline:s.shoreline,recovery:s.recovery,accountability:s.accountability});
        if(s.period===2) {
          tick(s,Math.max(0,210-s.minute));s.finished=true;refresh(s);
          traffic(s,'Planning','Handover complete. Outstanding resources, constraints and the decision trail are preserved in the After Action Review.');
          event(s,'session_end',{score:report(s).score,cost:s.cost});return 'Incident handed over. The After Action Review is ready.';
        }
        tick(s,Math.max(0,(s.period===0?60:150)-s.minute));beginPeriod(s,s.period+1);return `Operational period ${s.period+1} is open.`;
      }
    }
    if(ACTION_TASK[a.type])taskDone(s,ACTION_TASK[a.type]);
    s.queue=s.queue.filter(id=>s.tasks.find(t=>t.id===id)?.status==='pending');
    refresh(s);return notice;
  }
  function act(state, action) {
    const error=validateAction(state,action);
    if(error)return {ok:false,error};
    let next,notice;
    try { next=copy(state);notice=apply(next,copy(action)); }
    catch { return {ok:false,error:'The action could not be applied to this incident record.'}; }
    Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,next);
    return {ok:true,notice};
  }
  function report(s) {
    const assessment=Object.values(s.evidence).filter(e=>e.count);
    const judgment=assessment.length?assessment.reduce((n,e)=>n+e.total/e.count,0)/assessment.length:0;
    const coverage=Math.min(1,s.flags.boom.marsh/s.intel.marshDemand)*.5+Math.min(1,s.flags.boom.channel/s.intel.channelDemand)*.5;
    const costControl=clamp(100-Math.max(0,s.cost-s.intel.budget)/150);
    const sustainment=(hasSourceRelief(s)?50:0)+(wasteReady(s)?50:0);
    const score=Math.round(judgment*.30+s.accountability*.20+(100-s.shoreline)*.15+clamp(s.recovery*2)*.15+sustainment*.10+coverage*100*.05+costControl*.05);
    const objectives=[
      {text:'Maintain safe source work with verified atmospheric monitoring and relief.',status:monitoringReady(s)&&hasSourceRelief(s)?'Supported':monitoringReady(s)?'At risk':'Not supported'},
      {text:'Protect the highest-consequence containment area within the available inventory.',status:s.flags.boom[s.intel.priorityArea]>=s.intel[s.intel.priorityArea==='marsh'?'marshDemand':'channelDemand']?'Supported':'At risk'},
      {text:'Sustain recovery with accountable equipment and waste capacity.',status:wasteReady(s)&&s.recovery>=25?'Supported':wasteReady(s)?'Partially supported':'Constrained'},
      {text:'Hand over a verified resource picture and identified operational constraints.',status:s.flags.statusVerified&&s.flags.cop.length>=3&&!s.flags.cop.includes('rumor')&&s.flags.escalation?.covered?'Supported':'At risk'}
    ];
    return {schema:'trg.session-report.v17',sessionId:s.id,incidentName:'Blackwater Reach',incidentType:'oil-spill',roleId:'resources-unit',roleName:'Resources Unit',difficulty:s.difficulty,variant:s.variant,finished:s.finished,operationalPeriods:s.period+1,minute:s.minute,score,ier:score,cost:s.cost,shoreline:s.shoreline,recovery:s.recovery,accountability:s.accountability,objectives,history:copy(s.history),competencies:copy(s.competencies),orders:copy(s.orders),resources:copy(s.resources),constraints:gaps(s),events:copy(s.events),summary:`${objectives.filter(o=>o.status==='Supported').length} of four operational objectives supported. Recovery index ${Math.round(s.recovery)}/100; shoreline impact index ${Math.round(s.shoreline)}/100. ${gaps(s).length} constraint(s) remain for the incoming shift.`,scoring:{judgment:Math.round(judgment),accountability:s.accountability,environment:Math.round(100-s.shoreline),recovery:Math.round(clamp(s.recovery*2)),sustainment,coverage:Math.round(coverage*100),costControl:Math.round(costControl)},fictional:'Fictional scenario. Resource quantities, response times, monetary values and outcome indices are simulation parameters, not operational predictions or professional qualifications.'};
  }
  root.RR17={createState,act,report,validateState,VENDORS:copy(VENDORS),PERIODS:copy(PERIODS),SCENARIOS:copy(SCENARIOS)};
})(globalThis);
