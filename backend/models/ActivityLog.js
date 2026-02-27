const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ActivityLog = sequelize.define('ActivityLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        resource: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        resource_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        details: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'activity_logs',
        timestamps: true,
        updatedAt: false
    });

    return ActivityLog;
};
