import { Sequelize, DataTypes } from 'sequelize';

export const Record = ( sequelize: Sequelize) => {
    return sequelize.define('Record' , {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        patientId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'patient_id',
        },
        doctorId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'doctor_id'
        },
        type: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        diagnosis: {
            type: DataTypes.STRING(8000),
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