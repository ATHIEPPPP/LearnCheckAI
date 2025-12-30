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
	mapel: str
	file_url: Optional[str] = None
	file_type: Optional[str] = None
	created_at: datetime

	class Config:
		from_attributes = True

# ==================== CLASS SCHEMAS ====================

class CreateClassRequest(BaseModel):
    name: str
    subject: str = None
    role: str = "teacher"

class StudentInfo(BaseModel):
    email: str
    name: str
    username: str

class ClassResponse(BaseModel):
    class_id: str
    name: str
    subject: str
    teacher_email: str
    teacher_name: str
    students: List[StudentInfo] = [] 

    class Config:
        from_attributes = True
# moved from app/schemas.py

