from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .routers import questions
from .models import User

app = FastAPI(title="LearnCheck Backend")

# Buat tabel kalau belum ada
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    # Test sederhana: hitung user
    db.execute("SELECT 1")
    return {"status": "ok"}

app.include_router(questions.router)
