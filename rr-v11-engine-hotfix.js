window.RR = window.RR || {};
(() => {
  const RR=window.RR,U=RR.util,E=RR.IncidentEngine.prototype;
  const originalGenerate=E.generatePeriod;

  E.generatePeriod=function(){
    const S=originalGenerate.call(this);
    S.modifiers={externalEta:0,vendorDelayNext:0,accountabilityMultiplier:1,roadDelayNext:0};
    S._periodRecorded=0;
    S.counters.delayMinutes=S.counters.delayMinutes||0;
    return S;
  };

  E.makeRequest=function(priorityBoost=0){
    const S=this.state,rank=this.rankIndex();
    const unlocked=RR.RESOURCE_TYPES.filter(t=>rank>=2||!['bus','shelter'].includes(t.id));
    const t=U.randomOf(unlocked);
    const qtyBase=t.id==='radio'?U.randomOf([4,6,8]):t.id==='ppe'?U.randomOf([4,6,8]):t.id==='rest'?U.randomOf([2,4,6]):1;
    const qty=Math.max(1,Math.min(qtyBase,S.inventory[t.id].available+1));
    const p=U.clamp(Math.floor(Math.random()*3)+priorityBoost,0,2),priority=['Normal','High','Urgent'][p];
    const due=S.timeMinutes+U.randomOf(priority==='Urgent'?[35,45,55]:priority==='High'?[55,70,85]:[80,100,120]);
    return {id:'R'+Math.random().toString(36).slice(2,8).toUpperCase(),typeId:t.id,resource:t.name,route:t.route,qty,dest:U.randomOf(t.dest),priority,priorityScore:p,due,external:qty>S.inventory[t.id].available,status:'New',stage:'prioritize',firstAttempt:true,createdAt:S.timeMinutes,decisionStarted:U.nowSeconds(),overdue:false,impactLabel:t.impact,failText:t.fail};
  };

  E.advanceStage=function(r){
    const order=['document','route','review','availability','source','checkin','deploy'],i=order.indexOf(r.stage);
    if(i<order.length-1){r.stage=order[i+1];return{completed:false,periodComplete:false,complication:null}}
    return this.completeRequest(r);
  };

  E.periodComplete=function(){
    const S=this.state,open=S.queue.some(r=>r.status!=='Complete'&&r.status!=='Failed');
    if(open)return false;
    if(S.periodGenerated<S.periodCap){while(S.periodGenerated<S.periodCap){S.queue.push(this.makeRequest(S.periodGenerated===0?1:0));S.periodGenerated++}return false}
    if(S._periodRecorded===S.op)return true;
    S.periodStats.push({op:S.op,impact:S.metrics.impact,accuracy:S.metrics.accuracy,speed:this.scores().speed,accountability:S.metrics.accountability,documentation:S.metrics.documentation,duration:U.nowSeconds()-S.periodStart});
    S._periodRecorded=S.op;
    return true;
  };

  E.mistake=function(category,r){
    const S=this.state;S.weak[category]=(S.weak[category]||0)+1;this.profile.mistakes[category]=(this.profile.mistakes[category]||0)+1;
    if(category==='documentation'){S.metrics.documentation=U.clamp(S.metrics.documentation-12,0,100);S.counters.documentationErrors++}
    if(category==='accountability'){const p=Math.round(14*S.modifiers.accountabilityMultiplier);S.metrics.accountability=U.clamp(S.metrics.accountability-p,0,100);S.counters.accountabilityErrors++}
    S.metrics.accuracy=U.clamp(S.metrics.accuracy-9,0,100);
    const sev=r.priority==='Urgent'?10:r.priority==='High'?7:5,delay=r.priority==='Urgent'?10:7;S.metrics.impact=U.clamp(S.metrics.impact-sev,0,100);S.counters.impactPoints+=sev;S.counters.delayMinutes=(S.counters.delayMinutes||0)+delay;
    const impact={text:r.failText,severity:sev,resource:r.resource,category,period:S.op};S.impacts.push(impact);S.periodImpacts.push(impact);return impact;
  };

  E.answer=function(correct,category){
    const S=this.state,r=S.active,elapsed=U.nowSeconds()-r.decisionStarted;S.counters.decisions++;S.counters.totalDecisionTime+=Math.min(elapsed,S.diff.timeTarget);
    if(correct){
      if(r.firstAttempt)S.counters.correctFirst++;
      if(['routing','sourcing','documentation','accountability'].includes(category))this.profile.mastery[category]=U.clamp(this.profile.mastery[category]+1,0,100);
      if(r.stage==='availability'){const inv=S.inventory[r.typeId];if(inv.available>=r.qty){inv.available-=r.qty;inv.committed+=r.qty;r.external=false}else r.external=true}
      let processMinutes=Math.max(3,Math.round(Math.min(elapsed,S.diff.timeTarget)/3));
      if(r.stage==='source'&&r.external){const extra=S.modifiers.externalEta+S.modifiers.vendorDelayNext;processMinutes+=extra;S.counters.delayMinutes+=extra;S.modifiers.vendorDelayNext=0}
      if((r.stage==='checkin'||r.stage==='deploy')&&S.modifiers.roadDelayNext>0){processMinutes+=S.modifiers.roadDelayNext;S.counters.delayMinutes+=S.modifiers.roadDelayNext;S.modifiers.roadDelayNext=0}
      this.advanceTime(processMinutes);const before=r.stage,transition=this.advanceStage(r);if(S.active)r.decisionStarted=U.nowSeconds();return{correct:true,stage:before,...transition};
    }
    r.firstAttempt=false;const impact=this.mistake(category,r),delay=r.priority==='Urgent'?10:7;this.advanceTime(delay);return{correct:false,impact};
  };

  E.prioritize=function(r){
    const S=this.state,expected=this.expectedPriority(),correct=r.id===expected?.id;S.counters.decisions++;
    if(correct){S.counters.correctFirst++;this.profile.mastery.prioritization=U.clamp(this.profile.mastery.prioritization+1,0,100)}
    else{
      S.weak.prioritization++;this.profile.mistakes.prioritization++;S.metrics.accuracy=U.clamp(S.metrics.accuracy-8,0,100);S.counters.delayMinutes=(S.counters.delayMinutes||0)+6;this.advanceTime(6);
      const sev=expected?.priority==='Urgent'?9:expected?.priority==='High'?6:4;S.metrics.impact=U.clamp(S.metrics.impact-sev,0,100);
      const impact={text:`Priority conflict: ${expected?.resource||'higher-priority work'} for ${expected?.dest||'the field'} waits while ${r.resource} is processed first.`,severity:sev,resource:expected?.resource||r.resource,category:'prioritization',period:S.op};S.impacts.push(impact);S.periodImpacts.push(impact);
    }
    this.selectRequest(r.id);return correct;
  };

  E.applyComplication=function(card){
    const S=this.state;let text=card.text;
    if(card.type==='weather'){S.weather=U.randomOf(S.incident.weather);S.modifiers.externalEta=Math.max(S.modifiers.externalEta,15)}
    if(card.type==='staffing')S.modifiers.accountabilityMultiplier=Math.max(S.modifiers.accountabilityMultiplier,1.35);
    if(card.type==='vendor')S.modifiers.vendorDelayNext+=30;
    if(card.type==='access'){
      const pending=[...S.queue].filter(r=>r.status!=='Complete').sort((a,b)=>this.priorityScore(b)-this.priorityScore(a))[0];S.modifiers.roadDelayNext=Math.max(S.modifiers.roadDelayNext,20);
      if(pending)text=`Road closure: ${pending.resource} for ${pending.dest} is projected to lose 20 minutes in movement.`;
    }
    if(card.type==='surge'){S.queue.push(this.makeRequest(1));S.periodGenerated++;text='Request surge: an additional high-priority request has entered the queue.'}
    S.metrics.impact=U.clamp(S.metrics.impact-card.impact,0,100);S.counters.delayMinutes=(S.counters.delayMinutes||0)+(card.type==='vendor'?30:card.type==='access'?20:card.type==='weather'?15:0);
    const applied={...card,text};S.impacts.push({text,severity:card.impact,resource:card.label,category:card.type,period:S.op});return applied;
  };

  E.nextPeriod=function(){
    const S=this.state;S.op++;S.weather=U.randomOf(S.incident.weather);this.generatePeriod();return Math.random()<S.diff.complications?this.applyComplication(U.randomOf(RR.COMPLICATIONS)):null;
  };

  E.scores=function(){
    const S=this.state,c=S.counters,accuracy=c.decisions?Math.round(c.correctFirst/c.decisions*100):100;
    const speed=Math.round(U.clamp(100-(c.delayMinutes||0)*1.35,40,100)),accountability=Math.round(S.metrics.accountability),documentation=Math.round(S.metrics.documentation),impact=Math.round(S.metrics.impact),mission=Math.round(U.clamp(S.metrics.mission-c.requestsFailed*10,0,100));
    return{accuracy,speed,accountability,documentation,impact,mission,ier:Math.round(accuracy*.24+speed*.12+accountability*.17+documentation*.17+impact*.20+mission*.10)};
  };
})();