const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        password_reset_token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        password_reset_expires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        failed_login_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        account_locked_until: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_failed_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        wallet_address: {
            type: DataTypes.STRING(42),
            allowNull: true,
            unique: true
        }
    }, {
        tableName: 'users',
        timestamps: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            }
        }
    });

    // Instance method to verify password
    User.prototype.verifyPassword = async function (password) {
        return await bcrypt.compare(password, this.password_hash);
    };

    // Check if account is locked
    User.prototype.isAccountLocked = function () {
        if (!this.account_locked_until) return false;
        return new Date() < this.account_locked_until;
    };

    // Increment failed login attempts
    User.prototype.incrementFailedAttempts = async function () {
        this.failed_login_attempts += 1;
        this.last_failed_login = new Date();

        // Lock account after 5 failed attempts
        if (this.failed_login_attempts >= 5) {
            this.account_locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        await this.save();
    };

    // Reset login attempts on successful login
    User.prototype.resetFailedAttempts = async function () {
        if (this.failed_login_attempts > 0 || this.account_locked_until) {
            this.failed_login_attempts = 0;
            this.account_locked_until = null;
            this.last_failed_login = null;
            await this.save();
        }
    };

    return User;
};
