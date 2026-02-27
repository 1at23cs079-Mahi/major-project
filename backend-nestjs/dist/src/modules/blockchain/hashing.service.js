"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashingService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let HashingService = class HashingService {
    hashData(data) {
        const stringData = typeof data === 'string' ? data : JSON.stringify(data, this.sortedReplacer);
        const hash = (0, crypto_1.createHash)('sha256').update(stringData).digest('hex');
        return '0x' + hash;
    }
    hashEntityId(entityId) {
        const hash = (0, crypto_1.createHash)('sha256').update(entityId).digest('hex');
        return '0x' + hash;
    }
    hashPatientRecord(patient) {
        const recordData = {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: patient.dateOfBirth instanceof Date
                ? patient.dateOfBirth.toISOString().split('T')[0]
                : patient.dateOfBirth,
            gender: patient.gender,
            phone: patient.phone || null,
            address: patient.address || null,
            bloodType: patient.bloodType || null,
            allergies: patient.allergies || null,
            chronicConditions: patient.chronicConditions || null,
        };
        return this.hashData(recordData);
    }
    hashPrescription(prescription) {
        const recordData = {
            id: prescription.id,
            patientId: prescription.patientId,
            doctorId: prescription.doctorId,
            diagnosis: prescription.diagnosis || null,
            notes: prescription.notes || null,
            items: prescription.items.map(item => ({
                medicineName: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                quantity: item.quantity,
                instructions: item.instructions || null,
            })).sort((a, b) => a.medicineName.localeCompare(b.medicineName)),
        };
        return this.hashData(recordData);
    }
    hashAppointment(appointment) {
        const recordData = {
            id: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            scheduledAt: appointment.scheduledAt instanceof Date
                ? appointment.scheduledAt.toISOString()
                : appointment.scheduledAt,
            duration: appointment.duration,
            type: appointment.type,
            status: appointment.status,
            reason: appointment.reason || null,
        };
        return this.hashData(recordData);
    }
    hashMedicalRecord(record) {
        const recordData = {
            id: record.id,
            patientId: record.patientId,
            recordType: record.recordType,
            title: record.title,
            description: record.description || null,
            recordDate: record.recordDate instanceof Date
                ? record.recordDate.toISOString().split('T')[0]
                : record.recordDate,
            metadata: record.metadata || null,
        };
        return this.hashData(recordData);
    }
    hashConsentPurpose(purpose) {
        return this.hashData({ purpose });
    }
    verifyHash(data, hash) {
        const computedHash = this.hashData(data);
        return computedHash.toLowerCase() === hash.toLowerCase();
    }
    generateNonce() {
        return '0x' + (0, crypto_1.randomBytes)(32).toString('hex');
    }
    sortedReplacer(key, value) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return Object.keys(value)
                .sort()
                .reduce((sorted, k) => {
                sorted[k] = value[k];
                return sorted;
            }, {});
        }
        return value;
    }
};
exports.HashingService = HashingService;
exports.HashingService = HashingService = __decorate([
    (0, common_1.Injectable)()
], HashingService);
//# sourceMappingURL=hashing.service.js.map