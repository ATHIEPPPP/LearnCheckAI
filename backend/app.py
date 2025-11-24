# backend/app.py
from __future__ import annotations

# ===== stdlib =====
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import csv, json, subprocess, sys, random, re

# ===== third-party =====
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib  # untuk load model .joblib

# ===== pastikan package "training" bisa di-import =====
ROOT = Path(__file__).resolve().parents[1]  # .../LearnCheck
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# util LearnCheck
from training.scripts import common as LC

# ===== path & konstanta =====
SOAL_DIR = LC.SOAL_DIR
TRAINING_DIR = LC.TRAINING_DIR
JAWABAN_DIR = LC.JAWABAN_DIR
MODELS_DIR = LC.MODELS_OUTPUT_DIR            # tempat file model *.joblib
CHOICES = {"A", "B", "C", "D", "E"}

# ===== FastAPI app =====
app = FastAPI(title="LearnCheck API", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # batasi ke domain FE saat deploy
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== cache di memori =====
BANKS: Dict[str, dict] = {}
ANSKEY: Dict[tuple, dict] = {}   # (mapel, qid) -> {kunci,bobot,topik,tingkat}
ID2MAPEL: Dict[str, set] = {}    # qid -> {mapel}
MODELS: Dict[str, object] = {}   # mapel -> sklearn pipeline

# ===== helpers (token & normalisasi) =====
STOP = set("yang dari di ke dan untuk pada adalah ini itu tersebut dengan sebagai tidak atau".split())

def _tok(s: str) -> List[str]:
    return [w for w in re.findall(r"[a-z0-9]+", (s or "").lower()) if w not in STOP]

def _norm_choice(x: Optional[str]) -> str:
    if x is None:
        return ""
    s = str(x).strip().upper()
    for ch in s:
        if ch in CHOICES:
            return ch
    for ch in s:
        if ch in "12345":
            return "ABCDE"[int(ch) - 1]
    return ""

def _append_answers_csv(rows: List[dict]) -> None:
    path = JAWABAN_DIR / "siswa_jawaban.csv"
    path.parent.mkdir(parents=True, exist_ok=True)
    need_header = not path.exists() or path.stat().st_size == 0
    cols = ["student_id", "student_name", "session_id", "timestamp_ms", "mapel", "question_id", "chosen"]
    with path.open("a", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols)
        if need_header:
            w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in cols})

# ===== indexer & model loader =====
def _rebuild_indexes() -> None:
    """Bangun ulang index bank soal (dipanggil saat startup/reload)."""
    global BANKS, ANSKEY, ID2MAPEL
    BANKS = LC.load_all_banks()
    ANSKEY, ID2MAPEL = {}, {}
    for m, bank in BANKS.items():
        for q in bank.get("soal", []):
            qid = str(q.get("id", ""))
            ANSKEY[(m, qid)] = {
                "kunci": (q.get("kunci") or "").strip().upper(),
                "bobot": int(q.get("bobot", 1)),
                "topik": q.get("topik") or "",
                "tingkat": q.get("tingkat") or "",
            }
            ID2MAPEL.setdefault(qid, set()).add(m)

def load_models() -> None:
    """Load semua model *.joblib di folder models/ ke memori."""
    global MODELS
    MODELS = {}
    if not MODELS_DIR.exists():
        return
    for p in MODELS_DIR.glob("clf_*.joblib"):
        mapel = p.stem.replace("clf_", "")
        try:
            MODELS[mapel.lower()] = joblib.load(p)
            print(f"[MODEL] loaded {mapel} <- {p.name}")
        except Exception as e:
            print(f"[MODEL] skip {p.name}: {e}")

def predict_ai(mapel: str, text: str, options: Dict[str, str]) -> Optional[str]:
    """Skor tiap opsi dengan model mapel; return huruf terbaik atau None jika model tidak ada."""
    mdl = MODELS.get((mapel or "").lower())
    if not mdl:
        return None
    cands, keys = [], []
    for k in ["A", "B", "C", "D", "E"]:
        if k in (options or {}):
            cands.append(f"{text} [SEP] {str(options.get(k, ''))}")
            keys.append(k)
    if not cands:
        return None
    # sklearn predict_proba -> list of [p(0), p(1)] → ambil p(1)
    probs = [p[1] for p in mdl.predict_proba(cands)]
    best_idx = max(range(len(probs)), key=lambda i: probs[i])
    return keys[best_idx] if keys else None

@app.on_event("startup")
def _init():
    _rebuild_indexes()
    load_models()

# ===== models (Pydantic) =====
class PredictRequest(BaseModel):
    text: str
    options: Dict[str, str]
    mapel: Optional[str] = None
    topik: Optional[str] = None

class PredictResponse(BaseModel):
    choice: str

class GenerateReq(BaseModel):
    mapel: Optional[List[str]] = None   # None → semua mapel
    n: int = Field(..., gt=0, description="Jumlah soal per mapel")
    topik: Optional[List[str]] = None
    tingkat: Optional[List[str]] = None
    seed: Optional[int] = None
    allow_duplicate: bool = False

class QuestionOut(BaseModel):
    mapel: str
    id: str
    topik: Optional[str] = ""
    tingkat: Optional[str] = ""
    teks: str
    opsi: Dict[str, str]  # A..E

class AnswerItem(BaseModel):
    mapel: Optional[str] = None
    question_id: str
    chosen: str

class ScoredItem(BaseModel):
    mapel: str
    question_id: str
    chosen: str
    kunci: str
    correct: bool
    bobot: int
    topik: Optional[str] = ""
    tingkat: Optional[str] = ""

class ScoreReq(BaseModel):
    student_id: str
    student_name: str
    session_id: Optional[str] = None
    answers: List[AnswerItem]
    materialize: bool = True  # buat artefak rekap guru (CSV) via evaluator

class ScoreResp(BaseModel):
    total: int
    benar: int
    persen: float
    per_mapel: Dict[str, Dict[str, float]]
    items: List[ScoredItem]

class RemediationTopic(BaseModel):
    topik: str
    mapel: str
    skor_persen: float
    is_remedial: bool

class RemediationRecommendation(BaseModel):
    student_id: str
    session_id: str
    total_score: float
    renedial_topics: List[RemediationTopic]
    recommended_actions: List[str]

def analyze_remedial(score_resp: ScoreResp, mapel_scores: Dict) -> RemediationRecommendation:
    """
    Analisis hasil ujian siswa.
    Tentukan topik mana yang perlu remedial (skor < 75%)
    """
    REMEDIAL_THERESHOLD = 0.75
    remedial_topics = []

    for mapel, stats in mapel_scores.items():
        persen = stats.get("persen", 0.0) / 100.0
        if persen < REMEDIAL_THERESHOLD:
            remedial_topics.append(RemediationTopic(
                topik=mapel,
                mapel=mapel,
                skor_persen=stats.get("persen", 0.0),
                is_remedial=True
            ))

    recommended_actions = []
    for rt in remedial_topics:
        recommended_actions.append(
            f"pelajari ulang materi {rt.mapel} - Skor: {rt.skor_persen:.1f}%"
        )

    return RemediationRecommendation(
        student_id=score_resp.student_id,
        session_id=score_resp.session_id,
        total_score=score_resp.persen,
        remedial_topics=remedial_topics,
        recommended_actions=recommended_actions
    )

# ===== routes =====
@app.get("/")
def root():
    return {"service": "LearnCheck API", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {"ok": True, "banks": len(BANKS), "models": sorted(MODELS.keys())}

@app.post("/reload")
def reload_all():
    _rebuild_indexes()
    return {"ok": True, "banks": len(BANKS)}

@app.post("/models/reload")
def models_reload():
    load_models()
    return {"ok": True, "loaded": sorted(MODELS.keys())}

# ---- /predict: pakai AI jika ada model, else heuristik ----
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if req.mapel:  # coba AI model spesifik mapel
        ai = predict_ai(req.mapel, req.text, req.options or {})
        if ai:
            return {"choice": ai}

    # fallback heuristik overlap token
    q = set(_tok(req.text))
    avail = [k for k in ["A", "B", "C", "D", "E"] if k in (req.options or {})] or ["A"]
    scores = {k: len(q & set(_tok(req.options.get(k, "")))) for k in avail}
    best = [k for k, v in scores.items() if v == max(scores.values())] or avail
    return {"choice": random.choice(best)}

# ---- generate quiz ----
@app.post("/generate_quiz", response_model=List[QuestionOut])
def generate_quiz(req: GenerateReq):
    targets = (sorted([p.stem for p in SOAL_DIR.glob("*.json")])
               if not req.mapel else [m.lower() for m in req.mapel])
    out: List[QuestionOut] = []
    for m in targets:
        bank = LC.load_bank_soal(m)
        cand = LC.filter_questions(bank, topik=req.topik, tingkat=req.tingkat)
        take = LC.pick_questions(cand, n=req.n, seed=req.seed, allow_duplicate=req.allow_duplicate)
        for q in take:
            opsi = q.get("opsi", {})
            out.append(QuestionOut(
                mapel=m,
                id=str(q.get("id", "")),
                topik=q.get("topik", ""),
                tingkat=q.get("tingkat", ""),
                teks=q.get("teks", ""),
                opsi={k: opsi.get(k, "") for k in ("A", "B", "C", "D", "E")},
            ))
    rng = random.Random(req.seed)
    rng.shuffle(out)
    return out

# ---- score (tanpa remedial) + rekap guru opsional ----
@app.post("/score", response_model=ScoreResp)
def score(req: ScoreReq):
    session_id = req.session_id or f"{req.student_id}-{int(datetime.utcnow().timestamp() * 1000)}"
    items: List[ScoredItem] = []
    per_mapel: Dict[str, Dict[str, float]] = {}
    to_log = []
    benar = 0

    for a in req.answers:
        qid = str(a.question_id).strip()
        m = (a.mapel or next(iter(ID2MAPEL.get(qid, [])), "")).lower()
        ak = ANSKEY.get((m, qid))
        chosen = _norm_choice(a.chosen)

        if not ak:
            items.append(ScoredItem(
                mapel=m, question_id=qid, chosen=chosen, kunci="",
                correct=False, bobot=0, topik="", tingkat=""
            ))
            continue

        kunci = ak["kunci"]
        bobot = int(ak["bobot"])
        ok = (chosen == kunci) and bool(kunci)
        if ok:
            benar += 1

        items.append(ScoredItem(
            mapel=m, question_id=qid, chosen=chosen, kunci=kunci,
            correct=ok, bobot=bobot, topik=ak["topik"], tingkat=ak["tingkat"]
        ))

        st = per_mapel.setdefault(m, {"benar": 0, "total": 0, "bobot": 0.0, "skor": 0.0})
        st["total"] += 1
        st["bobot"] += bobot
        if ok:
            st["benar"] += 1
            st["skor"] += bobot

        to_log.append({
            "student_id": req.student_id,
            "student_name": req.student_name,
            "session_id": session_id,
            "timestamp_ms": str(int(datetime.utcnow().timestamp() * 1000)),
            "mapel": m,
            "question_id": qid,
            "chosen": chosen,
        })

    # simpan jawaban siswa
    _append_answers_csv(to_log)

    # (opsional) buat artefak rekap guru dengan evaluator yang sudah ada
    if req.materialize:
        out_dir = JAWABAN_DIR / "out"
        try:
            subprocess.run(
                [sys.executable, "-m", "training.scripts.evaluate_answers",
                 "--in", str(JAWABAN_DIR / "siswa_jawaban.csv"),
                 "--out-dir", str(out_dir)],
                check=True
            )
        except Exception as e:
            print(f"[WARN] evaluate_answers gagal: {e}")

    total = len(items)
    persen = round(100.0 * benar / total, 2) if total else 0.0
    per_mapel_pct = {
        m: {"benar": v["benar"], "total": v["total"],
            "persen": (round(100.0 * v["skor"] / v["bobot"], 2) if v["bobot"] else 0.0)}
        for m, v in per_mapel.items()
    }

    remedial = analyze_remedial(req, per_mapel_pct)

    if remedial.remedial_topics:
        _save_remedial_recommendation(remedial)

    return ScoreResp(total=total, benar=benar, persen=persen,
                     per_mapel=per_mapel_pct, items=items)

@app.get("/remedial/{student_id}/{session_id}")
def generate_remedial_quiz(
    mapel: str,
    n: int = 5,
    tingkat: str = "mudah" # Remedial = mudah
):
    """ Generate soal level MUDAH untuk remedial."""
    bank = LC.load_bank_soal(mapel)
    cand = LC.filter_questions(bank, tingkat=[tingkat])
    take = LC.pick_questions(cand, n=n, allow_duplicate=False)

    out = []
    for q in take:
        opsi = q.get("opsi", {})
        out.append(QuestionOut(
            mapel=mapel,
            id=str(q.get("id", "")),
            topik=q.get("tingkat", ""),
            teks = q.get("teks", ""),
            opsi={k: opsi.get(k, "") for k in ("A", "B", "C", "D", "E")},
        ))
    return out