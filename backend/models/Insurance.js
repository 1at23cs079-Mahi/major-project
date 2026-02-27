const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Insurance = sequelize.define('Insurance', {
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
        provider_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        policy_number: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        coverage_details: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        valid_from: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        valid_until: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        claim_documents: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: []
        }
    }, {
        tableName: 'insurance',
        timestamps: true
    });

    return Insurance;
};
