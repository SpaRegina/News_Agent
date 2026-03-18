@echo off
setlocal

set "ROOT=%~dp0"
set "NODE_BIN=C:\Program Files\nodejs"
set "NPM_CMD=npm"
if exist "%NODE_BIN%\npm.cmd" (
    set "NPM_CMD=%NODE_BIN%\npm.cmd"
    set "PATH=%NODE_BIN%;%PATH%"
)

echo Starting Docker containers...
start "News Agent - Docker" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%ROOT%'; docker compose up -d"

echo Starting Backend...
start "News Agent - Backend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%ROOT%backend'; & '.\venv\Scripts\python.exe' -m uvicorn main:app --reload --port 8000"

echo Starting Celery Worker...
start "News Agent - Worker" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%ROOT%'; & '.\backend\venv\Scripts\python.exe' -m celery -A workers.celery_app worker --loglevel=info"

echo Starting Frontend...
start "News Agent - Frontend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%ROOT%frontend'; & '%NPM_CMD%' run dev"

echo Services are starting in separate windows.
echo Frontend: http://localhost:3000
