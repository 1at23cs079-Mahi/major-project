-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_merkle_proofs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "leaf_hash" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "leaf_index" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "merkle_proofs_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "record_versions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "merkle_proofs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "blockchain_batches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_merkle_proofs" ("batch_id", "created_at", "id", "leaf_hash", "leaf_index", "proof", "version_id") SELECT "batch_id", "created_at", "id", "leaf_hash", "leaf_index", "proof", "version_id" FROM "merkle_proofs";
DROP TABLE "merkle_proofs";
ALTER TABLE "new_merkle_proofs" RENAME TO "merkle_proofs";
CREATE UNIQUE INDEX "merkle_proofs_version_id_key" ON "merkle_proofs"("version_id");
CREATE INDEX "merkle_proofs_batch_id_idx" ON "merkle_proofs"("batch_id");
CREATE INDEX "merkle_proofs_leaf_hash_idx" ON "merkle_proofs"("leaf_hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
