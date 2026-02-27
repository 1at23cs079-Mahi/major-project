import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

// Contract ABIs - These will be generated after compiling Solidity
import * as AuditLogABI from './abis/HealthcareAuditLog.json';
import * as ConsentManagerABI from './abis/ConsentManager.json';
import * as PrescriptionRegistryABI from './abis/PrescriptionRegistry.json';

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

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: JsonRpcProvider | null = null;
  private wallet: Wallet | null = null;
  private config: BlockchainConfig;
  private isConnected = false;

  // Contract instances
  private auditLogContract: Contract | null = null;
  private consentManagerContract: Contract | null = null;
  private prescriptionRegistryContract: Contract | null = null;

  constructor(private configService: ConfigService) {
    this.config = {
      enabled: this.configService.get<boolean>('BLOCKCHAIN_ENABLED', false),
      rpcUrl: this.configService.get<string>('BLOCKCHAIN_RPC_URL', 'http://127.0.0.1:8545'),
      chainId: this.configService.get<number>('BLOCKCHAIN_CHAIN_ID', 31337),
      privateKey: this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY', ''),
      contracts: {
        auditLog: this.configService.get<string>('AUDIT_LOG_CONTRACT_ADDRESS', ''),
        consentManager: this.configService.get<string>('CONSENT_MANAGER_CONTRACT_ADDRESS', ''),
        prescriptionRegistry: this.configService.get<string>('PRESCRIPTION_REGISTRY_CONTRACT_ADDRESS', ''),
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

  /**
   * Connect to blockchain network
   */
  async connect(): Promise<boolean> {
    try {
      this.logger.log(`Connecting to blockchain at ${this.config.rpcUrl}...`);

      // Create provider
      this.provider = new JsonRpcProvider(this.config.rpcUrl, {
        chainId: this.config.chainId,
        name: 'healthcare-chain',
      });

      // Verify connection
      const network = await this.provider.getNetwork();
      this.logger.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

      // Create wallet if private key is provided
      if (this.config.privateKey) {
        this.wallet = new Wallet(this.config.privateKey, this.provider);
        this.logger.log(`Wallet initialized: ${this.wallet.address}`);
      } else {
        this.logger.warn('No private key provided. Read-only mode.');
      }

      // Initialize contracts
      await this.initializeContracts();

      this.isConnected = true;
      this.logger.log('✅ Blockchain service initialized successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to connect to blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Initialize contract instances
   */
  private async initializeContracts() {
    const signer = this.wallet || this.provider;

    if (this.config.contracts.auditLog) {
      this.auditLogContract = new Contract(
        this.config.contracts.auditLog,
        AuditLogABI.abi,
        signer,
      );
      this.logger.log(`AuditLog contract initialized at ${this.config.contracts.auditLog}`);
    }

    if (this.config.contracts.consentManager) {
      this.consentManagerContract = new Contract(
        this.config.contracts.consentManager,
        ConsentManagerABI.abi,
        signer,
      );
      this.logger.log(`ConsentManager contract initialized at ${this.config.contracts.consentManager}`);
    }

    if (this.config.contracts.prescriptionRegistry) {
      this.prescriptionRegistryContract = new Contract(
        this.config.contracts.prescriptionRegistry,
        PrescriptionRegistryABI.abi,
        signer,
      );
      this.logger.log(`PrescriptionRegistry contract initialized at ${this.config.contracts.prescriptionRegistry}`);
    }
  }

  /**
   * Check if blockchain is enabled and connected
   */
  isEnabled(): boolean {
    return this.config.enabled && this.isConnected;
  }

  /**
   * Get provider instance
   */
  getProvider(): JsonRpcProvider | null {
    return this.provider;
  }

  /**
   * Get wallet instance
   */
  getWallet(): Wallet | null {
    return this.wallet;
  }

  /**
   * Get AuditLog contract
   */
  getAuditLogContract(): Contract | null {
    return this.auditLogContract;
  }

  /**
   * Get ConsentManager contract
   */
  getConsentManagerContract(): Contract | null {
    return this.consentManagerContract;
  }

  /**
   * Get PrescriptionRegistry contract
   */
  getPrescriptionRegistryContract(): Contract | null {
    return this.prescriptionRegistryContract;
  }

  /**
   * Get contract by type
   */
  getContract(type: 'AUDIT_LOG' | 'CONSENT_MANAGER' | 'PRESCRIPTION_REGISTRY'): Contract | null {
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

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');
    return await this.provider.getBlockNumber();
  }

  /**
   * Get gas price
   */
  async getGasPrice(): Promise<bigint> {
    if (!this.provider) throw new Error('Provider not initialized');
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    if (!this.wallet || !this.provider) return '0';
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations = 1): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) throw new Error('Provider not initialized');
    return await this.provider.waitForTransaction(txHash, confirmations);
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) throw new Error('Provider not initialized');
    return await this.provider.getTransactionReceipt(txHash);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    enabled: boolean;
    connected: boolean;
    network?: string;
    chainId?: number;
    blockNumber?: number;
    walletAddress?: string;
    balance?: string;
  }> {
    const result: any = {
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
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return result;
  }
}
