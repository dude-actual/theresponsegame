import importlib.util,tempfile,pathlib,unittest
spec=importlib.util.spec_from_file_location('trgserver',pathlib.Path(__file__).parents[1]/'backend'/'server.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class DatabaseTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.s=m.DemoStore(pathlib.Path(self.tmp.name)/'test.db')
 def tearDown(self):self.s.conn.close();self.tmp.cleanup()
 def state(self,name):
  return dict(schemaVersion=1,people=[dict(id='p1',name=name,group='IMT')],campaigns=[],runs=[],actions=[],plans=[],audit=[],configs={},settings={},activeRun=None)
 def test_workspace_partition(self):
  self.s.save('atlas',self.state('Atlas person'));self.s.save('civic',self.state('Civic person'))
  self.assertEqual(self.s.load('atlas')['people'][0]['name'],'Atlas person');self.assertEqual(self.s.load('civic')['people'][0]['name'],'Civic person')
 def test_unknown_workspace_rejected(self):
  with self.assertRaises(ValueError):self.s.load('unknown')
 def test_duplicate_record_rejected(self):
  s=self.state('x');s['people'].append(s['people'][0])
  with self.assertRaises(ValueError):self.s.save('atlas',s)
 def test_event_immutable(self):
  s=self.state('x');s['runs']=[{'id':'r1','events':[{'id':'e1','type':'decision','value':'original'}]}];self.s.save('atlas',s)
  s['runs'][0]['events'][0]['value']='changed'
  with self.assertRaises(ValueError):self.s.save('atlas',s)
  self.assertEqual(self.s.load('atlas')['runs'][0]['events'][0]['value'],'original')
 def test_groups_are_relational(self):
  self.s.save('atlas',self.state('x'));self.assertEqual(self.s.conn.execute('SELECT count(*) FROM group_members WHERE workspace_id=?',('atlas',)).fetchone()[0],1)
if __name__=='__main__':unittest.main()
