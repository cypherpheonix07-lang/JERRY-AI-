@echo off
setlocal enabledelayedexpansion

:: Project directory
set PROJECT_DIR=c:\Users\Phanindra\OneDrive\Desktop\CODING PROJECTS\stark-interface-main
cd /d "%PROJECT_DIR%"

:: Find all possible git installation paths
set GIT_PATHS="C:\Program Files\Git\cmd\git.exe" "C:\Program Files\Git\bin\git.exe" "C:\Program Files (x86)\Git\cmd\git.exe" "C:\Users\%username%\AppData\Local\Programs\Git\cmd\git.exe"

:: Find working git executable
set GIT_FOUND=0
for %%p in (%GIT_PATHS%) do (
    if exist %%p (
        set GIT_PATH=%%p
        set GIT_FOUND=1
        echo Found Git at: %%p
        goto :git_found
    )
)

:git_found
if %GIT_FOUND% equ 0 (
    echo ERROR: Git not found! Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo Starting force upload to GitHub...
echo.

:: Clean existing git repo if it exists
if exist .git (
    echo Removing existing .git directory to start fresh...
    rmdir /s /q .git
)

:: Initialize new repo
echo.
echo 1. Initializing new git repository...
%GIT_PATH% init

:: Configure git
echo.
echo 2. Configuring git...
%GIT_PATH% config --local user.name "cypherpheonix07-lang"
%GIT_PATH% config --local user.email "your-email@example.com"

:: Add all files
echo.
echo 3. Adding all files to staging...
%GIT_PATH% add .

:: Commit
echo.
echo 4. Creating initial commit...
%GIT_PATH% commit -m "Initial commit - force upload stark-interface project"

:: Add remote
echo.
echo 5. Adding GitHub remote...
%GIT_PATH% remote add origin https://github.com/cypherpheonix07-lang/JERRY-AI-.git

:: Force push to main
echo.
echo 6. Force pushing to GitHub main branch...
%GIT_PATH% branch -M main
%GIT_PATH% push -f -u origin main

echo.
echo 7. Verification...
%GIT_PATH% status
%GIT_PATH% remote -v

echo.
echo ==============================================
echo Upload process completed!
echo Check https://github.com/cypherpheonix07-lang/JERRY-AI- to verify.
echo ==============================================
pause