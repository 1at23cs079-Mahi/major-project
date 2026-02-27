const { sequelize } = require('../config/database');

// Import all models
const Role = require('./Role')(sequelize);
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Doctor = require('./Doctor')(sequelize);
const Pharmacy = require('./Pharmacy')(sequelize);
const Lab = require('./Lab')(sequelize);
const FamilyMember = require('./FamilyMember')(sequelize);
const Medicine = require('./Medicine')(sequelize);
const Prescription = require('./Prescription')(sequelize);
const PrescriptionItem = require('./PrescriptionItem')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const MedicalReport = require('./MedicalReport')(sequelize);
const Insurance = require('./Insurance')(sequelize);
const Message = require('./Message')(sequelize);
const Notification = require('./Notification')(sequelize);
const Consent = require('./Consent')(sequelize);
const ActivityLog = require('./ActivityLog')(sequelize);
const PasswordHistory = require('./PasswordHistory')(sequelize);
const EmergencyContact = require('./EmergencyContact')(sequelize);
const MedicineReminder = require('./MedicineReminder')(sequelize);
const BlockchainLedger = require('./BlockchainLedger')(sequelize);

// Define associations
// User - Role
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// User - Patient
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patientProfile', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Doctor
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Pharmacy
User.hasOne(Pharmacy, { foreignKey: 'user_id', as: 'pharmacyProfile', onDelete: 'CASCADE' });
Pharmacy.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Lab
User.hasOne(Lab, { foreignKey: 'user_id', as: 'labProfile', onDelete: 'CASCADE' });
Lab.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Patient - FamilyMembers
Patient.hasMany(FamilyMember, { foreignKey: 'patient_id', as: 'familyMembers', onDelete: 'CASCADE' });
FamilyMember.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient - EmergencyContacts
Patient.hasMany(EmergencyContact, { foreignKey: 'patient_id', as: 'emergencyContacts', onDelete: 'CASCADE' });
EmergencyContact.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient - Insurance
Patient.hasMany(Insurance, { foreignKey: 'patient_id', as: 'insurances', onDelete: 'CASCADE' });
Insurance.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient - MedicineReminders
Patient.hasMany(MedicineReminder, { foreignKey: 'patient_id', as: 'reminders', onDelete: 'CASCADE' });
MedicineReminder.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient - Appointments
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor - Appointments
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient - Prescriptions
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor - Prescriptions
Doctor.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'prescriptions' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Appointment - Prescription
Appointment.hasOne(Prescription, { foreignKey: 'appointment_id', as: 'prescription' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

// Pharmacy - Prescriptions
Pharmacy.hasMany(Prescription, { foreignKey: 'dispensed_by_pharmacy_id', as: 'dispensedPrescriptions' });
Prescription.belongsTo(Pharmacy, { foreignKey: 'dispensed_by_pharmacy_id', as: 'pharmacy' });

// Prescription - PrescriptionItems
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescription_id', as: 'items', onDelete: 'CASCADE' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

// Medicine - PrescriptionItems
Medicine.hasMany(PrescriptionItem, { foreignKey: 'medicine_id', as: 'prescriptionItems' });
PrescriptionItem.belongsTo(Medicine, { foreignKey: 'medicine_id', as: 'medicine' });

// PrescriptionItem - MedicineReminder
PrescriptionItem.hasMany(MedicineReminder, { foreignKey: 'prescription_item_id', as: 'reminders' });
MedicineReminder.belongsTo(PrescriptionItem, { foreignKey: 'prescription_item_id', as: 'prescriptionItem' });

// Patient - MedicalReports
Patient.hasMany(MedicalReport, { foreignKey: 'patient_id', as: 'medicalReports' });
MedicalReport.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor - MedicalReports
Doctor.hasMany(MedicalReport, { foreignKey: 'doctor_id', as: 'uploadedReports' });
MedicalReport.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Lab - MedicalReports
Lab.hasMany(MedicalReport, { foreignKey: 'lab_id', as: 'uploadedReports' });
MedicalReport.belongsTo(Lab, { foreignKey: 'lab_id', as: 'lab' });

// Messages
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Consent
Patient.hasMany(Consent, { foreignKey: 'patient_id', as: 'consents', onDelete: 'CASCADE' });
Consent.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Doctor.hasMany(Consent, { foreignKey: 'doctor_id', as: 'consents', onDelete: 'CASCADE' });
Consent.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// PasswordHistory
User.hasMany(PasswordHistory, { foreignKey: 'user_id', as: 'passwordHistory', onDelete: 'CASCADE' });
PasswordHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export all models
module.exports = {
    sequelize,
    Role,
    User,
    Patient,
    Doctor,
    Pharmacy,
    Lab,
    FamilyMember,
    Medicine,
    Prescription,
    PrescriptionItem,
    Appointment,
    MedicalReport,
    Insurance,
    Message,
    Notification,
    Consent,
    ActivityLog,
    PasswordHistory,
    EmergencyContact,
    MedicineReminder,
    BlockchainLedger
};
