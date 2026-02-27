# 🚀 Quick Database Setup

Since psql is not in your PATH, let's use pgAdmin or manual setup:

## Option 1: Using pgAdmin (Easiest)

1. **Open pgAdmin 4** (installed with PostgreSQL)
   - Start Menu → PostgreSQL → pgAdmin 4

2. **Connect to PostgreSQL:**
   - Right-click "Servers" → Create → Server
   - Name: "Local"
   - Connection tab:
     - Host: localhost
     - Port: 5432
     - Username: postgres
     - Password: (your PostgreSQL password)

3. **Create Database:**
   - Right-click "Databases" → Create → Database
   - Database name: `healthcare_db`
   - Click Save

## Option 2: Add PostgreSQL to PATH

1. Press `Win + X` → System
2. Advanced system settings → Environment Variables
3. Under "System variables", find "Path"
4. Click "Edit" → "New"
5. Add: `C:\Program Files\PostgreSQL\16\bin`
6. Click OK → OK → OK
7. **Restart Command Prompt/PowerShell**

## Option 3: Use full path

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql" -U postgres -c "CREATE DATABASE healthcare_db;"
```

---

## ⚠️ IMPORTANT: Update .env Password

**Edit:** `backend\.env`

Find this line:
```
DB_PASSWORD=your_password_here
```

Change to your actual PostgreSQL password (the one you set during installation):
```
DB_PASSWORD=postgres
```
(or whatever password you chose)

---

## After database is created:

```powershell
cd "c:\Users\mahes\Downloads\major project\backend"
node seeders/seedRoles.js
node seeders/seedAdmin.js
npm start
```

**Which option works best for you?**
