/* Targeted mutation testing, not a claim of exhaustive mutation coverage. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');const root=path.resolve(__dirname,'../..'),source=fs.readFileSync(path.join(root,'pilot/domain.js'),'utf8'),out=[];const temp=fs.mkdtempSync(path.join(os.tmpdir(),'trg-mut-'));
const mutations=[
 ['expected_revision',"c.expectedRevision===s.revision","true"],
 ['assigned_participant',"a.participantId===actor.id","true"],
 ['persona_roles',"ROLES[c.type].includes(actor.role)","true"],
 ['valid_retest_link',"p.scenario.retest.transferFrom===original.snapshot.id","true"],
 ['verified_review',"?.status!=='met'","?.status==='met'"],
 ['idempotency_signature',"s.keys[c.key].signature===signature","true"],
 ['terminal_session',"r.status==='active','The session must be active.'","true,'The session must be active.'"],
 ['event_replay',"stable(rebuilt)===stable(s)","true"]
];
for(const [name,before,after] of mutations){if(!source.includes(before)){out.push({name,status:'not_applied',reason:'Target not found'});continue;}const file=path.join(temp,name+'.js');fs.writeFileSync(file,source.replace(before,after));const r=cp.spawnSync(process.execPath,['--test','tests/pilot/test_domain.cjs'],{cwd:root,encoding:'utf8',env:{...process.env,TRG_DOMAIN_FILE:file},timeout:30000});out.push({name,status:r.status===0?'survived':'killed',exitCode:r.status});}
fs.rmSync(temp,{recursive:true,force:true});const report={scope:'Eight targeted state-engine guard mutations. Not exhaustive or independent review.',commit:process.env.TRG_SOURCE_SHA||process.env.GITHUB_SHA||'local-working-tree',results:out,killed:out.filter(x=>x.status==='killed').length,survived:out.filter(x=>x.status==='survived').length,notApplied:out.filter(x=>x.status==='not_applied').length};fs.mkdirSync(path.join(root,'qa/pilot'),{recursive:true});fs.writeFileSync(path.join(root,'qa/pilot/mutation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.survived||report.notApplied)process.exitCode=1;
