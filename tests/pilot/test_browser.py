"""Exercise the complete fictional workflow through rendered controls.
Native IDB/reload/concurrency cases run only with TRG_BASE_URL; injection is explicitly scoped.
"""
import hashlib,json,os,shutil,time,traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'qa/pilot';OUT.mkdir(exist_ok=True)
BASE=os.getenv('TRG_BASE_URL',''); BROWSER=os.getenv('TRG_BROWSER','chromium'); checks=[]; skips=[]; errors=[]; started=time.time()
def check(ok,name):
 if not ok: raise AssertionError(name)
 checks.append(name)
def snap(page,name): page.screenshot(path=str(OUT/(BROWSER+'-'+name+'.png')),full_page=True)
def state(page):return page.evaluate('TRG_PILOT.getState()')
def nav(page,v,id=''):
 page.evaluate('x=>location.hash="#/pilot/"+x',v+('/'+id if id else ''));page.wait_for_timeout(120)
def persona(page,id):
 page.locator('#pilot-persona').select_option(id);page.wait_for_timeout(170)
def fill_task(page):
 s=state(page);r=s['sessions'][-1]; step=r['snapshot']['steps'][r['step']];rank=0
 for f in step['fields']:
  x=page.locator('#pilot-task-form [name="'+f['id']+'"]')
  if f['type']=='text': x.fill('Synthetic browser acceptance entry. <img src=x onerror=window.TRG_XSS=1> Current source retained; scope is limited; unresolved owner and next update are stated. Not a real participant assessment.')
  elif f['type']=='rank':rank+=1;x.select_option(str(rank))
  else:x.select_option(f.get('expected') or f['options'][0]['id'])
 page.locator('#pilot-task-form button[type=submit]').click();page.wait_for_timeout(180)
def finish(page):
 for _ in range(5):
  r=state(page)['sessions'][-1]
  if r['status']=='completed':return r
  fill_task(page)
 raise AssertionError('Session did not complete')
def review(page,rid,met):
 persona(page,'evaluator');nav(page,'review',rid)
 r=next(r for r in state(page)['sessions'] if r['id']==rid)
 for i,c in enumerate(r['snapshot']['rubric']['criteria']):
  page.locator('[name="status_'+c['id']+'"]').select_option('met' if met or i else 'unmet')
  choices=page.locator('[name="evidence_'+c['id']+'"]')
  check(page.locator('[name="evidence_'+c['id']+'"]:checked').count()==0,'New review requires explicit evidence selection: '+c['id'])
  check('Select at least one evidence reference' in choices.first.evaluate('(input)=>input.validationMessage'),'Missing citation explains the required selection: '+c['id'])
  for index in ([1] if i==0 else [0] if i==1 else [0,1]):choices.nth(index).check()
  page.locator('[name="rationale_'+c['id']+'"]').fill('Synthetic evaluator entry for software acceptance; not professional validation.')
 page.locator('#pilot-review-form button[type=submit]').click();page.wait_for_timeout(200)
def load(page):
 if BASE:page.goto(BASE,wait_until='networkidle')
 else:
  page.set_content('<!doctype html><html lang="en"><head><title>Response Game test</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><div id="toast" role="status"></div><dialog id="drawer" aria-labelledby="drawer-title"></dialog></body></html>')
  page.evaluate('''()=>{window._testStorage={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>window._testStorage[k]??null,setItem:(k,v)=>window._testStorage[k]=String(v),removeItem:k=>delete window._testStorage[k]}});}''')
  for name in ['styles.css','pilot/pilot.css']:page.add_style_tag(content=(ROOT/name).read_text())
  for name in ['catalog.js','engine.js','pilot/pack.js','pilot/domain.js','pilot/store.js','pilot/ui.js','app.js']:page.add_script_tag(content=(ROOT/name).read_text())
 page.locator('[data-page="pilot"]').first.click();page.wait_for_selector('#pilot-assign-form')
with sync_playwright() as p:
 browser=getattr(p,BROWSER)
 kwargs={'args':['--no-sandbox']} if BROWSER=='chromium' else {}
 if BROWSER=='chromium' and not os.getenv('GITHUB_ACTIONS'):kwargs['executable_path']=shutil.which('chromium') or browser.executable_path
 b=browser.launch(**kwargs);ctx=b.new_context(viewport={'width':1440,'height':1050},reduced_motion='reduce',accept_downloads=True);page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e))); page.set_default_timeout(12000)
 try:
  load(page);check(len(state(page)['assignments'])==0,'Clean profile has no fabricated activity');check('FICTIONAL REHEARSAL' in page.locator('#pilot-root').inner_text(),'Exercise boundary remains visible');snap(page,'prepare')
  page.locator('#pilot-assign-form [value="p3"]').check();check('1 eligible / 2 selected' in page.locator('#pilot-audience').inner_text(),'Inactive participant excluded before assignment')
  page.locator('[name="sourceReviewed"]').check();page.locator('[name="boundaryAccepted"]').check();page.locator('#pilot-assign-form button[type=submit]').click();page.wait_for_timeout(250)
  check(len(state(page)['assignments'])==1,'Campaign creates one eligible assignment');check(len(state(page)['campaigns'][0]['audience']['excluded'])==1,'Exclusion is attributable in campaign')
  persona(page,'p1');page.locator('[data-pilot="start"]').click();page.wait_for_selector('#pilot-task-form');r=state(page)['sessions'][-1];rid=r['id'];snap(page,'task')
  first_text=page.locator('#pilot-task-form textarea').first;first_text.fill('A saved draft that must survive pause and interruption.');page.wait_for_timeout(400)
  check(bool(state(page)['sessions'][-1]['drafts']),'Written draft saves before submission')
  page.locator('[data-pilot="pause"]').click();page.wait_for_timeout(180);ms=state(page)['sessions'][-1]['activeMs'];page.wait_for_timeout(250)
  check(state(page)['sessions'][-1]['status']=='paused' and state(page)['sessions'][-1]['activeMs']==ms,'Pause freezes active time');page.locator('[data-pilot="resume"]').click();page.wait_for_selector('#pilot-task-form');check('saved draft' in page.locator('#pilot-task-form textarea').first.input_value(),'Resume restores saved task')
  if BASE:
   page.reload(wait_until='networkidle');page.wait_for_selector('#pilot-root');page.wait_for_selector('[data-pilot="resume"]');check('paused'==state(page)['sessions'][-1]['status'],'Refresh interrupts active session without erasing work');page.locator('[data-pilot="resume"]').click();page.wait_for_selector('#pilot-task-form');check('saved draft' in page.locator('#pilot-task-form textarea').first.input_value(),'Native IndexedDB retains draft after reload')
  else:skips.extend(['Native IndexedDB reload','Two-view transaction conflict','Corrupt native-cache recovery'])
  fill_task(page);context=page.locator('#pilot-previous-context');check(context.count()==1,'Later task offers earlier information and submitted work');context.locator('summary').click()
  prior=state(page)['sessions'][-1]
  for artifact in prior['snapshot']['steps'][0]['artifacts']:check(artifact['text'] in context.inner_text(),'Prior source artifact remains available: '+artifact['id'])
  check(prior['evidence'][0]['answers']['message'] in context.inner_text(),'Own submitted message remains available during later task')
  selected=prior['snapshot']['steps'][0]['fields'][0]['options'];label=next(o['label'] for o in selected if o['id']==prior['evidence'][0]['answers']['route'])
  check(label in context.inner_text(),'Submitted selections display authored labels instead of machine IDs')
  check('Inspect rule checks' not in context.inner_text(),'Earlier-work context does not expose evaluator rule checks mid-task')
  completed=finish(page);original=json.dumps(completed,sort_keys=True);check(len(completed['evidence'])==2,'Two work products stored as evidence');check(not state(page)['reviews'],'Submission does not imply evaluated success');check(page.evaluate('window.TRG_XSS!==1'),'Participant HTML is displayed as text, not executed')
  for legacy in ['overview','reports','library']:
   page.evaluate('v=>location.hash="#/"+v',legacy);page.wait_for_timeout(150)
   check('legacy starter practice only' in page.locator('[data-legacy-boundary]').inner_text(),legacy+' explicitly separates legacy and pilot records')
   page.locator('[data-legacy-boundary] a').click();page.wait_for_selector('#pilot-root');check(rid in json.dumps(state(page)),legacy+' links back to retained pilot evidence')
  review(page,rid,False);page.wait_for_selector('#pilot-finding-form')
  first_review=state(page)['reviews'][-1];nav(page,'review',rid)
  for decision in first_review['decisions']:
   selected=page.locator('[name="evidence_'+decision['criterionId']+'"]:checked').evaluate_all('(inputs)=>inputs.map(input=>input.value)')
   check(selected==decision['evidenceIds'],'Amendment restores every original citation: '+decision['criterionId'])
  page.locator('[name="rationale_authority"]').fill('Revised synthetic rationale only; the selected original evidence must not change.')
  page.locator('#pilot-review-form button[type=submit]').click();page.wait_for_selector('#pilot-finding-form')
  after_review=state(page)['reviews'][-1]
  check([d['evidenceIds'] for d in after_review['decisions']]==[d['evidenceIds'] for d in first_review['decisions']],'Rationale-only amendment preserves per-criterion and multiple citations')
  check(state(page)['reviews'][0]==first_review,'Review amendment leaves the historical review unchanged')
  for name in ['observation','impact','causeRationale']:page.locator('#pilot-finding-form [name="'+name+'"]').fill('Synthetic acceptance finding: the authority boundary needs clarification, with source and produced work retained.')
  page.locator('#pilot-finding-form button[type=submit]').click();page.wait_for_timeout(200);check(len(state(page)['findings'])==1,'Evaluator finding retains criterion and cause');page.locator('a[href*="/newaction/"]').first.click();page.wait_for_selector('#pilot-action-form')
  page.locator('[name="title"]').fill('Revise the fictional escalation card and rehearse a missing alternate.');page.locator('[name="completionCriteria"]').fill('Authority scope, owner and next update are explicit and the different transfer condition is reviewed.');page.locator('[name="due"]').fill('2026-11-13');page.locator('#pilot-action-form button[type=submit]').click();page.wait_for_timeout(250);aid=state(page)['actions'][-1]['id']
  check(state(page)['actions'][-1]['status']=='open','Action is not closed by creation');persona(page,'owner');nav(page,'action',aid);page.locator('[name="evidence"]').fill('Synthetic owner evidence: escalation card now separates coordination from command delegation and records the next update.');page.locator('#pilot-completion-form button[type=submit]').click();page.wait_for_timeout(200)
  check(state(page)['actions'][-1]['status']=='ready' and not state(page)['verifications'],'Completion evidence does not imply verification');check('Ready for retest' in page.locator('#pilot-root').inner_text() and 'Demo administrator creates' in page.locator('#pilot-root').inner_text(),'Owner completion names the next administrator retest step');persona(page,'admin');check(page.evaluate('location.hash').endswith('/action/'+aid),'Manual persona switch keeps the current action open');nav(page,'action',aid);page.locator('[data-pilot="retest"]').click();page.wait_for_timeout(200)
  check(len(state(page)['assignments'])==2,'Action creates a linked transfer assignment');persona(page,'p1');page.locator('[data-pilot="start"]').click();page.wait_for_selector('#pilot-task-form');retest=finish(page);retestid=retest['id'];check(retest['snapshot']['id']!='PILOT-ESC-A' and retest['originalSessionId']==rid,'Retest changes condition and retains original session')
  persona(page,'verifier');nav(page,'action',aid);check(page.locator('[data-pilot-form="verify"]').count()==0,'Verifier cannot skip evaluator review')
  review(page,retestid,True);check('Evaluator review recorded' in page.locator('#pilot-root').inner_text() and 'All rubric criteria marked met' in page.locator('#pilot-root').inner_text(),'All-met review has a truthful recorded-success screen');check(page.locator('a[href="#/pilot/action/'+aid+'"]').count()==1,'All-met transfer review links back to its verification action');persona(page,'verifier');nav(page,'action',aid);page.locator('[data-pilot-form="verify"] [name="rationale"]').fill('Synthetic verification entry: inspected owner evidence, original finding and linked transfer review. No professional acceptance inferred.');page.locator('[data-pilot-form="verify"] button[type=submit]').click();page.wait_for_timeout(200)
  check(len(state(page)['verifications'])==1,'Separate verifier records linked verification');check(json.dumps(state(page)['sessions'][0],sort_keys=True)==original,'Review and retest never rewrite original session');snap(page,'verification');persona(page,'executive');nav(page,'trace');snap(page,'trace')
  for m in page.evaluate('TRG_PILOT_DOMAIN.metrics(TRG_PILOT.getState())'):
   check(len(m['numerator'])<=len(m['denominator']) and all(x in m['denominator'] for x in m['numerator']),m['id']+' metric reconciles to underlying records')
  with page.expect_download() as download:page.locator('[data-pilot="export"]').first.click()
  exportpath=OUT/(BROWSER+'-trace.json');download.value.save_as(exportpath);export=json.loads(exportpath.read_text());check(export['payload']['environment']=='fictional-browser-rehearsal','Export labels fictional evidence');check(len(export['payload']['state']['verifications'])==1,'Export preserves full verified chain')
  for w,h in [(390,844),(768,1024),(1440,1050)]:
   page.set_viewport_size({'width':w,'height':h})
   for v in ['prepare','assignments','reviews','improve','trace','release']:
    nav(page,v);check(page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),f'{v} reflows at {w}px')
   snap(page,'reflow-'+str(w))
  nav(page,'prepare');page.keyboard.press('Tab');check(page.evaluate('document.activeElement!==document.body'),'Keyboard focus enters an interactive element')
  for _ in range(8):page.keyboard.press('Tab')
  check(page.evaluate('document.activeElement.tagName in {"A":1,"BUTTON":1,"INPUT":1,"SELECT":1,"TEXTAREA":1,"SUMMARY":1}'),'Keyboard tab order reaches named controls')
  nav(page,'session',rid);page.set_viewport_size({'width':390,'height':844});check(page.locator('textarea').count()==0,'Executive inspects completed work without an editable task');snap(page,'mobile-work')
  axe=ROOT/'node_modules/axe-core/axe.min.js'
  if axe.exists():
   page.add_script_tag(path=str(axe));nav(page,'prepare')
   result=page.evaluate("async()=>await axe.run(document.querySelector('#pilot-root'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})")
   (OUT/(BROWSER+'-axe.json')).write_text(json.dumps(result,indent=2))
   check(not [x for x in result['violations'] if x['impact'] in ['serious','critical']],'No serious or critical axe violations in the pilot preparation view')
  else:skips.append('axe-core not installed locally; native CI installs pinned test dependency')
  # Different work models render and submit, not only the escalation model.
  for sid in ['PILOT-SIT-A','PILOT-RES-A','PILOT-HO-A']:
   persona(page,'admin');nav(page,'prepare');page.locator('[data-pilot="select"][data-id="'+sid+'"]').click();page.locator('[name="sourceReviewed"]').check();page.locator('[name="boundaryAccepted"]').check();page.locator('#pilot-assign-form button[type=submit]').click();page.wait_for_timeout(160);persona(page,'p1');page.locator('[data-pilot="start"]').first.click();page.wait_for_selector('#pilot-task-form');done=finish(page);check(done['snapshot']['id']==sid and len(done['evidence'])==2,sid+' produces two work products through actual controls')
  if BASE:
   nav(page,'release');page.wait_for_selector('#pilot-release-record');page.wait_for_timeout(250)
   metadata=page.evaluate("async()=>await (await fetch('release.json')).json()")
   check(metadata['version']=='2.0.0-eval' and not metadata['liveCommunications'],'Machine-readable release matches the evaluation build')
   ctx.set_offline(True);nav(page,'trace');check('Event ledger' in page.locator('#pilot-root').inner_text(),'Loaded local workflow remains inspectable during network interruption');ctx.set_offline(False)
   second=ctx.new_page();second.goto(BASE+'/#/pilot/prepare');second.wait_for_selector('#pilot-persona');persona(second,'admin');nav(second,'prepare');second.locator('[name="sourceReviewed"]').check();second.locator('[name="boundaryAccepted"]').check();second.locator('#pilot-assign-form button[type=submit]').click();page.wait_for_timeout(350)
   check('Another view changed' in page.locator('#pilot-error').inner_text(),'Separate tab change exposes conflict recovery instead of overwriting');second.close();page.locator('[data-pilot="reload"]').first.click();page.wait_for_timeout(200)
  if BASE:
   # Transaction conflict through the real IndexedDB store, not a mock.
   conflict=page.evaluate('''async()=>{const a=new TRG_PILOT_STORE(),b=new TRG_PILOT_STORE();await a.open();await b.open();const s=await a.load();const base={org:s.org,expectedRevision:s.revision,actorId:'admin',at:new Date(Date.now()+1000).toISOString(),type:'create_campaign',payload:{name:'Concurrency test',scenario:TRG_PILOT_PACK[0],config:{site:'Fictional concurrency site',mode:'Observed'},participantIds:['p2'],sourceReviewed:true,boundaryAccepted:true}};const results=await Promise.allSettled([a.execute({...base,key:'two-view-a'}),b.execute({...base,key:'two-view-b'})]);a.close();b.close();return results.map(x=>x.status==='fulfilled'?'ok':x.reason.code);}''')
   check(conflict.count('ok')==1 and conflict.count('CONFLICT')==1,'Concurrent IDB commands cannot overwrite one another')
   page.reload(wait_until='networkidle');page.wait_for_selector('#pilot-root');page.wait_for_timeout(250)
   # Deliberately corrupt only this isolated browser test profile; recovery must not overwrite.
   page.evaluate('''async()=>{const db=await new Promise((r,j)=>{const q=indexedDB.open('trg-pilot-v2');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)});await new Promise((r,j)=>{const tx=db.transaction('states','readwrite'),q=tx.objectStore('states').get('internal-demo');q.onsuccess=()=>{const s=q.result;s.revision=-8;tx.objectStore('states').put(s);};tx.oncomplete=r;tx.onerror=j;});db.close();}''')
   page.reload(wait_until='networkidle');page.wait_for_selector('[data-pilot="raw"]');check('Stored history needs recovery' in page.locator('#pilot-root').inner_text(),'Corrupt cache blocks writes and exposes recovery export')
   with page.expect_download() as download:page.locator('[data-pilot="raw"]').click()
   recovery=OUT/(BROWSER+'-recovery.json');download.value.save_as(recovery);check(json.loads(recovery.read_text())['revision']==-8,'Recovery export preserves corrupt original without silent reseeding')
  check(not errors,'No JavaScript page errors')
 except Exception:
  snap(page,'failure');(OUT/(BROWSER+'-failure.html')).write_text(page.content());raise
 finally:
  report={'commit':os.getenv('TRG_SOURCE_SHA',os.getenv('GITHUB_SHA','local-working-tree')),'browser':BROWSER,'environment':'native-hosted-origin' if BASE else 'injected-rendered-DOM/volatile-store','dataClass':'fictional acceptance fixtures','passed':len(checks),'failed':0 if not __import__('sys').exc_info()[0] else 1,'skipped':len(skips),'quarantined':0,'checks':checks,'skips':skips,'pageErrors':errors,'durationSeconds':round(time.time()-started,3),'humanAcceptance':False}
  (OUT/(BROWSER+'-browser.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2));b.close()
