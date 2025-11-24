# build_materi_index.py
"""
Bangun index materi per mapel-topik dari training/materi/*.txt
→ mapping/materi_index.json + mapping/materi_index.csv

Cara pakai:
python -m training.scripts.build_materi_index
"""

from __future__ import annotations
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict
import json, csv, re

from .common import TRAINING_DIR, MAPPING_DIR

MATERI_DIR = TRAINING_DIR / "materi"

def _norm(s: str) -> str:
    return (s or "").strip().lower()

def _tokens(s: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", _norm(s).replace("_", " "))

def _split_paragraphs(text: str) -> List[Tuple[int, int, str]]:
    """Pisah per paragraf. Return list (start_line, end_line_exclusive, paragraph_text)."""
    lines = text.splitlines()
    paras = []
    start = 0
    i = 0
    while i <= len(lines):
        if i == len(lines) or not lines[i].strip():
            # paragraph boundary
            if start < i:
                chunk = "\n".join(lines[start:i]).strip()
                if chunk:
                    paras.append((start + 1, i, chunk))  # 1-based line number
            start = i + 1
        i += 1
    # Jika tidak ada baris kosong, jadikan 1 paragraf penuh
    if not paras and lines:
        paras = [(1, len(lines), "\n".join(lines).strip())]
    return paras

def _load_topic_index() -> Dict[str, List[str]]:
    f = MAPPING_DIR / "topic_index.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}

def _load_topic_alias() -> Dict[str, str]:
    p = MAPPING_DIR / "topic_alias.csv"
    if not p.exists():
        return {}
    alias = {}
    import csv
    with p.open("r", encoding="utf-8") as fh:
        r = csv.DictReader(fh)
        for row in r:
            a = _norm(row.get("variant",""))
            b = _norm(row.get("canonical",""))
            if a and b:
                alias[a] = b
    return alias

def _score(paragraph: str, topic: str) -> int:
    """Skor sederhana berbasis overlap token."""
    ptoks = set(_tokens(paragraph))
    ttoks = set(_tokens(topic))
    return sum(1 for t in ttoks if t in ptoks)

def main():
    topic_index = _load_topic_index()
    alias = _load_topic_alias()

    out_json = {}
    rows_csv = []

    for mapel, topics in topic_index.items():
        fn = MATERI_DIR / f"{mapel}.txt"
        if not fn.exists():
            # fallback: coba .md
            md = MATERI_DIR / f"{mapel}.md"
            if md.exists():
                fn = md
            else:
                continue
        text = fn.read_text(encoding="utf-8")
        paras = _split_paragraphs(text)

        per_topic = {}
        for t in topics:
            t_can = alias.get(_norm(t), _norm(t))
            scored = []
            for idx, (start, end, ptext) in enumerate(paras):
                s = _score(ptext, t_can)
                # bonus: ada frasa topik literal
                if _norm(t_can).replace("_", " ") in _norm(ptext):
                    s += 1
                if s > 0:
                    scored.append((s, idx, start, end, ptext))
            # ambil top 2 paragraf terbaik
            scored.sort(key=lambda x: (-x[0], x[1]))
            picks = scored[:2] if scored else []
            per_topic[t] = [{
                "para_index": idx,
                "score": s,
                "start_line": start,
                "end_line": end,
                "snippet": ptext[:500]
            } for (s, idx, start, end, ptext) in picks]

            # simpan ke CSV ringkas (1 baris per pick)
            for (s, idx, start, end, ptext) in picks:
                rows_csv.append({
                    "mapel": mapel, "topik": t, "para_index": idx, "score": s,
                    "start_line": start, "end_line": end, "preview": ptext[:120].replace("\n"," ")
                })

        out_json[mapel] = per_topic

    # tulis file
    MAPPING_DIR.mkdir(parents=True, exist_ok=True)
    (MAPPING_DIR / "materi_index.json").write_text(json.dumps(out_json, ensure_ascii=False, indent=2), encoding="utf-8")

    if rows_csv:
        with (MAPPING_DIR / "materi_index.csv").open("w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=["mapel","topik","para_index","score","start_line","end_line","preview"])
            w.writeheader()
            for r in rows_csv: w.writerow(r)

    print("OK: mapping/materi_index.json dibuat. (plus materi_index.csv)")

if __name__ == "__main__":
    main()
