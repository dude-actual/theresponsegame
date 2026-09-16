window.RR = window.RR || {};
(() => {
  const RR = window.RR;
  RR.RANKS = [
    {name:'Resources Unit Trainee',xp:0},
    {name:'Resources Unit Leader',xp:800},
    {name:'Situation Unit Leader',xp:1800},
    {name:'Logistics Section Chief',xp:3200},
    {name:'Planning Section Chief',xp:5200},
    {name:'Operations Section Chief',xp:7800},
    {name:'Incident Commander',xp:11000}
  ];
  RR.DIFFICULTY = {
    Recruit:{requestCount:[2,2,3,3],timeTarget:24,complexity:.65,complications:.28,unlockRank:0},
    Qualified:{requestCount:[2,3,3,3],timeTarget:20,complexity:.8,complications:.35,unlockRank:1},
    Advanced:{requestCount:[3,3,3,4],timeTarget:18,complexity:1,complications:.48,unlockRank:2},
    'Section Chief':{requestCount:[3,3,4,4],timeTarget:16,complexity:1.15,complications:.62,unlockRank:3},
    'Command Staff':{requestCount:[3,4,4,4],timeTarget:14,complexity:1.3,complications:.78,unlockRank:5}
  };
  RR.RESOURCE_TYPES = [
    {id:'vac',name:'Vacuum Truck',plural:'Vacuum Trucks',route:'Tactical',pool:2,dest:['Division Alpha','Division Bravo'],impact:'spill response',fail:'Product recovery is delayed while the vacuum truck remains unavailable.'},
    {id:'light',name:'Portable Light Tower',plural:'Portable Light Towers',route:'Tactical',pool:3,dest:['Division Bravo','Staging'],impact:'night operations',fail:'Night work is slowed because lighting support did not arrive on time.'},
    {id:'radio',name:'Intrinsically Safe Radio',plural:'Intrinsically Safe Radios',route:'Support',pool:18,dest:['Operations','Entry Team'],impact:'communications',fail:'Field communications are degraded while crews wait for intrinsically safe radios.'},
    {id:'ppe',name:'Level B PPE Set',plural:'Level B PPE Sets',route:'Support',pool:16,dest:['Entry Team','HazMat Group'],impact:'responder entry',fail:'Responder entry is delayed because required PPE is not available at the assignment.'},
    {id:'gen',name:'Portable Generator',plural:'Portable Generators',route:'Support',pool:2,dest:['Staging','Base'],impact:'support operations',fail:'Support operations lose capacity while backup power is delayed.'},
    {id:'tech',name:'Air Monitoring Technician',plural:'Air Monitoring Technicians',route:'Tactical',pool:2,dest:['HazMat Group','Division Alpha'],impact:'air monitoring',fail:'Work-area decisions are delayed while air monitoring support is unavailable.'},
    {id:'boom',name:'Boom Trailer',plural:'Boom Trailers',route:'Tactical',pool:2,dest:['Division Delta','Division Alpha'],impact:'spill containment',fail:'Containment is delayed because boom has not reached the assigned division.'},
    {id:'rest',name:'Portable Restroom Unit',plural:'Portable Restroom Units',route:'Support',pool:10,dest:['Base','Staging'],impact:'responder support',fail:'Responder support degrades as sanitation capacity falls behind demand.'},
    {id:'bus',name:'Evacuation Bus',plural:'Evacuation Buses',route:'Tactical',pool:3,dest:['Division Charlie','Evacuation Group'],impact:'evacuation',fail:'Evacuation movement is delayed while transportation remains tied up.'},
    {id:'shelter',name:'Shelter Supply Trailer',plural:'Shelter Supply Trailers',route:'Support',pool:2,dest:['Shelter Branch','Base'],impact:'shelter operations',fail:'Shelter capacity is constrained because support supplies have not arrived.'}
  ];
  RR.INCIDENTS = [
    {name:'River Bend Release',weather:['Clear','Gusty winds','Light rain'],brief:'A product release near a populated corridor is expanding operational demand.'},
    {name:'North Plant Fire',weather:['Hot / dry','Wind shift','Smoke advisory'],brief:'A process-area fire is driving simultaneous suppression, monitoring, and responder-support needs.'},
    {name:'Bayou Flood Response',weather:['Heavy rain','Flood watch','Thunderstorms'],brief:'Flooding is disrupting access routes and increasing evacuation and shelter demand.'},
    {name:'Pipeline Corridor Incident',weather:['Clear','Crosswind','Rain developing'],brief:'A corridor incident is stretching field logistics across multiple divisions.'}
  ];
  RR.COMPLICATIONS = [
    {type:'weather',label:'Weather Shift',text:'Weather conditions deteriorate. External resource ETAs increase by 15 minutes.',impact:4},
    {type:'staffing',label:'Staffing Shortage',text:'Staging loses two check-in personnel. Accountability errors now carry greater impact.',impact:5},
    {type:'access',label:'Road Closure',text:'A primary access route closes. One pending deployment is delayed.',impact:6},
    {type:'vendor',label:'Vendor Delay',text:'A supplier reports a 30-minute slip on the next externally sourced resource.',impact:5},
    {type:'surge',label:'Request Surge',text:'An additional high-priority request enters the queue.',impact:3}
  ];
  RR.ACHIEVEMENTS = [
    {id:'cleanRoute',name:'Clean Route',desc:'Complete an incident with 90%+ routing accuracy.'},
    {id:'accountable',name:'Accountability First',desc:'Finish with 95%+ accountability.'},
    {id:'docDisc',name:'Documentation Discipline',desc:'Finish with 95%+ documentation.'},
    {id:'zeroImpact',name:'Zero Preventable Impact',desc:'Complete an incident with Operational Impact score of 100.'},
    {id:'fourPeriods',name:'Four for Four',desc:'Complete all four operational periods.'},
    {id:'fastTrack',name:'Fast Track',desc:'Finish with 90%+ speed score.'},
    {id:'mastery80',name:'Process Mastery',desc:'Reach an Incident Effectiveness Rating of 80 or higher.'}
  ];
  RR.CERTIFICATIONS = {
    'routing-qualified':'Resource Routing Qualified',
    'section-coordination':'Section Coordination Qualified',
    'incident-command':'Incident Command Mastery'
  };
  RR.defaultProfile = {
    xp:0,sessions:0,bestIER:0,achievements:[],certifications:[],incidentStreak:0,bestIncidentStreak:0,history:[],
    mastery:{routing:0,documentation:0,accountability:0,prioritization:0,sourcing:0},
    mistakes:{routing:0,documentation:0,accountability:0,prioritization:0,sourcing:0}
  };
  RR.util = {
    clamp:(n,min,max)=>Math.max(min,Math.min(max,n)),
    randomOf:a=>a[Math.floor(Math.random()*a.length)],
    nowSeconds:()=>performance.now()/1000,
    formatTime(mins){mins=Math.round(mins);const h=Math.floor((mins%1440)/60),m=mins%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`},
    escapeHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))},
    capitalize:s=>s.charAt(0).toUpperCase()+s.slice(1)
  };
})();