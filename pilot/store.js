/* IndexedDB transactions serialize multi-tab commands. Local rehearsal storage is not a tenant boundary. */
(function(root){'use strict';const D=root.TRG_PILOT_DOMAIN;
class PilotStore{
 constructor(org='internal-demo'){this.org=org;this.db=null;this.mode='opening';this.raw=null;this.channel=null;}
 async open(){
  let available;try{available=root.indexedDB;}catch{}
  if(!available){this.mode='volatile';this.memory=D.initial(this.org);return this;}
  try{this.db=await new Promise((resolve,reject)=>{const req=indexedDB.open('trg-pilot-v2',1);req.onupgradeneeded=()=>{const db=req.result;db.createObjectStore('states',{keyPath:'org'});db.createObjectStore('events',{keyPath:['org','sequence']});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('Database upgrade blocked by another tab. Close that tab and reload.'));});this.mode='indexeddb';this.db.onversionchange=()=>{this.db.close();this.db=null;this.mode='closed';};}
  catch(e){this.mode='volatile';this.memory=D.initial(this.org);this.openError=String(e.message);}
  if(root.BroadcastChannel){this.channel=new BroadcastChannel('trg-pilot-updates');this.channel.onmessage=e=>{if(e.data.org===this.org)this.onchange?.(e.data);};}
  return this;
 }
 async rawRead(){if(this.mode==='volatile')return D.copy(this.memory);if(!this.db)throw Error('Database unavailable. Reload before working.');return await new Promise((resolve,reject)=>{const req=this.db.transaction('states').objectStore('states').get(this.org);req.onsuccess=()=>resolve(req.result||D.initial(this.org));req.onerror=()=>reject(req.error);});}
 async load(){
  if(this.mode==='volatile'){this.raw=await this.rawRead();D.validate(this.raw);return D.copy(this.raw);}
  if(!this.db)throw Error('Database unavailable. Reload before working.');
  // Both projections must come from one IndexedDB transaction snapshot.
  const snapshot=await new Promise((resolve,reject)=>{
   const tx=this.db.transaction(['states','events'],'readonly');let state,events;
   const stateRequest=tx.objectStore('states').get(this.org);
   const eventRequest=tx.objectStore('events').getAll(IDBKeyRange.bound([this.org,0],[this.org,Number.MAX_SAFE_INTEGER]));
   stateRequest.onsuccess=()=>{state=stateRequest.result||D.initial(this.org);};
   eventRequest.onsuccess=()=>{events=eventRequest.result;};
   tx.oncomplete=()=>resolve({state,events});
   tx.onerror=()=>reject(tx.error||Error('Could not read stored history.'));
   tx.onabort=()=>reject(tx.error||Error('Stored-history read was interrupted.'));
  });
  this.raw=snapshot.state;D.validate(this.raw);
  if(D.stable(snapshot.events)!==D.stable(this.raw.events))throw Object.assign(Error('Event store and current state disagree. Export recovery data; do not overwrite it.'),{code:'CORRUPT'});
  return D.copy(this.raw);
 }
 async execute(command){
  let result;
  if(this.mode==='volatile'){result=D.apply(this.memory,command);this.memory=result;}
  else{if(!this.db)throw Error('Database unavailable. Reload before working.');result=await new Promise((resolve,reject)=>{const tx=this.db.transaction(['states','events'],'readwrite');let next,problem;const req=tx.objectStore('states').get(this.org);req.onsuccess=()=>{try{const old=req.result||D.initial(this.org);if(!this.raw||D.stable(old)!==D.stable(this.raw))D.validate(old);next=D.apply(old,command);if(next.revision!==old.revision){tx.objectStore('events').add(next.events.at(-1));tx.objectStore('states').put(next);}}catch(e){problem=e;tx.abort();}};tx.oncomplete=()=>resolve(next);tx.onerror=()=>reject(problem||tx.error);tx.onabort=()=>reject(problem||tx.error||Error('Storage transaction aborted.'));});}
  this.raw=result;this.channel?.postMessage({org:this.org,revision:result.revision});return D.copy(result);
 }
 close(){this.channel?.close();this.db?.close();}
}
root.TRG_PILOT_STORE=PilotStore;
})(typeof window!=='undefined'?window:globalThis);
