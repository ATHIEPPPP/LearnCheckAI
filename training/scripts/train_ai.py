# training/scripts/train_ai.py
from __future__ import annotations
import argparse, json, random
from pathlib import Path
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# Import util project
import sys
ROOT = Path(__file__).resolve().parents[2]   # .../LearnCheck
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from training.scripts import common as LC   # type: ignore

def build_rows(bank: Dict) -> List[Tuple[str,int,str,str]]:
    """
    Buat dataset pointwise: 1 baris per opsi.
    text = 'teks_soal [SEP] teks_opsi'
    label = 1 kalau opsi == kunci, else 0
    return: [(text, label, qid, opsi_key), ...]
    """
    rows = []
    for q in bank.get("soal", []):
        qid = str(q.get("id",""))
        kunci = (q.get("kunci") or "").strip().upper()
        teks  = (q.get("teks") or "").strip()
        opsi  = q.get("opsi", {}) or {}
        for key in ["A","B","C","D","E"]:
            if key in opsi:
                cand = f"{teks} [SEP] {str(opsi.get(key,''))}"
                label = 1 if key == kunci else 0
                rows.append((cand, label, qid, key))
    return rows

def question_level_acc(rows, y_proba):
    """
    Hitung akurasi level-pertanyaan: untuk tiap qid,
    pilih opsi dengan proba tertinggi → benar bila itu kunci.
    """
    by_q = {}
    for (text,label,qid,opt), p in zip(rows, y_proba):
        by_q.setdefault(qid, []).append((opt, label, float(p)))
    total = 0; benar = 0
    for qid, arr in by_q.items():
        total += 1
        # ambil opsi dengan proba tertinggi
        best = max(arr, key=lambda t: t[2])
        benar += 1 if best[1] == 1 else 0
    return (benar/total) if total else 0.0

def train_one_mapel(mapel: str, out_dir: Path, test_size=0.1, seed=42):
    bank = LC.load_bank_soal(mapel)
    out_dir.mkdir(parents=True, exist_ok=True)
    rows = build_rows(bank)
    mdl_path = out_dir / f"clf_{mapel}.joblib"
    meta_path = out_dir / f"clf_{mapel}.json"
    if not rows:
        print(f"[WARN] {mapel}: tidak ada data")
        return

    X = [r[0] for r in rows]
    y = [r[1] for r in rows]

    Xtr, Xte, ytr, yte, rows_tr, rows_te = train_test_split(
        X, y, rows, test_size=test_size, random_state=seed, stratify=y
    )

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1,2),
            min_df=2,
            max_features=100_000,
            sublinear_tf=True
        )),
        ("clf", LogisticRegression(max_iter=2000, n_jobs=None))
    ])

    pipe.fit(Xtr, ytr)
    # metrik
    proba_te = pipe.predict_proba(Xte)[:,1]
    qa_acc = question_level_acc(rows_te, proba_te)
    bin_acc = accuracy_score(yte, (proba_te>=0.5).astype(int))

    out_dir.mkdir(parents=True, exist_ok=True)
    mdl_path  = out_dir / f"clf_{mapel}.joblib"
    meta_path = out_dir / f"clf_{mapel}.json"
    joblib.dump(pipe, mdl_path)
    meta = {
        "mapel": mapel,
        "rows": len(rows),
        "test_size": test_size,
        "seed": seed,
        "binary_acc": round(float(bin_acc),4),
        "question_acc": round(float(qa_acc),4),
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] {mapel}: saved {mdl_path.name}, QA-Acc={meta['question_acc']:.3f}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out-dir", default=str(ROOT / "models"))
    ap.add_argument("--out-dir", default=str(LC.MODELS_OUTPUT_DIR))
    ap.add_argument("--mapel", nargs="*", default=None, help="Kosongkan untuk semua mapel")
    ap.add_argument("--test-size", type=float, default=0.1)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    if not args.mapel:
        args.mapel = sorted([p.stem for p in LC.SOAL_DIR.glob("*.json")])

    out_dir = Path(args.out_dir)
    for m in args.mapel:
        train_one_mapel(m, out_dir, test_size=args.test_size, seed=args.seed)

if __name__ == "__main__":
    main()
