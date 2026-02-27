/**
 * Script to copy compiled contract ABIs to the NestJS src folder
 * Run after: npm run compile (in blockchain directory)
 */
import * as fs from 'fs';
import * as path from 'path';

const CONTRACTS = [
  'HealthcareAuditLog',
  'ConsentManager', 
  'PrescriptionRegistry'
];

const ARTIFACTS_DIR = path.join(__dirname, '..', 'artifacts', 'contracts');
const DEST_DIR = path.join(__dirname, '..', '..', 'src', 'modules', 'blockchain', 'abis');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log('📋 Copying contract ABIs...\n');

for (const contract of CONTRACTS) {
  const sourcePath = path.join(ARTIFACTS_DIR, `${contract}.sol`, `${contract}.json`);
  const destPath = path.join(DEST_DIR, `${contract}.json`);

  try {
    if (fs.existsSync(sourcePath)) {
      const artifact = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
      
      // Extract only ABI (reduce file size)
      const abiOnly = {
        contractName: artifact.contractName,
        abi: artifact.abi,
      };

      fs.writeFileSync(destPath, JSON.stringify(abiOnly, null, 2));
      console.log(`✅ ${contract}.json copied`);
    } else {
      console.log(`⚠️  ${contract}.json not found at ${sourcePath}`);
    }
  } catch (error) {
    console.error(`❌ Error copying ${contract}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

console.log('\n✨ ABI copy complete!');
console.log(`📁 ABIs saved to: ${DEST_DIR}`);
