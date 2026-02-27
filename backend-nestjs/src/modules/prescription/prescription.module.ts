import { Module } from '@nestjs/common';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { PrescriptionRepository } from './prescription.repository';

@Module({
  controllers: [PrescriptionController],
  providers: [PrescriptionService, PrescriptionRepository],
  exports: [PrescriptionService, PrescriptionRepository],
})
export class PrescriptionModule {}
