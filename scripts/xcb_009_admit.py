#!/usr/bin/env python3
"""Repository-local XCB-009 fail-closed admission."""
import argparse, hashlib, json, sys, time
from pathlib import Path

def load(path):
    value=json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value,dict): raise ValueError(f"{path} must be an object")
    return value

def admit(root,cell,event,authority):
    if not all(x.strip() for x in (cell,event,authority)): raise ValueError("cell, event, and authority are required")
    contract=load(root/"governance/xcb-009/contract.json")
    if contract.get("id")!="XCB-009" or contract.get("scope")!="**" or contract.get("exemptions")!=[]: raise ValueError("universal contract invariant violated")
    evidence={}
    expected={"warden":("XGW-001","VALIDATED"),"xer":("XER-001","LOADED")}
    for system,(identity,state) in expected.items():
        paths=contract.get("required_assets",{}).get(system,[])
        if not paths: raise ValueError(f"{system} assets missing from contract")
        evidence[system]=[]
        for rel in paths:
            path=root/rel
            if not path.is_file(): raise ValueError(f"required {system} asset missing: {rel}")
            data=load(path)
            if data.get("id")!=identity or data.get("state")!=state: raise ValueError(f"{system} identity/state invalid")
            evidence[system].append({"path":rel,"sha256":hashlib.sha256(path.read_bytes()).hexdigest()})
    core={"cell_id":cell,"event":event,"authority":authority,"contract":"XCB-009","warden":{"state":"VALIDATED","evidence":evidence["warden"]},"xer":{"state":"LOADED","evidence":evidence["xer"]}}
    rid="xcb-009-"+hashlib.sha256(json.dumps(core,sort_keys=True,separators=(",",":")).encode()).hexdigest()[:20]
    return {**core,"receipt_id":rid,"truth_state":"ADMITTED","fail_closed":True,"issued_at":int(time.time())}

def main():
    p=argparse.ArgumentParser(); p.add_argument("--root",type=Path,default=Path(__file__).resolve().parents[2]); p.add_argument("--cell",required=True); p.add_argument("--event",required=True); p.add_argument("--authority",required=True); p.add_argument("--output",type=Path); a=p.parse_args()
    try: receipt=admit(a.root.resolve(),a.cell,a.event,a.authority)
    except Exception as exc: print(json.dumps({"truth_state":"BLOCKED","fail_closed":True,"blocker":str(exc)})); return 2
    payload=json.dumps(receipt,indent=2,sort_keys=True)+"\n"
    if a.output: a.output.parent.mkdir(parents=True,exist_ok=True); a.output.write_text(payload,encoding="utf-8")
    print(payload,end=""); return 0
if __name__=="__main__": sys.exit(main())
