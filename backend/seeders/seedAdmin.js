const { sequelize, Role, User } = require('../models');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Get Admin role
        const adminRole = await Role.findOne({ where: { name: 'Admin' } });

        if (!adminRole) {
            console.error('❌ Admin role not found. Please run seed roles first.');
            process.exit(1);
        }

        // Create admin user
        const [adminUser, created] = await User.findOrCreate({
            where: { email: 'admin@healthcare.com' },
            defaults: {
                email: 'admin@healthcare.com',
                password_hash: 'Admin@123',
                role_id: adminRole.id,
                is_active: true
            }
        });

        if (created) {
            console.log('✅ Admin user created successfully');
            console.log('📧 Email: admin@healthcare.com');
            console.log('🔑 Password: Admin@123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
