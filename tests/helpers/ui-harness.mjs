import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const engineSource=fs.readFileSync('v17-engine.js','utf8'),uiSource=fs.readFileSync('v17-ui.js','utf8');
const sessionKey='trg-v17-session';
export function boot(seed={}, failWrites=false, endpoint=null, options={}) {
  const memory=new Map(Object.entries(seed).map(([k,v])=>[k,typeof v==='string'?v:JSON.stringify(v)]));
  const handlers=new Map(),nodes=new Map(),blobs=[],beacons=[],writes=[],windowHandlers=new Map(); let activeForm=null;
  function node(id='') {
    if(nodes.has(id))return nodes.get(id);
    const el={id,innerHTML:'',textContent:'',className:'',dataset:{},value:'',open:false,isConnected:true,disabled:false,
      setAttribute(key,value){this[key]=value;},hasAttribute(key){return key in this;},
      addEventListener(){},focus(){document.activeElement=this;},scrollIntoView(){},
      showModal(){this.open=true;},close(){this.open=false;},click(){},
      closest(){return null;},classList:{add(){},remove(){},toggle(){}}};
    let html='';Object.defineProperty(el,'innerHTML',{get:()=>html,set:value=>{html=value;if(id==='app')activeForm=null;}});
    nodes.set(id,el);return el;
  }
  function formNode(){
    if(activeForm)return activeForm;
    const html=node('app').innerHTML,match=html.match(/<form class='task-form' data-task='([^']+)'>([\s\S]*?)<\/form>/);if(!match)return null;
    const form={dataset:{task:match[1]},elements:[],matches:s=>s==='.task-form'};
    const attr=(s,n)=>s.match(new RegExp(n+"=['\"]([^'\"]*)['\"]"))?.[1]||'';
    for(const m of match[2].matchAll(/<input\b([^>]*)>|<select\b([^>]*)>([\s\S]*?)<\/select>|<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/g)){
      const attrs=m[1]??m[2]??m[4],name=attr(attrs,'name');if(!name)continue;
      const id=attr(attrs,'id')||'field-'+name+'-'+form.elements.length;
      const c=node(id);Object.assign(c,{name,type:m[2]!==undefined?'select-one':m[4]!==undefined?'textarea':attr(attrs,'type')||'text',value:m[2]!==undefined?attr(m[3].match(/<option([^>]*)>/)?.[1]||'','value'):m[4]!==undefined?m[5]:attr(attrs,'value'),checked:/\bchecked\b/.test(attrs),closest:s=>s==='.task-form'?form:null});form.elements.push(c);
    }
    activeForm=form;return form;
  }
  const document={documentElement:{dataset:{}},body:{className:''},activeElement:node('initial-focus'),
    getElementById:id=>node(id),createElement:tag=>node(`created-${tag}-${nodes.size}`),
    addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);},
    querySelector(selector){return selector==='input[name=difficulty]:checked'?{value:'guided'}:selector==='.task-form'?formNode():null;},
    querySelectorAll(){return [];}};
  class FormDataDouble {
    constructor(form){this.rows=form.entries||form.elements.filter(c=>!['checkbox','radio'].includes(c.type)||c.checked).map(c=>[c.name,c.value]);}
    entries(){return this.rows[Symbol.iterator]();}
    get(name){return this.rows.find(([key])=>key===name)?.[1]??null;}
    getAll(name){return this.rows.filter(([key])=>key===name).map(([,value])=>value);}
    has(name){return this.rows.some(([key])=>key===name);}
  }
  const context={document,console,Blob,FormData:FormDataDouble,Date,Math,JSON,Set,Map,
    TRG_CONFIG: endpoint ? {analyticsEndpoint:endpoint} : {},
    navigator:{sendBeacon(url,body){beacons.push({url,body});return true;}},location:{protocol:'http:',hostname:'localhost'},
    localStorage:{getItem(k){if(options.denyReads===true||(typeof options.denyReads==='function'&&options.denyReads(k)))throw new Error('Read denied');return memory.get(k)??null;},setItem(k,v){if(failWrites||options.failWrite?.(k)){const e=new Error('Storage denied');e.name=options.quota?'QuotaExceededError':'SecurityError';throw e;}writes.push(k);memory.set(k,String(v));}},
    URL:{createObjectURL(blob){blobs.push(blob);return `blob:test-${blobs.length}`;},revokeObjectURL(){}},
    setTimeout(fn){fn();return 0;},addEventListener(type,fn){windowHandlers.set(type,fn);},scrollTo(){}};
  context.window=context;context.globalThis=context;
  vm.createContext(context);vm.runInContext(engineSource,context);if(options.scenes)vm.runInContext(fs.readFileSync('v17-scenes.js','utf8'),context);let actionCalls=0;const original=context.RR17.act;context.RR17.act=(...args)=>{actionCalls++;return original(...args);};vm.runInContext(uiSource,context);
  function emit(type,event){for(const fn of handlers.get(type)||[])fn(event);}
  function click(action,extra={}) {
    const target={dataset:{action,...extra},setAttribute(){},textContent:'',closest:selector=>selector==='[data-action]'?target:null};
    emit('click',{target});
  }
  function submit(task,values={}) {
    const entries=Object.entries(values).flatMap(([key,value])=>(Array.isArray(value)?value:[value]).map(v=>[key,String(v)]));
    emit('submit',{preventDefault(){},target:{dataset:{task},entries,matches:s=>s==='.task-form'}});
  }
  function edit(values){const form=formNode();assert.ok(form,'active form required');for(const [name,value] of Object.entries(values)){const controls=form.elements.filter(c=>c.name===name);assert.ok(controls.length,name);for(const c of controls){if(['checkbox','radio'].includes(c.type))c.checked=(Array.isArray(value)?value:[value]).includes(c.value);else c.value=String(value);}emit('input',{target:controls[0]});}}
  return {memory,nodes,blobs,beacons,writes,click,submit,context,edit,form:formNode,emit,actions:()=>actionCalls,pagehide:()=>windowHandlers.get('pagehide')?.(),json:key=>JSON.parse(memory.get(key)||'null'),
    state:()=>JSON.parse(memory.get(sessionKey)||'null')?.state,
    html:()=>node('app').innerHTML,dialog:()=>node('dialog-content').innerHTML};
}
