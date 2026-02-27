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
var VersionTrackingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionTrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const canonical_hash_service_1 = require("./canonical-hash.service");
let VersionTrackingService = VersionTrackingService_1 = class VersionTrackingService {
    constructor(prisma, hashService) {
        this.prisma = prisma;
        this.hashService = hashService;
        this.logger = new common_1.Logger(VersionTrackingService_1.name);
    }
    async createVersion(entityType, entityId, recordData, createdBy, changeType = 'UPDATE') {
        const latestVersion = await this.getLatestVersion(entityType, entityId);
        const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
        const recordHash = this.hashRecord(entityType, recordData);
        const previousHash = latestVersion?.versionHash || null;
        const now = new Date();
        const versionHash = this.hashService.createVersionHash(recordHash, previousHash, now);
        const version = await this.prisma.recordVersion.create({
            data: {
                entityType,
                entityId,
                version: newVersionNumber,
                recordHash,
                previousHash,
                versionHash,
                createdBy,
                changeType,
                createdAt: now,
            },
        });
        this.logger.log(`Created version ${newVersionNumber} for ${entityType}:${entityId} - hash: ${versionHash.slice(0, 10)}...`);
        return version;
    }
    hashRecord(entityType, recordData) {
        switch (entityType) {
            case 'patient':
                return this.hashService.hashPatient(recordData);
            case 'prescription':
                return this.hashService.hashPrescription(recordData);
            case 'medicalRecord':
                return this.hashService.hashMedicalRecord(recordData);
            case 'appointment':
                return this.hashService.hashAppointment(recordData);
            default:
                return this.hashService.hash(recordData);
        }
    }
    async getLatestVersion(entityType, entityId) {
        return this.prisma.recordVersion.findFirst({
            where: { entityType, entityId },
            orderBy: { version: 'desc' },
        });
    }
    async getVersionHistory(entityType, entityId) {
        return this.prisma.recordVersion.findMany({
            where: { entityType, entityId },
            orderBy: { version: 'asc' },
            include: {
                merkleProof: true,
            },
        });
    }
    async getVersion(entityType, entityId, versionNumber) {
        return this.prisma.recordVersion.findUnique({
            where: {
                entityType_entityId_version: {
                    entityType,
                    entityId,
                    version: versionNumber,
                },
            },
            include: {
                merkleProof: {
                    include: {
                        batch: true,
                    },
                },
            },
        });
    }
    async getUnsubmittedVersions(limit = 100) {
        return this.prisma.recordVersion.findMany({
            where: {
                batchId: null,
            },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
    }
    async verifyVersionChain(entityType, entityId) {
        const versions = await this.getVersionHistory(entityType, entityId);
        if (versions.length === 0) {
            return { valid: true, totalVersions: 0 };
        }
        if (versions[0].previousHash !== null) {
            return {
                valid: false,
                totalVersions: versions.length,
                brokenAt: 1,
                error: 'First version should not have previousHash',
            };
        }
        for (let i = 1; i < versions.length; i++) {
            const current = versions[i];
            const previous = versions[i - 1];
            if (current.previousHash !== previous.versionHash) {
                return {
                    valid: false,
                    totalVersions: versions.length,
                    brokenAt: i + 1,
                    error: `Version ${i + 1} previousHash does not match version ${i} versionHash`,
                };
            }
        }
        return { valid: true, totalVersions: versions.length };
    }
    async verifyVersionData(entityType, entityId, versionNumber, currentData) {
        const version = await this.getVersion(entityType, entityId, versionNumber);
        if (!version) {
            throw new Error(`Version ${versionNumber} not found for ${entityType}:${entityId}`);
        }
        const actualHash = this.hashRecord(entityType, currentData);
        return {
            valid: version.recordHash === actualHash,
            expectedHash: version.recordHash,
            actualHash,
        };
    }
    async assignVersionsToBatch(versionIds, batchId) {
        await this.prisma.recordVersion.updateMany({
            where: { id: { in: versionIds } },
            data: { batchId },
        });
        this.logger.log(`Assigned ${versionIds.length} versions to batch ${batchId}`);
    }
    async getStatistics() {
        const [totalVersions, pendingVersions, versionsByType] = await Promise.all([
            this.prisma.recordVersion.count(),
            this.prisma.recordVersion.count({ where: { batchId: null } }),
            this.prisma.recordVersion.groupBy({
                by: ['entityType'],
                _count: true,
            }),
        ]);
        return {
            totalVersions,
            pendingVersions,
            submittedVersions: totalVersions - pendingVersions,
            byEntityType: versionsByType.reduce((acc, item) => {
                acc[item.entityType] = item._count;
                return acc;
            }, {}),
        };
    }
};
exports.VersionTrackingService = VersionTrackingService;
exports.VersionTrackingService = VersionTrackingService = VersionTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        canonical_hash_service_1.CanonicalHashService])
], VersionTrackingService);
//# sourceMappingURL=version-tracking.service.js.map