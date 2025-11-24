from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

@router.get("/", response_model=List[schemas.QuestionOut])
def list_questions(
    mapel: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Question).filter(models.Question.status == "active")
    if mapel:
        query = query.filter(models.Question.mapel == mapel)
    return query.all()


@router.post("/", response_model=schemas.QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    payload: schemas.QuestionCreate,
    db: Session = Depends(get_db),
):
    # TODO: nanti ambil created_by dari auth (JWT), untuk sekarang None
    q = models.Question(
        mapel=payload.mapel,
        question_text=payload.question_text,
        difficulty=payload.difficulty,
        topic=payload.topic,
        bloom_level=payload.bloom_level,
        created_by=None,
    )
    db.add(q)
    db.flush()  # supaya q.id terisi

    for ch in payload.choices:
        qc = models.QuestionChoice(
            question_id=q.id,
            label=ch.label.upper(),
            text=ch.text,
            is_correct=ch.is_correct,
        )
        db.add(qc)

    db.commit()
    db.refresh(q)
    return q


@router.get("/{question_id}", response_model=schemas.QuestionOut)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q
