# Healthcare Management System

A comprehensive full-stack healthcare management platform with secure role-based authentication and multiple user portals for Patients, Doctors, Pharmacies, Labs, and Administrators.

## 🏥 Features

### Patient Portal
- Registration & profile management
- Family member management
- Appointment booking & tracking
- View prescriptions with medicine photos
- Medicine reminders
- Medical records vault
- Secure doctor chat
- Emergency SOS & health card QR code
- Insurance management

### Doctor Portal
- Registration (requires admin approval)
- Appointment management & queue system
- Patient medical history (with consent)
- Create prescriptions with medicine photos
- Medical report uploads
- Secure patient messaging

### Pharmacy Portal
- Prescription verification via QR code
- Medicine inventory management
- Prescription fulfillment tracking
- Medicine photo uploads

### Lab Portal
- Test request management
- Lab report uploads
- Patient record linking

### Admin Portal
- User management (all roles)
- Doctor & pharmacy approval system
- Medicine master database
- System statistics & audit logs
- Role & permission management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "c:\Users\mahes\Downloads\major project"
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=healthcare_db
     DB_USER=postgres
     DB_PASSWORD=your_password
     JWT_SECRET=your_secret_key
     ```

4. **Create PostgreSQL database**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE healthcare_db;
   \q
   ```

5. **Seed the database**
   ```bash
   # Seed roles
   node backend/seeders/seedRoles.js
   
   # Seed admin user
   node backend/seeders/seedAdmin.js
   ```

6. **Start the application**
   ```bash
   # Development mode (both backend and frontend)
   npm run dev
   
   # Or start separately:
   npm run backend    # Backend on http://localhost:5000
   npm run frontend   # Frontend on http://localhost:3000
   ```

## 📁 Project Structure

```
healthcare-management-system/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication, validation, etc.
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── seeders/         # Database seeders
│   ├── utils/           # Utility functions
│   ├── uploads/         # File uploads
│   └── server.js        # Express server
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # React context (auth, etc.)
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── App.js       # Main app component
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Default Credentials

### Admin Account
- **Email:** admin@healthcare.com
- **Password:** Admin@123

**⚠️ Important:** Change the admin password after first login!

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register/patient` - Register as patient
- `POST /api/auth/register/doctor` - Register as doctor (requires approval)
- `POST /api/auth/register/pharmacy` - Register pharmacy (requires approval)
- `POST /api/auth/register/lab` - Register lab (requires approval)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/confirm` - Confirm password reset

Full AP I documentation will be added as development continues.

## 🛠️ Technology Stack

### Backend
- **Framework:** Node.js + Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **QR Codes:** qrcode library
- **Validation:** express-validator
- **Security:** Helmet, CORS

### Frontend
- **Framework:** React.js
- **Routing:** React Router
- **HTTP Client:** Axios
- **Styling:** CSS (premium design)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation
- File upload restrictions
- Activity logging for audit trail
- Patient consent management
- Secure file storage

## 🧪 Development

### Running Tests
```bash
cd backend
npm test
```

### Database Migrations
```bash
# Sync database schema
npm run migrate
```

### Seeding Data
```bash
npm run seed
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@healthcare-system.com or create an issue in the repository.

---

**Built with ❤️ for healthcare professionals and patients**
