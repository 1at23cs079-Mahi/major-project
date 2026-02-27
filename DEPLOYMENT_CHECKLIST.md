# Healthcare System - Deployment Checklist

## 🚀 Pre-Deployment Checklist

### Environment Setup

- [ ] **Node.js Version**
  - [ ] Backend: Node.js 18+ installed
  - [ ] Frontend: Node.js 18+ installed
  - [ ] Verify with `node --version`

- [ ] **PostgreSQL Database**
  - [ ] PostgreSQL 14+ installed
  - [ ] Database created
  - [ ] User credentials configured
  - [ ] Connection tested

- [ ] **Blockchain Setup**
  - [ ] Ethereum node access (Infura/Alchemy)
  - [ ] Private key for transactions
  - [ ] Sufficient ETH for gas fees
  - [ ] Smart contracts deployed
  - [ ] Contract addresses recorded

- [ ] **Environment Variables**
  - [ ] Copy `.env.example` to `.env`
  - [ ] Fill all required variables
  - [ ] Verify no placeholder values
  - [ ] Test environment variable loading

---

## 📦 Backend Deployment

### 1. Install Dependencies
```bash
cd backend
npm install
```

- [ ] All dependencies installed successfully
- [ ] No vulnerability warnings (or acceptable)
- [ ] `node_modules` folder created

### 2. Database Migration
```bash
# Run migration file
psql -U your_username -d your_database -f backend/migrations/add-patient-unique-fields.sql
```

- [ ] Migration executed successfully
- [ ] New columns added to patients table
- [ ] Indexes created
- [ ] No errors in console

### 3. Seed Database (Optional)
```bash
cd backend
node seeders/seedRoles.js
node seeders/seedAdmin.js
```

- [ ] Roles seeded (Admin, Doctor, Patient, Lab, Pharmacy)
- [ ] Admin user created
- [ ] Admin credentials saved securely

### 4. Test Backend Locally
```bash
cd backend
npm start
# or
node server.js
```

- [ ] Server starts on port 5000 (or configured port)
- [ ] No startup errors
- [ ] Database connection successful
- [ ] All routes registered
- [ ] Blockchain service initialized

### 5. Backend Environment Variables

**Required Variables**:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/healthcare_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Blockchain
BLOCKCHAIN_NETWORK=mainnet
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=0x...
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_AUDIT_CONTRACT_ADDRESS=0x...

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://yourdomain.com

# Email (if configured)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

- [ ] All variables filled
- [ ] Secrets are strong (32+ characters)
- [ ] URLs are correct
- [ ] Blockchain addresses are valid Ethereum addresses

---

## 🎨 Frontend Deployment

### 1. Install Dependencies
```bash
cd frontend
npm install
```

- [ ] All dependencies installed
- [ ] No critical vulnerabilities
- [ ] `node_modules` folder created

### 2. Configure API URL
**File**: `frontend/src/services/api.js`

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

- [ ] API_URL points to production backend
- [ ] HTTPS enabled
- [ ] CORS configured on backend

### 3. Build Frontend
```bash
cd frontend
npm run build
```

- [ ] Build completes successfully
- [ ] `build` folder created
- [ ] No build errors
- [ ] Assets optimized

### 4. Test Frontend Locally
```bash
cd frontend
npm start
```

- [ ] App runs on port 3000
- [ ] No console errors
- [ ] Can navigate to all pages
- [ ] Can login/logout
- [ ] API calls working

### 5. Frontend Environment Variables

**File**: `frontend/.env`

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_BLOCKCHAIN_NETWORK=mainnet
REACT_APP_ENABLE_BLOCKCHAIN=true
```

- [ ] API URL is production backend
- [ ] Environment variables loaded

---

## 🌐 Production Deployment

### Backend Hosting Options

#### Option 1: VPS (DigitalOcean, AWS EC2, etc.)

**Steps**:
1. **Setup Server**
   - [ ] Ubuntu 22.04 LTS installed
   - [ ] Firewall configured (allow 80, 443, 22)
   - [ ] SSH key authentication enabled

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql nginx
   ```
   - [ ] Node.js installed
   - [ ] PostgreSQL installed
   - [ ] Nginx installed

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/healthcare-system.git
   cd healthcare-system/backend
   npm install --production
   ```
   - [ ] Repository cloned
   - [ ] Dependencies installed

4. **Setup PM2 Process Manager**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name healthcare-backend
   pm2 save
   pm2 startup
   ```
   - [ ] PM2 installed
   - [ ] Backend running
   - [ ] Auto-restart on reboot configured

5. **Configure Nginx Reverse Proxy**
   
   **File**: `/etc/nginx/sites-available/healthcare-backend`
   
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/healthcare-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
   
   - [ ] Nginx configured
   - [ ] Symlink created
   - [ ] Nginx restarted

6. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```
   - [ ] SSL certificate obtained
   - [ ] HTTPS enabled
   - [ ] Auto-renewal configured

#### Option 2: Heroku

**Steps**:
1. **Create Heroku App**
   ```bash
   heroku create healthcare-backend
   ```
   - [ ] App created

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```
   - [ ] PostgreSQL addon added
   - [ ] DATABASE_URL set automatically

3. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_secret
   heroku config:set BLOCKCHAIN_PRIVATE_KEY=0x...
   # ... set all other variables
   ```
   - [ ] All env variables set

4. **Deploy**
   ```bash
   git push heroku main
   ```
   - [ ] Code deployed
   - [ ] Build successful
   - [ ] App running

### Frontend Hosting Options

#### Option 1: Netlify

**Steps**:
1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```
   - [ ] Build successful

2. **Deploy to Netlify**
   - [ ] Create Netlify account
   - [ ] Connect GitHub repository
   - [ ] Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `build`
   - [ ] Set environment variables in Netlify dashboard
   - [ ] Deploy

3. **Configure Custom Domain**
   - [ ] Add custom domain in Netlify
   - [ ] Update DNS records
   - [ ] SSL automatically configured

#### Option 2: Vercel

**Steps**:
1. **Deploy**
   ```bash
   cd frontend
   vercel
   ```
   - [ ] Vercel CLI installed
   - [ ] Project deployed
   - [ ] Production URL obtained

2. **Configure**
   - [ ] Set environment variables
   - [ ] Configure custom domain
   - [ ] SSL automatically configured

#### Option 3: VPS with Nginx

**Steps**:
1. **Build and Upload**
   ```bash
   cd frontend
   npm run build
   scp -r build/* user@server:/var/www/healthcare-frontend
   ```
   - [ ] Build uploaded

2. **Configure Nginx**
   
   **File**: `/etc/nginx/sites-available/healthcare-frontend`
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/healthcare-frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   - [ ] Nginx configured
   - [ ] SSL enabled with Certbot

---

## 🔐 Security Hardening

### Backend Security

- [ ] **Environment Variables**
  - [ ] No secrets in code
  - [ ] `.env` not in git
  - [ ] Strong JWT secrets (32+ chars)

- [ ] **Database Security**
  - [ ] Strong database password
  - [ ] PostgreSQL only accepts localhost connections (if on same server)
  - [ ] Regular backups configured
  - [ ] SSL connection to database

- [ ] **Rate Limiting**
  - [ ] Rate limiter middleware active
  - [ ] Sensible limits set
  - [ ] Blockchain logging of rate limit hits

- [ ] **CORS**
  - [ ] Only allow frontend domain
  - [ ] No wildcard (*) in production

- [ ] **Helmet.js**
  - [ ] Security headers enabled
  - [ ] CSP configured
  - [ ] XSS protection enabled

- [ ] **Input Validation**
  - [ ] All inputs sanitized
  - [ ] SQL injection protection
  - [ ] File upload validation

- [ ] **HTTPS Only**
  - [ ] SSL certificate installed
  - [ ] HTTP redirects to HTTPS
  - [ ] HSTS header enabled

### Frontend Security

- [ ] **API URL**
  - [ ] Uses HTTPS
  - [ ] Environment variable for URL
  - [ ] No hardcoded secrets

- [ ] **Authentication**
  - [ ] Tokens stored securely (httpOnly cookies or secure storage)
  - [ ] Auto-logout on token expiration
  - [ ] Refresh token rotation

- [ ] **XSS Protection**
  - [ ] No `dangerouslySetInnerHTML` without sanitization
  - [ ] User input escaped
  - [ ] Content Security Policy

---

## ⛓️ Blockchain Deployment

### Smart Contract Deployment

**Contracts to Deploy**:
1. `AuditLog.sol`
2. `Consent.sol`
3. `Prescription.sol`
4. `RecordRegistry.sol`

**Deployment Steps**:

1. **Setup Hardhat**
   ```bash
   cd backend/contracts
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat
   ```
   - [ ] Hardhat initialized

2. **Configure Hardhat**
   
   **File**: `hardhat.config.js`
   
   ```javascript
   module.exports = {
     solidity: "0.8.19",
     networks: {
       mainnet: {
         url: process.env.BLOCKCHAIN_RPC_URL,
         accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY]
       }
     }
   };
   ```
   - [ ] Config created

3. **Compile Contracts**
   ```bash
   npx hardhat compile
   ```
   - [ ] All contracts compiled
   - [ ] No errors

4. **Deploy to Testnet First**
   ```bash
   npx hardhat run scripts/deploy.js --network goerli
   ```
   - [ ] Deployed to testnet
   - [ ] Contract addresses saved
   - [ ] Verified on Etherscan

5. **Test Contracts**
   - [ ] Test all functions
   - [ ] Verify gas costs
   - [ ] Check permissions

6. **Deploy to Mainnet**
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```
   - [ ] Deployed to mainnet
   - [ ] Contract addresses saved
   - [ ] Verified on Etherscan
   - [ ] Update `BLOCKCHAIN_CONTRACT_ADDRESS` in `.env`

---

## 🗄️ Database Backup

### Automated Backup Script

**File**: `backup-db.sh`

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/healthcare-db"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="healthcare_backup_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -U your_username healthcare_db > $BACKUP_DIR/$FILENAME
gzip $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

**Setup Cron Job**:
```bash
crontab -e
# Add this line to run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

- [ ] Backup script created
- [ ] Cron job configured
- [ ] Test backup manually
- [ ] Verify restore works

---

## 📊 Monitoring and Logging

### Backend Monitoring

- [ ] **PM2 Monitoring**
  ```bash
  pm2 monit
  pm2 logs healthcare-backend
  ```

- [ ] **Log Management**
  - [ ] Winston logger configured
  - [ ] Logs stored in `backend/logs/`
  - [ ] Log rotation enabled
  - [ ] Error logs separated

- [ ] **Application Monitoring**
  - [ ] Consider: New Relic, DataDog, or Sentry
  - [ ] Error tracking enabled
  - [ ] Performance monitoring

### Database Monitoring

- [ ] **PostgreSQL Logs**
  - [ ] Slow query logging enabled
  - [ ] Log file location configured
  - [ ] Regular log review

- [ ] **Database Performance**
  - [ ] Index usage monitoring
  - [ ] Query performance analysis
  - [ ] Connection pool monitoring

### Blockchain Monitoring

- [ ] **Transaction Monitoring**
  - [ ] Etherscan API integration
  - [ ] Gas price alerts
  - [ ] Failed transaction alerts

- [ ] **Smart Contract Events**
  - [ ] Event listeners configured
  - [ ] Event logs stored
  - [ ] Anomaly detection

---

## ✅ Post-Deployment Testing

### Functional Tests

- [ ] **User Registration**
  - [ ] Patient registration works
  - [ ] Doctor registration works
  - [ ] Lab registration works
  - [ ] Pharmacy registration works

- [ ] **Authentication**
  - [ ] Login works
  - [ ] Logout works
  - [ ] Token refresh works
  - [ ] Password reset works

- [ ] **Patient Unique ID**
  - [ ] ID generation works
  - [ ] QR code generated
  - [ ] ID format correct (HID-YYYY-XXXXX)
  - [ ] ID is unique

- [ ] **Consent System**
  - [ ] Grant consent works
  - [ ] Revoke consent works
  - [ ] Consent verification works
  - [ ] Blockchain logging works

- [ ] **Doctor Patient Lookup**
  - [ ] Lookup with consent works
  - [ ] Lookup without consent blocked
  - [ ] Blockchain logging works
  - [ ] All patient data displayed

- [ ] **Lab Patient Lookup**
  - [ ] Lookup with consent works
  - [ ] Lookup without consent blocked
  - [ ] Upload permission granted

- [ ] **Prescriptions**
  - [ ] Create prescription works
  - [ ] Blockchain anchoring works
  - [ ] QR code generated
  - [ ] Patient receives notification

- [ ] **Medical Records**
  - [ ] Upload works
  - [ ] File hashing works
  - [ ] Blockchain anchoring works
  - [ ] View works

- [ ] **Dashboards**
  - [ ] Patient dashboard loads with real data
  - [ ] Doctor dashboard loads with real data
  - [ ] Pharmacy dashboard loads with real data
  - [ ] Lab dashboard loads with real data
  - [ ] Admin dashboard loads with real data

### Performance Tests

- [ ] **Load Testing**
  - [ ] 100 concurrent users
  - [ ] Response time < 2 seconds
  - [ ] No errors under load

- [ ] **Database Performance**
  - [ ] Query response time acceptable
  - [ ] Indexes used properly
  - [ ] Connection pool adequate

- [ ] **Blockchain Performance**
  - [ ] Transaction confirmation time
  - [ ] Gas costs acceptable
  - [ ] No failed transactions

### Security Tests

- [ ] **Penetration Testing**
  - [ ] SQL injection attempts blocked
  - [ ] XSS attempts blocked
  - [ ] CSRF protection works
  - [ ] Rate limiting works

- [ ] **Access Control**
  - [ ] Unauthorized access blocked
  - [ ] Role-based permissions work
  - [ ] Consent verification works

- [ ] **Data Encryption**
  - [ ] Passwords hashed
  - [ ] Sensitive data encrypted
  - [ ] HTTPS enforced

---

## 📱 Mobile Responsiveness

- [ ] **Test on Devices**
  - [ ] iPhone (Safari)
  - [ ] Android (Chrome)
  - [ ] Tablet (iPad)

- [ ] **Responsive Design**
  - [ ] All pages mobile-friendly
  - [ ] Buttons touchable
  - [ ] Text readable
  - [ ] Forms usable

---

## 📞 Support Setup

- [ ] **Documentation**
  - [ ] USER_GUIDE.md completed
  - [ ] API documentation created
  - [ ] Deployment guide created

- [ ] **Support Channels**
  - [ ] Support email configured
  - [ ] Phone support (if applicable)
  - [ ] In-app help/chat

- [ ] **Training**
  - [ ] Admin training completed
  - [ ] Healthcare provider training
  - [ ] Patient onboarding materials

---

## 🚨 Emergency Procedures

### Rollback Plan

**If deployment fails**:

1. **Backend Rollback**
   ```bash
   pm2 stop healthcare-backend
   git checkout <previous-commit>
   npm install
   pm2 restart healthcare-backend
   ```

2. **Frontend Rollback**
   - Netlify/Vercel: Use platform rollback feature
   - VPS: Deploy previous build

3. **Database Rollback**
   ```bash
   psql -U username -d database < /var/backups/latest_backup.sql
   ```

- [ ] Rollback plan tested
- [ ] Team knows rollback procedure

### Incident Response

**If production issue occurs**:

1. **Assess Severity**
   - Critical: System down, data loss
   - High: Major feature broken
   - Medium: Minor feature broken
   - Low: Cosmetic issue

2. **Notify Team**
   - [ ] Notification channels configured
   - [ ] Contact list updated

3. **Troubleshooting**
   - [ ] Check logs: `pm2 logs`
   - [ ] Check database: PostgreSQL logs
   - [ ] Check blockchain: Etherscan
   - [ ] Check monitoring: PM2 monit

4. **Recovery**
   - [ ] Fix or rollback
   - [ ] Verify fix
   - [ ] Post-mortem

---

## 📋 Final Checklist

### Before Going Live

- [ ] All features tested
- [ ] Security audit completed
- [ ] Performance acceptable
- [ ] Backups working
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Team trained
- [ ] Support ready
- [ ] Emergency procedures tested
- [ ] Domain configured
- [ ] SSL enabled
- [ ] Analytics configured (optional)
- [ ] Legal compliance checked (HIPAA, GDPR, etc.)

### Go Live

- [ ] Announce to team
- [ ] Monitor closely for 24 hours
- [ ] Be ready for hotfixes
- [ ] Collect user feedback

### Post-Launch

- [ ] Review logs daily
- [ ] Monitor performance
- [ ] Check blockchain transactions
- [ ] User feedback analysis
- [ ] Plan next updates

---

## 🎉 Congratulations!

Your healthcare system is now deployed and running in production with:
- ✅ Blockchain integration
- ✅ Unique patient identification
- ✅ Permission-based access control
- ✅ Dynamic dashboards
- ✅ Secure authentication
- ✅ Comprehensive audit trail

**Stay vigilant, monitor regularly, and keep improving!**

---

*Deployment Checklist Version: 1.0*
*Last Updated: 2026-01-20*
