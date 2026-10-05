import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const release=JSON.parse(await fs.readFile('package.json','utf8')).version;
let revision=release,missing=false;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{
 try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname==='/__qa/release'&&req.method==='POST'){let body='';for await(const part of req)body+=part;const update=JSON.parse(body);revision=update.revision||release;missing=!!update.missing;res.writeHead(200);res.end('Test fixture updated');return;}
 if(pathname==='/')pathname='/index.html';if(missing&&pathname==='/v17-scenes.js')throw Error('interrupted install');
 const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))throw Error('outside root');let data=await fs.readFile(file);
 if(['/index.html','/trg-sw.js'].includes(pathname))data=Buffer.from(data.toString().replaceAll(release,revision));
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
}).listen(8787,'127.0.0.1');
