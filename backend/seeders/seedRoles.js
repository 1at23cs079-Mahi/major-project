const { sequelize, Role } = require('../models');

const seedRoles = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Sync database
        await sequelize.sync();
        console.log('Database synced');

        // Create roles if they don't exist
        const roles = ['Admin', 'Doctor', 'Patient', 'Pharmacy', 'Lab'];

        for (const roleName of roles) {
            const [role, created] = await Role.findOrCreate({
                where: { name: roleName },
                defaults: {
                    name: roleName,
                    permissions: {}
                }
            });

            if (created) {
                console.log(`✅ Created role: ${roleName}`);
            } else {
                console.log(`ℹ️  Role already exists: ${roleName}`);
            }
        }

        console.log('✅ Roles seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
};

seedRoles();
