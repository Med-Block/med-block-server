import { Sequelize, DataTypes } from 'sequelize';

export const User = ( sequelize: Sequelize) => {
    return sequelize.define('User' , {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user', 'doctor'),
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    });
}