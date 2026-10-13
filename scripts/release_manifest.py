"""Generate a Jekyll release manifest; GitHub Pages fills the exact build SHA/time."""
from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1]
files=['index.html','styles.css','app.js','engine.js','catalog.js','trg-sw.js']+[str(p.relative_to(R)) for p in sorted((R/'pilot').glob('*')) if p.is_file()]
r={'version':'2.0.0-eval','environment':'public-evaluation / fictional browser rehearsal','sourceCommit':'{{ site.github.build_revision }}','buildTime':'{{ site.time | date_to_xmlschema }}','manifestKind':'static build metadata, not a live service health check','identity':'Not authenticated; rehearsal personas only','storage':'Browser IndexedDB; not secure production tenancy','liveCommunications':False,'contentApproval':'Authored; practitioner review required','sourceHashes':{f:hashlib.sha256((R/f).read_bytes()).hexdigest() for f in files}}
header='---\nlayout: null\n---\n'
for name in ['release.json','health.json']:(R/name).write_text(header+json.dumps(r,indent=2)+'\n')
