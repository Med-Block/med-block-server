import { Sequelize, DataTypes } from 'sequelize';

export const RecordType = ( sequelize: Sequelize) => {
    return sequelize.define('RecordType' , {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
    });
}