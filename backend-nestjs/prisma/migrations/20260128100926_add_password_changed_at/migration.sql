-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_changed_at" DATETIME;

-- CreateIndex
CREATE INDEX "patients_deleted_at_idx" ON "patients"("deleted_at");
