"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const AuditLogABI = __importStar(require("./abis/HealthcareAuditLog.json"));
const ConsentManagerABI = __importStar(require("./abis/ConsentManager.json"));
const PrescriptionRegistryABI = __importStar(require("./abis/PrescriptionRegistry.json"));
let BlockchainService = BlockchainService_1 = class BlockchainService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(BlockchainService_1.name);
        this.provider = null;
        this.wallet = null;
        this.isConnected = false;
        this.auditLogContract = null;
        this.consentManagerContract = null;
        this.prescriptionRegistryContract = null;
        this.config = {
            enabled: this.configService.get('BLOCKCHAIN_ENABLED', false),
            rpcUrl: this.configService.get('BLOCKCHAIN_RPC_URL', 'http://127.0.0.1:8545'),
            chainId: this.configService.get('BLOCKCHAIN_CHAIN_ID', 31337),
            privateKey: this.configService.get('BLOCKCHAIN_PRIVATE_KEY', ''),
            contracts: {
                auditLog: this.configService.get('AUDIT_LOG_CONTRACT_ADDRESS', ''),
                consentManager: this.configService.get('CONSENT_MANAGER_CONTRACT_ADDRESS', ''),
                prescriptionRegistry: this.configService.get('PRESCRIPTION_REGISTRY_CONTRACT_ADDRESS', ''),
            },
        };
    }
    async onModuleInit() {
        if (!this.config.enabled) {
            this.logger.warn('Blockchain integration is DISABLED. Set BLOCKCHAIN_ENABLED=true to enable.');
            return;
        }
        await this.connect();
    }
    async onModuleDestroy() {
        if (this.provider) {
            this.provider.destroy();
            this.logger.log('Blockchain connection closed');
        }
    }
    async connect() {
        try {
            this.logger.log(`Connecting to blockchain at ${this.config.rpcUrl}...`);
            this.provider = new ethers_1.JsonRpcProvider(this.config.rpcUrl, {
                chainId: this.config.chainId,
                name: 'healthcare-chain',
            });
            const network = await this.provider.getNetwork();
            this.logger.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
            if (this.config.privateKey) {
                this.wallet = new ethers_1.Wallet(this.config.privateKey, this.provider);
                this.logger.log(`Wallet initialized: ${this.wallet.address}`);
            }
            else {
                this.logger.warn('No private key provided. Read-only mode.');
            }
            await this.initializeContracts();
            this.isConnected = true;
            this.logger.log('✅ Blockchain service initialized successfully');
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to connect to blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`);
            this.isConnected = false;
            return false;
        }
    }
    async initializeContracts() {
        const signer = this.wallet || this.provider;
        if (this.config.contracts.auditLog) {
            this.auditLogContract = new ethers_1.Contract(this.config.contracts.auditLog, AuditLogABI.abi, signer);
            this.logger.log(`AuditLog contract initialized at ${this.config.contracts.auditLog}`);
        }
        if (this.config.contracts.consentManager) {
            this.consentManagerContract = new ethers_1.Contract(this.config.contracts.consentManager, ConsentManagerABI.abi, signer);
            this.logger.log(`ConsentManager contract initialized at ${this.config.contracts.consentManager}`);
        }
        if (this.config.contracts.prescriptionRegistry) {
            this.prescriptionRegistryContract = new ethers_1.Contract(this.config.contracts.prescriptionRegistry, PrescriptionRegistryABI.abi, signer);
            this.logger.log(`PrescriptionRegistry contract initialized at ${this.config.contracts.prescriptionRegistry}`);
        }
    }
    isEnabled() {
        return this.config.enabled && this.isConnected;
    }
    getProvider() {
        return this.provider;
    }
    getWallet() {
        return this.wallet;
    }
    getAuditLogContract() {
        return this.auditLogContract;
    }
    getConsentManagerContract() {
        return this.consentManagerContract;
    }
    getPrescriptionRegistryContract() {
        return this.prescriptionRegistryContract;
    }
    getContract(type) {
        switch (type) {
            case 'AUDIT_LOG':
                return this.auditLogContract;
            case 'CONSENT_MANAGER':
                return this.consentManagerContract;
            case 'PRESCRIPTION_REGISTRY':
                return this.prescriptionRegistryContract;
            default:
                return null;
        }
    }
    async getBlockNumber() {
        if (!this.provider)
            throw new Error('Provider not initialized');
        return await this.provider.getBlockNumber();
    }
    async getGasPrice() {
        if (!this.provider)
            throw new Error('Provider not initialized');
        const feeData = await this.provider.getFeeData();
        return feeData.gasPrice || BigInt(0);
    }
    async getBalance() {
        if (!this.wallet || !this.provider)
            return '0';
        const balance = await this.provider.getBalance(this.wallet.address);
        return ethers_1.ethers.formatEther(balance);
    }
    async waitForTransaction(txHash, confirmations = 1) {
        if (!this.provider)
            throw new Error('Provider not initialized');
        return await this.provider.waitForTransaction(txHash, confirmations);
    }
    async getTransactionReceipt(txHash) {
        if (!this.provider)
            throw new Error('Provider not initialized');
        return await this.provider.getTransactionReceipt(txHash);
    }
    async healthCheck() {
        const result = {
            enabled: this.config.enabled,
            connected: this.isConnected,
        };
        if (this.isConnected && this.provider) {
            try {
                const network = await this.provider.getNetwork();
                result.network = network.name;
                result.chainId = Number(network.chainId);
                result.blockNumber = await this.provider.getBlockNumber();
                if (this.wallet) {
                    result.walletAddress = this.wallet.address;
                    result.balance = await this.getBalance();
                }
            }
            catch (error) {
                result.error = error instanceof Error ? error.message : 'Unknown error';
            }
        }
        return result;
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map