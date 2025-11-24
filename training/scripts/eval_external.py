# training/scripts/eval_external.py
from __future__ import annotations
import argparse, json, random, csv, re, sys
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any

# ========= KONFIGURASI PATH =========
# Struktur asumsi:
# ROOT/
# ├─ training/
# │  └─ soal/*.json      (bank soal training)
# └─ evaluation/
#    ├─ external/*.json  (test eksternal)
#    └─ reports/         (keluar laporan)
ROOT = Path(__file__).resolve().parents[2]
TRAIN_SOAL_DIR = ROOT / "training" / "soal"
OUT_DIR = ROOT / "evaluation" / "reports"
CHOICES = ["A", "B", "C", "D", "E"]

# ========= UTIL =========
def read_bank(p: Path) -> Dict[str, Any]:
    return json.loads(p.read_text(encoding="utf-8"))

def normalize_text(s: str) -> str:
    # Normalisasi sederhana untuk cek duplikasi (casefold + kompres spasi)
    return re.sub(r"\s+", " ", (s or "").strip().casefold())

def load_training_texts() -> set[str]:
    seen = set()
    if TRAIN_SOAL_DIR.exists():
        for fp in TRAIN_SOAL_DIR.glob("*.json"):
            try:
                bank = read_bank(fp)
                for q in bank.get("soal", []):
                    seen.add(normalize_text(q.get("teks", "")))
            except Exception:
                # Abaikan file training yang rusak
                pass
    return seen

def walk_external_tests(test_dir: Path, test_file: Optional[Path]) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    files: List[Path]
    if test_file:
        files = [test_file]
    else:
        files = sorted((test_dir or Path()).glob("*.json"))
    for fp in files:
        bank = read_bank(fp)
        mapel = (bank.get("mapel") or fp.stem).lower()
        for q in bank.get("soal", []):
            qq = dict(q)
            qq["mapel"] = mapel
            items.append(qq)
    return items

# ========= ADAPTER PREDIKSI =========
def pred_random(teks: str, opsi: Dict[str, str], mapel: str, topik: str) -> str:
    # baseline acak: hanya dari opsi yang tersedia
    avail = [k for k in CHOICES if k in (opsi or {})]
    return random.choice(avail or CHOICES[:4])

def pred_http(teks: str, opsi: Dict[str, str], mapel: str, topik: str, endpoint: str) -> str:
    """
    Memanggil endpoint HTTP modelmu, misal POST /predict
    Body (contoh):
      { "text": "...", "options": {"A":"...",...}, "mapel":"ipa", "topik":"..." }
    Respon (contoh):
      { "choice": "A" }
    """
    import requests  # pastikan terpasang jika pakai --adapter http
    payload = {"text": teks, "options": opsi or {}, "mapel": mapel, "topik": topik}
    r = requests.post(endpoint, json=payload, timeout=30)
    r.raise_for_status()
    ch = (r.json() or {}).get("choice", "")
    return (ch or "").strip().upper()[:1]

def safe_choice(x: str) -> str:
    s = (x or "").strip().upper()
    if s in CHOICES:
        return s
    # toleransi input "1..5" → "A..E"
    for ch in s:
        if ch in "12345":
            return "ABCDE"[int(ch) - 1]
    return ""

def bootstrap_ci(acc_list, n_boot=2000, seed=42):
    if not acc_list:
        return (0.0, 0.0, 0.0)
    rnd = random.Random(seed)
    n = len(acc_list)
    samples = []
    for _ in range(n_boot):
        s = [acc_list[rnd.randrange(n)] for __ in range(n)]
        samples.append(sum(s) / n)
    samples.sort()
    acc = sum(acc_list) / n
    lo = samples[int(0.025 * (n_boot - 1))]
    hi = samples[int(0.975 * (n_boot - 1))]
    return (acc * 100.0, lo * 100.0, hi * 100.0)


def confusion_update(cnf: Dict[Tuple[str, str], int], y_true: str, y_pred: str) -> None:
    cnf[(y_true or "-", y_pred or "-")] += 1

# ========= MAIN =========
def main():
    ap = argparse.ArgumentParser(description="Evaluasi model pada test eksternal (bukan data training).")
    ap.add_argument("--test-dir", default=str(ROOT / "evaluation" / "external"),
                    help="Folder berisi *.json test eksternal.")
    ap.add_argument("--test-file", help="Jika cuma 1 file JSON eksternal.")
    ap.add_argument("--adapter", choices=["random", "http"], default="random",
                    help="Sumber prediksi: baseline acak atau via HTTP endpoint.")
    ap.add_argument("--endpoint", help="Wajib jika --adapter http (contoh: http://127.0.0.1:8000/predict)")
    ap.add_argument("--seed", type=int, default=123)
    ap.add_argument("--out-name", default=None, help="Nama file laporan (tanpa ekstensi).")
    args = ap.parse_args()

    random.seed(args.seed)

    # Validasi input
    test_dir = Path(args.test_dir) if args.test_dir else None
    test_file = Path(args.test_file) if args.test_file else None
    if test_file and not test_file.exists():
        print(f"ERR: test file tidak ditemukan: {test_file}")
        sys.exit(1)
    if not test_file:
        if not test_dir or not test_dir.exists():
            print(f"ERR: test dir tidak ditemukan: {test_dir}")
            sys.exit(1)

    # Load test eksternal
    tests = walk_external_tests(test_dir or Path(), test_file)
    if not tests:
        print("Tidak ada item test eksternal.")
        sys.exit(1)

    # Load teks training untuk cek potensi duplikasi (data leakage)
    train_texts = load_training_texts()

    # Evaluasi
    per_mapel = defaultdict(lambda: {"benar": 0, "total": 0})
    per_topik = defaultdict(lambda: {"benar": 0, "total": 0})
    acc_list: List[int] = []
    cnf: Counter = Counter()
    rows_csv: List[Dict[str, Any]] = []
    warn_dupe = 0

    for q in tests:
        mapel = (q.get("mapel") or "").lower()
        teks = q.get("teks", "")
        # opsi: normalisasi key salah ketik "opti"
        opsi = q.get("opsi") or q.get("opti") or {}
        kunci = safe_choice(q.get("kunci", ""))
        topik = q.get("topik", "") or ""
        qid = str(q.get("id", ""))

        # Cek duplikasi kasar
        if normalize_text(teks) in train_texts:
            warn_dupe += 1

        # Prediksi
        if args.adapter == "random":
            pred = pred_random(teks, opsi, mapel, topik)
        else:
            if not args.endpoint:
                print("ERR: --endpoint wajib untuk adapter http")
                sys.exit(2)
            pred = pred_http(teks, opsi, mapel, topik, args.endpoint)

        correct = int(pred == kunci)
        acc_list.append(correct)

        per_mapel[mapel]["total"] += 1
        per_mapel[mapel]["benar"] += correct

        per_topik[(mapel, topik)]["total"] += 1
        per_topik[(mapel, topik)]["benar"] += correct

        confusion_update(cnf, kunci or "-", pred or "-")

        rows_csv.append({
            "mapel": mapel,
            "question_id": qid,
            "topik": topik,
            "pred": pred,
            "kunci": kunci,
            "benar": correct,
        })

    acc, lo, hi = bootstrap_ci(acc_list)

    summary = {
        "n_items": len(tests),
        "adapter": args.adapter,
        "endpoint": args.endpoint or "",
        "accuracy_pct": round(acc, 2),
        "ci95_pct": [round(lo, 2), round(hi, 2)],
        "per_mapel": {
            m: {
                "total": v["total"],
                "benar": v["benar"],
                "accuracy_pct": round(100.0 * v["benar"] / max(1, v["total"]), 2),
            }
            for m, v in sorted(per_mapel.items())
        },
        "per_topik": {
            f"{m}::{t}": {
                "total": v["total"],
                "benar": v["benar"],
                "accuracy_pct": round(100.0 * v["benar"] / max(1, v["total"]), 2),
            }
            for (m, t), v in sorted(per_topik.items())
        },
        "confusion": {f"{t}->{p}": n for (t, p), n in sorted(cnf.items())},
        "dup_warn_in_train": warn_dupe,
    }

    # Tulis laporan
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    name = args.out_name or f"external_eval_{args.adapter}_{ts}"
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # JSON
    (OUT_DIR / f"{name}.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    # CSV
    with (OUT_DIR / f"{name}.csv").open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=["mapel", "question_id", "topik", "pred", "kunci", "benar"])
        w.writeheader()
        for r in rows_csv:
            w.writerow(r)

    # Ringkasan terminal
    print(f"[OK] Evaluasi selesai: {len(tests)} item")
    print(f"  Akurasi: {summary['accuracy_pct']}%  (95% CI: {summary['ci95_pct'][0]}%–{summary['ci95_pct'][1]}%)")
    if warn_dupe:
        print(f"  Peringatan: {warn_dupe} soal di test eksternal identik dengan teks di training (potensi leakage).")
    print(f"  Laporan: {OUT_DIR / (name + '.json')} dan {OUT_DIR / (name + '.csv')}")

if __name__ == "__main__":
    main()
