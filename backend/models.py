from sqlalchemy import (
	Column, Integer, String, Text, Boolean, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

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
# moved from app/models.py

