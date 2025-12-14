# LearnCheck Backend API

Backend API untuk LearnCheck LMS menggunakan FastAPI + PostgreSQL + AI Question Generation.

## ✅ Fitur Lengkap

### 🔐 Authentication & Authorization

- ✅ Register user (student/teacher/admin)
- ✅ Login dengan JWT token
- ✅ Get current user info
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access control

### 📝 Question Generation (AI)

- ✅ Generate soal otomatis dengan Gemini AI
- ✅ Simpan ke database
- ✅ List semua pertanyaan
- ✅ Filter by mapel (mata pelajaran)

### 📚 Materials Management

- ✅ Upload materi (teacher only)
- ✅ List materi by mapel
- ✅ Delete materi
- ✅ Track uploader

### 📊 Quiz Management

- ✅ Create quiz (teacher only)
- ✅ Update quiz settings (timer, enable/disable, dates, attempts)
- ✅ List quizzes
- ✅ Quiz settings: timer, start/end date, show answers, randomize

### 🎯 Remedial Recommendation

- ✅ AI-generated remedial content based on wrong answers

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
cd backend
pip install -r requirement.txt
```

### 2. Setup Database (PostgreSQL)

```bash
cd ../training
docker-compose up -d
```

### 3. Setup Environment Variables

Buat file `.env` di folder `training/`:

```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

### 4. Run Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server akan berjalan di: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 📡 API Endpoints

### Authentication

- `POST /auth/register` - Register user baru
- `POST /auth/login` - Login dan dapatkan JWT token
- `GET /auth/me` - Get current user info (requires auth)

### Questions

- `POST /qg/generate` - Generate soal dengan AI
- `GET /questions` - List semua pertanyaan (filter: `?mapel=Biologi`)
- `GET /questions/{id}` - Get detail pertanyaan

### Materials

- `POST /materials` - Upload materi (teacher only)
- `GET /materials` - List materi (filter: `?mapel=Fisika`)
- `DELETE /materials/{id}` - Hapus materi

### Quizzes

- `POST /quizzes` - Buat quiz baru (teacher only)
- `GET /quizzes` - List semua quiz
- `GET /quizzes/{id}` - Get detail quiz
- `PUT /quizzes/{id}` - Update pengaturan quiz

### Remedial

- `POST /remedial/recommend` - Generate rekomendasi remedial

## 🔑 Authentication Headers

Untuk endpoint yang memerlukan autentikasi, tambahkan header:

```
Authorization: Bearer <your_jwt_token>
```

## 📦 Database Models

- **User**: users (id, email, name, hashed_password, role)
- **Question**: questions (id, question_text, mapel, topic, difficulty, created_by)
- **QuestionChoice**: question_choices (id, question_id, label, text, is_correct)
- **Material**: materials (id, title, description, file_url, mapel, uploaded_by)
- **Quiz**: quizzes (id, title, mapel, duration, enabled, start_date, end_date, settings)

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database (dengan pgvector)
- **JWT** - Authentication
- **Passlib + Bcrypt** - Password hashing
- **Google Gemini AI** - Question generation
- **Pydantic v2** - Data validation

## 📝 Notes

- Entry point tunggal: `backend/app/main.py`
- File lama sudah di-backup: `app_old_backup.py`, `main_old_backup.py`
- CORS sudah di-enable untuk frontend (localhost:5173)
- JWT secret key harus diganti di production
- Database auto-create tables on startup
