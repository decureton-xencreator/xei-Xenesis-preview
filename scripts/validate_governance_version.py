#!/usr/bin/env python3
"""Fail closed when public governance declarations drift from the authority lock."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCK = ROOT / "governance" / "CANONICAL-AUTHORITY-LOCK.json"

def fail(message):
    print(f"GOVERNANCE_VERSION_DRIFT: {message}", file=sys.stderr)
    raise SystemExit(1)

try:
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    fail(f"authority lock unreadable: {exc}")

am = lock.get("authorities", {}).get("AM-002")
if not re.fullmatch(r"\d+\.\d+", str(am or "")):
    fail("AM-002 lock must be a major.minor version")

expected = {
    "README.md": [f"AM-002 Version {am}"],
    "XEN-REPOSITORY-SYNC.md": [f"AM-002 Version {am}"],
    "governance/MWI-AM-002-SYNC-2026-07-19.md": [f"AM-002 v{am}"],
    "governance/FEDERATION-CONVERSATION-CONNECTION-RECEIPT.json": [f"AM-002-v{am}"],
}
stale = re.compile(r"AM-002(?: Version| v|-)\s*v?(?!"+re.escape(am)+r"\b)\d+\.\d+")

for rel, tokens in expected.items():
    path = ROOT / rel
    if not path.is_file():
        fail(f"required declaration missing: {rel}")
    text = path.read_text(encoding="utf-8")
    for token in tokens:
        if token not in text:
            fail(f"{rel} does not declare {token}")
    match = stale.search(text)
    if match:
        fail(f"{rel} contains stale declaration {match.group(0)}")

print(f"GOVERNANCE_VERSION_ALIGNED: AM-002 v{am}; {len(expected)} declarations verified")
