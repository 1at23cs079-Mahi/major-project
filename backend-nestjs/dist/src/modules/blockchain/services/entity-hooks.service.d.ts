import { PrismaService } from '@common/prisma/prisma.service';
import { VersionTrackingService, VersionedEntityType, ChangeType } from './version-tracking.service';
export declare class EntityHooksService {
    private readonly prisma;
    private readonly versionTracking;
    private readonly logger;
    private isEnabled;
    constructor(prisma: PrismaService, versionTracking: VersionTrackingService);
    onPatientCreated(patient: any, userId: string): Promise<void>;
    onPatientUpdated(patient: any, userId: string): Promise<void>;
    onPatientDeleted(patientId: string, userId: string): Promise<void>;
    onPrescriptionCreated(prescription: any, userId: string): Promise<void>;
    onPrescriptionUpdated(prescription: any, userId: string): Promise<void>;
    onPrescriptionFilled(prescriptionId: string, pharmacyId: string, userId: string): Promise<void>;
    onMedicalRecordCreated(record: any, userId: string): Promise<void>;
    onMedicalRecordUpdated(record: any, userId: string): Promise<void>;
    onAppointmentCreated(appointment: any, userId: string): Promise<void>;
    onAppointmentUpdated(appointment: any, userId: string): Promise<void>;
    onAppointmentCancelled(appointmentId: string, userId: string, reason?: string): Promise<void>;
    onEntityChange(entityType: VersionedEntityType, entityId: string, data: Record<string, unknown>, userId: string, changeType?: ChangeType): Promise<void>;
    setEnabled(enabled: boolean): void;
    get enabled(): boolean;
}
