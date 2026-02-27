import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';
export interface BlockchainConfig {
    enabled: boolean;
    rpcUrl: string;
    chainId: number;
    privateKey: string;
    contracts: {
        auditLog: string;
        consentManager: string;
        prescriptionRegistry: string;
    };
}
export declare class BlockchainService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private provider;
    private wallet;
    private config;
    private isConnected;
    private auditLogContract;
    private consentManagerContract;
    private prescriptionRegistryContract;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<boolean>;
    private initializeContracts;
    isEnabled(): boolean;
    getProvider(): JsonRpcProvider | null;
    getWallet(): Wallet | null;
    getAuditLogContract(): Contract | null;
    getConsentManagerContract(): Contract | null;
    getPrescriptionRegistryContract(): Contract | null;
    getContract(type: 'AUDIT_LOG' | 'CONSENT_MANAGER' | 'PRESCRIPTION_REGISTRY'): Contract | null;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<bigint>;
    getBalance(): Promise<string>;
    waitForTransaction(txHash: string, confirmations?: number): Promise<ethers.TransactionReceipt | null>;
    getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null>;
    healthCheck(): Promise<{
        enabled: boolean;
        connected: boolean;
        network?: string;
        chainId?: number;
        blockNumber?: number;
        walletAddress?: string;
        balance?: string;
    }>;
}
