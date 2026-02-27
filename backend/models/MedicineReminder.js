const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MedicineReminder = sequelize.define('MedicineReminder', {
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
        prescription_item_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'prescription_items',
                key: 'id'
            },
            onDelete: 'SET NULL'
        },
        medicine_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        dosage: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        reminder_times: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: []
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'medicine_reminders',
        timestamps: true
    });

    return MedicineReminder;
};
