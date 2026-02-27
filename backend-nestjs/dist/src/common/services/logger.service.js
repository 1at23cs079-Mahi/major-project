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
exports.WinstonLoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = require("winston");
let WinstonLoggerService = class WinstonLoggerService {
    constructor() {
        this.logger = (0, winston_1.createLogger)({
            level: process.env.LOG_LEVEL || 'debug',
            format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.json()),
            defaultMeta: { service: 'healthcare-api' },
            transports: [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ timestamp, level, message, context, stack }) => {
                        const ctx = context ? `[${context}]` : '';
                        const msg = stack ? `${message}\n${stack}` : message;
                        return `${timestamp} ${level} ${ctx} ${msg}`;
                    })),
                }),
                new winston_1.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                }),
                new winston_1.transports.File({
                    filename: 'logs/combined.log',
                    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
                }),
            ],
        });
    }
    setContext(context) {
        this.context = context;
    }
    log(message, context) {
        this.logger.info(message, { context: context || this.context });
    }
    error(message, trace, context) {
        this.logger.error(message, {
            context: context || this.context,
            stack: trace,
        });
    }
    warn(message, context) {
        this.logger.warn(message, { context: context || this.context });
    }
    debug(message, context) {
        this.logger.debug(message, { context: context || this.context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context: context || this.context });
    }
    logWithMeta(level, message, meta) {
        this.logger.log(level, message, {
            context: this.context,
            ...meta,
        });
    }
};
exports.WinstonLoggerService = WinstonLoggerService;
exports.WinstonLoggerService = WinstonLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WinstonLoggerService);
//# sourceMappingURL=logger.service.js.map