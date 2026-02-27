-- CreateTable
CREATE TABLE "record_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "record_hash" TEXT NOT NULL,
    "previous_hash" TEXT,
    "version_hash" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "batch_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "record_versions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "blockchain_batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blockchain_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_number" INTEGER NOT NULL,
    "merkle_root" TEXT NOT NULL,
    "record_count" INTEGER NOT NULL,
    "entity_types" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tx_hash" TEXT,
    "block_number" INTEGER,
    "gas_used" TEXT,
    "submitted_at" DATETIME,
    "confirmed_at" DATETIME,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "merkle_proofs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "leaf_hash" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "leaf_index" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "record_versions_entity_type_entity_id_idx" ON "record_versions"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "record_versions_record_hash_idx" ON "record_versions"("record_hash");

-- CreateIndex
CREATE INDEX "record_versions_version_hash_idx" ON "record_versions"("version_hash");

-- CreateIndex
CREATE INDEX "record_versions_batch_id_idx" ON "record_versions"("batch_id");

-- CreateIndex
CREATE INDEX "record_versions_created_at_idx" ON "record_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "record_versions_entity_type_entity_id_version_key" ON "record_versions"("entity_type", "entity_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_batches_batch_number_key" ON "blockchain_batches"("batch_number");

-- CreateIndex
CREATE INDEX "blockchain_batches_merkle_root_idx" ON "blockchain_batches"("merkle_root");

-- CreateIndex
CREATE INDEX "blockchain_batches_tx_hash_idx" ON "blockchain_batches"("tx_hash");

-- CreateIndex
CREATE INDEX "blockchain_batches_status_idx" ON "blockchain_batches"("status");

-- CreateIndex
CREATE INDEX "blockchain_batches_created_at_idx" ON "blockchain_batches"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "merkle_proofs_version_id_key" ON "merkle_proofs"("version_id");

-- CreateIndex
CREATE INDEX "merkle_proofs_batch_id_idx" ON "merkle_proofs"("batch_id");

-- CreateIndex
CREATE INDEX "merkle_proofs_leaf_hash_idx" ON "merkle_proofs"("leaf_hash");
