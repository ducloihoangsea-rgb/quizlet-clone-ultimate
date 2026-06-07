@echo off
title Running Quizlet Clone Dev Server
echo ===================================================
echo   KHOI DONG QUIZLET CLONE DEV SERVER (PNPM)
echo ===================================================

:: Tu dong xac dinh lenh pnpm hoac npx pnpm
set PM=pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Khong tim thay pnpm trong PATH, tu dong su dung "npx pnpm".
    set PM=npx pnpm
)

:: Tao file .env neu chua co
if not exist .env (
    if exist .env.example (
        echo [INFO] Dang tao file .env tu .env.example...
        copy .env.example .env
        echo [WARNING] Da tao file .env. Vui long mo file .env va dien thong tin database, auth secrets truoc khi chay!
    ) else (
        echo [WARNING] Khong tim thay file .env.example de sao chep.
    )
)

:: Cai dat dependencies neu chua co node_modules
if not exist node_modules (
    echo [INFO] Dang tien hanh cai dat cac thu vien (%PM% install)...
    %PM% install
)

:: Chay server dev
echo [INFO] Dang khoi dong development server...
%PM% dev
pause
