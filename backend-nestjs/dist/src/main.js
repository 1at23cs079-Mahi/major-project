"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const logger_service_1 = require("./common/services/logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const configService = app.get(config_1.ConfigService);
    const logger = app.get(logger_service_1.WinstonLoggerService);
    app.useLogger(logger);
    app.use((0, helmet_1.default)());
    const corsOrigins = configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
        prefix: 'api/v',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(logger), new transform_interceptor_1.TransformInterceptor());
    if (configService.get('SWAGGER_ENABLED') === 'true') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Healthcare Platform API')
            .setDescription('Production-ready Healthcare Management System API')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('Auth', 'Authentication endpoints')
            .addTag('Patients', 'Patient management endpoints')
            .addTag('Appointments', 'Appointment scheduling endpoints')
            .addTag('Prescriptions', 'Prescription management endpoints')
            .addTag('Health', 'System health endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        });
        logger.log('Swagger documentation available at /api/docs', 'Bootstrap');
    }
    const port = configService.get('PORT') || 5000;
    await app.listen(port);
    logger.log(`Application running on port ${port}`, 'Bootstrap');
    logger.log(`Environment: ${configService.get('NODE_ENV')}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map