import e from 'express';
import { Sequelize, DataTypes } from 'sequelize';

export const LicenceLog = ( sequelize: Sequelize) => {
    return sequelize.define('LicenceLog' , {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        licenceId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'licence_id',
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        event: {
            type: DataTypes.ENUM('activate', 'deactivate', 'force_deactivate'),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'updated_at',
        },
    });
}