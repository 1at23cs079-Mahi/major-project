const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Patient = sequelize.define('Patient', {
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
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM('Male', 'Female', 'Other'),
            allowNull: true
        },
        blood_group: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        allergies: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        chronic_conditions: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        profile_photo: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        unique_patient_id: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
            comment: 'Unique identifier for patient lookup (e.g., HID-2026-00001)'
        },
        blockchain_address: {
            type: DataTypes.STRING(42),
            allowNull: true,
            comment: 'Ethereum wallet address for blockchain operations'
        },
        qr_code_path: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Path to generated QR code for quick access'
        }
    }, {
        tableName: 'patients',
        timestamps: true
    });

    return Patient;
};
