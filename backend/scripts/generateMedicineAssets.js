const { sequelize, Medicine } = require('./models');
const path = require('path');
const fs = require('fs');

// We'll use a mock for the AI tool in this script, or better yet,
// we'll just define the metadata and let the agent handle the actual generation call
// during the run if possible.

const medicinesToGenerate = [
    { name: 'Paracetamol 500mg', category: 'Analgesic', description: 'Pain relief and fever reducer', prompt: 'a realistic white pill bottle for Paracetamol 500mg, professional medical packaging, isolated on white background' },
    { name: 'Amoxicillin 250mg', category: 'Antibiotic', description: 'Used to treat bacterial infections', prompt: 'a realistic antibiotic pill bottle for Amoxicillin 250mg, medical grade packaging, isolated on white background' },
    { name: 'Cetirizine 10mg', category: 'Antihistamine', description: 'Used for allergy relief', prompt: 'a realistic allergy medication box for Cetirizine 10mg, clean medical design' },
    { name: 'Metformin 850mg', category: 'Antidiabetic', description: 'Used to control blood sugar levels', prompt: 'a realistic diabetes medication bottle for Metformin 850mg, professional pharmaceutical packaging' }
];

async function generateMedicineAssets() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const uploadDir = path.join(__dirname, '../uploads/medicines');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const med of medicinesToGenerate) {
            console.log(`Processing: ${med.name}`);

            // In a real scenario, we'd call generate_image here. 
            // Since this script runs in Node, we'll just create the DB entries.
            // The agent will generate one sample image to demonstrate.

            const [medicine, created] = await Medicine.findOrCreate({
                where: { name: med.name },
                defaults: {
                    category: med.category,
                    description: med.description,
                    default_dosage: '1 tablet',
                    image_path: `/uploads/medicines/${med.name.replace(/\s+/g, '_').toLowerCase()}.jpg`
                }
            });

            if (created) {
                console.log(`✅ Created database entry for ${med.name}`);
            } else {
                console.log(`ℹ️  Medicine ${med.name} already exists`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating medicine assets:', error);
        process.exit(1);
    }
}

generateMedicineAssets();
