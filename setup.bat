@echo off
echo Setting up IOIO E-Commerce Platform...

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo WARNING: Please edit .env file with your configuration before continuing!
    pause
    exit /b 1
)

REM Create uploads directory
if not exist backend\uploads mkdir backend\uploads
type nul > backend\uploads\.gitkeep

REM Build and start containers
echo Building Docker containers...
docker-compose build

echo Starting services...
docker-compose up -d

REM Wait for database
echo Waiting for database to be ready...
timeout /t 10 /nobreak

REM Run database setup
echo Setting up database...
docker-compose exec backend npm run db:setup

echo.
echo Setup complete!
echo.
echo Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    Admin Panel: http://localhost:3000/admin
echo.
echo Default admin credentials:
echo    Email: admin@ioio.com
echo    Password: admin123
echo.
echo WARNING: Remember to change the admin password after first login!
pause
