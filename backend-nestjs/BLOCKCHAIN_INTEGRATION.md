# 🔗 Blockchain Integration Guide

## Healthcare Platform - Tamper-Proof Audit & Verification System

This document describes the blockchain integration added to the healthcare platform for:
- Tamper-proof audit logs
- Medical record integrity verification
- Prescription authenticity
- Patient consent tracking

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │   OFF-CHAIN (SQLite) │      │   ON-CHAIN (Ethereum)│       │
│  │   ─────────────────  │      │   ─────────────────  │       │
│  │   • Patient Data     │      │   • Record Hashes    │       │
│  │   • Appointments     │◄────►│   • Timestamps       │       │
│  │   • Prescriptions    │      │   • Audit Proofs     │       │
│  │   • Medical History  │      │   • Signatures       │       │
│  │   • Full Records     │      │   • Consent Status   │       │
│  └──────────────────────┘      └──────────────────────┘       │
│                                                                 │
│  ⚠️  NO SENSITIVE DATA ON BLOCKCHAIN - ONLY HASHES & PROOFS   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Privacy First**: NO patient data is stored on-chain
2. **Integrity Verification**: SHA-256 hashes prove data hasn't been tampered
3. **Immutable Audit Trail**: Every critical action is logged on blockchain
4. **Consent Transparency**: Consent grants/revocations are publicly verifiable

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Ethereum (Hardhat local network) |
| Smart Contracts | Solidity 0.8.24 |
| Backend Integration | ethers.js v6 |
| Security | OpenZeppelin Contracts v5 |
| Development | Hardhat + TypeChain |

---

## 📦 Project Structure

```
backend-nestjs/
├── blockchain/                    # Hardhat project
│   ├── contracts/                 # Solidity smart contracts
│   │   ├── HealthcareAuditLog.sol
│   │   ├── ConsentManager.sol
│   │   └── PrescriptionRegistry.sol
│   ├── scripts/
│   │   ├── deploy.ts             # Deployment script
│   │   └── copy-abis.ts          # ABI copy utility
│   ├── deployments/              # Deployment records
│   ├── hardhat.config.ts
│   └── package.json
│
├── src/modules/blockchain/        # NestJS blockchain module
│   ├── abis/                     # Contract ABIs (generated)
│   ├── contracts/                # Contract service wrappers
│   │   ├── audit-log.contract.ts
│   │   ├── consent.contract.ts
│   │   └── prescription.contract.ts
│   ├── blockchain.module.ts
│   ├── blockchain.service.ts
│   ├── blockchain.controller.ts
│   ├── hashing.service.ts
│   ├── verification.service.ts
│   └── audit-integration.service.ts
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- The existing NestJS backend running

### Step 1: Install Blockchain Dependencies

```powershell
# Navigate to blockchain directory
cd backend-nestjs/blockchain

# Install Hardhat and dependencies
npm install
```

### Step 2: Install Backend Dependencies

```powershell
# Navigate to backend
cd backend-nestjs

# Install ethers.js
npm install
```

### Step 3: Start Local Blockchain

```powershell
# In a NEW terminal, start Hardhat node
cd backend-nestjs/blockchain
npm run node
```

This will output:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**Save Account #0's Private Key** - you'll need it!

### Step 4: Deploy Smart Contracts

```powershell
# In another terminal
cd backend-nestjs/blockchain

# Compile contracts
npm run compile

# Deploy to local network
npm run deploy:local
```

Output will show:
```
📋 Deploying HealthcareAuditLog...
✅ HealthcareAuditLog deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🤝 Deploying ConsentManager...
✅ ConsentManager deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

💊 Deploying PrescriptionRegistry...
✅ PrescriptionRegistry deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### Step 5: Copy Contract ABIs

```powershell
# Copy compiled ABIs to NestJS
npx ts-node scripts/copy-abis.ts
```

### Step 6: Configure Environment

Update `backend-nestjs/.env`:

```env
# Enable blockchain
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CHAIN_ID=31337

# Contract addresses from deployment
AUDIT_LOG_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CONSENT_MANAGER_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PRESCRIPTION_REGISTRY_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

# Private key from Hardhat node (Account #0)
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Step 7: Start NestJS Backend

```powershell
cd backend-nestjs
npm run start:dev
```

You should see:
```
[BlockchainService] Connecting to blockchain at http://127.0.0.1:8545...
[BlockchainService] Connected to network: unknown (chainId: 31337)
[BlockchainService] Wallet initialized: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
[BlockchainService] ✅ Blockchain service initialized successfully
```

---

## 📡 API Endpoints

### Health & Status

```http
# Check blockchain connection
GET /api/blockchain/health

# Get detailed status with statistics
GET /api/blockchain/status
```

### Record Verification

```http
# Generic verification
GET /api/blockchain/verify/:type/:id
# Types: patient, prescription, appointment, medical_record

# Specific verifications
GET /api/blockchain/verify/patient/:id
GET /api/blockchain/verify/prescription/:id
GET /api/blockchain/verify/appointment/:id
GET /api/blockchain/verify/medical-record/:id
```

**Example Response:**
```json
{
  "entityType": "prescription",
  "entityId": "clm12345",
  "verified": true,
  "blockchainHash": "0x1234...abcd",
  "currentHash": "0x1234...abcd",
  "timestamp": 1706300400,
  "message": "Prescription authenticity verified successfully",
  "details": {
    "blockchainStatus": "ACTIVE",
    "validUntil": "2024-03-15T00:00:00.000Z",
    "verifiedAt": "2024-01-26T10:30:00.000Z"
  }
}
```

### Audit Trail

```http
# Get total audit entries
GET /api/blockchain/audit/total

# Get specific audit entry
GET /api/blockchain/audit/entry/:entryId

# Get entity's audit history
GET /api/blockchain/audit/entity/:entityId
```

### Consent Management

```http
# Grant consent (requires authentication)
POST /api/blockchain/consent/grant
Authorization: Bearer <token>
{
  "patientId": "patient-123",
  "granteeId": "doctor-456",
  "consentType": 0,  // FULL_ACCESS
  "expiresAt": 1735689600,  // Unix timestamp (optional)
  "purpose": "Ongoing treatment"
}

# Revoke consent
POST /api/blockchain/consent/revoke
Authorization: Bearer <token>
{
  "consentId": "0x..."
}

# Check if consent exists
POST /api/blockchain/consent/check
{
  "patientId": "patient-123",
  "granteeId": "doctor-456",
  "requiredType": 1  // PRESCRIPTION_ONLY
}

# Get consent details
GET /api/blockchain/consent/:consentId

# Get patient's all consents
GET /api/blockchain/consent/patient/:patientId
```

### Consent Types

| Value | Type | Description |
|-------|------|-------------|
| 0 | FULL_ACCESS | Full medical record access |
| 1 | PRESCRIPTION_ONLY | Only prescription access |
| 2 | APPOINTMENT_ONLY | Only appointment access |
| 3 | LAB_RESULTS_ONLY | Only lab results |
| 4 | EMERGENCY_ONLY | Emergency access only |
| 5 | INSURANCE_SHARING | Share with insurance |
| 6 | RESEARCH_PARTICIPATION | Anonymized research |

### Prescription Blockchain

```http
# Get prescription blockchain record
GET /api/blockchain/prescription/:prescriptionId

# Get remaining refills
GET /api/blockchain/prescription/:prescriptionId/refills

# Get prescription statistics
GET /api/blockchain/prescription/stats
```

---

## 🔒 Smart Contracts

### HealthcareAuditLog.sol

Creates tamper-proof audit entries for all critical healthcare operations.

**Features:**
- Single and batch audit entry creation
- Record integrity verification
- Entity history tracking
- Role-based access control (AUDITOR_ROLE)

**Action Types:**
- PATIENT_CREATED, PATIENT_UPDATED
- PRESCRIPTION_CREATED, PRESCRIPTION_FILLED, PRESCRIPTION_CANCELLED
- APPOINTMENT_CREATED, APPOINTMENT_UPDATED, APPOINTMENT_CANCELLED
- MEDICAL_RECORD_CREATED, MEDICAL_RECORD_UPDATED
- CONSENT_GRANTED, CONSENT_REVOKED
- ACCESS_GRANTED, ACCESS_REVOKED
- EMERGENCY_ACCESS

### ConsentManager.sol

Manages patient consent for data access with full lifecycle tracking.

**Features:**
- Grant/revoke consent
- Consent expiration handling
- Multi-type consent support
- Patient-provider consent lookup

### PrescriptionRegistry.sol

Registry for prescription authenticity verification.

**Features:**
- Prescription registration
- Fill and refill tracking
- Authenticity verification
- Expiration management

---

## 🔄 Integration Flow

### When a Patient is Created

```
1. Patient data saved to SQLite
2. HashingService creates SHA-256 hash of patient record
3. AuditLogContractService.createAuditEntry() called
4. Hash + metadata stored on blockchain
5. Transaction hash returned and logged
```

### When Verifying a Record

```
1. API receives verification request
2. Record fetched from SQLite
3. Current hash calculated
4. Blockchain queried for original hash
5. Hashes compared
6. Verification result returned
```

---

## 🧪 Testing Verification

### Test with cURL

```bash
# Check blockchain health
curl http://localhost:5000/api/blockchain/health

# Verify a patient (replace with real ID)
curl http://localhost:5000/api/blockchain/verify/patient/clm12345

# Check consent
curl -X POST http://localhost:5000/api/blockchain/consent/check \
  -H "Content-Type: application/json" \
  -d '{"patientId":"patient-1","granteeId":"doctor-1","requiredType":0}'
```

---

## ⚙️ Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| BLOCKCHAIN_ENABLED | Enable/disable blockchain | false |
| BLOCKCHAIN_RPC_URL | Ethereum node URL | http://127.0.0.1:8545 |
| BLOCKCHAIN_CHAIN_ID | Network chain ID | 31337 |
| BLOCKCHAIN_PRIVATE_KEY | Wallet private key | - |
| AUDIT_LOG_CONTRACT_ADDRESS | AuditLog contract | - |
| CONSENT_MANAGER_CONTRACT_ADDRESS | ConsentManager contract | - |
| PRESCRIPTION_REGISTRY_CONTRACT_ADDRESS | PrescriptionRegistry contract | - |

---

## 🚨 Important Security Notes

1. **Never commit private keys** to version control
2. **Use environment variables** for all secrets
3. **Hardhat accounts are for development only** - never use in production
4. **NO patient data** should ever be stored on-chain
5. **Hashes are one-way** - original data cannot be recovered from blockchain

---

## 📈 Production Considerations

For production deployment:

1. **Use a proper Ethereum network** (Mainnet, Polygon, Arbitrum)
2. **Use a secure key management system** (AWS KMS, HashiCorp Vault)
3. **Consider gas costs** and batch operations
4. **Implement proper error handling** and fallbacks
5. **Add monitoring** for blockchain transaction failures
6. **Consider IPFS** for large document storage

---

## 🐛 Troubleshooting

### "Blockchain is disabled"
- Set `BLOCKCHAIN_ENABLED=true` in .env
- Ensure Hardhat node is running

### "Contract not initialized"
- Check contract addresses in .env
- Ensure contracts are deployed
- Verify ABIs are copied to src/modules/blockchain/abis/

### "Provider not initialized"
- Hardhat node may not be running
- Check BLOCKCHAIN_RPC_URL

### "Transaction failed"
- Check wallet has enough ETH
- Verify you have the AUDITOR_ROLE on contracts

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

## 🎉 Summary

This blockchain integration adds:

✅ **Tamper-proof audit logs** - Every critical action recorded  
✅ **Record integrity verification** - Detect unauthorized changes  
✅ **Prescription authenticity** - Verify prescriptions haven't been altered  
✅ **Consent tracking** - Transparent consent management  
✅ **Privacy-preserving** - Only hashes stored on-chain  
✅ **Production-ready** - Role-based access, batch operations  
