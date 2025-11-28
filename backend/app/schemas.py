# backend/app/schemas.py

from pydantic import BaseModel
from typing import List, Optional

class QuestionChoiceBase(BaseModel):
    label: str
    text: str
    is_correct: bool

class QuestionBase(BaseModel):
    question_text: str
    mapel: str
    topic: str
    difficulty: Optional[str] = "sedang"
    explanation: Optional[str] = None
    choices: List[QuestionChoiceBase]  # Mendefinisikan choices sebagai list

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int

    class Config:
        orm_mode = True

class RemedialRequest(BaseModel):
    mapel: str
    wrong_questions: List[str]

