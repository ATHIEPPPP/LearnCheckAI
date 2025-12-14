@echo off
echo ========================================
echo   LearnCheck - Stop All Services
echo ========================================
echo.

echo Stopping PostgreSQL database...
cd training
docker-compose down
echo ✓ Database stopped
echo.

echo Stopping backend...
taskkill /F /IM python.exe 2>nul
echo ✓ Backend stopped
echo.

echo ========================================
echo   All services stopped!
echo ========================================
pause
