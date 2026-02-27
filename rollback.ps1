# Production Rollback Script
# Use this script to rollback to a previous version in case of deployment issues

Write-Host "🔄 Healthcare System - Rollback Procedure" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$rollbackConfirm = Read-Host "Are you sure you want to rollback? (yes/no)"
if ($rollbackConfirm -ne "yes") {
    Write-Host "Rollback cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "⚠️  ROLLBACK STEPS:" -ForegroundColor Yellow
Write-Host ""

# Step 1: Stop application
Write-Host "1. Stop the application" -ForegroundColor White
Write-Host "   - Press Ctrl+C in the terminal running the app" -ForegroundColor Gray
Write-Host "   - Or: taskkill /F /IM node.exe" -ForegroundColor Gray
Read-Host "Press Enter when application is stopped"

# Step 2: Restore database backup
Write-Host ""
Write-Host "2. Restore database from backup" -ForegroundColor White
Write-Host "   PostgreSQL restore command:" -ForegroundColor Gray
Write-Host "   psql -U <username> -d <dbname> < backup_file.sql" -ForegroundColor Gray
Write-Host ""
$dbRestore = Read-Host "Have you restored the database backup? (yes/no)"
if ($dbRestore -ne "yes") {
    Write-Host "⚠️  Database not restored. Rollback incomplete." -ForegroundColor Red
    exit 1
}

# Step 3: Restore code
Write-Host ""
Write-Host "3. Restore previous code version" -ForegroundColor White
Write-Host "   Git command:" -ForegroundColor Gray
Write-Host "   git checkout <previous-commit-hash>" -ForegroundColor Gray
Write-Host ""
$codeRestore = Read-Host "Have you restored the previous code version? (yes/no)"
if ($codeRestore -ne "yes") {
    Write-Host "⚠️  Code not restored. Rollback incomplete." -ForegroundColor Red
    exit 1
}

# Step 4: Reinstall dependencies
Write-Host ""
Write-Host "4. Reinstalling dependencies..." -ForegroundColor Yellow
npm install
Set-Location backend
npm install
Set-Location ..
Set-Location frontend
npm install
Set-Location ..
Write-Host "✓ Dependencies reinstalled" -ForegroundColor Green

# Step 5: Rebuild frontend
Write-Host ""
Write-Host "5. Rebuilding frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..
Write-Host "✓ Frontend rebuilt" -ForegroundColor Green

# Step 6: Clear logs
Write-Host ""
Write-Host "6. Clearing recent logs..." -ForegroundColor Yellow
Remove-Item backend\logs\*.log -Force -ErrorAction SilentlyContinue
Write-Host "✓ Logs cleared" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Rollback complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Start the application with: npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "POST-ROLLBACK CHECKLIST:" -ForegroundColor Yellow
Write-Host "□ Verify application starts without errors" -ForegroundColor White
Write-Host "□ Test critical user flows" -ForegroundColor White
Write-Host "□ Check database integrity" -ForegroundColor White
Write-Host "□ Review error logs" -ForegroundColor White
Write-Host "□ Notify stakeholders of rollback" -ForegroundColor White
Write-Host ""
