const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MedicalReport = sequelize.define('MedicalReport', {
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
            allowNull: true,
            references: {
                model: 'doctors',
                key: 'id'
            }
        },
        lab_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'labs',
                key: 'id'
            }
        },
        report_type: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_path: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        file_type: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        upload_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
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
        tableName: 'medical_reports',
        timestamps: true
    });

    return MedicalReport;
};
