# check_mapping.py
# Cek konsistensi bank soal vs topic_index.json (MISSING/UNUSED)

from __future__ import annotations
from collections import defaultdict
from .common import load_all_banks, load_topic_index

def _norm(s: str) -> str:
    return (s or "").strip().replace(" ", "_").lower()

def main():
    banks = load_all_banks()
    mapping = load_topic_index()

    used = defaultdict(set)
    for m, bank in banks.items():
        for q in bank.get("soal", []):
            used[m].add(_norm(q.get("topik", "")))

    missing, unused = [], []
    for m, s_used in used.items():
        s_map = set(mapping.get(m, []))
        miss = sorted(s_used - s_map)
        un = sorted(s_map - s_used)
        if miss: missing.append((m, miss))
        if un:   unused.append((m, un))

    if not missing and not unused:
        print("Mapping konsisten dengan bank soal ✅"); return

    if missing:
        print("\n[MISSING] Topik dipakai di soal tapi tidak ada di mapping:")
        for m, arr in missing: print(f" - {m}: {', '.join(arr)}")

    if unused:
        print("\n[UNUSED] Topik ada di mapping tapi tidak dipakai di soal:")
        for m, arr in unused: print(f" - {m}: {', '.join(arr)}")

if __name__ == "__main__":
    main()
