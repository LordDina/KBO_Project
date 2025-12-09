# Script de démarrage pour PowerShell - KBO CRUD

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Application KBO CRUD" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "[1/4] Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Créer la base de données
if (-not (Test-Path "data\kbo.db")) {
    Write-Host "[2/4] Création de la base de données..." -ForegroundColor Yellow
    npm run db:migrate
    Write-Host ""
    
    Write-Host "[3/4] Chargement des données de test..." -ForegroundColor Yellow
    npm run db:seed
    Write-Host ""
}

# Démarrer le serveur
Write-Host "[4/4] Démarrage du serveur..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Serveur démarré sur http://localhost:3000" -ForegroundColor Green
Write-Host "✓ Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Green
Write-Host ""

npm run dev

# Pause pour voir les messages
Read-Host "Appuyez sur Entrée pour fermer"
