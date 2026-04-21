@echo off
title X-Post Studio Server
echo ========================================
echo     REPLY+QUOTE - X-POST STUDIO
echo ========================================
echo.
echo [1/2] Lancement du serveur Python...
start /b python server.py
echo [2/2] Attente du serveur...
timeout /t 3 /nobreak > nul
echo [3/3] Ouverture de l'interface...
start http://localhost:5000
echo.
echo ----------------------------------------
echo LE SERVEUR EST ACTIF.
echo Gardez cette fenetre ouverte pendant l'utilisation.
echo ----------------------------------------
echo.
pause
