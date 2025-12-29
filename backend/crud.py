"""Database CRUD operations"""

from sqlalchemy.orm import Session
import backend.models as models
import json
from typing import Optional, List


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
        subject=subject,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_class(db: Session, email: str, class_id: Optional[str]):
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

def delete_session(db: Session, token: str) -> bool:
    session = get_session(db, token)
    if session:
        db.delete(session)
        db.commit()
        return True
    return False


# ===== Class Operations =====

def get_class_by_id(db: Session, class_id: str) -> Optional[models.Class]:
    return db.query(models.Class).filter(models.Class.class_id == class_id).first()

def get_classes_by_teacher(db: Session, teacher_email: str) -> List[models.Class]:
    return db.query(models.Class).filter(models.Class.teacher_email == teacher_email).all()

def create_class(db: Session, class_id: str, name: str, subject: str,
                 teacher_email: str, teacher_name: str) -> models.Class:
    cls = models.Class(
        class_id=class_id,
        name=name,
        subject=subject,
        teacher_email=teacher_email,
        teacher_name=teacher_name,
        students="[]",
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return cls

def add_student_to_class(db: Session, class_id: str, student_email: str) -> bool:
    cls = get_class_by_id(db, class_id)
    if cls:
        students = json.loads(cls.students or "[]")
        if student_email not in students:
            students.append(student_email)
            cls.students = json.dumps(students)
            db.commit()
            db.refresh(cls)
        return True
    return False

def remove_student_from_class(db: Session, class_id: str, student_email: str) -> bool:
    cls = get_class_by_id(db, class_id)
    if cls:
        students = json.loads(cls.students or "[]")
        if student_email in students:
            students.remove(student_email)
            cls.students = json.dumps(students)
            db.commit()
            db.refresh(cls)
        return True
    return False


# ===== Quiz Settings Operations =====

def get_quiz_settings(db: Session, mapel: str) -> Optional[models.Quiz]:
    return db.query(models.Quiz).filter(models.Quiz.mapel == mapel).order_by(models.Quiz.created_at.desc()).first()

def upsert_quiz_settings(db: Session, mapel: str, enabled: bool, timer: int,
                         start_date, end_date, show_correct_answers: bool,
                         randomize_questions: bool, attempts: int,
                         created_by: int = 1) -> models.Quiz:
    quiz = get_quiz_settings(db, mapel)
    if quiz:
        quiz.enabled = enabled
        quiz.duration = timer
        quiz.start_date = start_date
        quiz.end_date = end_date
        quiz.show_correct_answers = show_correct_answers
        quiz.randomize_questions = randomize_questions
        quiz.max_attempts = attempts
    else:
        quiz = models.Quiz(
            title=f"Quiz {mapel}",
            mapel=mapel,
            enabled=enabled,
            duration=timer,
            start_date=start_date,
            end_date=end_date,
            show_correct_answers=show_correct_answers,
            randomize_questions=randomize_questions,
            max_attempts=attempts,
            created_by=created_by,
        )
        db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz
