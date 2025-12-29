# backend/app/crud.py
"""Database CRUD operations"""

from sqlalchemy.orm import Session
import models
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
# moved from app/crud.py

