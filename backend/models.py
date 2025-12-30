
from backend.db import Base
from sqlalchemy import (
	Column, Integer, String, Text, Boolean, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime

# --- Quiz Model ---
class Quiz(Base):
	__tablename__ = "quizzes"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String(255), nullable=False)
	mapel = Column(String(100), nullable=False)
	duration = Column(Integer, default=60)
	enabled = Column(Boolean, default=True)
	start_date = Column(DateTime, nullable=True)
	end_date = Column(DateTime, nullable=True)
	show_correct_answers = Column(Boolean, default=True)
	randomize_questions = Column(Boolean, default=False)
	max_attempts = Column(Integer, default=1)
	created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow)

	creator = relationship("User", back_populates="quizzes")

# --- Class Model ---
class Class(Base):
	__tablename__ = "classes"

	id = Column(Integer, primary_key=True, index=True)
	class_id = Column(String(255), unique=True, nullable=False, index=True)
	name = Column(String(255), nullable=False)
	subject = Column(String(100), nullable=False)
	teacher_email = Column(String(255), ForeignKey("users.email"), nullable=False)
	teacher_name = Column(String(255), nullable=False)
	students = Column(Text, nullable=True)  # JSON array of student emails
	created_at = Column(DateTime, default=datetime.utcnow)

	teacher = relationship("User", back_populates="created_classes")

# --- Session Model ---
class Session(Base):
	__tablename__ = "sessions"

	id = Column(Integer, primary_key=True, index=True)
	token = Column(String(255), unique=True, nullable=False, index=True)
	email = Column(String(255), nullable=False)
	role = Column(String(20), nullable=False)
	created_at = Column(DateTime, default=datetime.utcnow)



class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	email = Column(String(255), unique=True, nullable=False, index=True)
	username = Column(String(255), nullable=False)
	name = Column(String(255), nullable=True)  # Keep for compatibility
	hashed_password = Column(Text, nullable=False)
	role = Column(String(20), nullable=False, default="student")
	subject = Column(String(100), nullable=True)  # For teachers
	class_id = Column(String(255), nullable=True)  # For students
	created_at = Column(DateTime, default=datetime.utcnow)

	questions = relationship("Question", back_populates="creator")
	materials = relationship("Material", back_populates="uploader")
	quizzes = relationship("Quiz", back_populates="creator")
	created_classes = relationship("Class", back_populates="teacher")


class Question(Base):
	__tablename__ = "questions"

	id = Column(Integer, primary_key=True, index=True)
	question_text = Column(Text, nullable=False)
	mapel = Column(String(100), nullable=False)
	topic = Column(String(255))
	difficulty = Column(String(20), default="sedang")
	explanation = Column(Text)
	created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
	created_at = Column(DateTime, default=datetime.utcnow)

	creator = relationship("User", back_populates="questions")
	choices = relationship("QuestionChoice", back_populates="question", cascade="all, delete-orphan")


class QuestionChoice(Base):
	__tablename__ = "question_choices"

	id = Column(Integer, primary_key=True, index=True)
	question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
	label = Column(String(1))
	text = Column(Text, nullable=False)
	is_correct = Column(Boolean, default=False)

	question = relationship("Question", back_populates="choices")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    mapel = Column(String(100), nullable=False)  # Mata pelajaran
    file_url = Column(String(255), nullable=True)  # Path/URL file materi
    file_type = Column(String(50), nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploader = relationship("User", back_populates="materials")
    created_at = Column(DateTime, default=datetime.utcnow)

class DBQuestion(Base):
    __tablename__ = "db_questions"

    id = Column(String(36), primary_key=True, index=True)
    mapel = Column(String(100), nullable=False) # Judul asli, e.g. "Biologi Dasar"
    mapel_id = Column(String(100), nullable=True, index=True) # Slug untuk filter, e.g. "biologi"
    topic = Column(String(255))
    difficulty = Column(String(20))
    question_text = Column(Text, nullable=False)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)
    option_e = Column(Text)
    correct_answer = Column(String(1))
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
# moved from app/models.py
