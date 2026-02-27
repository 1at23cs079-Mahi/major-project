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
exports.PrescriptionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const constants_1 = require("../../common/constants");
let PrescriptionRepository = class PrescriptionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, items) {
        return this.prisma.prescription.create({
            data: {
                ...data,
                items: {
                    create: items.map((item) => ({
                        medicineName: item.medicineName,
                        dosage: item.dosage,
                        frequency: item.frequency,
                        duration: item.duration,
                        quantity: item.quantity,
                        instructions: item.instructions,
                        refillsAllowed: item.refillsAllowed || 0,
                    })),
                },
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
                pharmacy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
            },
        });
    }
    async findById(id) {
        return this.prisma.prescription.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
                pharmacy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
            },
        });
    }
    async findAll(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.prescription.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
                pharmacy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
            },
        });
    }
    async count(where) {
        return this.prisma.prescription.count({ where });
    }
    async update(id, data) {
        return this.prisma.prescription.update({
            where: { id },
            data,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
                pharmacy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
            },
        });
    }
    async fillPrescription(id, pharmacyId) {
        return this.prisma.prescription.update({
            where: { id },
            data: {
                pharmacyId,
                status: constants_1.PrescriptionStatus.FILLED,
                filledAt: new Date(),
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
                pharmacy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                items: true,
            },
        });
    }
    async incrementRefill(itemId) {
        await this.prisma.prescriptionItem.update({
            where: { id: itemId },
            data: {
                refillsUsed: { increment: 1 },
            },
        });
    }
    buildWhereClause(query) {
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.patientId) {
            where.patientId = query.patientId;
        }
        if (query.doctorId) {
            where.doctorId = query.doctorId;
        }
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate) {
                where.createdAt.gte = new Date(query.fromDate);
            }
            if (query.toDate) {
                where.createdAt.lte = new Date(query.toDate);
            }
        }
        return where;
    }
};
exports.PrescriptionRepository = PrescriptionRepository;
exports.PrescriptionRepository = PrescriptionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrescriptionRepository);
//# sourceMappingURL=prescription.repository.js.map