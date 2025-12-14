# backend/app/schemas.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# ==================== AUTH SCHEMAS ====================

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str

    class Config:
        from_attributes = True

# ==================== QUESTION SCHEMAS ====================

class QuestionChoiceBase(BaseModel):
    label: str
    text: str
    is_correct: bool

class QuestionCreate(BaseModel):
    question_text: Optional[str] = None
    mapel: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = "sedang"

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    mapel: str
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

# ==================== MATERIAL SCHEMAS ====================

class MaterialCreate(BaseModel):
    title: str
    description: Optional[str] = None
    file_url: str
    file_type: Optional[str] = "document"
    mapel: str

class MaterialResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    file_url: str
    file_type: str
    mapel: str
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== QUIZ SCHEMAS ====================

class QuizCreate(BaseModel):
    title: str
    mapel: str
    duration: Optional[int] = 60
    enabled: Optional[bool] = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    show_correct_answers: Optional[bool] = True
    randomize_questions: Optional[bool] = False
    max_attempts: Optional[int] = 1

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    enabled: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    show_correct_answers: Optional[bool] = None
    randomize_questions: Optional[bool] = None
    max_attempts: Optional[int] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    mapel: str
    duration: int
    enabled: bool
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    show_correct_answers: bool
    randomize_questions: bool
    max_attempts: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== REMEDIAL SCHEMAS ====================

class RemedialRequest(BaseModel):
    mapel: str
    wrong_questions: List[str]

