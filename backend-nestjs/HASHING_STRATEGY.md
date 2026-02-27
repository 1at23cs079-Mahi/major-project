# 🔐 Production-Grade Hashing Strategy

## Healthcare Platform - HIPAA-Safe Canonical Hashing with Merkle Trees

This document describes the production-grade hashing strategy for blockchain verification.

---

## 📐 Architecture Overview

### Three-Layer Hashing Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION HASHING ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYER 1: Record Hash                                               │
│  ─────────────────────                                              │
│  recordHash = SHA256(canonical(integrity_fields_only))              │
│  • Sorted keys (alphabetical)                                       │
│  • Deterministic JSON                                               │
│  • Excludes: timestamps, UI fields, cache data                      │
│                                                                     │
│  LAYER 2: Version Hash (Chained)                                    │
│  ─────────────────────────────                                      │
│  versionHash = SHA256(recordHash + previousHash + timestamp)        │
│  • Links: H1 → H2 → H3 → ...                                        │
│  • Tamper detection: breaks chain                                   │
│                                                                     │
│  LAYER 3: Merkle Root (Batched)                                     │
│  ─────────────────────────────                                      │
│  merkleRoot = buildMerkleTree(batch_of_version_hashes)              │
│  • Batches: 100 records or 1 minute interval                        │
│  • Single blockchain transaction per batch                          │
│  • Individual proofs for each record                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐    ┌───────────────┐
│ Entity      │───►│ Canonical    │───►│ Version       │───►│ Merkle Batch  │
│ Change      │    │ Hash Service │    │ Tracking      │    │ Service       │
└─────────────┘    └──────────────┘    └───────────────┘    └───────────────┘
                          │                    │                    │
                          ▼                    ▼                    ▼
                   ┌──────────────┐    ┌───────────────┐    ┌───────────────┐
                   │ recordHash   │    │ RecordVersion │    │ Blockchain    │
                   │ (Layer 1)    │    │ Table         │    │ Transaction   │
                   └──────────────┘    └───────────────┘    └───────────────┘
```

---

## 🔑 Key Components

### 1. Canonical Hash Service (`canonical-hash.service.ts`)

**Purpose**: Create deterministic, reproducible hashes of records.

```typescript
// Key features:
class CanonicalHashService {
  // Canonicalize data (sorted keys, deterministic)
  canonicalize(data: unknown): string;
  
  // Create SHA-256 hash
  hash(data: unknown): string;  // Returns: 0x...
  
  // Create version hash (for chaining)
  createVersionHash(recordHash: string, previousHash: string | null, timestamp: Date): string;
  
  // Entity-specific extractors (only integrity fields)
  extractPatientIntegrityFields(patient: {...}): Record<string, unknown>;
  extractPrescriptionIntegrityFields(prescription: {...}): Record<string, unknown>;
  extractMedicalRecordIntegrityFields(record: {...}): Record<string, unknown>;
  extractAppointmentIntegrityFields(appointment: {...}): Record<string, unknown>;
}
```

**Canonical JSON Example**:
```typescript
// Input (random key order)
{ "name": "John", "age": 30, "id": "123" }

// Canonical output (sorted keys)
{"age":30,"id":"123","name":"John"}

// Hash
0x7b4e8f2a3c5d1e6b9f0a2c4d6e8f1a3b5c7d9e1f2a4b6c8d0e2f4a6b8c0d2e4f
```

### 2. Version Tracking Service (`version-tracking.service.ts`)

**Purpose**: Track entity changes with chained version hashes.

```typescript
class VersionTrackingService {
  // Create a new version entry
  createVersion(
    entityType: 'patient' | 'prescription' | 'medicalRecord' | 'appointment',
    entityId: string,
    recordData: Record<string, unknown>,
    createdBy: string,
    changeType: 'CREATE' | 'UPDATE' | 'DELETE'
  ): Promise<RecordVersion>;
  
  // Get version history
  getVersionHistory(entityType, entityId): Promise<RecordVersion[]>;
  
  // Verify chain integrity
  verifyVersionChain(entityType, entityId): Promise<{
    valid: boolean;
    totalVersions: number;
    brokenAt?: number;
  }>;
}
```

**Version Chain Example**:
```
Version 1 (CREATE):
├── recordHash: 0xabc...
├── previousHash: null
└── versionHash: 0x111...

Version 2 (UPDATE):
├── recordHash: 0xdef...
├── previousHash: 0x111...  ← Links to V1
└── versionHash: 0x222...

Version 3 (UPDATE):
├── recordHash: 0xghi...
├── previousHash: 0x222...  ← Links to V2
└── versionHash: 0x333...
```

### 3. Merkle Batch Service (`merkle-batch.service.ts`)

**Purpose**: Batch version hashes into Merkle trees for efficient blockchain storage.

```typescript
class MerkleBatchService {
  // Build Merkle tree from hashes
  buildMerkleTree(hashes: string[]): {
    root: string;
    proofs: Map<number, string[]>;
  };
  
  // Process pending versions into a batch
  processPendingBatch(): Promise<{
    processed: boolean;
    batchId?: number;
    merkleRoot?: string;
  }>;
  
  // Verify a record's blockchain proof
  verifyRecordProof(entityType, entityId, version?): Promise<{
    verified: boolean;
    merkleRoot: string;
    txHash: string;
    blockNumber: number;
  }>;
}
```

**Merkle Tree Example**:
```
                 [Root]
                 0x999...
              /           \
         [Node]           [Node]
         0x555...         0x666...
        /       \        /       \
    [V1 Hash]  [V2 Hash] [V3 Hash] [V4 Hash]
    0x111...   0x222...  0x333...  0x444...
```

### 4. Entity Hooks Service (`entity-hooks.service.ts`)

**Purpose**: Automatically create versions when entities change.

```typescript
class EntityHooksService {
  // Patient hooks
  onPatientCreated(patient, userId): Promise<void>;
  onPatientUpdated(patient, userId): Promise<void>;
  
  // Prescription hooks
  onPrescriptionCreated(prescription, userId): Promise<void>;
  onPrescriptionFilled(prescriptionId, pharmacyId, userId): Promise<void>;
  
  // ... similar for MedicalRecord, Appointment
}
```

---

## 📁 Database Schema

### RecordVersion Table
```sql
CREATE TABLE RecordVersion (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType   TEXT NOT NULL,          -- 'patient', 'prescription', etc.
  entityId     TEXT NOT NULL,          -- UUID of the entity
  version      INTEGER NOT NULL,       -- 1, 2, 3, ...
  recordHash   TEXT NOT NULL,          -- SHA256 of canonical data
  previousHash TEXT,                   -- Previous version's hash (null for v1)
  versionHash  TEXT NOT NULL,          -- Chain link hash
  createdBy    TEXT NOT NULL,          -- User who made the change
  changeType   TEXT NOT NULL,          -- 'CREATE', 'UPDATE', 'DELETE'
  batchId      INTEGER,                -- Foreign key to batch (null if pending)
  createdAt    DATETIME NOT NULL,
  
  UNIQUE(entityType, entityId, version)
);
```

### BlockchainBatch Table
```sql
CREATE TABLE BlockchainBatch (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  batchNumber  INTEGER UNIQUE,          -- Auto-incremented batch number
  merkleRoot   TEXT NOT NULL,           -- Root hash of Merkle tree
  recordCount  INTEGER NOT NULL,        -- Number of records in batch
  entityTypes  TEXT NOT NULL,           -- JSON array of entity types
  status       TEXT DEFAULT 'PENDING',  -- PENDING, SUBMITTED, CONFIRMED, FAILED
  txHash       TEXT,                    -- Blockchain transaction hash
  blockNumber  INTEGER,                 -- Block number when confirmed
  gasUsed      TEXT,                    -- Gas used for transaction
  submittedAt  DATETIME,
  confirmedAt  DATETIME,
  errorMessage TEXT,
  createdAt    DATETIME NOT NULL
);
```

### MerkleProof Table
```sql
CREATE TABLE MerkleProof (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  versionId  INTEGER UNIQUE NOT NULL,  -- Foreign key to RecordVersion
  batchId    INTEGER NOT NULL,         -- Foreign key to BlockchainBatch
  leafHash   TEXT NOT NULL,            -- The version hash (leaf)
  proof      TEXT NOT NULL,            -- JSON array of sibling hashes
  leafIndex  INTEGER NOT NULL,         -- Position in Merkle tree
  createdAt  DATETIME NOT NULL
);
```

---

## 🔌 API Endpoints

### Version Tracking

```
GET  /blockchain/versions/:entityType/:entityId
     → Get version history for an entity

GET  /blockchain/versions/:entityType/:entityId/:version
     → Get specific version details

GET  /blockchain/versions/:entityType/:entityId/chain/verify
     → Verify version chain integrity

GET  /blockchain/versions/stats
     → Get version tracking statistics
```

### Merkle Batches

```
GET  /blockchain/batches/stats
     → Get batch statistics

GET  /blockchain/batches/:batchId
     → Get batch details

POST /blockchain/batches/process
     → Manually trigger batch processing

POST /blockchain/batches/retry-failed
     → Retry failed batch submissions
```

### Blockchain Proof Verification

```
GET  /blockchain/proof/:entityType/:entityId
     → Verify record's blockchain proof

GET  /blockchain/proof/:entityType/:entityId?version=N
     → Verify specific version's proof
```

---

## 🚀 Usage Examples

### 1. Integrating with Patient Service

```typescript
import { EntityHooksService } from './blockchain/services';

@Injectable()
export class PatientService {
  constructor(
    private prisma: PrismaService,
    private entityHooks: EntityHooksService,
  ) {}

  async createPatient(data: CreatePatientDto, userId: string) {
    const patient = await this.prisma.patient.create({ data });
    
    // Create blockchain version automatically
    await this.entityHooks.onPatientCreated(patient, userId);
    
    return patient;
  }

  async updatePatient(id: string, data: UpdatePatientDto, userId: string) {
    const patient = await this.prisma.patient.update({
      where: { id },
      data,
    });
    
    // Create new version (links to previous)
    await this.entityHooks.onPatientUpdated(patient, userId);
    
    return patient;
  }
}
```

### 2. Verifying Record Integrity

```typescript
// Via API
GET /blockchain/proof/patient/patient-uuid-123

// Response
{
  "entityType": "patient",
  "entityId": "patient-uuid-123",
  "verified": true,
  "version": 3,
  "batchId": 42,
  "merkleRoot": "0x1234...",
  "blockNumber": 156789,
  "txHash": "0xabcd...",
  "chainIntact": true,
  "status": "VERIFIED_ON_BLOCKCHAIN"
}
```

### 3. Checking Version History

```typescript
// Via API
GET /blockchain/versions/prescription/rx-uuid-456

// Response
{
  "entityType": "prescription",
  "entityId": "rx-uuid-456",
  "totalVersions": 3,
  "versions": [
    {
      "version": 1,
      "recordHash": "0xabc...",
      "changeType": "CREATE",
      "createdBy": "doctor-123",
      "hasBlockchainProof": true
    },
    {
      "version": 2,
      "recordHash": "0xdef...",
      "changeType": "UPDATE",
      "createdBy": "doctor-123",
      "hasBlockchainProof": true
    },
    {
      "version": 3,
      "recordHash": "0xghi...",
      "changeType": "UPDATE",
      "createdBy": "pharmacy-789",
      "hasBlockchainProof": false  // Pending batch
    }
  ]
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Enable/disable blockchain features
BLOCKCHAIN_ENABLED=true

# Merkle batch configuration
MERKLE_BATCH_SIZE=100           # Records per batch
MERKLE_BATCH_INTERVAL_MS=60000  # 1 minute between batches
MERKLE_MIN_BATCH_SIZE=1         # Minimum records to create a batch

# Optional: Salt for hash privacy
HASH_SALT=your-secret-salt-here

# Blockchain connection
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CHAIN_ID=31337
BLOCKCHAIN_PRIVATE_KEY=0x...
```

---

## 🔒 Security Considerations

### What IS Stored On-Chain
- ✅ SHA-256 hashes (0x64-character hex strings)
- ✅ Merkle roots (single hash per batch)
- ✅ Timestamps (when hash was recorded)
- ✅ Action types (enum values, not text)

### What is NOT Stored On-Chain
- ❌ Patient names, DOB, SSN
- ❌ Medical diagnoses or conditions
- ❌ Prescription details or medications
- ❌ Doctor or hospital names
- ❌ Any identifiable information

### HIPAA Compliance
- Hashes are one-way - cannot be reversed
- Even with hash, need off-chain DB to find record
- Salt adds extra privacy protection
- Only entity IDs (UUIDs) are used, not names

---

## 📈 Performance

### Gas Efficiency
- **Without batching**: 1 tx per record ≈ 50,000 gas each
- **With Merkle batching**: 1 tx per 100 records ≈ 80,000 gas total
- **Savings**: ~98% gas reduction

### Database Overhead
- RecordVersion: ~500 bytes per version
- MerkleProof: ~300 bytes per version (only when batched)
- BlockchainBatch: ~500 bytes per batch

### Typical Throughput
- Version creation: <10ms
- Batch processing: <500ms (100 records)
- Blockchain confirmation: 2-15 seconds (network dependent)

---

## 🧪 Testing

### Test Canonical Hashing
```bash
curl -X POST http://localhost:5000/blockchain/hash/test \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":30,"id":"123"}'

# Response:
{
  "original": {"name":"John","age":30,"id":"123"},
  "canonical": "{\"age\":30,\"id\":\"123\",\"name\":\"John\"}",
  "hash": "0x7b4e8f2a..."
}
```

### Verify Version Chain
```bash
curl http://localhost:5000/blockchain/versions/patient/patient-123/chain/verify

# Response:
{
  "valid": true,
  "totalVersions": 5
}
```

---

## 📚 Related Documentation

- [BLOCKCHAIN_INTEGRATION.md](./BLOCKCHAIN_INTEGRATION.md) - Smart contracts and blockchain setup
- [Smart Contracts](./blockchain/contracts/) - Solidity contract source code
