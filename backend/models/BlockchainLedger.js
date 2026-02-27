const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BlockchainLedger = sequelize.define('BlockchainLedger', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        block_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        previous_hash: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        hash: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        data_hash: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        record_type: {
            type: DataTypes.ENUM('PRESCRIPTION', 'MEDICAL_RECORD', 'CONSENT_GRANT', 'CONSENT_REVOKE', 'APPOINTMENT', 'PATIENT_REGISTRATION', 'AUDIT_LOG', 'EMERGENCY_ACCESS'),
            allowNull: false
        },
        record_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        patient_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        nonce: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'blockchain_ledger',
        timestamps: true,
        indexes: [
            { fields: ['block_number'] },
            { fields: ['hash'] },
            { fields: ['data_hash'] },
            { fields: ['record_type'] },
            { fields: ['record_id'] },
            { fields: ['user_id'] },
            { fields: ['patient_id'] },
            { fields: ['timestamp'] }
        ]
    });

    return BlockchainLedger;
};
