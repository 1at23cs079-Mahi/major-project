const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Appointment = sequelize.define('Appointment', {
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
        appointment_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        appointment_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'),
            defaultValue: 'pending'
        },
        queue_number: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        cancelled_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        cancellation_reason: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'appointments',
        timestamps: true
    });

    return Appointment;
};
