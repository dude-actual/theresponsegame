"""Lexical meaning proxy + structural repetition screening, NOT human semantic validation."""
import json,re,itertools,math,subprocess,pathlib,os
R=pathlib.Path(__file__).resolve().parents[1];pack=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./pilot/pack.js')))"],cwd=R));out=R/'qa/pilot';out.mkdir(exist_ok=True)
# Bounded vocabulary normalization is transparent and reviewable; no model/API inference.
ALIASES={'notify':'notification','notifying':'notification','inform':'notification','confirm':'verify','verified':'verify','reconcile':'verify','handoff':'handover','crew':'resource','crews':'resource','pump':'resource','pumps':'resource','unavailable':'missing'}
STOP={'the','a','an','and','or','is','to','of','in','for','with','this','that','are','not','at','as','from','by','be','it','your','you','must'}
def tokens(x):return [ALIASES.get(t,t) for t in re.findall(r'[a-z]{3,}',x.lower()) if t not in STOP]
def parts(s):
 return {'objective':s['objective'],'prompts':' '.join(x['instruction'] for x in s['steps']),'choices':' '.join(o['label'] for x in s['steps'] for f in x['fields'] for o in f.get('options',[])),'artifacts':json.dumps([x['artifacts'] for x in s['steps']]),'consequences':json.dumps([x.get('consequences',{}) for x in s['steps']]),'debrief':json.dumps(s.get('debrief',{})),'structure':[(x['id'],[(f['type'],f.get('expected')) for f in x['fields']]) for x in s['steps']]}
def similarity(a,b):
 A=set(tokens(a));B=set(tokens(b));return round(len(A&B)/len(A|B),3) if A|B else 1
flags=[]
for a,b in itertools.combinations(pack,2):
 A,B=parts(a),parts(b);score={k:similarity(A[k],B[k]) for k in A if k!='structure'};same=A['structure']==B['structure'];high=[k for k,v in score.items() if v>=.70]
 if high or same:flags.append({'left':a['id'],'right':b['id'],'similarity':score,'identicalStructure':same,'flaggedDimensions':high,'humanReview':'pending','decision':None})
legacy=json.loads((R/'assets/catalog.json').read_text());legacy=legacy if isinstance(legacy,list) else legacy['scenarios'];groups={}
for s in legacy:groups.setdefault(s['pattern'],[]).append(s['id'])
report={'commit':os.getenv('TRG_SOURCE_SHA',os.getenv('GITHUB_SHA','local-working-tree')),'method':'Token alias normalization, Jaccard similarity at 0.70, and interaction structure. Lexical/structural screening, not a full semantic embedding model or professional validity judgment.','packRecords':len(pack),'baseExperiences':4,'transferConditions':2,'legacyStarterRecords':len(legacy),'legacySharedPatternGroups':groups,'flags':flags,'approval':'No flag is automatically approved or rejected.'};(out/'content-repetition.json').write_text(json.dumps(report,indent=2));print(json.dumps({'packRecords':6,'flaggedPairs':len(flags),'humanReview':'pending'}))
