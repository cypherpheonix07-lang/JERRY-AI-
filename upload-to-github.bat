@echo off
cd /d "c:\Users\Phanindra\OneDrive\Desktop\CODING PROJECTS\stark-interface-main"

:: Set the path to git
set GIT_PATH="C:\Program Files\Git\cmd\git.exe"

echo Initializing git repository...
%GIT_PATH% init

echo Adding files...
%GIT_PATH% add .

echo Committing files...
%GIT_PATH% commit -m "Initial commit - upload stark-interface project"

echo Adding remote origin...
%GIT_PATH% remote add origin https://github.com/cypherpheonix07-lang/stark-interface.git

echo Renaming branch to main...
%GIT_PATH% branch -M main

echo Pushing to GitHub...
%GIT_PATH% push -u origin main

echo Done!
pause