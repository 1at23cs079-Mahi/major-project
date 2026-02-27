-- Migration: Add unique patient identification and blockchain fields
-- Date: 2026-01-20
-- Purpose: Support unique patient ID system and blockchain integration

-- Add unique_patient_id column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS unique_patient_id VARCHAR(20) UNIQUE;

-- Add blockchain_address column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS blockchain_address VARCHAR(42);

-- Add qr_code_path column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS qr_code_path VARCHAR(255);

-- Create index on unique_patient_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_patients_unique_patient_id 
ON patients(unique_patient_id);

-- Create index on blockchain_address for blockchain operations
CREATE INDEX IF NOT EXISTS idx_patients_blockchain_address 
ON patients(blockchain_address);

-- Add blockchain_tx_hash to prescriptions table if not exists
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66);

-- Add blockchain_tx_hash to medical_reports table if not exists
ALTER TABLE medical_reports 
ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66);

-- Add blockchain_tx_hash to consents table if not exists
ALTER TABLE consents 
ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66);

-- Add provider_type to consents table for Lab and Pharmacy support
ALTER TABLE consents 
ADD COLUMN IF NOT EXISTS provider_type VARCHAR(20) DEFAULT 'Doctor';

-- Update existing consents to have provider_type = 'Doctor'
UPDATE consents SET provider_type = 'Doctor' WHERE provider_type IS NULL;

-- Create indexes for blockchain_tx_hash columns for verification
CREATE INDEX IF NOT EXISTS idx_prescriptions_blockchain_tx_hash 
ON prescriptions(blockchain_tx_hash);

CREATE INDEX IF NOT EXISTS idx_medical_reports_blockchain_tx_hash 
ON medical_reports(blockchain_tx_hash);

CREATE INDEX IF NOT EXISTS idx_consents_blockchain_tx_hash 
ON consents(blockchain_tx_hash);

-- Add comments for documentation
COMMENT ON COLUMN patients.unique_patient_id IS 'Unique healthcare identifier in format HID-YYYY-XXXXX';
COMMENT ON COLUMN patients.blockchain_address IS 'Ethereum wallet address for blockchain operations';
COMMENT ON COLUMN patients.qr_code_path IS 'Path to generated QR code for patient identification';
COMMENT ON COLUMN consents.provider_type IS 'Type of healthcare provider: Doctor, Lab, or Pharmacy';
COMMENT ON COLUMN prescriptions.blockchain_tx_hash IS 'Blockchain transaction hash for prescription verification';
COMMENT ON COLUMN medical_reports.blockchain_tx_hash IS 'Blockchain transaction hash for report verification';
COMMENT ON COLUMN consents.blockchain_tx_hash IS 'Blockchain transaction hash for consent audit trail';

-- Verify migration
SELECT 'Migration completed successfully' AS status;
