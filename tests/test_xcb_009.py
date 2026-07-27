import importlib.util, json, tempfile, unittest
from pathlib import Path
P=Path(__file__).parents[1]/"scripts"/"xcb_009_admit.py"
S=importlib.util.spec_from_file_location("xcb",P); M=importlib.util.module_from_spec(S); S.loader.exec_module(M)
class AdmissionTests(unittest.TestCase):
 def test_repository_admits(self):
  r=M.admit(Path(__file__).parents[1],"test","pull_request","contents:read")
  self.assertEqual(r["truth_state"],"ADMITTED"); self.assertTrue(r["warden"]["evidence"]); self.assertTrue(r["xer"]["evidence"])
 def test_missing_warden_fails_closed(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d); (root/"governance/xcb-009").mkdir(parents=True)
   for n in ("contract.json","xer.json"): (root/"governance/xcb-009"/n).write_bytes((Path(__file__).parents[1]/"governance/xcb-009"/n).read_bytes())
   with self.assertRaises(ValueError): M.admit(root,"test","push","read")
 def test_invalid_xer_state_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d); (root/"governance/xcb-009").mkdir(parents=True)
   for n in ("contract.json","warden.json","xer.json"): (root/"governance/xcb-009"/n).write_bytes((Path(__file__).parents[1]/"governance/xcb-009"/n).read_bytes())
   p=root/"governance/xcb-009/xer.json"; x=json.loads(p.read_text()); x["state"]="UNVERIFIED"; p.write_text(json.dumps(x))
   with self.assertRaises(ValueError): M.admit(root,"test","push","read")
if __name__=="__main__": unittest.main()
