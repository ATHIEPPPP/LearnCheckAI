# build_mapping.py
# Bangun ulang mapping/topic_index.json + metadata.csv dari seluruh bank soal

from __future__ import annotations
from pathlib import Path
from collections import Counter
from datetime import datetime
import csv, json
from .common import TRAINING_DIR, SOAL_DIR, MAPPING_DIR, load_all_banks

def _norm(s: str) -> str:
    return (s or "").strip().replace(" ", "_").lower()

def _load_topic_alias(path: Path) -> dict:
    if not path.exists():
        return {}
    alias = {}
    with path.open("r", encoding="utf-8") as fh:
        r = csv.DictReader(fh)
        for row in r:
            src = _norm(row.get("variant", ""))
            dst = _norm(row.get("canonical", ""))
            if src and dst:
                alias[src] = dst
    return alias

def main():
    MAPPING_DIR.mkdir(parents=True, exist_ok=True)
    alias = _load_topic_alias(MAPPING_DIR / "topic_alias.csv")
    banks = load_all_banks()

    topic_index = {}
    meta_rows = []

    for mapel, bank in banks.items():
        used_topics = []
        tingkat_counter = Counter()
        for q in bank.get("soal", []):
            t = _norm(q.get("topik", "umum"))
            t = alias.get(t, t)
            used_topics.append(t)
            tingkat_counter[_norm(q.get("tingkat", ""))] += 1

        uniq_topics = sorted(set(used_topics))
        topic_index[mapel] = uniq_topics

        total = len(bank.get("soal", []))
        mudah = tingkat_counter["mudah"]; sedang = tingkat_counter["sedang"]; sulit = tingkat_counter["sulit"]

        meta_rows.append({
            "mapel": mapel, "n_soal": total, "n_topik": len(uniq_topics),
            "mudah": mudah, "sedang": sedang, "sulit": sulit,
            "updated_at": datetime.utcnow().isoformat() + "Z",
        })

    (MAPPING_DIR / "topic_index.json").write_text(
        json.dumps(topic_index, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    meta_cols = ["mapel","n_soal","n_topik","mudah","sedang","sulit","updated_at"]
    with (MAPPING_DIR / "metadata.csv").open("w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=meta_cols); w.writeheader()
        for row in sorted(meta_rows, key=lambda x: x["mapel"]):
            w.writerow(row)

    print("OK: mapping/topic_index.json & mapping/metadata.csv diperbarui.")

if __name__ == "__main__":
    main()
