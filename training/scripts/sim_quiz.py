# sim_quiz.py
"""
Simulasi kuis interaktif (CLI) untuk LearnCheck.
- Ambil soal dari training/soal/*.json (mendukung opsi A–E)
- Tanyakan ke pengguna (interaktif) ATAU auto-random (--auto)
- Nilai langsung
- Berikan materi remedial utk jawaban salah (berdasar mapping/materi_index.json;
  fallback ke paragraf awal materi mapel bila index tak tersedia)
- Log jawaban ke training/jawaban/siswa_jawaban.csv
- (Opsional) materialize artefak resmi guru: gradebook + remedial JSON

Contoh:
python -m training.scripts.sim_quiz --mapel ipa biologi --n 5 \
  --student-id S1 --student-name "Demo" --materialize
"""

from __future__ import annotations
import argparse, csv, json, random, sys, subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple
from .common import (
    SOAL_DIR, TRAINING_DIR, JAWABAN_DIR,
    load_bank_soal, filter_questions, pick_questions, load_all_banks
)

MAPPING_DIR = TRAINING_DIR / "mapping"
MATERI_DIR = TRAINING_DIR / "materi"

CHOICES = ["A","B","C","D","E"]

# ---------- Materi helpers ----------
def _load_json(p: Path, default):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default

def _fallback_snippet(mapel: str, topic_hint: str="") -> str:
    for ext in (".txt",".md"):
        f = MATERI_DIR / f"{mapel}{ext}"
        if f.exists():
            text = f.read_text(encoding="utf-8")
            parts = [p.strip() for p in text.split("\n\n") if p.strip()]
            if topic_hint:
                # pilih paragraf yang mengandung kata topik
                t = topic_hint.replace("_"," ").lower()
                for p in parts:
                    if t in p.lower():
                        return p[:500]
            return (parts[0][:500] if parts else text[:500])
    return ""

def _best_snippet(mapel: str, topik: str) -> str:
    idx = _load_json(MAPPING_DIR / "materi_index.json", {})
    cand = idx.get(mapel.lower(), {}).get(topik.lower(), [])
    if cand:
        return (cand[0].get("snippet") or "")[:500]
    return _fallback_snippet(mapel, topik)

# ---------- Kumpulan soal ----------
def build_question_set(targets: List[str], n_per_mapel: int,
                       topik: List[str] | None, tingkat: List[str] | None,
                       seed: int | None, allow_duplicate=False) -> List[Dict]:
    out: List[Dict] = []
    for m in targets:
        bank = load_bank_soal(m)
        cand = filter_questions(bank, topik=topik, tingkat=tingkat)
        if not cand: continue
        take = pick_questions(cand, n=n_per_mapel, seed=seed, allow_duplicate=allow_duplicate)
        for q in take:
            qq = dict(q)
            qq["mapel"] = m
            out.append(qq)
    random.Random(seed).shuffle(out)
    return out

def fmt_opsi(opsi: Dict) -> str:
    return "\n".join([
        f"  A. {opsi.get('A','')}",
        f"  B. {opsi.get('B','')}",
        f"  C. {opsi.get('C','')}",
        f"  D. {opsi.get('D','')}",
        f"  E. {opsi.get('E','')}",
    ])

def normalize_choice(s: str) -> str:
    if s is None: return ""
    s = str(s).strip().upper()
    for ch in s:
        if ch in CHOICES: return ch
    for ch in s:
        if ch in "12345": return "ABCDE"[int(ch)-1]
    return ""

# ---------- Logging ----------
def append_answers_csv(rows: List[Dict], path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    need_header = not path.exists() or path.stat().st_size == 0
    cols = ["student_id","student_name","session_id","timestamp_ms",
            "mapel","question_id","chosen"]
    with path.open("a", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        if need_header: w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k,"") for k in cols})

# ---------- Main ----------
def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--mapel", nargs="+", help="Daftar mapel, contoh: ipa biologi")
    g.add_argument("--all", action="store_true", help="Pakai semua mapel di training/soal/")
    ap.add_argument("--topik", nargs="*", help="Filter topik (opsional)")
    ap.add_argument("--tingkat", nargs="*", help="Filter tingkat: mudah/sedang/sulit")
    ap.add_argument("--n", type=int, required=True, help="Jumlah soal per mapel")
    ap.add_argument("--seed", type=int, help="Seed RNG")
    ap.add_argument("--allow-duplicate", action="store_true")
    ap.add_argument("--auto", action="store_true", help="Jawab otomatis (random) untuk simulasi cepat")
    ap.add_argument("--student-id", default="S1")
    ap.add_argument("--student-name", default="Demo User")
    ap.add_argument("--session-id", default=None, help="Isi sendiri; default akan dibuat otomatis")
    ap.add_argument("--materialize", action="store_true",
                    help="Setelah simulasi, jalankan penilaian & remedial resmi (gradebook.json + remedial_for_guru.json)")
    args = ap.parse_args()

    # tentukan target mapel
    targets = sorted([p.stem for p in SOAL_DIR.glob("*.json")]) if args.all else [m.lower() for m in args.mapel]
    session_id = args.session_id or f"{args.student_id}-{int(datetime.utcnow().timestamp()*1000)}"
    rng = random.Random(args.seed)

    # ambil set soal
    qs = build_question_set(targets, args.n, args.topik, args.tingkat, args.seed, args.allow_duplicate)
    if not qs:
        print("Tidak ada soal yang cocok filter."); sys.exit(1)

    print(f"\n=== SIMULASI KUIS ({len(qs)} soal) ===")
    print(f"Student : {args.student_name} ({args.student_id})")
    print(f"Session : {session_id}\n")

    answers = []
    benar = 0
    per_mapel = {m: {"bobot":0, "skor":0, "benar":0, "total":0} for m in targets}
    wrong_items = []

    for i, q in enumerate(qs, 1):
        m = q.get("mapel","")
        teks = q.get("teks","")
        opsi = q.get("opsi",{})
        kunci = (q.get("kunci") or "").upper()
        bobot = int(q.get("bobot",1))
        print(f"\n[{i}/{len(qs)}] {m.upper()} | {q.get('topik','')}")
        print(teks)
        print(fmt_opsi(opsi))

        if args.auto:
            chosen = rng.choice(CHOICES if opsi.get("E","") else CHOICES[:4])
            print(f"-> Auto answer: {chosen}")
        else:
            while True:
                chosen = normalize_choice(input("Jawaban (A/B/C/D/E atau 1-5): "))
                if chosen in CHOICES or chosen == "":
                    break
                print("  Input tidak valid.")
        is_correct = (chosen == kunci)
        if is_correct: benar += 1
        else:
            wrong_items.append({
                "mapel": m, "topik": q.get("topik",""), "id": q.get("id",""),
                "chosen": chosen, "kunci": kunci
            })

        # akumulasi stats
        fm = per_mapel[m]
        fm["bobot"] += bobot
        fm["skor"]  += (bobot if is_correct else 0)
        fm["benar"] += (1 if is_correct else 0)
        fm["total"] += 1

        # simpan baris untuk CSV
        answers.append({
            "student_id": args.student_id,
            "student_name": args.student_name,
            "session_id": session_id,
            "timestamp_ms": str(int(datetime.utcnow().timestamp()*1000)),
            "mapel": m,
            "question_id": str(q.get("id","")),
            "chosen": chosen
        })

    # simpan ke siswa_jawaban.csv
    append_answers_csv(answers, JAWABAN_DIR / "siswa_jawaban.csv")

    # tampilkan ringkasan
    print("\n=== HASIL ===")
    total = len(qs)
    print(f"Skor: {benar}/{total} benar ({(100.0*benar/total):.2f}%)")
    for m, st in per_mapel.items():
        if st["total"] == 0: continue
        pct = 100.0*st["skor"]/max(1, st["bobot"])
        print(f" - {m}: {st['benar']}/{st['total']} benar ({pct:.2f}%)")

    # tampilkan remedial untuk jawaban salah
    if wrong_items:
        print("\n=== REMEDIAL (untuk yang salah) ===")
        for it in wrong_items:
            snip = _best_snippet(it["mapel"], it["topik"]) or "(Belum ada materi yang diindeks untuk topik ini)"
            print(f"\n[{it['mapel'].upper()}] {it['id']} | topik: {it['topik']}")
            print(f"  Jawaban kamu: {it['chosen']} | Kunci: {it['kunci']}")
            print(f"  Materi disarankan:\n  {snip}")
    else:
        print("\nTidak ada jawaban salah. Mantap!")

    # materialize artefak resmi untuk guru
    if args.materialize:
        out_dir = JAWABAN_DIR / "out"
        cmd1 = [sys.executable, "-m", "training.scripts.evaluate_answers",
                "--in", str(JAWABAN_DIR / "siswa_jawaban.csv"),
                "--out-dir", str(out_dir)]
        cmd2 = [sys.executable, "-m", "training.scripts.assign_remedial",
                "--scored", str(out_dir / "siswa_jawaban_scored.csv")]
        print("\nMenulis artefak resmi guru (gradebook + remedial JSON)...")
        subprocess.run(cmd1, check=True)
        subprocess.run(cmd2, check=True)
        print("Selesai. Lihat: training/jawaban/gradebook.json dan remedial_for_guru.json")

if __name__ == "__main__":
    main()
