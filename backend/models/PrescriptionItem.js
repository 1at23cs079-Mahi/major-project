const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PrescriptionItem = sequelize.define('PrescriptionItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        prescription_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'prescriptions',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        medicine_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'medicines',
                key: 'id'
            }
        },
        dosage: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        frequency: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        duration: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'prescription_items',
        timestamps: true
    });

    return PrescriptionItem;
};
