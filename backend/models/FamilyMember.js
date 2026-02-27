const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FamilyMember = sequelize.define('FamilyMember', {
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        relationship: {
            type: DataTypes.STRING(50),
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
        medical_conditions: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        allergies: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'family_members',
        timestamps: true
    });

    return FamilyMember;
};
