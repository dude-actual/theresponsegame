"""Real loopback HTTP and database checks. No browser or external provider implied."""
import http.client, importlib.util, json, tempfile, threading, unittest
from pathlib import Path
P=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('demo',P/'backend/server.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class HTTPTests(unittest.TestCase):
 @classmethod
 def setUpClass(c):
  c.tmp=tempfile.TemporaryDirectory();c.server=m.ThreadingHTTPServer(('127.0.0.1',0),m.Handler);c.server.store=m.DemoStore(Path(c.tmp.name)/'test.sqlite3');c.thread=threading.Thread(target=c.server.serve_forever,daemon=True);c.thread.start();c.port=c.server.server_port
 @classmethod
 def tearDownClass(c):c.server.shutdown();c.server.server_close();c.server.store.conn.close();c.tmp.cleanup()
 def request(self,method,path,body=None,headers=None):
  con=http.client.HTTPConnection('127.0.0.1',self.port,timeout=4);con.request(method,path,body,headers or {});r=con.getresponse();b=r.read();status=r.status;con.close();return status,b
 def test_health(self):
  status,b=self.request('GET','/api/health');self.assertEqual(status,200);self.assertEqual(json.loads(b)['mode'],'local-demo')
 def test_static(self):
  status,b=self.request('GET','/');self.assertEqual(status,200);self.assertIn(b'The Response Game',b)
 def test_host(self):self.assertEqual(self.request('GET','/api/health',headers={'Host':'evil.invalid'})[0],403)
 def test_origin(self):self.assertEqual(self.request('GET','/api/health',headers={'Origin':'https://evil.invalid'})[0],403)
 def test_private_paths(self):
  for path in ['/backend/server.py','/.env','/.local/test.sqlite3','/qa/ui.sqlite3']:
   with self.subTest(path=path):self.assertEqual(self.request('GET',path)[0],403)
 def test_mime(self):self.assertEqual(self.request('PUT','/api/workspaces/atlas/state','{}',{'Content-Type':'text/plain'})[0],415)
 def test_round_trip(self):
  state={'schemaVersion':1,'people':[],'campaigns':[],'runs':[],'actions':[],'plans':[],'audit':[],'activeRun':None,'settings':{'label':'HTTP test only'},'configs':{}}
  self.assertEqual(self.request('PUT','/api/workspaces/atlas/state',json.dumps(state),{'Content-Type':'application/json'})[0],200)
  status,b=self.request('GET','/api/workspaces/atlas/state');self.assertEqual(status,200);self.assertEqual(json.loads(b)['state']['settings']['label'],'HTTP test only')
  status,b=self.request('GET','/api/workspaces/civic/state');self.assertIsNone(json.loads(b)['state'])
 def test_unknown_workspace(self):self.assertEqual(self.request('GET','/api/workspaces/not-an-org/state')[0],404)
if __name__=='__main__':unittest.main()
