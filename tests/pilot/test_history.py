import importlib.util,pathlib,tempfile,unittest,copy
ROOT=pathlib.Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('db',ROOT/'backend/server.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class HistoryTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.db=m.DemoStore(pathlib.Path(self.tmp.name)/'db.sqlite3');self.s=dict(schemaVersion=1,people=[],campaigns=[],runs=[{'id':'old','status':'completed','events':[{'id':'event-1','type':'finished'}],'draft':{'known':'Synthetic original'}}],actions=[],plans=[],audit=[],activeRun=None);self.db.save('atlas',self.s)
 def tearDown(self):self.db.conn.close();self.tmp.cleanup()
 def test_removal_rejected(self):
  x=copy.deepcopy(self.s);x['runs']=[]
  with self.assertRaisesRegex(ValueError,'Terminal'):self.db.save('atlas',x)
  self.assertEqual(self.db.load('atlas')['runs'],self.s['runs'])
 def test_alteration_rejected(self):
  x=copy.deepcopy(self.s);x['runs'][0]['draft']['known']='Changed'
  with self.assertRaisesRegex(ValueError,'Terminal'):self.db.save('atlas',x)
 def test_append_allowed(self):
  x=copy.deepcopy(self.s);x['runs'].append({'id':'new','status':'running','events':[]});self.db.save('atlas',x);self.assertEqual(len(self.db.load('atlas')['runs']),2)
 def test_rollback_restores_legacy_database(self):
  dump='\n'.join(self.db.conn.iterdump());import sqlite3
  restored=sqlite3.connect(':memory:');restored.executescript(dump);self.assertEqual(restored.execute('SELECT payload FROM runs').fetchone()[0],self.db.conn.execute('SELECT payload FROM runs').fetchone()[0]);restored.close()
if __name__=='__main__':unittest.main()
