# Healthcare Management System - Quick Start Guide

## Prerequisites
- Node.js v16 or higher
- PostgreSQL v13 or higher
- npm (comes with Node.js)

## Step-by-Step Setup

### 1. Create PostgreSQL Database
```powershell
# Open PowerShell and run:
psql -U postgres

# In psql prompt:
CREATE DATABASE healthcare_db;
\q
```

If you don't have PostgreSQL installed:
- Download from: https://www.postgresql.org/download/windows/
- During installation, note your postgres user password

### 2. Configure Environment Variables
```powershell
# Navigate to project directory
cd "c:\Users\mahes\Downloads\major project"

# Copy the example environment file
Copy-Item .env.example .env

# Edit .env file with your settings
notepad .env
```

Update these values in `.env`:
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=change_this_to_a_random_string_at_least_32_characters_long
```

### 3. Install Dependencies
```powershell
# Install root package dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 4. Initialize Database
```powershell
# Create roles in database
node backend/seeders/seedRoles.js

# Create admin user
node backend/seeders/seedAdmin.js
```

You should see:
```
✅ Created role: Admin
✅ Created role: Doctor
✅ Created role: Patient
✅ Created role: Pharmacy
✅ Created role: Lab
✅ Admin user created successfully
```

### 5. Start the Application
```powershell
# Option 1: Run both backend and frontend together
npm run dev

# Option 2: Run separately (open two PowerShell windows)
# Window 1:
npm run backend

# Window 2:
npm run frontend
```

### 6. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

### 7. Login
Navigate to http://localhost:3000/login

**Admin Credentials:**
- Email: `admin@healthcare.com`
- Password: `Admin@123`

**Or Register a New Patient:**
1. Click "Register here"
2. Select "Patient" role
3. Fill in your details
4. Submit (auto-login after registration)

## Troubleshooting

### Database Connection Error
If you see "Unable to connect to the database":
1. Make sure PostgreSQL is running
2. Check DB_PASSWORD in `.env` matches your postgres password
3. Verify database `healthcare_db` exists

### Port Already in Use
If port 5000 or 3000 is busy:
1. Edit `.env` and change PORT to another number (e.g., 5001)
2. Update FRONTEND_URL in `.env if needed
3. Restart the application

### Module Not Found Errors
Run:
```powershell
npm run install:all
```

## Next Steps
- ✅ Login as admin to explore the admin dashboard
- ✅ Register as a patient to see the patient portal
- ✅ Register as a doctor (requires admin approval)
- 📖 Read README.md for full documentation
- 📖 Check walkthrough.md for detailed system overview

## Quick Commands Reference
```powershell
# Start development servers
npm run dev

# Start backend only
npm run backend

# Start frontend only  
npm run frontend

# Reinstall all dependencies
npm run install:all

# Reseed database
node backend/seeders/seedRoles.js
node backend/seeders/seedAdmin.js
```

---

**Need Help?** Check the full [README.md](file:///c:/Users/mahes/Downloads/major%20project/README.md) for detailed documentation.
