"""Rendered UI tests. Uses content injection because this environment blocks file/localhost
navigation in managed Chromium. localStorage is a test double; hosted-origin persistence,
service worker retirement and production network integrations are NOT certified by this suite.
"""
from pathlib import Path
import json, os, shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa';OUT.mkdir(exist_ok=True)
BASE_URL=os.environ.get('TRG_BASE_URL','')
checks=[]
def check(condition,label):
 assert condition,label
 checks.append(label)
def load(page):
 if BASE_URL:
  page.goto(BASE_URL);page.wait_for_selector('.pilot-entry');return
 page.set_content('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="app"></div><div id="toast" role="status" aria-live="polite"></div><dialog id="drawer" aria-labelledby="drawer-title"></dialog></body></html>')
 page.evaluate("""() => {window._testStorage={};Object.defineProperty(window,'localStorage',{value:{getItem:k=>window._testStorage[k]??null,setItem:(k,v)=>{window._testStorage[k]=String(v)},removeItem:k=>delete window._testStorage[k]}})}""")
 page.add_style_tag(content=(ROOT/'styles.css').read_text())
 for f in ['catalog.js','engine.js','app.js']:page.add_script_tag(content=(ROOT/f).read_text())
 page.wait_for_selector('.pilot-entry')
def nav(page,name):page.evaluate('(n)=>{location.hash="#/"+n}',name);page.wait_for_timeout(60)
def finish(page,posture='authority',bad=False):
 page.locator('[data-action="decision"][data-choice="'+('defer' if bad else 'clarify')+'"]').click()
 page.locator('[data-action="decision"][data-choice="'+('old' if bad else 'current')+'"]').click()
 page.locator('#task-form [name="choice"]').select_option('assume' if bad else posture)
 page.locator('#task-form [name="recipient"]').fill('Designated duty lead')
 page.locator('#task-form [name="checkpoint"]').fill('Duty update in five minutes')
 if page.locator('#task-form [name="externalRef"]').count():
  page.locator('[data-action="worksheet"]').click();page.locator('#worksheet-note').fill('Verified facts and the current duty lead recorded for this exercise only.');page.locator('[data-action="capture-worksheet"]').click()
 page.locator('[data-action="submit-task"]').click()
 page.locator('#brief-form [name="known"]').fill('The current duty report is attributable, but the full impact remains unverified.')
 page.locator('#brief-form [name="unknown"]').fill('Resource capability and restoration time have not been confirmed.')
 page.locator('#brief-form [name="next"]').fill('The designated duty lead will verify the gaps and provide the next update in five minutes.')
 page.locator('[data-action="complete-run"]').click();page.wait_for_selector('.debrief')
with sync_playwright() as p:
 executable=os.environ.get('TRG_CHROMIUM') or shutil.which('chromium') or p.chromium.executable_path
 b=p.chromium.launch(executable_path=executable,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1050},reduced_motion='reduce',accept_downloads=True);errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 load(page);page.screenshot(path=str(OUT/'01_landing.png'),full_page=True)
 check(page.locator('.pilot-entry h1').inner_text()=='Open your workspace','Operational public entry renders')
 page.locator('.pilot-entry summary').click();page.locator('[data-action="nav"][data-page="overview"]').first.click();page.wait_for_selector('.summary-grid')
 page.screenshot(path=str(OUT/'02_workspace.png'),full_page=True)
 check(page.locator('.metric-value').nth(1).inner_text()=='0','No fabricated completion metrics')
 nav(page,'library');page.locator('#library-search').fill('QI');check(page.evaluate('filtered().length')==12,'Role-alias search finds both pipeline and marine QI contexts')
 page.locator('[data-action="clear-filters"]').click();page.locator('#filter-sector').select_option('Healthcare');check(page.locator('.scenario-card').count()==6,'Sector filtering returns six pattern starters')
 page.locator('[data-action="clear-filters"]').click();page.screenshot(path=str(OUT/'03_library.png'),full_page=True)
 page.locator('[data-action="configure"][data-id="TRG-001"]').click();page.locator('[name="variant"]').select_option('Primary unavailable');page.screenshot(path=str(OUT/'04_configuration.png'),full_page=True)
 page.locator('[data-action="save-run"]').click();page.wait_for_selector('.player-card');page.screenshot(path=str(OUT/'05_practice.png'),full_page=True)
 page.locator('[data-action="pause"]').first.click();check('Take the time' in page.locator('.player-card').inner_text(),'Participant pause is visible')
 before=page.evaluate('data.activeRun.activeMs');page.wait_for_timeout(1200);check(page.evaluate('data.activeRun.activeMs')==before,'Paused time does not advance')
 page.locator('[data-action="exit-player"]').click();page.locator('[data-action="resume-run"]').click();page.wait_for_selector('.options');check(page.locator('.options').count()==1,'Saved practice can be resumed')
 finish(page);check(page.locator('.metric-value').first.inner_text()=='3 / 3','Successful path produces three rule checks')
 check('Human review required' in page.locator('.debrief').inner_text(),'Free-text is explicitly awaiting review')
 page.screenshot(path=str(OUT/'06_debrief.png'),full_page=True)
 with page.expect_download() as dl:page.locator('[data-action="export-run"]').click()
 downloaded=dl.value;downloaded.save_as(OUT/'test_run_export.json');export=json.loads((OUT/'test_run_export.json').read_text());check(export['status']=='completed' and len(export['observations'])==3,'JSON evidence export includes actual completed record')
 page.locator('[data-action="action-from-run"]').click();page.locator('[name="title"]').fill('Verify the duty-team escalation handover');page.locator('[name="status"]').select_option('Verified');page.locator('[data-action="save-action"]').click();check('Legacy verification is disabled' in page.locator('#action-error').inner_text(),'Legacy verification cannot bypass linked evaluator and retest workflow')
 page.locator('[name="status"]').select_option('Open');page.locator('[data-action="save-action"]').click();check(page.locator('.action-card').count()==1,'Improvement action is linked and saved')
 nav(page,'campaigns');page.locator('[data-action="campaign"]').first.click();page.locator('[name="name"]').fill('Selected-person escalation preview');page.locator('#campaign-group').select_option('Selected individuals');page.locator('#campaign-people').select_option(['atlas-p0','atlas-p1']);page.locator('#campaign-channel').select_option('SMS preview');check('1 eligible / 2 selected' in page.locator('#audience-preview').inner_text(),'Individual selection applies channel consent exclusions')
 page.locator('[name="ack"]').check();page.locator('[data-action="save-campaign"]').click();page.locator('[data-action="preview-campaign"]').click();check('no actual dispatch' in page.locator('#drawer').inner_text(),'Campaign dispatch is explicitly a dry run');page.locator('[data-action="close"]').first.click();page.screenshot(path=str(OUT/'07_campaigns.png'),full_page=True)
 nav(page,'people');page.locator('[data-action="import-people"]').click();page.locator('#people-csv').fill('external_id,name,email,group,role\nDEMO-101,"Example, Person",test101@example.invalid,Review team,Evaluator\nDEMO-101,Duplicate,duplicate@example.invalid,Review team,Evaluator');page.locator('[data-action="validate-people"]').click();check('1 accepted for import · 1 exceptions' in page.locator('#import-result').inner_text(),'Import quarantines duplicate IDs');page.locator('#people-csv').fill('bad data');check(page.locator('#commit-people').is_disabled(),'Editing validated CSV invalidates previous import approval');page.locator('[data-action="close"]').first.click()
 nav(page,'overview');page.locator('#workspace-select').select_option('civic');page.wait_for_function("workspace==='civic' && document.querySelector('.metric-value').textContent !== ''");page.wait_for_timeout(400);check(page.locator('.metric-value').nth(1).inner_text()=='0','Demo workspace switching does not mix run counts');page.locator('#workspace-select').select_option('atlas');page.wait_for_timeout(400);check(page.locator('.metric-value').nth(1).inner_text()=='1','Workspace state returns from test storage')
 nav(page,'library');page.locator('[data-action="configure"][data-id="TRG-001"]').click();page.locator('[name="channel"]').select_option('SMS preview');page.locator('[data-action="save-run"]').click();page.locator('#sms-reply').fill('STOP');page.locator('[data-action="sms-reply"]').click();check(page.evaluate('data.runs.filter(r=>r.status==="completed").length')==1,'STOP does not fabricate a failure or completed attempt')
 nav(page,'library');page.locator('[data-action="configure"][data-id="TRG-003"]').click();page.locator('[name="channel"]').select_option('External-task preview');page.locator('[data-action="save-run"]').click();finish(page,'bounded',bad=True);check(page.locator('.metric-value').first.inner_text()=='0 / 3','Unsuccessful path remains visible after completion');check(page.evaluate('data.runs.at(-1).events.some(e=>e.type==="simulated_worksheet")'),'External-task preview captures a self-reported artifact, not a fake webhook')
 nav(page,'overview');page.screenshot(path=str(OUT/'08_workspace_with_evidence.png'),full_page=True)
 for width,height in [(390,844),(768,1024)]:
  page.set_viewport_size({'width':width,'height':height})
  for view in ['overview','library','campaigns','people','plans','actions','reports','integrations','settings']:
   nav(page,view);check(page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),f'{view} fits viewport {width}px')
  nav(page,'overview');page.screenshot(path=str(OUT/f'09_workspace_{width}.png'),full_page=True)
 page.set_viewport_size({'width':1440,'height':1050});nav(page,'plans');page.screenshot(path=str(OUT/'10_plans.png'),full_page=True)
 nav(page,'integrations');page.screenshot(path=str(OUT/'11_integrations.png'),full_page=True)
 check(not errors,'No JavaScript page errors: '+str(errors))
 report={'passed':len(checks),'checks':checks,'scope':('Hosted localhost browser with native storage and local demo database; no external integrations.' if BASE_URL else 'Rendered DOM with Chromium content injection; localStorage test double. Hosted navigation, native storage and network integrations not validated by this suite.'),'page_errors':errors}
 (OUT/'browser_results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2));b.close()
