@echo off
REM Script de démarrage rapide pour Windows

echo.
echo ====================================
echo  Application KBO CRUD
echo ====================================
echo.

REM Vérifier si node_modules existe
if not exist node_modules (
    echo [1/4] Installation des dépendances...
    call npm install
    echo.
)

REM Créer la base de données
if not exist data\kbo.db (
    echo [2/4] Création de la base de données...
    call npm run db:migrate
    echo.
    
    echo [3/4] Chargement des données de test...
    call npm run db:seed
    echo.
)

REM Démarrer le serveur
echo [4/4] Démarrage du serveur...
echo.
echo ✓ Serveur démarré sur http://localhost:3000
echo ✓ Appuyez sur Ctrl+C pour arrêter
echo.
npm run dev

pause
