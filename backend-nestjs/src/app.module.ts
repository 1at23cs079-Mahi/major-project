import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RedisModule } from '@common/redis/redis.module';
import { LoggerModule } from '@common/services/logger.module';
import { AuthModule } from '@modules/auth/auth.module';
import { PatientModule } from '@modules/patient/patient.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { PrescriptionModule } from '@modules/prescription/prescription.module';
import { HealthModule } from '@modules/health/health.module';
import { AuditModule } from '@modules/audit/audit.module';
import { BlockchainModule } from '@modules/blockchain/blockchain.module';
import configuration from '@config/configuration';
import { validationSchema } from '@config/validation.schema';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ([
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ]),
    }),

    // Core Modules
    PrismaModule,
    RedisModule,
    LoggerModule,

    // Feature Modules
    AuthModule,
    PatientModule,
    AppointmentModule,
    PrescriptionModule,
    AuditModule,
    BlockchainModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
