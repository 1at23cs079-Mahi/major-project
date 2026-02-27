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
var EntityHooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityHooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const version_tracking_service_1 = require("./version-tracking.service");
let EntityHooksService = EntityHooksService_1 = class EntityHooksService {
    constructor(prisma, versionTracking) {
        this.prisma = prisma;
        this.versionTracking = versionTracking;
        this.logger = new common_1.Logger(EntityHooksService_1.name);
        this.isEnabled = process.env.BLOCKCHAIN_ENABLED === 'true';
    }
    async onPatientCreated(patient, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('patient', patient.id, patient, userId, 'CREATE');
            this.logger.debug(`Created version for new patient: ${patient.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for patient ${patient.id}:`, error);
        }
    }
    async onPatientUpdated(patient, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('patient', patient.id, patient, userId, 'UPDATE');
            this.logger.debug(`Created version for updated patient: ${patient.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for patient ${patient.id}:`, error);
        }
    }
    async onPatientDeleted(patientId, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('patient', patientId, { id: patientId, deleted: true, deletedAt: new Date() }, userId, 'DELETE');
            this.logger.debug(`Created delete version for patient: ${patientId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create delete version for patient ${patientId}:`, error);
        }
    }
    async onPrescriptionCreated(prescription, userId) {
        if (!this.isEnabled)
            return;
        try {
            const fullPrescription = prescription.items
                ? prescription
                : await this.prisma.prescription.findUnique({
                    where: { id: prescription.id },
                    include: { items: true },
                });
            await this.versionTracking.createVersion('prescription', prescription.id, fullPrescription, userId, 'CREATE');
            this.logger.debug(`Created version for new prescription: ${prescription.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for prescription ${prescription.id}:`, error);
        }
    }
    async onPrescriptionUpdated(prescription, userId) {
        if (!this.isEnabled)
            return;
        try {
            const fullPrescription = prescription.items
                ? prescription
                : await this.prisma.prescription.findUnique({
                    where: { id: prescription.id },
                    include: { items: true },
                });
            await this.versionTracking.createVersion('prescription', prescription.id, fullPrescription, userId, 'UPDATE');
            this.logger.debug(`Created version for updated prescription: ${prescription.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for prescription ${prescription.id}:`, error);
        }
    }
    async onPrescriptionFilled(prescriptionId, pharmacyId, userId) {
        if (!this.isEnabled)
            return;
        try {
            const prescription = await this.prisma.prescription.findUnique({
                where: { id: prescriptionId },
                include: { items: true },
            });
            await this.versionTracking.createVersion('prescription', prescriptionId, { ...prescription, filledBy: pharmacyId }, userId, 'UPDATE');
            this.logger.debug(`Created fill version for prescription: ${prescriptionId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create fill version for prescription ${prescriptionId}:`, error);
        }
    }
    async onMedicalRecordCreated(record, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('medicalRecord', record.id, record, userId, 'CREATE');
            this.logger.debug(`Created version for new medical record: ${record.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for medical record ${record.id}:`, error);
        }
    }
    async onMedicalRecordUpdated(record, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('medicalRecord', record.id, record, userId, 'UPDATE');
            this.logger.debug(`Created version for updated medical record: ${record.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for medical record ${record.id}:`, error);
        }
    }
    async onAppointmentCreated(appointment, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('appointment', appointment.id, appointment, userId, 'CREATE');
            this.logger.debug(`Created version for new appointment: ${appointment.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for appointment ${appointment.id}:`, error);
        }
    }
    async onAppointmentUpdated(appointment, userId) {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion('appointment', appointment.id, appointment, userId, 'UPDATE');
            this.logger.debug(`Created version for updated appointment: ${appointment.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for appointment ${appointment.id}:`, error);
        }
    }
    async onAppointmentCancelled(appointmentId, userId, reason) {
        if (!this.isEnabled)
            return;
        try {
            const appointment = await this.prisma.appointment.findUnique({
                where: { id: appointmentId },
            });
            await this.versionTracking.createVersion('appointment', appointmentId, { ...appointment, cancelledAt: new Date(), cancellationReason: reason }, userId, 'UPDATE');
            this.logger.debug(`Created cancellation version for appointment: ${appointmentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create cancellation version for appointment ${appointmentId}:`, error);
        }
    }
    async onEntityChange(entityType, entityId, data, userId, changeType = 'UPDATE') {
        if (!this.isEnabled)
            return;
        try {
            await this.versionTracking.createVersion(entityType, entityId, data, userId, changeType);
            this.logger.debug(`Created version for ${entityType}: ${entityId} (${changeType})`);
        }
        catch (error) {
            this.logger.error(`Failed to create version for ${entityType} ${entityId}:`, error);
        }
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.log(`Entity hooks ${enabled ? 'enabled' : 'disabled'}`);
    }
    get enabled() {
        return this.isEnabled;
    }
};
exports.EntityHooksService = EntityHooksService;
exports.EntityHooksService = EntityHooksService = EntityHooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        version_tracking_service_1.VersionTrackingService])
], EntityHooksService);
//# sourceMappingURL=entity-hooks.service.js.map