"""Small dependency/secret/executable-sink inventory. Not a penetration test."""
from pathlib import Path
import re,json,os,hashlib
R=Path(__file__).resolve().parents[1];roots=[R/'pilot',R/'backend'];files=[p for root in roots for p in root.rglob('*') if p.suffix in {'.js','.py','.sql'}]
patterns={'private_key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----','hardcoded_github_token':r'gh[pousr]_[A-Za-z0-9]{30,}','hardcoded_service_key':r'\bsk_(?:live|proj)_[A-Za-z0-9]{20,}','dynamic_eval':r'\beval\(','new_Function':r'new\s+Function\('}
findings=[]
for p in files:
 s=p.read_text()
 for name,pat in patterns.items():
  for match in re.finditer(pat,s):findings.append({'path':str(p.relative_to(R)),'line':s[:match.start()].count('\n')+1,'rule':name})
report={'commit':os.getenv('TRG_SOURCE_SHA',os.getenv('GITHUB_SHA','local-working-tree')),'filesScanned':len(files),'findings':findings,'scope':'Targeted source patterns only. No credentials were read; no independent penetration test. Public browser personas are explicitly NOT authentication.','runtimeDependencyManifest':'No npm runtime packages. axe-core and Playwright are test-only.'};(R/'qa/pilot/source-check.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2));raise SystemExit(1 if findings else 0)
