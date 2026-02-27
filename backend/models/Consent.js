const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Consent = sequelize.define('Consent', {
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
            },
            onDelete: 'CASCADE'
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'doctors',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        consent_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'view_records'
        },
        granted_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        is_revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        blockchain_tx: {
            type: DataTypes.STRING(66),
            allowNull: true
        }
    }, {
        tableName: 'consents',
        timestamps: true
    });

    return Consent;
};
