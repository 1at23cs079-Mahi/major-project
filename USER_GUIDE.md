# Healthcare System - User Guide

## 📖 Table of Contents
1. [Patient User Guide](#patient-user-guide)
2. [Doctor User Guide](#doctor-user-guide)
3. [Lab User Guide](#lab-user-guide)
4. [Pharmacy User Guide](#pharmacy-user-guide)
5. [Admin User Guide](#admin-user-guide)

---

## 👤 Patient User Guide

### Getting Your Unique Healthcare ID

Your unique healthcare ID is essential for doctors and labs to access your medical records.

**Steps**:
1. Login to your patient account
2. Navigate to your dashboard
3. Look for the "Your Unique Patient ID" card
4. Click the **"🔐 Generate ID"** button
5. Your unique ID will be generated in format: `HID-2026-XXXXX`
6. A QR code will also be generated for quick scanning

**Important**: 
- Keep your unique ID safe
- Share it only with healthcare providers you trust
- You can scan the QR code at hospitals/clinics for faster check-in

### Granting Consent to Healthcare Providers

Before a doctor or lab can access your medical records, you must grant them consent.

**Steps**:
1. Navigate to **Consent Management** page
2. Click **"Grant New Consent"**
3. Enter the healthcare provider's ID or select from list
4. Choose consent type:
   - **View Records**: For doctors to see your medical history
   - **Lab Access**: For labs to upload test results
   - **Pharmacy Access**: For pharmacies to verify prescriptions
5. Set expiration date (optional)
6. Click **"Grant Consent"**
7. Consent is recorded on blockchain for security

**Viewing Active Consents**:
- See all active consents in the Consent Management page
- Each consent shows:
  - Provider name and type (Doctor/Lab/Pharmacy)
  - Consent type
  - Grant date
  - Expiration date
  - Blockchain verification badge

**Revoking Consent**:
1. Go to Consent Management page
2. Find the consent you want to revoke
3. Click **"Revoke"**
4. Confirm revocation
5. Provider immediately loses access to your records
6. Revocation is logged on blockchain

### Managing Your Medical Records

**Viewing Records**:
1. Navigate to **Medical Vault** page
2. See all your medical records:
   - Lab reports
   - X-rays and scans
   - Doctor notes
   - Prescription history
3. Each record shows blockchain verification badge

**Uploading Personal Documents**:
1. Click **"Upload Document"**
2. Select file (PDF, image, etc.)
3. Choose document type
4. Add description
5. Submit
6. File is hashed and anchored to blockchain

### Booking Appointments

**Steps**:
1. Navigate to **Book Appointment** page
2. Select doctor or specialty
3. Choose available date and time
4. Add reason for visit
5. Submit appointment request
6. Receive confirmation when doctor approves

### Viewing Prescriptions

**Steps**:
1. Navigate to **My Prescriptions** page
2. View all prescriptions:
   - Active prescriptions
   - Expired prescriptions
   - Medicine details with photos
   - Dosage instructions
   - Blockchain verification

**Prescription Features**:
- QR code for pharmacy verification
- Medicine images for identification
- Reminder notifications
- Refill tracking

### Emergency SOS

**When to Use**: Medical emergency, accident, critical situation

**Steps**:
1. Click **"Emergency SOS"** button (🚨)
2. Your emergency contacts are notified immediately
3. Your location is shared (if enabled)
4. Emergency responders can access your critical health info:
   - Blood type
   - Allergies
   - Current medications
   - Emergency contacts

---

## 👨‍⚕️ Doctor User Guide

### Looking Up Patients by Unique ID

**Why**: Access patient medical records with consent verification

**Steps**:
1. Navigate to **Patient Record Vault** page
2. Enter patient's unique healthcare ID:
   - Format: `HID-2026-XXXXX`
   - Ask patient for this ID
3. Click **"🔐 Secure Lookup"**
4. System checks for active consent from patient
5. If consent exists, you'll see:
   - Patient personal information
   - Medical history
   - Lab reports
   - Previous prescriptions
   - Blockchain verification badges

**If No Consent**:
- You'll see an error message
- Patient must grant you "view_records" consent
- Ask patient to add you in their Consent Management page
- Try lookup again after patient grants consent

**Important Notes**:
- Every lookup is logged on blockchain
- Unauthorized access attempts are recorded
- Respect patient privacy

### Creating Prescriptions (Blockchain-Verified)

**Steps**:
1. Navigate to **Create Prescription** page
2. Enter patient's unique ID or select from your patients
3. Add diagnosis
4. Add medicines:
   - Search medicine database
   - Select medicine with photo
   - Enter dosage (e.g., "500mg twice daily")
   - Add duration
5. Add special instructions
6. Click **"Create Prescription"**
7. Prescription is:
   - Saved to database
   - Hashed with SHA-256
   - Anchored to blockchain
   - QR code generated
   - Patient notified

**Prescription Features**:
- Blockchain verification for authenticity
- Can't be altered after creation
- Patient receives immediately
- Pharmacy can verify with QR code

### Managing Appointments

**Today's Appointments**:
1. View on dashboard or Appointment Calendar
2. See patient details
3. Accept or reject appointment requests
4. Manage queue

**Appointment Queue**:
- See waiting patients
- Estimated wait times
- Call next patient
- Mark as completed

### Uploading Medical Reports

**When**: After examination, tests, or procedures

**Steps**:
1. Lookup patient by unique ID
2. Click **"Upload Report"**
3. Select file (PDF, image, etc.)
4. Enter report details:
   - Report type (Lab, X-Ray, MRI, etc.)
   - Report name
   - Description
5. Submit
6. File is:
   - Hashed with SHA-256
   - Anchored to blockchain
   - Added to patient's Medical Vault
   - Patient notified

---

## 🧪 Lab User Guide

### Looking Up Patients for Report Upload

**Purpose**: Verify patient identity and consent before uploading lab results

**Steps**:
1. Login to Lab Dashboard
2. Go to **Patient Lookup** section
3. Enter patient's unique healthcare ID:
   - Format: `HID-2026-XXXXX`
   - Patient provides this ID when submitting samples
4. Click **"🔐 Lookup Patient"**
5. System verifies:
   - Patient exists
   - Patient has granted lab access consent
   - Your lab is authorized
6. If verified, you'll see:
   - Patient name
   - Patient database ID
   - Upload permission granted

**If Consent Not Found**:
- Patient must grant your lab "lab_access" consent
- Contact patient or requesting doctor
- Verify patient has completed consent process

### Uploading Lab Reports (Blockchain-Secured)

**Steps**:
1. After successful patient lookup
2. Click **"📤 Upload Lab Report"**
3. Select report file (PDF preferred)
4. Enter report details:
   - Test type (Blood Test, Urine Test, etc.)
   - Test date
   - Results summary
   - Reference ranges
5. Add any special notes
6. Submit
7. Report is:
   - File hashed with SHA-256
   - Hash anchored to blockchain
   - Transaction hash stored
   - Added to patient's records
   - Doctor and patient notified
   - Blockchain verification badge added

**Security Features**:
- Report cannot be altered after upload
- Blockchain provides proof of authenticity
- Patient can verify report integrity
- Timestamp proves when report was uploaded

### Managing Test Requests

**Viewing Pending Tests**:
1. Dashboard shows pending test count
2. View list of pending tests
3. See patient details and test type
4. Mark as completed after upload

### Lab Inventory (If Applicable)

- Track test kits
- Manage equipment
- Monitor consumables

---

## 💊 Pharmacy User Guide

### Verifying Prescriptions (Blockchain-Verified)

**Purpose**: Ensure prescription authenticity before dispensing medicine

**Methods**:

#### Method 1: QR Code Scanning
1. Patient presents prescription QR code
2. Click **"Scan QR Code"** in Verify Prescription page
3. Use camera to scan QR code
4. System verifies:
   - Prescription exists in database
   - Prescription is blockchain-verified
   - Prescription is not expired
   - Prescription hasn't been dispensed yet
5. If valid:
   - See prescription details
   - Medicine list with photos
   - Dosage instructions
   - Doctor information
   - Blockchain verification badge

#### Method 2: Prescription ID Entry
1. Patient provides prescription ID
2. Enter ID in verification page
3. Click **"Verify Prescription"**
4. Same verification process as QR scan

**After Verification**:
1. Dispense medicines according to prescription
2. Mark prescription as dispensed
3. Patient receives notification
4. Transaction logged on blockchain

### Managing Medicine Inventory

**Viewing Inventory**:
1. Navigate to **Inventory** page
2. See all medicines in stock:
   - Medicine name with photo
   - Available quantity
   - Expiration dates
   - Reorder level

**Adding New Medicine**:
1. Click **"Add Medicine"**
2. Enter medicine details
3. Upload medicine photo
4. Set stock level
5. Submit

**Updating Stock**:
- After dispensing, update quantities
- System alerts for low stock
- Track expiration dates

### Uploading Medicine Photos

**Purpose**: Help patients identify medicines

**Steps**:
1. Navigate to **Upload Medicine Photo** page
2. Search for medicine in database
3. Upload clear photo of medicine
4. Add photo to medicine record
5. Photo appears in prescriptions with this medicine

---

## 🛡️ Admin User Guide

### Managing User Approvals

**Pending Doctor Approvals**:
1. Navigate to Admin Dashboard
2. See pending doctor registrations
3. Review:
   - Medical license number
   - Specialization
   - Registration documents
4. Approve or reject
5. Doctor receives notification

**Pending Pharmacy Approvals**:
- Same process as doctor approvals
- Verify pharmacy license
- Check business registration

**Pending Lab Approvals**:
- Verify lab certification
- Check accreditation
- Approve or reject

### Managing Medicine Database

**Adding New Medicines**:
1. Go to **Medicine Management**
2. Click **"Add New Medicine"**
3. Enter:
   - Generic name
   - Brand names
   - Composition
   - Manufacturer
   - Category
   - Standard dosages
4. Upload medicine photo
5. Submit

**Editing Medicine**:
- Update details
- Add alternative brands
- Update photos
- Set availability

**Deleting Medicine**:
- Only if no prescriptions use it
- Soft delete (mark inactive)
- Keeps historical data

### Viewing Audit Logs

**Purpose**: Monitor system activity and blockchain transactions

**What You Can See**:
1. **User Activity**:
   - Login/logout events
   - Failed login attempts
   - Role changes
   - Account modifications

2. **Data Access Logs**:
   - Patient record lookups
   - Prescription creations
   - Medical record uploads
   - Consent grants/revocations

3. **Blockchain Logs**:
   - All blockchain transactions
   - Transaction hashes
   - Verification status
   - Timestamp

**Filtering Logs**:
- By date range
- By user
- By action type
- By blockchain status

### System Statistics

**Dashboard Metrics**:
- Total users by role
- Active patients
- Active doctors
- Total prescriptions
- Total medical records
- Blockchain transactions
- System health

---

## 🔐 Security Best Practices

### For Patients:
1. **Protect Your Unique ID**: Don't share publicly
2. **Review Consents Regularly**: Check who has access
3. **Revoke Unused Consents**: Remove old/unnecessary consents
4. **Enable 2FA**: If available, enable two-factor authentication
5. **Strong Password**: Use complex, unique password
6. **Monitor Activity**: Check your activity log

### For Healthcare Providers (Doctors/Labs/Pharmacies):
1. **Request Consent First**: Never try unauthorized access
2. **Verify Patient Identity**: Always confirm unique ID with patient
3. **Log Out After Use**: Don't leave sessions open
4. **Respect Privacy**: Only access what's necessary
5. **Report Issues**: Report suspicious activity to admin
6. **Secure Devices**: Use encrypted, password-protected devices

### For Admins:
1. **Regular Audits**: Review audit logs weekly
2. **Monitor Blockchain**: Check blockchain sync status
3. **User Verification**: Thoroughly verify new user registrations
4. **Backup Data**: Regular database backups
5. **Update System**: Keep software up to date
6. **Incident Response**: Have plan for security incidents

---

## 🔍 Blockchain Verification

### What is Blockchain Verification?

Every critical operation in this system is recorded on the blockchain:
- Prescriptions
- Medical records
- Consents
- Patient lookups

The blockchain badge (⛓️) indicates data is blockchain-verified.

### Why Blockchain?

1. **Immutability**: Once recorded, cannot be altered
2. **Transparency**: All parties can verify authenticity
3. **Audit Trail**: Complete history of all actions
4. **Security**: Cryptographically secured
5. **Trust**: No single party controls the data

### How to Verify Data

**For Patients**:
1. Go to **Blockchain Verification** page
2. Enter transaction hash (shown on records)
3. Click **"Verify"**
4. See:
   - Transaction status
   - Timestamp
   - Data hash
   - Block number
   - Confirmation count

**For Healthcare Providers**:
- Same process as patients
- Use transaction hash from records
- Verify before trusting data

---

## 🆘 Troubleshooting

### "No Consent Found" Error

**Problem**: Healthcare provider can't access your records

**Solution**:
1. Go to Consent Management
2. Grant appropriate consent type
3. Inform provider to try again

### "Invalid Unique Patient ID" Error

**Problem**: Unique ID not recognized

**Solution**:
1. Check ID format: `HID-YYYY-XXXXX`
2. Verify you've generated your ID
3. Contact admin if issue persists

### "Blockchain Verification Failed"

**Problem**: Data not on blockchain

**Solution**:
1. Wait a few minutes (blockchain sync delay)
2. Try verification again
3. Contact admin if persistent

### Can't Login

**Problem**: Login credentials not working

**Solution**:
1. Use **Forgot Password** link
2. Check email for reset link
3. Create new password
4. Try login again

---

## 📞 Support

**For Technical Issues**:
- Email: support@healthcare.com
- Phone: +1-XXX-XXX-XXXX
- Hours: 24/7

**For Medical Emergencies**:
- Call emergency services immediately
- Use SOS feature in app

**For Account Issues**:
- Contact admin through app
- Email: admin@healthcare.com

---

*Last Updated: 2026-01-20*
*Version: 2.0.0*
