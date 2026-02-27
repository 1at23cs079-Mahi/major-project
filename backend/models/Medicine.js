const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Medicine = sequelize.define('Medicine', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        manufacturer: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        image_path: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        default_dosage: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'medicines',
        timestamps: true
    });

    return Medicine;
};
