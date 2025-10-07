# common.py — util path, loader, normalisasi, validasi (mendukung opsi A–E)

from __future__ import annotations
from pathlib import Path
import json, random
from typing import Dict, List, Tuple, Iterable, Optional

__all__ = [
    "TRAINING_DIR", "SOAL_DIR", "MATERI_DIR", "MAPPING_DIR", "JAWABAN_DIR",
    "list_mapel", "load_topic_index", "load_bank_soal", "load_all_banks",
    "validate_question", "validate_bank", "filter_questions", "pick_questions",
]

ALLOWED_TINGKAT = {"mudah", "sedang", "sulit"}
CHOICE_SET = {"A", "B", "C", "D", "E"}

# ---------- Lokasi direktori ----------
def _find_training_dir(start: Path) -> Path:
    p = start.resolve()
    for _ in range(8):
        if p.name == "training":
            return p
        if (p / "training").exists():
            return (p / "training").resolve()
        p = p.parent
    return Path(__file__).resolve().parents[1]

TRAINING_DIR = _find_training_dir(Path(__file__).parent)
SOAL_DIR = TRAINING_DIR / "soal"
MATERI_DIR = TRAINING_DIR / "materi"
MAPPING_DIR = TRAINING_DIR / "mapping"
JAWABAN_DIR = TRAINING_DIR / "jawaban"

# ---------- Helper normalisasi ----------
def _ensure_opsi_dict(opsi):
    """Kembalikan dict A..E dari berbagai bentuk opsi (dict/list/label)."""
    if isinstance(opsi, dict):
        out = {}
        alias = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E"}
        for k, v in opsi.items():
            kk = str(k).strip().upper()
            kk = alias.get(kk, kk)
            if kk in CHOICE_SET:
                out[kk] = v
        if out:
            # pastikan A..D ada; E opsional (akan diisi "" jika tak ada)
            for L in ("A", "B", "C", "D", "E"):
                out.setdefault(L, "")
            return out
    if isinstance(opsi, list):
        letters = ["A", "B", "C", "D", "E"]
        if all(isinstance(it, dict) for it in opsi):
            out = {}
            for it in opsi[:5]:
                lab = str(it.get("label", "")).strip().upper()
                val = it.get("text") or it.get("value") or it.get("option") or ""
                if lab in CHOICE_SET:
                    out[lab] = val
            if out:
                for L in letters:
                    out.setdefault(L, "")
                return out
            # fallback urut
            return {letters[i]: (it.get("text") or it.get("value") or "") for i, it in enumerate(opsi[:5])}
        # list of strings
        return {letters[i]: (opsi[i] if i < len(opsi) else "") for i in range(5)}
    # fallback
    return {"A": "", "B": "", "C": "", "D": "", "E": ""}

def _to_choice_letter(x) -> str:
    """Konversi angka 0/1-based atau huruf ke A..E."""
    if x is None: return ""
    if isinstance(x, (int, float)):
        i = int(x)
        if 1 <= i <= 5:  # 1-based
            return "ABCDE"[i-1]
        if 0 <= i <= 4:  # 0-based
            return "ABCDE"[i]
        return str(x)
    s = str(x).strip().upper()
    if s in CHOICE_SET: return s
    if s.isdigit():
        i = int(s)
        if 1 <= i <= 5: return "ABCDE"[i-1]
        if 0 <= i <= 4: return "ABCDE"[i]
    return s

def _normalize_question_in_place(q: dict):
    q.setdefault("id", q.get("question_id") or q.get("qid") or q.get("number") or "")
    if "teks" not in q:
        q["teks"] = q.get("question") or q.get("pertanyaan") or q.get("text") or q.get("teks_soal") or ""
    if "kunci" not in q:
        k = q.get("answer") or q.get("key") or q.get("correct") or q.get("jawaban_benar")
        q["kunci"] = _to_choice_letter(k)
    else:
        q["kunci"] = _to_choice_letter(q["kunci"])
    raw_opsi = q.get("opsi") or q.get("options") or q.get("choices") or q.get("pilihan")
    q["opsi"] = _ensure_opsi_dict(raw_opsi)
    if "topik" not in q:   q["topik"] = (q.get("topic") or q.get("subtopic") or q.get("kategori") or "umum")
    if "tingkat" not in q:
        lvl = str(q.get("difficulty") or q.get("level") or "").lower()
        if lvl in ALLOWED_TINGKAT: q["tingkat"] = lvl
    q.setdefault("bobot", 1)

# ---------- Loader ----------
def load_topic_index() -> Dict[str, List[str]]:
    f = MAPPING_DIR / "topic_index.json"
    if not f.exists(): return {}
    with f.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    return {m.lower(): [t.strip().replace(" ", "_").lower() for t in topics]
            for m, topics in data.items()}

def list_mapel() -> List[str]:
    return sorted([p.stem.lower() for p in SOAL_DIR.glob("*.json")])

def load_bank_soal(mapel: str) -> Dict:
    f = SOAL_DIR / f"{mapel.lower()}.json"
    with f.open("r", encoding="utf-8") as fh:
        raw = json.load(fh)

    if isinstance(raw, list):
        data = {"mapel": mapel, "versi": "1.0", "soal": raw}
    elif isinstance(raw, dict):
        data = dict(raw)
        if "soal" not in data:
            for alt in ("questions", "data", "items", "bank", "bank_soal"):
                if isinstance(data.get(alt), list):
                    data["soal"] = data[alt]; break
        data.setdefault("soal", [])
        data.setdefault("mapel", mapel)
        data.setdefault("versi", "1.0")
    else:
        raise ValueError(f"Bentuk JSON tidak didukung: {f.name}")

    if not isinstance(data["soal"], list):
        raise ValueError(f"Field 'soal' bukan list di {f.name}")

    data["mapel"] = data.get("mapel", mapel).lower()
    for idx, q in enumerate(data["soal"], 1):
        if isinstance(q, dict):
            _normalize_question_in_place(q)
            if not str(q.get("id","")).strip():
                q["id"] = f"{data['mapel']}-{idx:04d}"
    return data

def load_all_banks() -> Dict[str, Dict]:
    return {m: load_bank_soal(m) for m in list_mapel()}

# ---------- Validasi ----------
def validate_question(q: Dict, topics: Iterable[str]) -> List[str]:
    errs = []
    if not str(q.get("id","")).strip(): errs.append("id kosong")
    if not str(q.get("teks","")).strip(): errs.append("teks kosong")
    opsi = q.get("opsi")
    # minimal A–D harus ada; E opsional
    if not isinstance(opsi, dict) or not all(k in opsi for k in ["A","B","C","D"]):
        errs.append("opsi harus memuat minimal A,B,C,D,E")
    kunci = (q.get("kunci") or "").strip().upper()
    if kunci not in CHOICE_SET:
        errs.append("kunci bukan A/B/C/D/E")
    if kunci == "E" and (not isinstance(opsi, dict) or "E" not in opsi or not str(opsi.get("E","")).strip()):
        errs.append("kunci E tetapi opsi E tidak tersedia")
    topik = str(q.get("topik","")).strip().replace(" ","_").lower()
    if not topik: errs.append("topik kosong")
    elif topics and topik not in topics: errs.append(f"topik '{topik}' tidak terdaftar di topic_index")
    tingkat = str(q.get("tingkat","")).lower()
    if tingkat and tingkat not in ALLOWED_TINGKAT:
        errs.append(f"tingkat '{tingkat}' tidak valid (harus {sorted(ALLOWED_TINGKAT)})")
    return errs

def validate_bank(bank: Dict, topic_index: Dict[str, List[str]]) -> Tuple[bool, List[str]]:
    mapel = bank.get("mapel","").lower()
    topics = set(topic_index.get(mapel, []))
    seen = set(); errs = []
    for i, q in enumerate(bank.get("soal", []), 1):
        qid = str(q.get("id", f"?row{i}"))
        if qid in seen: errs.append(f"duplikat id: {qid}")
        seen.add(qid)
        errs.extend([f"{qid}: {e}" for e in validate_question(q, topics)])
    return len(errs) == 0, errs

# ---------- Seleksi ----------
def filter_questions(bank: Dict, topik: Optional[List[str]]=None, tingkat: Optional[List[str]]=None) -> List[Dict]:
    qs = bank["soal"]
    if topik:
        tset = {t.strip().replace(" ", "_").lower() for t in topik}
        qs = [q for q in qs if str(q.get("topik","")).replace(" ","_").lower() in tset]
    if tingkat:
        lset = {l.lower() for l in tingkat}
        qs = [q for q in qs if str(q.get("tingkat","")).lower() in lset]
    return qs

def pick_questions(qs: List[Dict], n: int, seed: Optional[int]=None, allow_duplicate=False) -> List[Dict]:
    rnd = random.Random(seed)
    if not allow_duplicate: return rnd.sample(qs, k=min(n, len(qs)))
    return [rnd.choice(qs) for _ in range(n)]
