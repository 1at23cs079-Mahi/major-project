"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./common/prisma/prisma.module");
const redis_module_1 = require("./common/redis/redis.module");
const logger_module_1 = require("./common/services/logger.module");
const auth_module_1 = require("./modules/auth/auth.module");
const patient_module_1 = require("./modules/patient/patient.module");
const appointment_module_1 = require("./modules/appointment/appointment.module");
const prescription_module_1 = require("./modules/prescription/prescription.module");
const health_module_1 = require("./modules/health/health.module");
const audit_module_1 = require("./modules/audit/audit.module");
const blockchain_module_1 = require("./modules/blockchain/blockchain.module");
const configuration_1 = __importDefault(require("./config/configuration"));
const validation_schema_1 = require("./config/validation.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: validation_schema_1.validationSchema,
                validationOptions: {
                    abortEarly: true,
                },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ([
                    {
                        ttl: configService.get('THROTTLE_TTL', 60) * 1000,
                        limit: configService.get('THROTTLE_LIMIT', 100),
                    },
                ]),
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            logger_module_1.LoggerModule,
            auth_module_1.AuthModule,
            patient_module_1.PatientModule,
            appointment_module_1.AppointmentModule,
            prescription_module_1.PrescriptionModule,
            audit_module_1.AuditModule,
            blockchain_module_1.BlockchainModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map