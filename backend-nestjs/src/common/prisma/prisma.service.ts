import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Delete in order to respect foreign key constraints
    await this.prescriptionItem.deleteMany();
    await this.prescription.deleteMany();
    await this.appointment.deleteMany();
    await this.medicalRecord.deleteMany();
    await this.auditLog.deleteMany();
    await this.refreshToken.deleteMany();
    await this.patient.deleteMany();
    await this.doctor.deleteMany();
    await this.pharmacy.deleteMany();
    await this.lab.deleteMany();
    await this.user.deleteMany();
  }
}
