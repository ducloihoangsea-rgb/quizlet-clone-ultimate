@echo off
title Build Quizlet Clone Production
echo ===================================================
echo   BUILD QUIZLET CLONE PRODUCTION (TURBO + PNPM)
echo ===================================================

:: Tu dong xac dinh lenh pnpm hoac npx pnpm
set PM=pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Khong tim thay pnpm trong PATH, tu dong su dung "npx pnpm".
    set PM=npx pnpm
)

:: Kiem tra file .env
if not exist .env (
    echo [WARNING] File .env chua co. Vui long tao file .env tu .env.example va cau hinh database truoc khi build.
    pause
    exit /b 1
)

:: Cai dat dependencies neu chua co node_modules
if not exist node_modules (
    echo [INFO] Dang tien hanh cai dat cac thu vien (%PM% install)...
    %PM% install
)

:: Tien hanh build bang Turborepo de dat toc do nhanh nhat
echo [INFO] Dang build ung dung voi Turborepo (build sieu toc)...
%PM% build

if %errorlevel% neq 0 (
    echo [ERROR] Qua trinh build xay ra loi!
    pause
    exit /b 1
)

:: Xoa bo cac file rac va cache khong can thiet sau khi build
echo [INFO] Dang don dep cache va file rac de giam dung luong...
if exist .turbo rd /s /q .turbo
if exist .cache rd /s /q .cache

:: Ghi file Require.txt de nguoi dung biet can mang gi di
echo [INFO] Dang tao file Require.txt...
(
echo [DANH SACH FILE/FOLDER CAN THIET DE CHAY PHAN MEM TREN MAY MOI]
echo 1. .env ^(Chua cac cau hinh moi truong, database^)
echo 2. package.json va pnpm-workspace.yaml ^(De chay lenh start hoac cai dat lai tren he thong^)
echo 3. apps/nextjs/.next ^(Thu muc web build production^)
echo 4. apps/nextjs/package.json
echo 5. packages/ ^(Chua backend, db, ui va validators cua monorepo^)
echo 6. node_modules/ ^(Cac thu vien da duoc cai dat^)
echo.
echo [YEU CAU HE THONG MOI]
echo - Node.js phien ban >= 22.10.0
echo - PNPM phien ban ^(pnpm install -g pnpm hoac dung npx pnpm^)
echo - Database PostgreSQL ^(vi du: Supabase hoac Neon.tech hoac Local PostgreSQL^)
) > Require.txt

echo ===================================================
echo   BUILD THANH CONG VA DA DON DEP CAC FILE RAC!
echo   Chi tiet file can thiet da duoc ghi vao Require.txt
echo ===================================================
pause
