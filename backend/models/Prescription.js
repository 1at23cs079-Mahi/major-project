const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Prescription = sequelize.define('Prescription', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'patients',
                key: 'id'
            }
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'doctors',
                key: 'id'
            }
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'appointments',
                key: 'id'
            }
        },
        diagnosis: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        qr_code: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        prescription_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        is_dispensed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        dispensed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dispensed_by_pharmacy_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'pharmacies',
                key: 'id'
            }
        },
        blockchain_hash: {
            type: DataTypes.STRING(66),
            allowNull: true
        },
        blockchain_tx: {
            type: DataTypes.STRING(66),
            allowNull: true
        }
    }, {
        tableName: 'prescriptions',
        timestamps: true
    });

    return Prescription;
};
