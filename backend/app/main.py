from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import sys
from pathlib import Path

# Add parent directory to path so 'training' can be imported
ROOT = Path(__file__).resolve().parents[2]  # LearnCheck root
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from . import models, schemas
from .db import SessionLocal
from training.scripts.qg_service import generate_question_raw, generate_remedial
from training.scripts.db import insert_question_with_options

app = FastAPI()

@app.post("/remedial/recommend")
def recommend_remedial(req: schemas.RemedialRequest):
    if not req.wrong_questions:
        return {"content": "Tidak ada materi remedial karena jawaban Anda benar semua! Pertahankan."}
    
    content = generate_remedial(req.mapel, req.wrong_questions)
    return {"content": content}

# CORS middleware untuk frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency untuk mendapatkan session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

import re

from typing import List
import random

# ...

SOAL_DIR = ROOT / "training" / "soal"

@app.post("/qg/generate", response_model=List[schemas.Question])
def generate_question(qg_input: schemas.QuestionCreate, db: Session = Depends(get_db)):
    # Update context agar AI fokus ke Mapel, bukan instruksi kalimat
    if qg_input.mapel:
        # Context spesifik untuk memaksa AI menggunakan knowledge-base nya
        context = f"Mata Pelajaran: {qg_input.mapel}. Topik: {qg_input.topic or 'Umum'}. Buat soal pilihan ganda akademik yang relevan dan menantang."
    else:
        context = qg_input.question_text

    # Panggil AI (Gemini)
    # Kita loop sebentar untuk mencoba generate beberapa soal jika memungkinkan, 
    # tapi karena limitasi waktu response, kita generate 1-2 soal berkualitas atau 1 set.
    # Saat ini qg_service hanya return 1 soal per call.
    
    generated_questions = []
    
    # Kita panggil 1 kali dulu. Jika ingin lebih, butuh loop (tapi lambat).
    # Untuk demo cepat, 1 soal AI yang BENAR lebih baik daripada soal salah.
    
    raw_question = generate_question_raw(context)
    print(f"DEBUG raw_question: {repr(raw_question[:200])}")

    # Extract JSON Array dari response
    json_match = re.search(r'(\[.*\]|\{.*\})', raw_question, re.DOTALL)
    
    if not json_match:
        # Fallback check
        try:
            parsed = json.loads(raw_question)
            json_str = raw_question
        except:
             raise HTTPException(status_code=400, detail=f"No JSON found in response: {raw_question[:100]}")
    else:
        json_str = json_match.group(0)
    
    # --- FIX: Bersihkan JSON string dari invalid escape chars ---
    # Kadang AI generate LaTeX \t atau \n yang dianggap escape char invalid oleh JSON decoder standard
    # Kita replace single backslash yang tidak diikuti escape char valid dengan double backslash
    # Tapi ini tricky. Cara paling aman: coba parse, kalau gagal, coba raw string repair.
    
    def clean_json_string(s):
        # Hapus trailing comma di array/objek (common AI mistake)
        s = re.sub(r',\s*([\]}])', r'\1', s)
        return s

    json_str = clean_json_string(json_str)

    try:
        # Gunakan strict=False agar bisa handle control characters
        parsed_data = json.loads(json_str, strict=False)
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Faulty JSON: {json_str}")
        # Coba repair brute-force untuk backslash error
        try:
            # Ganti backslash tunggal dengan double, kecuali yang sudah double
            fixed_str = json_str.replace('\\', '\\\\') 
            # Ini mungkin merusak \n \t yang valid, tapi seringkali menyelamatkan \frac{} matematika
            parsed_data = json.loads(fixed_str, strict=False)
        except:
             raise HTTPException(status_code=400, detail=f"Failed to parse JSON: {str(e)}")

    # Normalisasi ke List
    if isinstance(parsed_data, dict):
        questions_list = [parsed_data]
    elif isinstance(parsed_data, list):
        questions_list = parsed_data
    else:
        questions_list = []

    qids = []
    for q_json in questions_list:
        try:
            qid = insert_question_with_options(
                q_json, 
                mapel=qg_input.mapel, 
                topic=qg_input.topic, 
                difficulty=qg_input.difficulty
            )
            qids.append(qid)
        except Exception as e:
            print(f"ERROR inserting question: {e}")

    # Ambil semua object Question lengkap dari DB
    if qids:
        generated_questions = db.query(models.Question).filter(models.Question.id.in_(qids)).all()
    else:
        generated_questions = []

    return generated_questions