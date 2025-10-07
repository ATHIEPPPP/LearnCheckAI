# evaluate_answers.py — penilaian + gradebook (mendukung A–E)

from __future__ import annotations
import argparse, csv, json
from pathlib import Path
from collections import defaultdict
from typing import Dict
from .common import load_all_banks, JAWABAN_DIR

CHOICES = {"A","B","C","D","E"}

def _pick(d: Dict, *names, default=""):
    for n in names:
        if n in d and d[n] not in (None, ""):
            return d[n]
    return default

def _norm_choice(x: str) -> str:
    if x is None: return ""
    s = str(x).strip().upper()
    for ch in s:
        if ch in CHOICES: return ch
    for ch in s:
        if ch in "12345": return "ABCDE"[int(ch)-1]
    return ""

def build_answer_key():
    key = {}; id_to_mapel = {}
    banks = load_all_banks()
    for m, bank in banks.items():
        for q in bank.get("soal", []):
            qid = str(q.get("id"))
            key[(m, qid)] = {
                "kunci": (q.get("kunci") or "").strip().upper(),
                "bobot": int(q.get("bobot", 1)),
                "topik": q.get("topik"),
                "tingkat": q.get("tingkat"),
            }
            id_to_mapel.setdefault(qid, set()).add(m)
    return key, id_to_mapel

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", type=Path, required=True,
                    help="CSV jawaban siswa (kolom: student_id,session_id,id_soal/jawaban_siswa)")
    ap.add_argument("--out-dir", type=Path, default=JAWABAN_DIR / "out",
                    help="Folder output rekap")
    args = ap.parse_args()

    anskey, id_to_mapel = build_answer_key()
    args.out_dir.mkdir(parents=True, exist_ok=True)

    with args.infile.open("r", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))

    scored_rows = []
    agg_sesi = defaultdict(lambda: {"benar":0,"salah":0,"skor":0,"bobot":0})
    agg_siswa = defaultdict(lambda: {"benar":0,"salah":0,"skor":0,"bobot":0})
    agg_topik = defaultdict(lambda: {"benar":0,"salah":0,"skor":0,"bobot":0})
    agg_mapel = defaultdict(lambda: {"benar":0,"salah":0,"skor":0,"bobot":0})

    gb = defaultdict(lambda: {
        "student_id":"", "student_name":"",
        "session_id":"", "mapel":"",
        "n_q":0, "benar":0, "salah":0, "skor":0, "bobot":0,
        "last_timestamp_ms":"", "by_topic": defaultdict(lambda: {"benar":0,"salah":0,"skor":0,"bobot":0,"n_q":0})
    })

    for r in rows:
        mapel = str((_pick(r, "mapel","subject","mata_pelajaran") or "")).lower()
        qid = str(_pick(r, "question_id","qid","id_soal")).strip()
        chosen = _norm_choice(_pick(r, "chosen","jawaban","jawaban_siswa","answer"))

        sid = str(_pick(r, "student_id","siswa_id","user_id"))
        sname = str(_pick(r, "student_name","nama","name"))
        sesi = str(_pick(r, "session_id","sesi_id","attempt_id"))
        ts_ms = str(_pick(r, "timestamp_ms","ts_ms","time_ms"))

        info = anskey.get((mapel, qid)) if mapel else None
        if not info and qid:
            cands = list(id_to_mapel.get(qid, []))
            if len(cands) == 1:
                mapel = cands[0]; info = anskey.get((mapel, qid))

        if not info:
            correct, score, bobot, topik, tingkat, reason = "", 0, 0, "", "", "UNKNOWN_QUESTION"
        else:
            kunci = info["kunci"]; bobot = info["bobot"]; topik = info["topik"] or ""; tingkat = info["tingkat"] or ""
            if chosen not in CHOICES:
                correct, score, reason = False, 0, "INVALID_CHOICE"
            else:
                correct = (chosen == kunci); score = bobot if correct else 0; reason = "OK"

        out_row = {**r, "mapel": mapel, "topik": topik, "tingkat": tingkat,
                   "correct": correct, "score": score, "bobot": bobot, "reason": reason}
        scored_rows.append(out_row)

        if bobot:
            agg_mapel[mapel]["bobot"] += bobot; agg_mapel[mapel]["skor"] += score
            if correct is True: agg_mapel[mapel]["benar"] += 1
            elif correct is False: agg_mapel[mapel]["salah"] += 1

            if topik:
                agg_topik[(mapel, topik)]["bobot"] += bobot; agg_topik[(mapel, topik)]["skor"] += score
                if correct is True: agg_topik[(mapel, topik)]["benar"] += 1
                elif correct is False: agg_topik[(mapel, topik)]["salah"] += 1

            if sid:
                agg_siswa[(sid, mapel)]["bobot"] += bobot; agg_siswa[(sid, mapel)]["skor"] += score
                if correct is True: agg_siswa[(sid, mapel)]["benar"] += 1
                elif correct is False: agg_siswa[(sid, mapel)]["salah"] += 1

            if sesi:
                agg_sesi[(sesi, mapel)]["bobot"] += bobot; agg_sesi[(sesi, mapel)]["skor"] += score
                if correct is True: agg_sesi[(sesi, mapel)]["benar"] += 1
                elif correct is False: agg_sesi[(sesi, mapel)]["salah"] += 1

        if sid and sesi and mapel:
            key = (sid, sesi, mapel); rec = gb[key]
            rec["student_id"]=sid; rec["student_name"]=sname; rec["session_id"]=sesi; rec["mapel"]=mapel
            rec["n_q"] += 1; rec["bobot"] += bobot; rec["skor"] += score
            if correct is True: rec["benar"] += 1
            elif correct is False: rec["salah"] += 1
            if ts_ms.isdigit():
                if not rec["last_timestamp_ms"] or int(ts_ms) > int(rec["last_timestamp_ms"]):
                    rec["last_timestamp_ms"] = ts_ms
            if topik:
                bt = rec["by_topic"][topik]
                bt["n_q"] += 1; bt["bobot"] += bobot; bt["skor"] += score
                if correct is True: bt["benar"] += 1
                elif correct is False: bt["salah"] += 1

    # Skor baris
    args.out_dir.mkdir(parents=True, exist_ok=True)
    scored_path = args.out_dir / "siswa_jawaban_scored.csv"
    with scored_path.open("w", newline="", encoding="utf-8") as fh:
        fieldnames = list(scored_rows[0].keys()) if scored_rows else []
        w = csv.DictWriter(fh, fieldnames=fieldnames); w.writeheader()
        for r in scored_rows: w.writerow(r)

    # Rekap
    def dump_agg(path: Path, rows: Dict):
        with path.open("w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            first_key = next(iter(rows.keys()), None)
            if isinstance(first_key, tuple): w.writerow(["key1","key2","benar","salah","skor","bobot","persen"])
            else: w.writerow(["key","benar","salah","skor","bobot","persen"])
            for k, v in rows.items():
                pct = (100.0 * v["skor"]/v["bobot"]) if v["bobot"] else 0.0
                if isinstance(k, tuple): w.writerow([*k, v["benar"], v["salah"], v["skor"], v["bobot"], f"{pct:.2f}"])
                else: w.writerow([k, v["benar"], v["salah"], v["skor"], v["bobot"], f"{pct:.2f}"])

    dump_agg(args.out_dir / "rekap_per_mapel.csv", agg_mapel)
    dump_agg(args.out_dir / "rekap_per_topik.csv", agg_topik)
    dump_agg(args.out_dir / "rekap_per_siswa.csv", agg_siswa)
    dump_agg(args.out_dir / "rekap_per_sesi.csv", agg_sesi)

    # Gradebook
    gradebook_csv = JAWABAN_DIR / "gradebook.csv"
    gb_cols = ["student_id","student_name","session_id","mapel","n_q","benar","salah","skor","bobot","persen","last_timestamp_ms","by_topic_json"]
    with gradebook_csv.open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=gb_cols); w.writeheader()
        for (_sid, _sesi, _mapel), rec in sorted(gb.items()):
            persen = (100.0 * rec["skor"]/rec["bobot"]) if rec["bobot"] else 0.0
            w.writerow({
                "student_id": rec["student_id"], "student_name": rec["student_name"],
                "session_id": rec["session_id"], "mapel": rec["mapel"],
                "n_q": rec["n_q"], "benar": rec["benar"], "salah": rec["salah"],
                "skor": rec["skor"], "bobot": rec["bobot"], "persen": f"{persen:.2f}",
                "last_timestamp_ms": rec["last_timestamp_ms"],
                "by_topic_json": json.dumps(rec["by_topic"], ensure_ascii=False)
            })

    gradebook_json = JAWABAN_DIR / "gradebook.json"
    payload = []
    for (_sid, _sesi, _mapel), rec in sorted(gb.items()):
        persen = (100.0 * rec["skor"]/rec["bobot"]) if rec["bobot"] else 0.0
        payload.append({**rec, "persen": round(persen,2)})
    gradebook_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"OK: Skoring → {scored_path}")
    print(f"OK: Rekap → {args.out_dir}")
    print(f"OK: Gradebook CSV/JSON dibuat di folder jawaban")

if __name__ == "__main__":
    main()
