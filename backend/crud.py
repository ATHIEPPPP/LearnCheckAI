# backend/app/crud.py
"""Database CRUD operations"""

from sqlalchemy.orm import Session
import backend.models as models
import json
from typing import Optional, List, Dict


# ===== User Operations =====

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
	return db.query(models.User).filter(models.User.email == email).first()

def get_all_users(db: Session) -> List[models.User]:
	return db.query(models.User).all()

def create_user(db: Session, email: str, username: str, hashed_password: str, 
				role: str, subject: Optional[str] = None) -> models.User:
	user = models.User(
		email=email,
		username=username,
		hashed_password=hashed_password,
		role=role,
		subject=subject
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	return user

def update_user_class(db: Session, email: str, class_id: str):
	user = get_user_by_email(db, email)
	if user:
		user.class_id = class_id
		db.commit()
		db.refresh(user)
	return user

def delete_user(db: Session, email: str) -> bool:
	user = get_user_by_email(db, email)
	if user:
		db.delete(user)
		db.commit()
		return True
	return False


# ===== Session Operations =====

def create_session(db: Session, token: str, email: str, role: str) -> models.Session:
	session = models.Session(token=token, email=email, role=role)
	db.add(session)
	db.commit()
	db.refresh(session)
	return session

def get_session(db: Session, token: str) -> Optional[models.Session]:
	return db.query(models.Session).filter(models.Session.token == token).first()

# ===== Class Operations =====
def get_classes_by_teacher(db: Session, teacher_email: str) -> List[models.Class]:
	"""Get all classes created by a teacher (by email)."""
	return db.query(models.Class).filter(models.Class.teacher_email == teacher_email).all()

# ===== Quiz Settings Operations =====
def get_quiz_settings(db: Session, mapel: str) -> Optional[models.Quiz]:
	"""Get the most recent quiz settings for this subject (mapel)."""
	return db.query(models.Quiz).filter(models.Quiz.mapel == mapel).order_by(models.Quiz.created_at.desc()).first()

