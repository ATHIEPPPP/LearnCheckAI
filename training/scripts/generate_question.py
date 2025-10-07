# generate_question.py — generator set soal lintas mapel (A–E)

from __future__ import annotations
import argparse, json, csv
from pathlib import Path
from datetime import datetime
from typing import List, Dict
from .common import load_bank_soal, SOAL_DIR, filter_questions, pick_questions

def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--mapel", nargs="+", help="Satu/lebih mapel spesifik (nama file tanpa .json).")
    g.add_argument("--all", action="store_true", help="Gunakan semua mapel di training/soal/")
    ap.add_argument("--topik", nargs="*", help="Filter topik (opsional).")
    ap.add_argument("--tingkat", nargs="*", help="Filter tingkat: mudah/sedang/sulit (opsional).")
    ap.add_argument("--n", type=int, required=True, help="Jumlah soal per sampling.")
    ap.add_argument("--seed", type=int, help="Seed random (opsional).")
    ap.add_argument("--allow-duplicate", action="store_true", help="Sampling dengan pengulangan.")
    ap.add_argument("--format", choices=["json", "csv"], default="json")
    ap.add_argument("--out", type=Path, required=True, help="File output.")
    args = ap.parse_args()

    targets = sorted([p.stem for p in SOAL_DIR.glob("*.json")]) if args.all else [m.lower() for m in args.mapel]

    generated: List[Dict] = []
    for m in targets:
        bank = load_bank_soal(m)
        cand = filter_questions(bank, topik=args.topik, tingkat=args.tingkat)
        if not cand: continue
        take = pick_questions(cand, n=args.n, seed=args.seed, allow_duplicate=args.allow_duplicate)
        for q in take: generated.append({**q, "mapel": m})

    args.out.parent.mkdir(parents=True, exist_ok=True)
    if args.format == "json":
        out = {"generated_at": datetime.utcnow().isoformat() + "Z", "mapel": targets, "n_total": len(generated), "soal": generated}
        args.out.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        header = ["idx","mapel","id","topik","tingkat","teks","A","B","C","D","E","kunci","bobot","sumber"]
        with args.out.open("w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh); w.writerow(header)
            for i, q in enumerate(generated, 1):
                o = q.get("opsi", {})
                w.writerow([
                    i, q.get("mapel",""), q.get("id",""), q.get("topik",""), q.get("tingkat",""),
                    q.get("teks",""), o.get("A",""), o.get("B",""), o.get("C",""), o.get("D",""), o.get("E",""),
                    q.get("kunci",""), q.get("bobot",1), q.get("sumber","")
                ])
    print(f"OK: dibuat {args.format.upper()} → {args.out}")

if __name__ == "__main__":
    main()
