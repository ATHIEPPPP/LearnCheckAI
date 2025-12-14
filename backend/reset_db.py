"""Reset database - drop all tables and recreate"""

from app.db import engine, Base

print("Creating tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("Creating default admin...")
from app import models
from sqlalchemy.orm import Session
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

with Session(engine) as db:
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.email == "admin@learncheck.com").first()
    
    if not admin:
        admin = models.User(
            email="admin@learncheck.com",
            username="Admin",
            hashed_password=pwd_context.hash("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
        print(f"Admin created: admin@learncheck.com / admin123")
    else:
        print("Admin already exists")

print("Done! Database reset complete.")
