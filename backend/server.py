#!/usr/bin/env python3
"""Loopback-only development database. NOT a production tenant/authentication server.
Run: python backend/server.py --port 8080
All contacts should be fictional. Stores entities relationally in local SQLite.
"""
from __future__ import annotations
import argparse, json, mimetypes, sqlite3, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT=Path(__file__).resolve().parents[1]
WORKSPACES={'atlas','civic'}
ENTITIES=('people','campaigns','runs','actions','plans','audit')

class DemoStore:
    def __init__(self,path:Path):
        path.parent.mkdir(parents=True,exist_ok=True)
        self.conn=sqlite3.connect(path,check_same_thread=False)
        self.lock=threading.RLock()
        self.conn.execute('PRAGMA foreign_keys=ON')
        self.conn.execute('CREATE TABLE IF NOT EXISTS workspace (id TEXT PRIMARY KEY, meta TEXT NOT NULL)')
        for table in (*ENTITIES,'events','observations','groups'):
            self.conn.execute(f'CREATE TABLE IF NOT EXISTS {table} (workspace_id TEXT NOT NULL REFERENCES workspace(id), id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(workspace_id,id))')
        self.conn.execute('CREATE TABLE IF NOT EXISTS group_members (workspace_id TEXT NOT NULL, group_id TEXT NOT NULL, person_id TEXT NOT NULL, PRIMARY KEY(workspace_id,group_id,person_id), FOREIGN KEY(workspace_id,person_id) REFERENCES people(workspace_id,id))')
        self.conn.commit()
    @staticmethod
    def encode(obj):return json.dumps(obj,separators=(',',':'),sort_keys=True)
    def load(self,w):
        if w not in WORKSPACES:raise ValueError('Unknown demonstration workspace')
        with self.lock:
            row=self.conn.execute('SELECT meta FROM workspace WHERE id=?',(w,)).fetchone()
            if not row:return None
            state=json.loads(row[0])
            for table in ENTITIES:
                state[table]=[json.loads(r[0]) for r in self.conn.execute(f'SELECT payload FROM {table} WHERE workspace_id=? ORDER BY rowid',(w,))]
            return state
    def save(self,w,state):
        if w not in WORKSPACES:raise ValueError('Unknown demonstration workspace')
        if not isinstance(state,dict) or state.get('schemaVersion')!=1:raise ValueError('Unsupported state schema')
        for table in ENTITIES:
            if not isinstance(state.get(table),list) or len(state[table])>5000:raise ValueError('Invalid entity collection: '+table)
            ids=[r.get('id') for r in state[table] if isinstance(r,dict)]
            if len(ids)!=len(state[table]) or any(not isinstance(i,str) or len(i)>180 for i in ids) or len(ids)!=len(set(ids)):raise ValueError('Invalid or duplicate entity IDs: '+table)
        meta={k:v for k,v in state.items() if k not in ENTITIES}
        with self.lock,self.conn:
            self.conn.execute('INSERT INTO workspace VALUES (?,?) ON CONFLICT(id) DO UPDATE SET meta=excluded.meta',(w,self.encode(meta)))
            self.conn.execute('DELETE FROM group_members WHERE workspace_id=?',(w,))
            for table in ENTITIES:
                self.conn.execute(f'DELETE FROM {table} WHERE workspace_id=?',(w,))
                self.conn.executemany(f'INSERT INTO {table} VALUES (?,?,?)',[(w,r['id'],self.encode(r)) for r in state[table]])
            self.conn.execute('DELETE FROM groups WHERE workspace_id=?',(w,))
            for g in {p.get('group','Unassigned') for p in state['people']}:
                self.conn.execute('INSERT INTO groups VALUES (?,?,?)',(w,g,self.encode({'name':g})))
            self.conn.executemany('INSERT INTO group_members VALUES (?,?,?)',[(w,p.get('group','Unassigned'),p['id']) for p in state['people']])
            all_runs=state['runs']+([state['activeRun']] if state.get('activeRun') else [])
            for run in all_runs:
                for table,key in [('events','events'),('observations','observations')]:
                    for item in run.get(key,[]):
                        encoded=self.encode(item);old=self.conn.execute(f'SELECT payload FROM {table} WHERE workspace_id=? AND id=?',(w,item['id'])).fetchone()
                        if old and old[0]!=encoded:raise ValueError('Recorded '+table+' are immutable in this local database')
                        self.conn.execute(f'INSERT OR IGNORE INTO {table} VALUES (?,?,?)',(w,item['id'],encoded))

class Handler(SimpleHTTPRequestHandler):
    server_version='TRGLocalDemo/1.0'
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Cache-Control','no-store')
        super().end_headers()
    def allowed(self):
        allowed={f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
        if self.headers.get('Host') not in allowed:return False
        origin=self.headers.get('Origin')
        return not origin or origin in {'http://'+a for a in allowed}
    def respond(self,status,obj):
        b=json.dumps(obj).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
    def state_workspace(self):
        parts=urlparse(self.path).path.strip('/').split('/')
        return parts[2] if len(parts)==4 and parts[:2]==['api','workspaces'] and parts[3]=='state' else None
    def do_GET(self):
        if not self.allowed():return self.respond(403,{'error':'Loopback host and same-origin access only'})
        path=unquote(urlparse(self.path).path)
        if path=='/api/health':return self.respond(200,{'mode':'local-demo','version':'1.0.0','authentication':'none: fictional-data development server only'})
        w=self.state_workspace()
        if w:
            try:return self.respond(200,{'state':self.server.store.load(w)})
            except ValueError as e:return self.respond(404,{'error':str(e)})
        if path.startswith('/api/'):return self.respond(404,{'error':'No such API'})
        if any(x.startswith('.') or x in {'backend','__pycache__'} for x in path.split('/') if x) or Path(path).suffix in {'.sqlite3','.db','.log','.pid'}:return self.respond(403,{'error':'Private development path'})
        target=(ROOT/path.lstrip('/')).resolve()
        if not target.is_relative_to(ROOT):return self.respond(403,{'error':'Invalid path'})
        if target.is_dir() and path not in {'/',''}:return self.respond(403,{'error':'Directory listings disabled'})
        return super().do_GET()
    def do_PUT(self):
        if not self.allowed():return self.respond(403,{'error':'Loopback host and same-origin access only'})
        w=self.state_workspace()
        if not w:return self.respond(404,{'error':'No such API'})
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':return self.respond(415,{'error':'JSON required'})
        try:length=int(self.headers.get('Content-Length','0'))
        except ValueError:return self.respond(400,{'error':'Invalid content length'})
        if not 0<length<=3_000_000:return self.respond(413,{'error':'Body must be 1 byte to 3 MB'})
        try:
            state=json.loads(self.rfile.read(length));self.server.store.save(w,state)
            return self.respond(200,{'saved':True,'mode':'local-demo'})
        except (ValueError,TypeError,KeyError) as e:return self.respond(400,{'error':str(e)})
    def log_message(self,format,*args):
        print('[local-demo] '+format%args)

def main():
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8080);p.add_argument('--db',type=Path,default=ROOT/'.local'/'demo.sqlite3');a=p.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',a.port),Handler);server.store=DemoStore(a.db)
    print(f'TRG local demonstration: http://127.0.0.1:{a.port} | SQLite: {a.db}',flush=True)
    print('Not a production server. No authentication. Fictional demonstration data only.',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close();server.store.conn.close()
if __name__=='__main__':main()
