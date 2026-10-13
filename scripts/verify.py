"""One reproducible command runner; failures are recorded, never silently retried."""
import subprocess,json,os,time,platform,pathlib,re
R=pathlib.Path(__file__).resolve().parents[1];OUT=R/'qa/pilot';OUT.mkdir(parents=True,exist_ok=True)
commands=[['node','--check',f] for f in ['app.js','engine.js','catalog.js','trg-sw.js','pilot/domain.js','pilot/pack.js','pilot/store.js','pilot/ui.js']]+[['node','tests/test_engine.cjs'],['node','tests/pilot/test_ui_views.cjs'],['node','--test','tests/pilot/test_domain.cjs','tests/pilot/test_regressions.cjs','tests/pilot/test_store.cjs'],['python','tests/test_database.py'],['python','tests/test_http.py'],['python','tests/pilot/test_history.py'],['node','tests/pilot/mutation.cjs'],['node','tests/pilot/performance.cjs'],['python','tests/pilot/test_content_audit.py'],['python','scripts/content_audit.py']]
report={'commit':os.getenv('TRG_SOURCE_SHA',os.getenv('GITHUB_SHA','local-working-tree')),'environment':{'python':platform.python_version(),'platform':platform.platform()},'dataClass':'synthetic fixtures','results':[],'quarantined':0}
for i,c in enumerate(commands):
 t=time.monotonic();p=subprocess.run(c,cwd=R,text=True,capture_output=True,timeout=120);log=p.stdout+'\n'+p.stderr;path=OUT/f'command-{i+1:02d}.log';path.write_text(log)
 report['results'].append({'command':' '.join(c),'exitCode':p.returncode,'durationSeconds':round(time.monotonic()-t,3),'artifact':str(path.relative_to(R)),'passed':p.returncode==0,'summary':log[-1200:]})
 print('PASS' if p.returncode==0 else 'FAIL',' '.join(c),flush=True)
report['failedCommands']=sum(x['exitCode']!=0 for x in report['results']);report['passedCommands']=len(commands)-report['failedCommands'];(OUT/'commands.json').write_text(json.dumps(report,indent=2));raise SystemExit(1 if report['failedCommands'] else 0)
