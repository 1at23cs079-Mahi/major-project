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
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const logger_service_1 = require("../services/logger.service");
let LoggingInterceptor = class LoggingInterceptor {
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext('HTTP');
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const requestId = headers['x-request-id'] || this.generateRequestId();
        request.requestId = requestId;
        const startTime = Date.now();
        this.logger.debug(`Incoming Request: ${method} ${url}`, 'LoggingInterceptor');
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const duration = Date.now() - startTime;
                this.logger.logWithMeta('info', `${method} ${url} ${statusCode}`, {
                    method,
                    url,
                    statusCode,
                    duration: `${duration}ms`,
                    ip,
                    userAgent: userAgent.substring(0, 100),
                    requestId,
                });
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.logWithMeta('error', `${method} ${url} ERROR`, {
                    method,
                    url,
                    duration: `${duration}ms`,
                    ip,
                    userAgent: userAgent.substring(0, 100),
                    requestId,
                    error: error.message,
                });
            },
        }));
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.WinstonLoggerService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map