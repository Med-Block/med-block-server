import { Sequelize, DataTypes } from 'sequelize';

export const License = ( sequelize: Sequelize) => {
    return sequelize.define('License' , {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id',
        },
        doctorId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'doctor_id'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'is_active',
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