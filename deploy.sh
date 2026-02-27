#!/bin/bash
# Production Deployment Script for Healthcare Management System
# Run this script to deploy the application to production

set -e  # Exit on error

echo "🚀 Healthcare System - Production Deployment"
echo "============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Verify required environment variables
REQUIRED_VARS=("DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET" "ENCRYPTION_KEY")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Environment variables validated${NC}"

# Step 1: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 2: Test database connection
echo ""
echo "🔌 Testing database connection..."
cd backend
node -e "const { testConnection } = require('./config/database'); testConnection().then(() => process.exit(0)).catch(() => process.exit(1));"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi
cd ..

# Step 3: Run database migrations
echo ""
echo "🗄️  Running database migrations..."
cd backend
node -e "const { sequelize } = require('./config/database'); sequelize.sync({ alter: true }).then(() => { console.log('Database synced'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
echo -e "${GREEN}✓ Database migrations complete${NC}"
cd ..

# Step 4: Seed initial data
echo ""
echo "🌱 Seeding initial data..."
cd backend
node seeders/seedRoles.js
node seeders/seedAdmin.js
echo -e "${GREEN}✓ Initial data seeded${NC}"
cd ..

# Step 5: Build frontend
echo ""
echo "🏗️  Building frontend..."
cd frontend
npm run build
echo -e "${GREEN}✓ Frontend build complete${NC}"
cd ..

# Step 6: Create required directories
echo ""
echo "📁 Creating required directories..."
mkdir -p backend/uploads/prescriptions
mkdir -p backend/uploads/medicines
mkdir -p backend/uploads/reports
mkdir -p backend/uploads/qr-codes
mkdir -p backend/logs
mkdir -p backend/emergency_logs
echo -e "${GREEN}✓ Directories created${NC}"

# Step 7: Set permissions
echo ""
echo "🔐 Setting file permissions..."
chmod 755 backend/uploads
chmod 755 backend/logs
chmod 755 backend/emergency_logs
echo -e "${GREEN}✓ Permissions set${NC}"

# Step 8: Generate encryption key if not exists
echo ""
echo "🔑 Checking encryption key..."
if [ -z "$ENCRYPTION_KEY" ] || [ "$ENCRYPTION_KEY" == "generate_random_32_byte_hex_string_here" ]; then
    echo -e "${YELLOW}⚠️  Encryption key not set. Generate one using:${NC}"
    echo "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo "Then update your .env file"
else
    echo -e "${GREEN}✓ Encryption key configured${NC}"
fi

# Step 9: Security check
echo ""
echo "🛡️  Running security checks..."
cd backend
npm audit --production
cd ..
echo -e "${GREEN}✓ Security audit complete${NC}"

# Step 10: Start application
echo ""
echo "🚀 Starting application..."
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "Backend will run on: http://localhost:${PORT:-5000}"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo "1. Configure SSL certificates for HTTPS"
echo "2. Set up reverse proxy (nginx/Apache)"
echo "3. Configure firewall rules"
echo "4. Set up automated backups"
echo "5. Configure monitoring and alerting"
echo "6. Review security documentation in backend/docs/SECURITY.md"
echo ""
echo -e "${GREEN}Happy Healing! 🏥${NC}"
