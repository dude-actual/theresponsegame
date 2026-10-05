import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export function checkRange(cwd,base,head){execFileSync('git',['diff','--check',`${base}..${head}`],{cwd,stdio:'pipe'});}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
 const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
 const event=process.env.GITHUB_EVENT_PATH?JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')):{};
 const head=event.pull_request?.head.sha||process.env.GITHUB_SHA||git('rev-parse','HEAD');
 let base=event.pull_request?.base.sha||event.before;
 if(!base||/^0+$/.test(base)){try{base=git('rev-parse',`${head}^`);}catch{base=execFileSync('git',['hash-object','-t','tree','--stdin'],{input:'',encoding:'utf8'}).trim();}}
 if(event.pull_request)base=git('merge-base',base,head);
 try{checkRange(process.cwd(),base,head);console.log(`Committed change verified: ${base}..${head}`);}catch(e){process.stderr.write(e.stdout||e.message);process.exit(1);}
}
