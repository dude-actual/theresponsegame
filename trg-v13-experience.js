window.TRG = window.TRG || {};
(() => {
'use strict';
const T = window.TRG;
T.VERSION = '13.0.0-rc1';

const CHALLENGES = [
  {id:'clean-handoffs',title:'Clean Handoffs',brief:'Protect accountability through every transfer.',metric:'accountability',target:94,reward:180},
  {id:'decision-quality',title:'Decision Quality',brief:'Finish with high first-attempt accuracy.',metric:'accuracy',target:90,reward:180},
  {id:'documented-response',title:'Documented Response',brief:'Keep requests and orders traceable.',metric:'documentation',target:95,reward:180},
  {id:'operational-tempo',title:'Operational Tempo',brief:'Keep the incident moving without sacrificing control.',metric:'speed',target:88,reward:180},
  {id:'impact-control',title:'Impact Control',brief:'Limit preventable operational consequences.',metric:'impact',target:92,reward:220},
  {id:'balanced-command',title:'Balanced Command',brief:'Maintain an IER of 84+ with no score below 70.',metric:'ier',target:84,reward:240}
];

const SEASONS = [
  {months:[5,6,7,8,9,10],name:'Atlantic Readiness Season',incidents:['hurricane','severe-weather'],brief:'Weather, access, evacuation, shelter, and continuity pressure are elevated.',bonus:120},
  {months:[2,3,4],name:'Spring Operations',incidents:['wildfire','pipeline','refinery'],brief:'Fast-moving field conditions reward early resource discipline and strong situational awareness.',bonus:100},
  {months:[11,0,1],name:'Winter Operations',incidents:['transportation','public-event','chemical'],brief:'Travel, public-event, and cold-weather support constraints shape the operating picture.',bonus:100}
];

const hash = (value) => {let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
const localDateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const weekKey=(d=new Date())=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()),day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return localDateKey(x);};
const pick=(arr,seed)=>arr[seed%arr.length];

class RetentionStore {
  constructor(key='trgRetentionV13'){this.key=key;}
  load(){try{return {...this.defaults(),...(JSON.parse(localStorage.getItem(this.key)||'null')||{})};}catch{return this.defaults();}}
  defaults(){return {daily:{},weekly:{},seasonal:{},lastPlayed:'',totalDaysPlayed:0,challengeStreak:0,bestChallengeStreak:0};}
  save(v){localStorage.setItem(this.key,JSON.stringify(v));return v;}
  markPlayed(dateKey){const v=this.load();if(v.lastPlayed!==dateKey){v.totalDaysPlayed++;v.lastPlayed=dateKey;}return this.save(v);}
  recordChallenge(key,complete){const v=this.load(),prior=v.daily[key];if(complete&&!prior?.complete){v.challengeStreak++;v.bestChallengeStreak=Math.max(v.bestChallengeStreak,v.challengeStreak||0);}else if(!complete&&!prior?.complete){v.challengeStreak=0;}v.daily[key]={complete,updatedAt:new Date().toISOString()};return this.save(v);}
  recordWeekly(key,entry){const v=this.load();v.weekly[key]={...(v.weekly[key]||{}),...entry};return this.save(v);}
  recordSeason(key,entry){const v=this.load();v.seasonal[key]={...(v.seasonal[key]||{}),...entry};return this.save(v);}
}

const daily=(date=new Date())=>{const key=localDateKey(date),seed=hash(key+'daily'),incident=pick(T.INCIDENTS,seed),challenge=pick(CHALLENGES,seed>>>3);return {key,incidentId:incident.id,incidentName:incident.name,challenge,reward:challenge.reward,mode:'daily'};};
const incidentOfDay=(date=new Date())=>{const key=localDateKey(date),incident=pick(T.INCIDENTS,hash(key+'incident'));return {key,incidentId:incident.id,incidentName:incident.name,reward:90,mode:'featured'};};
const weekly=(date=new Date())=>{const key=weekKey(date),incidentIds=[...T.INCIDENTS].sort((a,b)=>hash(a.id+key)-hash(b.id+key)).slice(0,3).map(x=>x.id);return {key,title:'Weekly Operation',brief:'Complete three incidents across at least two incident types while maintaining an average IER of 78+.',incidentIds,targetSessions:3,targetUniqueIncidents:2,targetAverage:78,reward:500,mode:'weekly'};};
const seasonal=(date=new Date())=>{const s=SEASONS.find(x=>x.months.includes(date.getMonth()))||SEASONS[0];return {...s,key:`${date.getFullYear()}-${s.name.replace(/\W+/g,'-').toLowerCase()}`,mode:'seasonal'};};
function evaluateChallenge(challenge,scores){if(!challenge||!scores)return false;if(challenge.id==='balanced-command')return scores.ier>=challenge.target&&['accuracy','speed','accountability','documentation','impact','mission','costControl'].every(k=>scores[k]>=70);return Number(scores[challenge.metric]||0)>=challenge.target;}

function applyRetention({profile,report,scores,mode,retentionStore}){
  const out={bonusXp:0,notices:[]},today=daily(),featured=incidentOfDay(),week=weekly(),season=seasonal(),store=retentionStore||new RetentionStore();store.markPlayed(today.key);
  if(mode==='daily'){const done=evaluateChallenge(today.challenge,scores),state=store.load(),already=state.daily[today.key]?.complete;store.recordChallenge(today.key,done);if(done&&!already){profile.xp+=today.reward;out.bonusXp+=today.reward;out.notices.push(`Daily Challenge complete · +${today.reward} XP`);}}
  if(report?.incidentType===featured.incidentId){const state=store.load(),marker=`featured:${featured.key}`;if(!state.daily[marker]?.complete){state.daily[marker]={complete:true};profile.xp+=featured.reward;out.bonusXp+=featured.reward;out.notices.push(`Incident of the Day complete · +${featured.reward} XP`);store.save(state);}}
  const r=store.load(),w=r.weekly[week.key]||{sessions:0,incidentIds:[],ierTotal:0,complete:false};if(report){w.sessions++;w.incidentIds=[...new Set([...(w.incidentIds||[]),report.incidentType])];w.ierTotal=(w.ierTotal||0)+scores.ier;}const avg=w.sessions?Math.round(w.ierTotal/w.sessions):0,weeklyComplete=w.sessions>=week.targetSessions&&w.incidentIds.length>=week.targetUniqueIncidents&&avg>=week.targetAverage;if(weeklyComplete&&!w.complete){w.complete=true;profile.xp+=week.reward;out.bonusXp+=week.reward;out.notices.push(`Weekly Operation complete · +${week.reward} XP`);}store.recordWeekly(week.key,w);
  if(report&&season.incidents.includes(report.incidentType)){const ss=r.seasonal[season.key]||{sessions:0,complete:false};ss.sessions++;if(ss.sessions>=2&&!ss.complete){ss.complete=true;profile.xp+=season.bonus;out.bonusXp+=season.bonus;out.notices.push(`${season.name} milestone · +${season.bonus} XP`);}store.recordSeason(season.key,ss);}
  return out;
}

const NarrativeDirector={
  briefing(pack,role,difficulty,challenge){const op=pack.periods[0];return{eyebrow:'Mission Briefing',title:pack.name,deck:`You are assigned as ${role.name}. ${pack.summary}`,condition:`Opening condition: ${op[1]}`,objectives:pack.objectives.slice(0,3),directive:`Operate within ${difficulty} conditions. Requests, costs, resource commitments, and consequences carry forward.`,challenge:challenge?`${challenge.title}: ${challenge.brief}`:''};},
  period(pack,op,state){const p=pack.periods[op-1],urgent=state?state.queue?.filter(x=>x.priority==='Urgent'&&x.status!=='Complete').length||0:0;return{title:`OP ${op} · ${p[0]}`,text:`${p[1]}${urgent?` ${urgent} urgent work item${urgent===1?' is':'s are'} pending.`:''}`};},
  selection(work){return{title:'Work Selected',text:`${work.kind==='task'?work.title:work.resource} is now active. Required-by time and incident priority remain in effect.`};},
  accepted(work){return{title:work.kind==='request'?'Resource Action Accepted':'Command Action Accepted',text:work.kind==='request'?`${work.resource} moved one step closer to operational deployment.`:`${work.title} was incorporated into the incident picture.`};},
  deployed(work){return{title:'Deployment Alert',text:`${work.resource} has completed the resource-management cycle for ${work.dest}. Status is current.`};},
  impact(impact){return{title:'Operational Impact',text:impact.text};},complication(c){return{title:c.label,text:c.text};},
  periodClose(op,state){return{title:`Operational Period ${op} Closed`,text:`${state.periodImpacts.length} new impact${state.periodImpacts.length===1?'':'s'} recorded. ${state.unmetNeeds||0} unmet need${state.unmetNeeds===1?' remains':'s remain'}.`};}
};
const Onboarding={key:'trgOnboardingV13',load(){try{return JSON.parse(localStorage.getItem(this.key)||'{"complete":false,"step":0}')}catch{return{complete:false,step:0}}},save(v){localStorage.setItem(this.key,JSON.stringify(v));return v},reset(){return this.save({complete:false,step:0})},complete(){return this.save({complete:true,step:99})},next(){const v=this.load();v.step++;if(v.step>=4)v.complete=true;return this.save(v)},hint(){const v=this.load();if(v.complete)return null;if(v.step===0)return{title:'Start with consequence, not convenience.',text:'Choose the highest-consequence work using incident priority, urgency, and required time.'};if(v.step===1)return{title:'Read the whole request.',text:'Use the active-work details and the IMH before you commit a resource or route a request.'};if(v.step===2)return{title:'Watch what changed.',text:'After each decision, check the common operating picture, pending work, resource availability, and impact indicators.'};return{title:'You are running the incident.',text:'The tutorial will now get out of the way. Use the IMH whenever you need the job aid.'};}};
T.experience={CHALLENGES,RetentionStore,daily,incidentOfDay,weekly,seasonal,evaluateChallenge,applyRetention,NarrativeDirector,Onboarding,localDateKey};
})();