@echo off
echo ========================================
echo   LearnCheck - Start All Services
echo ========================================
echo.

echo [1/3] Starting PostgreSQL database...
cd training
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start database!
    pause
    exit /b 1
)
echo ✓ Database started successfully
echo.

echo [2/3] Waiting for database to be ready...
timeout /t 3 /nobreak >nul
echo ✓ Database ready
echo.

echo [3/3] Starting backend server...
cd ..\backend
echo Backend will start in a new window...
start cmd /k "python main.py"
echo ✓ Backend starting...
echo.

echo ========================================
echo   All services started!
echo ========================================
echo.
echo Database:  http://localhost:5050 (pgAdmin)
echo Backend:   http://localhost:8000
echo.
echo Login credentials:
echo   Admin:   admin@learncheck.com / admin123
echo   Guru:    apong123@gmail.com / [password]
echo   Siswa:   abimsgp123@gmail.com / [password]
echo.
echo To start frontend, open new terminal and run:
echo   cd learncheck-frontend
echo   npm run dev
echo.
pause
