# Production Deployment Script for Windows
# Run this script in PowerShell to deploy the application

Write-Host "🚀 Healthcare System - Production Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Environment file found" -ForegroundColor Green

# Step 1: Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
Set-Location backend
npm install
Set-Location ..
Set-Location frontend
npm install
Set-Location ..
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 2: Build frontend
Write-Host ""
Write-Host "🏗️  Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..
Write-Host "✓ Frontend build complete" -ForegroundColor Green

# Step 3: Create required directories
Write-Host ""
Write-Host "📁 Creating required directories..." -ForegroundColor Yellow
$directories = @(
    "backend\uploads\prescriptions",
    "backend\uploads\medicines",
    "backend\uploads\reports",
    "backend\uploads\qr-codes",
    "backend\logs",
    "backend\emergency_logs"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✓ Directories created" -ForegroundColor Green

# Step 4: Security audit
Write-Host ""
Write-Host "🛡️  Running security audit..." -ForegroundColor Yellow
Set-Location backend
npm audit --production
Set-Location ..
Write-Host "✓ Security audit complete" -ForegroundColor Green

# Completion
Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Configure PostgreSQL database" -ForegroundColor White
Write-Host "2. Update .env with production values" -ForegroundColor White
Write-Host "3. Run database seed scripts:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   node seeders/seedRoles.js" -ForegroundColor Gray
Write-Host "   node seeders/seedAdmin.js" -ForegroundColor Gray
Write-Host "4. Start the application:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  PRODUCTION CHECKLIST:" -ForegroundColor Yellow
Write-Host "□ SSL certificates configured" -ForegroundColor White
Write-Host "□ Firewall rules set" -ForegroundColor White
Write-Host "□ Automated backups configured" -ForegroundColor White
Write-Host "□ Monitoring configured" -ForegroundColor White
Write-Host "□ Security documentation reviewed" -ForegroundColor White
Write-Host ""
Write-Host "Happy Healing! 🏥" -ForegroundColor Green
