window.RR = window.RR || {};
(() => {
  const RR=window.RR,U=RR.util;

  class IncidentEngine {
    constructor(profile,difficulty='Recruit'){
      this.profile=profile;
      this.difficulty=difficulty;
      this.state=null;
    }
    rankForXp(xp){return [...RR.RANKS].reverse().find(r=>xp>=r.xp)||RR.RANKS[0]}
    rankIndex(){return RR.RANKS.findIndex(r=>r.name===this.rankForXp(this.profile.xp).name)}
    nextRank(){return RR.RANKS.find(r=>r.xp>this.profile.xp)||null}
    masteryPercent(){const v=Object.values(this.profile.mastery);return Math.round(v.reduce((a,b)=>a+b,0)/(v.length||1))}
    label(req){const t=RR.RESOURCE_TYPES.find(x=>x.id===req.typeId);return `${req.qty} ${req.qty===1?t.name:t.plural}`}
    createIncident(){
      const diff=RR.DIFFICULTY[this.difficulty],incident=U.randomOf(RR.INCIDENTS),inventory={};
      RR.RESOURCE_TYPES.forEach(r=>{
        const scale=this.difficulty==='Command Staff'?.7:this.difficulty==='Section Chief'?.8:this.difficulty==='Advanced'?.9:1;
        inventory[r.id]={...r,available:Math.max(1,Math.round(r.pool*scale)),committed:0,deployed:0};
      });
      this.state={
        difficulty:this.difficulty,diff,incident,op:1,timeMinutes:420,weather:incident.weather[0],inventory,
        queue:[],active:null,completed:[],impacts:[],periodImpacts:[],periodStats:[],periodGenerated:0,periodCap:0,
        metrics:{accuracy:100,speed:100,accountability:100,documentation:100,impact:100,mission:100},
        counters:{decisions:0,correctFirst:0,totalDecisionTime:0,accountabilityErrors:0,documentationErrors:0,impactPoints:0,requestsCompleted:0,requestsFailed:0},
        weak:{routing:0,documentation:0,accountability:0,prioritization:0,sourcing:0},
        periodStart:U.nowSeconds()
      };
      this.generatePeriod();
      return this.state;
    }
    makeRequest(priorityBoost=0){
      const S=this.state,t=U.randomOf(RR.RESOURCE_TYPES);
      const qtyBase=t.id==='radio'?U.randomOf([4,6,8]):t.id==='ppe'?U.randomOf([4,6,8]):t.id==='rest'?U.randomOf([2,4,6]):1;
      const qty=Math.max(1,Math.min(qtyBase,S.inventory[t.id].available+1));
      const p=U.clamp(Math.floor(Math.random()*3)+priorityBoost,0,2),priority=['Normal','High','Urgent'][p];
      const due=S.timeMinutes+U.randomOf(priority==='Urgent'?[35,45,55]:priority==='High'?[55,70,85]:[80,100,120]);
      return {id:'R'+Math.random().toString(36).slice(2,8).toUpperCase(),typeId:t.id,resource:t.name,route:t.route,qty,dest:U.randomOf(t.dest),
        priority,priorityScore:p,due,external:qty>S.inventory[t.id].available,status:'New',stage:'prioritize',
        firstAttempt:true,createdAt:S.timeMinutes,decisionStarted:U.nowSeconds(),overdue:false,impactLabel:t.impact,failText:t.fail};
    }
    generatePeriod(){
      const S=this.state,count=S.diff.requestCount[S.op-1];
      S.queue=[];S.periodGenerated=0;
      S.periodCap=count+(Math.random()<S.diff.complexity*.45?1:0)+(S.op>=3&&Math.random()<.32?1:0);
      for(let i=0;i<count;i++){S.queue.push(this.makeRequest(i===0?1:0));S.periodGenerated++}
      S.active=null;S.periodImpacts=[];S.periodStart=U.nowSeconds();
      return S;
    }
    priorityScore(r){return r.priorityScore*1000-(r.due-this.state.timeMinutes)}
    expectedPriority(){return [...this.state.queue].filter(r=>r.status!=='Complete'&&r.status!=='Failed').sort((a,b)=>this.priorityScore(b)-this.priorityScore(a))[0]}
    selectRequest(id){
      const r=this.state.queue.find(x=>x.id===id);if(!r||r.status==='Complete'||r.status==='Failed')return null;
      this.state.active=r;if(r.stage==='prioritize')r.stage='document';r.decisionStarted=U.nowSeconds();return r;
    }
    decisionFor(r){
      const inv=this.state.inventory[r.typeId];
      if(r.stage==='document')return{category:'documentation',prompt:`${this.label(r)} requested for ${r.dest}. What happens first?`,
        choices:[['Complete the ICS 213-RR with resource, quantity, destination, and required time',true],['Call Staging before documenting the request',false],['Wait until the end of the operational period to document it',false]],
        imh:'Requisitioner: identify the resource need and type, then complete the ICS 213-RR Resource Request in the IAP.'};
      if(r.stage==='route')return{category:'routing',prompt:`This is a ${r.route.toUpperCase()} request. Where should it route?`,
        choices:r.route==='Tactical'?[['Resource Unit',true],['Finance',false],['Vendor directly',false]]:[['Logistics',true],['Field Operations',false],['Staging only',false]],
        imh:'At the Tactical vs Support decision point, tactical requests route through Resource Unit and support requests route to Logistics.'};
      if(r.stage==='review')return{category:'routing',prompt:`${r.route==='Tactical'?'Resource Unit':'Logistics'} has the request. What happens next?`,
        choices:r.route==='Tactical'?[['Review for clarity and check ordered resources / staging availability',true],['Immediately order from an outside supplier',false],['Send it directly to Finance',false]]:[['Review for clarity before sourcing',true],['Send it directly to the field',false],['Close it because support resources are not tracked',false]],
        imh:r.route==='Tactical'?'Resource Unit reviews the ICS 213-RR for clarity and checks ordered resources and staging availability.':'Logistics reviews support requests for clarity before sourcing or ordering.'};
      if(r.stage==='availability')return{category:'sourcing',prompt:`${inv.available>=r.qty?'The requested resource is available internally.':'The requested quantity is not fully available internally.'} What is the next move?`,
        choices:inv.available>=r.qty?[['Earmark the resource for this assignment and update status',true],['Order another resource anyway',false],['Send it to the field without updating status',false]]:[['Route to Logistics to source / order the shortfall',true],['Close the request as unavailable',false],['Send an unverified substitute',false]],
        imh:inv.available>=r.qty?'If equipment is available, earmark it for the specific use and update resource status.':'If the resource is not available internally, Logistics sources and orders it and captures supplier, price, UOM, ETA, and status.'};
      if(r.stage==='source')return{category:'documentation',prompt:r.external?'A supplier is found. What information belongs with the order?':'The resource is committed internally. What information must stay visible?',
        choices:r.external?[['Price, UOM, ETA, supplier details, and completed 213-RR',true],['Only the supplier phone number',false],['Only the ETA',false]]:[['Assignment, location, status, and accountability',true],['Only the resource name',false],['Nothing else; it is already available',false]],
        imh:r.external?'Logistics captures price, UOM, ETA and vendor details and completes the request record. Finance may be involved when required.':'Availability does not replace accountability. Maintain assignment and status visibility as the resource is activated.'};
      if(r.stage==='checkin')return{category:'accountability',prompt:`${r.resource} arrives or is activated. What must happen before final deployment?`,
        choices:[['Check it in and document accountability',true],['Send it directly to the end user with no check-in',false],['Document it only at demobilization',false]],
        imh:'Staging or the designated check-in location receives resources and records check-in/accountability before deployment. Use the applicable check-in/status tools such as ICS 211.'};
      return{category:'accountability',prompt:`${r.resource} is ready for ${r.dest}. What completes the process?`,
        choices:[['Assign it, update status, and keep the incident record current',true],['Let the vendor decide where it goes',false],['Leave status unchanged until the incident ends',false]],
        imh:'Operations / Staging / Resource Unit maintain assignment and status visibility as the resource is issued.'};
    }
    advanceStage(r){
      const order=['document','route','review','availability','source','checkin','deploy'],i=order.indexOf(r.stage);
      if(i<order.length-1)r.stage=order[i+1];else this.completeRequest(r);
    }
    completeRequest(r){
      const S=this.state,inv=S.inventory[r.typeId];r.status='Complete';r.completedAt=S.timeMinutes;S.counters.requestsCompleted++;
      if(inv.committed>=r.qty){inv.committed-=r.qty;inv.deployed+=r.qty}else if(inv.available>=r.qty){inv.available-=r.qty;inv.deployed+=r.qty}
      S.completed.push(r);S.active=null;this.advanceTime(8);
      let complication=null;
      if(S.periodGenerated<S.periodCap&&Math.random()<.62){S.queue.push(this.makeRequest(Math.random()<.45?1:0));S.periodGenerated++;if(Math.random()<S.diff.complications*.32)complication=this.applyComplication(U.randomOf(RR.COMPLICATIONS))}
      return{completed:true,complication,periodComplete:this.periodComplete()};
    }
    periodComplete(){
      const S=this.state,open=S.queue.some(r=>r.status!=='Complete'&&r.status!=='Failed');if(open)return false;
      if(S.periodGenerated<S.periodCap){while(S.periodGenerated<S.periodCap){S.queue.push(this.makeRequest(S.periodGenerated===0?1:0));S.periodGenerated++}return false}
      S.periodStats.push({op:S.op,impact:S.metrics.impact,accuracy:S.metrics.accuracy,speed:S.metrics.speed,accountability:S.metrics.accountability,documentation:S.metrics.documentation,duration:U.nowSeconds()-S.periodStart});
      return true;
    }
    advanceTime(mins){this.state.timeMinutes+=mins;this.checkDeadlines()}
    checkDeadlines(){
      const S=this.state;S.queue.forEach(r=>{if(r.status==='Complete'||r.status==='Failed'||r.overdue||S.timeMinutes<=r.due)return;
        r.overdue=true;const sev=r.priority==='Urgent'?10:r.priority==='High'?7:4;S.metrics.impact=U.clamp(S.metrics.impact-sev,0,100);S.metrics.mission=U.clamp(S.metrics.mission-4,0,100);
        const impact={text:`${r.impactLabel} is delayed because ${r.resource} missed the required time.`,severity:sev,resource:r.resource,category:'prioritization',period:S.op};
        S.impacts.push(impact);S.periodImpacts.push(impact);S.weak.prioritization++;this.profile.mistakes.prioritization++;
      });
    }
    mistake(category,r){
      const S=this.state;S.weak[category]=(S.weak[category]||0)+1;this.profile.mistakes[category]=(this.profile.mistakes[category]||0)+1;
      if(category==='documentation')S.metrics.documentation=U.clamp(S.metrics.documentation-12,0,100);
      if(category==='accountability')S.metrics.accountability=U.clamp(S.metrics.accountability-14,0,100);
      S.metrics.accuracy=U.clamp(S.metrics.accuracy-9,0,100);
      const sev=r.priority==='Urgent'?10:r.priority==='High'?7:5;S.metrics.impact=U.clamp(S.metrics.impact-sev,0,100);S.counters.impactPoints+=sev;
      const impact={text:r.failText,severity:sev,resource:r.resource,category,period:S.op};S.impacts.push(impact);S.periodImpacts.push(impact);return impact;
    }
    answer(correct,category){
      const S=this.state,r=S.active,elapsed=U.nowSeconds()-r.decisionStarted;S.counters.decisions++;S.counters.totalDecisionTime+=elapsed;
      if(correct){
        if(r.firstAttempt)S.counters.correctFirst++;
        if(['routing','sourcing','documentation','accountability'].includes(category))this.profile.mastery[category]=U.clamp(this.profile.mastery[category]+1,0,100);
        if(r.stage==='availability'){const inv=S.inventory[r.typeId];if(inv.available>=r.qty){inv.available-=r.qty;inv.committed+=r.qty;r.external=false}else r.external=true}
        this.advanceTime(Math.max(3,Math.round(elapsed/3)));const before=r.stage;this.advanceStage(r);if(S.active)r.decisionStarted=U.nowSeconds();
        return{correct:true,stage:before};
      }
      r.firstAttempt=false;const impact=this.mistake(category,r);this.advanceTime(r.priority==='Urgent'?10:7);return{correct:false,impact};
    }
    prioritize(r){
      const S=this.state,expected=this.expectedPriority(),correct=r.id===expected?.id;S.counters.decisions++;
      if(correct){S.counters.correctFirst++;this.profile.mastery.prioritization=U.clamp(this.profile.mastery.prioritization+1,0,100)}
      else{S.metrics.accuracy=U.clamp(S.metrics.accuracy-5,0,100);S.weak.prioritization++;this.profile.mistakes.prioritization++;this.advanceTime(6);this.mistake('prioritization',r)}
      this.selectRequest(r.id);return correct;
    }
    applyComplication(card){
      const S=this.state;if(card.type==='weather')S.weather=U.randomOf(S.incident.weather);if(card.type==='vendor')S.timeMinutes+=10;if(card.type==='access')S.timeMinutes+=8;
      S.metrics.impact=U.clamp(S.metrics.impact-card.impact,0,100);S.impacts.push({text:card.text,severity:card.impact,resource:card.label,category:card.type,period:S.op});
      if(card.type==='surge'){S.queue.push(this.makeRequest(1));S.periodGenerated++}return card;
    }
    nextPeriod(){
      const S=this.state;S.op++;S.weather=U.randomOf(S.incident.weather);const card=Math.random()<S.diff.complications?this.applyComplication(U.randomOf(RR.COMPLICATIONS)):null;this.generatePeriod();return card;
    }
    scores(){
      const S=this.state,c=S.counters,accuracy=c.decisions?Math.round(c.correctFirst/c.decisions*100):100,avg=c.decisions?c.totalDecisionTime/c.decisions:0;
      const speed=Math.round(U.clamp(100-Math.max(0,avg-S.diff.timeTarget)*3,40,100)),accountability=Math.round(S.metrics.accountability),documentation=Math.round(S.metrics.documentation),impact=Math.round(S.metrics.impact),mission=Math.round(U.clamp(S.metrics.mission-c.requestsFailed*10,0,100));
      return{accuracy,speed,accountability,documentation,impact,mission,ier:Math.round(accuracy*.24+speed*.12+accountability*.17+documentation*.17+impact*.20+mission*.10)};
    }
    finish(){
      const S=this.state,s=this.scores(),xpGain=Math.round(s.ier*4+S.completed.length*18+(this.difficulty==='Command Staff'?140:this.difficulty==='Section Chief'?100:this.difficulty==='Advanced'?70:this.difficulty==='Qualified'?40:20));
      this.profile.xp+=xpGain;this.profile.sessions++;this.profile.bestIER=Math.max(this.profile.bestIER,s.ier);this.profile.incidentStreak=s.ier>=80?this.profile.incidentStreak+1:0;this.profile.bestIncidentStreak=Math.max(this.profile.bestIncidentStreak,this.profile.incidentStreak);
      this.profile.history=[...(this.profile.history||[]),{ier:s.ier,difficulty:this.difficulty,date:new Date().toISOString()}].slice(-12);
      Object.keys(this.profile.mastery).forEach(k=>{const e=S.weak[k]||0;this.profile.mastery[k]=U.clamp(this.profile.mastery[k]+(e===0?3:e===1?1:0),0,100)});
      const unlocked=[],maybe=(id,cond)=>{if(cond&&!this.profile.achievements.includes(id)){this.profile.achievements.push(id);unlocked.push(id)}};
      maybe('cleanRoute',s.accuracy>=90);maybe('accountable',s.accountability>=95);maybe('docDisc',s.documentation>=95);maybe('zeroImpact',s.impact===100);maybe('fourPeriods',true);maybe('fastTrack',s.speed>=90);maybe('mastery80',s.ier>=80);
      const cert=(id,cond)=>{if(cond&&!this.profile.certifications.includes(id)){this.profile.certifications.push(id);unlocked.push('cert:'+id)}};
      cert('routing-qualified',this.profile.sessions>=3&&this.profile.bestIER>=80&&this.profile.mastery.routing>=20);
      cert('section-coordination',this.rankIndex()>=3&&this.profile.bestIER>=85&&this.masteryPercent()>=40);
      cert('incident-command',this.rankIndex()>=6&&this.profile.bestIER>=92&&this.masteryPercent()>=65);
      return{scores:s,xpGain,unlocked};
    }
  }
  RR.IncidentEngine=IncidentEngine;
})();