const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PasswordHistory = sequelize.define('PasswordHistory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Historical password hash to prevent reuse'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'password_history',
        timestamps: false,
        indexes: [
            {
                fields: ['user_id', 'created_at']
            }
        ]
    });

    return PasswordHistory;
};
