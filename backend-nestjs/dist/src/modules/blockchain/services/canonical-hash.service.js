"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalHashService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let CanonicalHashService = class CanonicalHashService {
    constructor() {
        this.hashSalt = process.env.HASH_SALT || '';
    }
    hash(data, useSalt = false) {
        const canonical = this.canonicalize(data);
        const toHash = useSalt && this.hashSalt
            ? canonical + this.hashSalt
            : canonical;
        const hash = (0, crypto_1.createHash)('sha256').update(toHash).digest('hex');
        return '0x' + hash;
    }
    createVersionHash(recordHash, previousHash, timestamp) {
        const data = {
            recordHash,
            previousHash: previousHash || '0x0',
            timestamp: timestamp.toISOString(),
        };
        return this.hash(data);
    }
    verify(data, expectedHash, useSalt = false) {
        const computedHash = this.hash(data, useSalt);
        return computedHash.toLowerCase() === expectedHash.toLowerCase();
    }
    canonicalize(data) {
        return JSON.stringify(this.sortObject(data));
    }
    sortObject(obj) {
        if (obj === null || obj === undefined) {
            return null;
        }
        if (obj instanceof Date) {
            return obj.toISOString();
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObject(item));
        }
        if (typeof obj === 'object') {
            const sorted = {};
            const keys = Object.keys(obj).sort();
            for (const key of keys) {
                const value = obj[key];
                if (value !== undefined) {
                    sorted[key] = this.sortObject(value);
                }
            }
            return sorted;
        }
        return obj;
    }
    extractPatientIntegrityFields(patient) {
        return {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: this.normalizeDate(patient.dateOfBirth),
            gender: patient.gender,
            bloodType: patient.bloodType || null,
            allergies: this.parseJsonField(patient.allergies),
            chronicConditions: this.parseJsonField(patient.chronicConditions),
            emergencyContact: patient.emergencyContact || null,
            emergencyPhone: patient.emergencyPhone || null,
        };
    }
    extractPrescriptionIntegrityFields(prescription) {
        return {
            id: prescription.id,
            patientId: prescription.patientId,
            doctorId: prescription.doctorId,
            diagnosis: prescription.diagnosis || null,
            notes: prescription.notes || null,
            validUntil: this.normalizeDate(prescription.validUntil),
            items: prescription.items
                .map(item => ({
                medicineName: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                quantity: item.quantity,
                instructions: item.instructions || null,
                refillsAllowed: item.refillsAllowed,
            }))
                .sort((a, b) => a.medicineName.localeCompare(b.medicineName)),
        };
    }
    extractMedicalRecordIntegrityFields(record) {
        return {
            id: record.id,
            patientId: record.patientId,
            recordType: record.recordType,
            title: record.title,
            description: record.description || null,
            recordDate: this.normalizeDate(record.recordDate),
            metadata: this.parseJsonField(record.metadata),
        };
    }
    extractAppointmentIntegrityFields(appointment) {
        return {
            id: appointment.id,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            scheduledAt: this.normalizeDate(appointment.scheduledAt),
            duration: appointment.duration,
            type: appointment.type,
            status: appointment.status,
            reason: appointment.reason || null,
            notes: appointment.notes || null,
            symptoms: this.parseJsonField(appointment.symptoms),
        };
    }
    hashPatient(patient) {
        const fields = this.extractPatientIntegrityFields(patient);
        return this.hash(fields);
    }
    hashPrescription(prescription) {
        const fields = this.extractPrescriptionIntegrityFields(prescription);
        return this.hash(fields);
    }
    hashMedicalRecord(record) {
        const fields = this.extractMedicalRecordIntegrityFields(record);
        return this.hash(fields);
    }
    hashAppointment(appointment) {
        const fields = this.extractAppointmentIntegrityFields(appointment);
        return this.hash(fields);
    }
    normalizeDate(date) {
        if (!date)
            return null;
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime()))
            return null;
        return d.toISOString().split('T')[0];
    }
    parseJsonField(field) {
        if (!field)
            return null;
        try {
            return JSON.parse(field);
        }
        catch {
            return field;
        }
    }
    hashEntityId(entityId) {
        return this.hash({ entityId }, true);
    }
    hashMultiple(hashes) {
        const sorted = [...hashes].sort();
        return this.hash(sorted);
    }
};
exports.CanonicalHashService = CanonicalHashService;
exports.CanonicalHashService = CanonicalHashService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CanonicalHashService);
//# sourceMappingURL=canonical-hash.service.js.map