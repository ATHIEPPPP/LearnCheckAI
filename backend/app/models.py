from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)  # admin/teacher/student
    full_name = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="creator")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    mapel = Column(Text)
    question_text = Column(Text, nullable=False)
    difficulty = Column(String(10))  # mudah/sedang/sulit
    topic = Column(Text)
    bloom_level = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    source_material_id = Column(Integer, nullable=True)
    status = Column(String(20), default="active")

    creator = relationship("User", back_populates="questions")
    choices = relationship("QuestionChoice", back_populates="question",
                           cascade="all, delete-orphan")


class QuestionChoice(Base):
    __tablename__ = "question_choices"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    label = Column(String(1))   # A/B/C/D/E
    text = Column(Text)
    is_correct = Column(Boolean, default=False)

    question = relationship("Question", back_populates="choices")
