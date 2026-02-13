@echo off
REM Script para desplegar la funcionalidad de Actividades en Google Cloud (Windows)
REM Uso: deploy-activities.bat

echo.
echo ========================================
echo   Despliegue de Actividades - IOIO
echo ========================================
echo.

REM Verificar que gcloud está instalado
where gcloud >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: gcloud CLI no esta instalado
    echo Descargalo de: https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Obtener proyecto actual
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i
if "%PROJECT_ID%"=="" (
    echo ERROR: No hay proyecto configurado en gcloud
    echo Ejecuta: gcloud config set project YOUR_PROJECT_ID
    exit /b 1
)
echo Proyecto: %PROJECT_ID%
echo.

REM Paso 1: Aplicar migración
echo [1/4] Aplicando migracion de base de datos...
echo.
echo OPCION 1: Conectarse manualmente a Cloud SQL
echo   gcloud sql connect ioio-postgres --user=postgres
echo   Luego ejecuta: \i database/migration_add_activities.sql
echo.
echo OPCION 2: Usar Cloud SQL Proxy (recomendado)
echo.
set /p CONTINUE="Presiona Enter cuando hayas aplicado la migracion manualmente..."

REM Paso 2: Actualizar backend
echo.
echo [2/4] Actualizando servidor backend...
gcloud compute ssh ioio-backend --zone=us-central1-a --command="cd /opt/ioio && sudo git pull origin main && cd backend && sudo docker stop ioio-backend && sudo docker rm ioio-backend && sudo docker build -t ioio-backend . && sudo docker run -d --name ioio-backend --restart unless-stopped -p 5000:5000 --env-file .env ioio-backend npm start"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al actualizar el backend
    exit /b 1
)
echo Backend actualizado correctamente
echo.

REM Esperar a que el backend inicie
echo Esperando a que el backend inicie...
timeout /t 10 /nobreak >nul

REM Paso 3: Actualizar frontend
echo [3/4] Actualizando servidor frontend...
gcloud compute ssh ioio-frontend --zone=us-central1-a --command="cd /opt/ioio && sudo git pull origin main && cd frontend && sudo docker stop ioio-frontend && sudo docker rm ioio-frontend && sudo docker build -t ioio-frontend . && sudo docker run -d --name ioio-frontend --restart unless-stopped -p 3000:3000 ioio-frontend"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al actualizar el frontend
    exit /b 1
)
echo Frontend actualizado correctamente
echo.

REM Paso 4: Obtener IPs
echo [4/4] Obteniendo informacion de despliegue...
for /f "tokens=*" %%i in ('gcloud compute instances describe ioio-backend --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)"') do set BACKEND_IP=%%i
for /f "tokens=*" %%i in ('gcloud compute instances describe ioio-frontend --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)"') do set FRONTEND_IP=%%i

echo.
echo ========================================
echo   DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo URLs de acceso:
echo   Backend API:    http://%BACKEND_IP%:5000/api/activities
echo   Frontend:       http://%FRONTEND_IP%:3000/actividades
echo   Admin Panel:    http://%FRONTEND_IP%:3000/admin/activities
echo.
echo Prueba el endpoint:
echo   curl http://%BACKEND_IP%:5000/api/activities
echo.
echo Proximos pasos:
echo   1. Accede al panel admin: http://%FRONTEND_IP%:3000/admin
echo   2. Ve a la seccion 'Actividades'
echo   3. Crea tu primera actividad
echo   4. Verifica que aparezca en: http://%FRONTEND_IP%:3000/actividades
echo.
echo ========================================
echo.
pause
