const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Pharmacy = sequelize.define('Pharmacy', {
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        license_number: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        operating_hours: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        is_approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'pharmacies',
        timestamps: true
    });

    return Pharmacy;
};
