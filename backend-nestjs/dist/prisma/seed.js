"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const UserRole = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PATIENT: 'PATIENT',
    PHARMACY: 'PHARMACY',
    LAB: 'LAB',
};
const UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
};
const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
};
const AppointmentStatus = {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
};
const PrescriptionStatus = {
    ACTIVE: 'ACTIVE',
    FILLED: 'FILLED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
};
async function main() {
    console.log('Starting database seed...');
    console.log('Cleaning existing data...');
    await prisma.prescriptionItem.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.pharmacy.deleteMany();
    await prisma.lab.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    console.log('Creating admin user...');
    await prisma.user.create({
        data: {
            email: 'admin@healthcare.com',
            password: hashedPassword,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            emailVerified: true,
        },
    });
    console.log('Creating doctors...');
    const doctorUser1 = await prisma.user.create({
        data: {
            email: 'dr.smith@healthcare.com',
            password: hashedPassword,
            role: UserRole.DOCTOR,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            doctor: {
                create: {
                    firstName: 'John',
                    lastName: 'Smith',
                    specialization: 'Cardiology',
                    licenseNumber: 'MD-12345',
                    phone: '+1234567890',
                    qualifications: JSON.stringify(['MBBS', 'MD Cardiology', 'FACC']),
                    experienceYears: 15,
                    consultationFee: 150.00,
                    availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
                    availableTimeStart: '09:00',
                    availableTimeEnd: '17:00',
                    bio: 'Board-certified cardiologist with 15 years of experience.',
                },
            },
        },
        include: { doctor: true },
    });
    const doctorUser2 = await prisma.user.create({
        data: {
            email: 'dr.johnson@healthcare.com',
            password: hashedPassword,
            role: UserRole.DOCTOR,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            doctor: {
                create: {
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    specialization: 'General Medicine',
                    licenseNumber: 'MD-67890',
                    phone: '+1234567891',
                    qualifications: JSON.stringify(['MBBS', 'MD Internal Medicine']),
                    experienceYears: 10,
                    consultationFee: 100.00,
                    availableDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
                    availableTimeStart: '10:00',
                    availableTimeEnd: '18:00',
                    bio: 'Experienced general practitioner specializing in preventive care.',
                },
            },
        },
        include: { doctor: true },
    });
    console.log('Creating patients...');
    const patientUser1 = await prisma.user.create({
        data: {
            email: 'patient1@email.com',
            password: hashedPassword,
            role: UserRole.PATIENT,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            patient: {
                create: {
                    firstName: 'Alice',
                    lastName: 'Williams',
                    dateOfBirth: new Date('1985-03-15'),
                    gender: Gender.FEMALE,
                    phone: '+1987654321',
                    address: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    emergencyContact: 'Bob Williams',
                    emergencyPhone: '+1987654322',
                    bloodType: 'O+',
                    allergies: JSON.stringify(['Penicillin']),
                    chronicConditions: JSON.stringify(['Hypertension']),
                    insuranceProvider: 'Blue Cross',
                    insuranceNumber: 'BC123456',
                },
            },
        },
        include: { patient: true },
    });
    const patientUser2 = await prisma.user.create({
        data: {
            email: 'patient2@email.com',
            password: hashedPassword,
            role: UserRole.PATIENT,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            patient: {
                create: {
                    firstName: 'Michael',
                    lastName: 'Brown',
                    dateOfBirth: new Date('1990-07-22'),
                    gender: Gender.MALE,
                    phone: '+1876543210',
                    address: '456 Oak Avenue',
                    city: 'Los Angeles',
                    state: 'CA',
                    zipCode: '90001',
                    bloodType: 'A+',
                    allergies: JSON.stringify([]),
                    chronicConditions: JSON.stringify([]),
                    insuranceProvider: 'Aetna',
                    insuranceNumber: 'AE789012',
                },
            },
        },
        include: { patient: true },
    });
    console.log('Creating pharmacy...');
    await prisma.user.create({
        data: {
            email: 'pharmacy@citymed.com',
            password: hashedPassword,
            role: UserRole.PHARMACY,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            pharmacy: {
                create: {
                    name: 'City Medical Pharmacy',
                    licenseNumber: 'PH-11111',
                    phone: '+1555123456',
                    address: '789 Health Blvd',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10002',
                    operatingHours: 'Mon-Sat: 8AM-10PM, Sun: 10AM-6PM',
                },
            },
        },
        include: { pharmacy: true },
    });
    console.log('Creating lab...');
    await prisma.user.create({
        data: {
            email: 'lab@diagnosix.com',
            password: hashedPassword,
            role: UserRole.LAB,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            lab: {
                create: {
                    name: 'DiagnosiX Labs',
                    licenseNumber: 'LAB-22222',
                    phone: '+1555789012',
                    address: '321 Science Park',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10003',
                    accreditation: 'CAP, CLIA',
                    servicesOffered: JSON.stringify(['Blood Tests', 'Urinalysis', 'X-Ray', 'MRI', 'CT Scan']),
                },
            },
        },
        include: { lab: true },
    });
    console.log('Creating appointments...');
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7);
    futureDate1.setHours(10, 0, 0, 0);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14);
    futureDate2.setHours(14, 30, 0, 0);
    await prisma.appointment.create({
        data: {
            patientId: patientUser1.patient.id,
            doctorId: doctorUser1.doctor.id,
            scheduledAt: futureDate1,
            duration: 30,
            type: 'IN_PERSON',
            status: AppointmentStatus.CONFIRMED,
            reason: 'Annual cardiac checkup',
            symptoms: JSON.stringify(['Occasional chest discomfort', 'Shortness of breath']),
        },
    });
    await prisma.appointment.create({
        data: {
            patientId: patientUser2.patient.id,
            doctorId: doctorUser2.doctor.id,
            scheduledAt: futureDate2,
            duration: 30,
            type: 'VIDEO',
            status: AppointmentStatus.SCHEDULED,
            reason: 'Follow-up consultation',
            symptoms: JSON.stringify(['Headache', 'Fatigue']),
        },
    });
    console.log('Creating prescriptions...');
    await prisma.prescription.create({
        data: {
            patientId: patientUser1.patient.id,
            doctorId: doctorUser1.doctor.id,
            status: PrescriptionStatus.ACTIVE,
            diagnosis: 'Essential hypertension',
            notes: 'Monitor blood pressure daily. Follow up in 2 weeks.',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            items: {
                create: [
                    {
                        medicineName: 'Lisinopril',
                        dosage: '10mg',
                        frequency: 'Once daily',
                        duration: '30 days',
                        quantity: 30,
                        instructions: 'Take in the morning with water',
                        refillsAllowed: 3,
                    },
                    {
                        medicineName: 'Aspirin',
                        dosage: '81mg',
                        frequency: 'Once daily',
                        duration: '30 days',
                        quantity: 30,
                        instructions: 'Take with food',
                        refillsAllowed: 3,
                    },
                ],
            },
        },
    });
    console.log('Creating medical records...');
    await prisma.medicalRecord.create({
        data: {
            patientId: patientUser1.patient.id,
            recordType: 'Lab Results',
            title: 'Complete Blood Count',
            description: 'Routine CBC test results - all values within normal range',
            recordDate: new Date(),
            metadata: JSON.stringify({
                hemoglobin: '14.5 g/dL',
                wbc: '7500 /µL',
                platelets: '250000 /µL',
            }),
        },
    });
    console.log('Creating audit logs...');
    await prisma.auditLog.create({
        data: {
            action: 'LOGIN',
            entityType: 'User',
            ipAddress: '127.0.0.1',
            userAgent: 'Seed Script',
            metadata: JSON.stringify({ source: 'initial_seed' }),
        },
    });
    console.log('');
    console.log('='.repeat(60));
    console.log('Seed completed successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Test accounts (password for all: Password123!)');
    console.log('-'.repeat(60));
    console.log('Admin:     admin@healthcare.com');
    console.log('Doctor 1:  dr.smith@healthcare.com (Cardiology)');
    console.log('Doctor 2:  dr.johnson@healthcare.com (General Medicine)');
    console.log('Patient 1: patient1@email.com (Alice Williams)');
    console.log('Patient 2: patient2@email.com (Michael Brown)');
    console.log('Pharmacy:  pharmacy@citymed.com');
    console.log('Lab:       lab@diagnosix.com');
    console.log('='.repeat(60));
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map