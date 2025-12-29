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
# moved from app/schemas.py

