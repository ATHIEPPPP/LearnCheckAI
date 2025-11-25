from fastapi import FastAPI, HTTPException, Depends
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
from training.scripts.qg_service import generate_question_raw
from training.scripts.db import insert_question_with_options

app = FastAPI()

# Dependency untuk mendapatkan session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/qg/generate", response_model=schemas.Question)
def generate_question(qg_input: schemas.QuestionCreate, db: Session = Depends(get_db)):
    context = qg_input.question_text
    raw_question = generate_question_raw(context)

    # Parse raw_question menjadi dictionary
    try:
        q_json = json.loads(raw_question)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Failed to parse Gemini output.")

    # Simpan ke database
    qid = insert_question_with_options(q_json)
    
    return db.query(models.Question).filter(models.Question.id == qid).first()