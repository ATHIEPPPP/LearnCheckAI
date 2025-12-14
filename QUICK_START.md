# 🚀 LearnCheck - Quick Start Guide

## ⚠️ PENTING: Database PostgreSQL Harus Running!

**Akun tidak akan muncul jika PostgreSQL tidak running!**

## 📋 Cara Menjalankan Aplikasi

### Opsi 1: Gunakan Script Otomatis (RECOMMENDED)

**Windows:**

```bash
# Start semua services
start-all.bat

# Cek status
check-status.bat

# Stop semua services
stop-all.bat
```

### Opsi 2: Manual

**1. Start Database (WAJIB dilakukan pertama!):**

```bash
cd training
docker-compose up -d
```

**2. Start Backend:**

```bash
cd backend
python main.py
```

**3. Start Frontend (terminal baru):**

```bash
cd learncheck-frontend
npm run dev
```

## 🔐 Akun Default

Database sudah berisi akun-akun berikut:

| Role  | Email                | Password   | Nama      |
| ----- | -------------------- | ---------- | --------- |
| Admin | admin@learncheck.com | admin123   | Admin     |
| Guru  | apong123@gmail.com   | [lihat DB] | Pak Apong |
| Siswa | abimsgp123@gmail.com | [lihat DB] | Abim      |

## 🔍 Troubleshooting

### Problem: "Akun hilang semua" / Tidak bisa login

**Penyebab:** PostgreSQL database tidak running

**Solusi:**

```bash
# 1. Cek apakah database running
docker ps | findstr postgres

# 2. Jika tidak ada output, jalankan database
cd training
docker-compose up -d

# 3. Tunggu 3-5 detik, lalu cek kembali
check-status.bat
```

### Problem: Backend error "connection refused"

**Solusi:**

```bash
# Pastikan database running dulu
cd training
docker-compose up -d

# Tunggu sebentar lalu start backend
cd ..\backend
python main.py
```

### Problem: Ingin reset database

**Untuk menghapus semua data dan mulai dari awal:**

```bash
# Stop semua services
cd training
docker-compose down -v

# Start ulang (akan create database baru)
docker-compose up -d

# Backend akan auto-create admin user saat pertama kali start
cd ..\backend
python main.py
```

## 📦 Struktur Database

**PostgreSQL Container:**

- Host: `localhost`
- Port: `5432`
- Database: `learncheck_db`
- User: `learncheck_user`
- Password: `learncheck_pwd`

**pgAdmin (Web UI):**

- URL: http://localhost:5050
- Email: athifzaki29@gmail.com
- Password: @anjinglu123

## 🎯 Best Practices

1. **Selalu start database dulu** sebelum backend
2. **Gunakan `start-all.bat`** untuk kemudahan
3. **Gunakan `check-status.bat`** untuk troubleshooting
4. **Jangan manual delete container** kecuali ingin reset data

## 📝 Logs Location

- Backend logs: Console output
- Database logs: `docker-compose logs postgres`
- Frontend logs: Browser console

## 🆘 Quick Commands

```bash
# Cek semua container
docker ps -a

# Cek logs database
cd training
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Cek users di database
cd backend
python -c "from app.db import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SELECT email, username, role FROM users')); [print(f'{row}') for row in result]; conn.close()"
```

## 🔄 Development Workflow

```bash
# Morning: Start semua
start-all.bat

# Development...
# (backend auto-reload dengan uvicorn --reload)
# (frontend auto-reload dengan Vite)

# Evening: Stop semua
stop-all.bat
```

## 💾 Data Persistence

Data disimpan di Docker volume `pgdata`, jadi data **AMAN** meskipun:

- Restart container
- Restart komputer
- Stop/start docker-compose

Data **HILANG** hanya jika:

- Manual delete volume: `docker-compose down -v`
- Delete container dan volume

## 🎓 Tutorial Lengkap

Untuk tutorial lengkap tentang upload materi dan AI integration, lihat:

- `MATERIAL_UPLOAD_GUIDE.md`

Happy Coding! 🚀
