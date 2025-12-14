@echo off
echo ========================================
echo   LearnCheck - Check Services Status
echo ========================================
echo.

echo [Database Status]
cd training
docker-compose ps
echo.

echo [Backend Status]
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if errorlevel 1 (
    echo Backend: NOT RUNNING
) else (
    echo Backend: RUNNING
)
echo.

echo [Database Connection Test]
cd ..\backend
python -c "from app.db import engine; conn = engine.connect(); print('✓ Database connection: OK'); conn.close()" 2>nul
if errorlevel 1 (
    echo ✗ Database connection: FAILED
)
echo.

echo [Users in Database]
python -c "from app.db import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SELECT COUNT(*) FROM users')); count = result.scalar(); print(f'Total users: {count}'); conn.close()" 2>nul
echo.

pause
