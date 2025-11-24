from typing import List, Optional
from pydantic import BaseModel, Field

# ---------- User (sederhana dulu) ----------
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: str = "teacher"

class UserCreate(UserBase):
    password: str = Field(min_length=6)

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True  # Pydantic v2


# ---------- Question ----------
class QuestionChoiceBase(BaseModel):
    label: str
    text: str
    is_correct: bool = False

class QuestionChoiceCreate(QuestionChoiceBase):
    pass

class QuestionChoiceOut(QuestionChoiceBase):
    id: int

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    mapel: str
    question_text: str
    difficulty: Optional[str] = None
    topic: Optional[str] = None
    bloom_level: Optional[str] = None

class QuestionCreate(QuestionBase):
    choices: List[QuestionChoiceCreate]

class QuestionOut(QuestionBase):
    id: int
    status: str
    choices: List[QuestionChoiceOut]

    class Config:
        from_attributes = True
