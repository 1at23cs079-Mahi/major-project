const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Doctor = sequelize.define('Doctor', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        specialization: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        license_number: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        qualification: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        experience_years: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        clinic_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        clinic_address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        availability: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        consultation_fee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        is_approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        profile_photo: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'doctors',
        timestamps: true
    });

    return Doctor;
};
